import transporter from "../config/smtp.js";
import User from "../models/auth_model.js";
import Giveaway from "../models/giveaway_model.js";

const getAllGiveaways = async (req, res) => {
  try {
    const role = req.user?.role || "user"; // Default to 'user'

    const giveaways = await Giveaway.find({}).sort({ createdAt: -1 });

    const formattedGiveaways = giveaways.map((g) => ({
      id: g._id,
      title: g.title,
      subTitle: g.subTitle,
      description: g.description,
      giveawayImageUrl: g.giveawayImageUrl,
      qrCodeUrl: g.qrCodeUrl,
      fee: g.fee,
      totalSlots: g.totalSlots,
      endDate: g.endDate,
      categories: g.categories,
      numberOfWinners: g.numberOfWinners,
      participantsCount: g.participants?.length || 0,
    }));

    res.status(200).json({
      message: "Giveaways fetched successfully",
      giveaways: formattedGiveaways,
    });
  } catch (err) {
    console.error("Fetch giveaways error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getGiveawayById = async (req, res) => {
  try {
    const { id } = req.params;

    const giveaway = await Giveaway.findById(id)
      .populate("participants.userId", "fullName email") // Adjust fields as needed
      .populate("winners", "fullName email"); // Populate winners (User model)

    if (!giveaway) {
      return res.status(404).json({ message: "Giveaway not found" });
    }

    const formattedParticipants = giveaway.participants.map((participant) => {
      const user = participant.userId;

      console.log(user)

      return {
        userId: user?._id || null,
        name: user?.fullName || null,
        email: user?.email || null,
        transactionId: participant.transactionId,
        registeredAt: participant.registeredAt,
        status: participant.status,
        verifiedAt: participant.verifiedAt,
        isWinner: participant.isWinner,
      };
    });
    const formattedWinners = giveaway.winners.map((winner) => ({
      id: winner?._id || null,
      name: winner?.fullName || null,
      email: winner?.email || null,
    }));

    const formattedGiveaway = {
      id: giveaway._id,
      title: giveaway.title,
      subTitle: giveaway.subTitle,
      description: giveaway.description,
      giveawayImageUrl: giveaway.giveawayImageUrl,
      qrCodeUrl: giveaway.qrCodeUrl,
      fee: giveaway.fee,
      totalSlots: giveaway.totalSlots,
      endDate: giveaway.endDate,
      categories: giveaway.categories,
      numberOfWinners: giveaway.numberOfWinners,
      participantsCount: formattedParticipants.length,
      participantsList: formattedParticipants,
      winnersList: formattedWinners,
    };
    console.log(giveaway.participants);
    res.status(200).json({
      message: "Giveaway fetched successfully",
      giveaway: formattedGiveaway,
    });
  } catch (err) {
    console.error("Fetch giveaway by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const participateForGiveaway = async (req, res) => {
  const { giveawayId, transactionId } = req.body;
  const email = req.user?.email;
  const fullName = req.user?.fullName;

  try {
    if (!giveawayId || !transactionId || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const giveaway = await Giveaway.findById(giveawayId);
    if (!giveaway) {
      return res.status(404).json({ message: "Giveaway not found" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();

    if (giveaway.startTime && now < giveaway.startTime) {
      return res.status(400).json({ message: "Giveaway is not open yet" });
    }

    if (now > giveaway.endDate) {
      return res.status(400).json({ message: "Giveaway has ended" });
    }

    const alreadyRegistered = giveaway.participants.some(
      (p) => p.userId.toString() === user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    if (giveaway.participants.length >= giveaway.totalSlots) {
      return res.status(400).json({ message: "Giveaway is full" });
    }

    giveaway.participants.push({
      userId: user._id,
      email,
      fullName,
      transactionId,
      registeredAt: now,
      status: "pending",
    });

    await giveaway.save();

    await transporter.sendMail({
      from: '"Bindaas" <bindaaspay@gmail.com>',
      to: user.email,
      subject: "✅ Giveaway Participation Received!",
      html: `
        <p>Hi ${user.name || "there"},</p>
        <p>Your participation in the giveaway <strong>${
          giveaway.title
        }</strong> has been received.</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p>Status: <span style="color: orange;">Pending Verification</span></p>
        <br/>
        <p>Thank you for participating!</p>
      `,
    });

    return res.status(200).json({
      message: "Registered successfully, awaiting verification",
      status: "pending",
    });
  } catch (err) {
    console.error("Giveaway registration error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserGiveawayHistory = async (req, res) => {
  const userId = req.user._id;

  try {
    const giveaways = await Giveaway.find({ "participants.userId": userId })
      .select(
        "title subTitle endDate giveawayImageUrl fee categories participants"
      )
      .lean();

    // Extract only the relevant participant info for this user
    const participation = giveaways.map((giveaway) => {
      const participant = giveaway.participants.find(
        (p) => p.userId.toString() === userId.toString()
      );
      return {
        giveaway: {
          _id: giveaway._id,
          title: giveaway.title,
          subTitle: giveaway.subTitle,
          endDate: giveaway.endDate,
          giveawayImageUrl: giveaway.giveawayImageUrl,
          fee: giveaway.fee,
          categories: giveaway.categories,
        },
        participant: {
          transactionId: participant.transactionId,
          status: participant.status,
          registeredAt: participant.registeredAt,
          verifiedAt: participant.verifiedAt,
          isWinner: participant.isWinner,
        },
      };
    });

    res.status(200).json({ participation });
  } catch (err) {
    console.error("Error fetching user giveaway participation:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserGiveawayHistoryById = async (req, res) => {
  const userId = req.params.userId || req.user?._id;

  if (!userId) {
    return res.status(400).json({ message: "User ID not provided" });
  }

  try {
    const giveaways = await Giveaway.find({ "participants.userId": userId })
      .select(
        "title subTitle endDate giveawayImageUrl fee categories participants"
      )
      .lean();

    const participation = giveaways.map((giveaway) => {
      const participant = giveaway.participants.find(
        (p) => p.userId.toString() === userId.toString()
      );

      return {
        giveaway: {
          _id: giveaway._id,
          title: giveaway.title,
          subTitle: giveaway.subTitle,
          endDate: giveaway.endDate,
          giveawayImageUrl: giveaway.giveawayImageUrl,
          fee: giveaway.fee,
          categories: giveaway.categories,
        },
        participant: {
          transactionId: participant.transactionId,
          status: participant.status,
          registeredAt: participant.registeredAt,
          verifiedAt: participant.verifiedAt,
          isWinner: participant.isWinner,
        },
      };
    });

    res.status(200).json({ participation });
  } catch (err) {
    console.error("Error fetching user giveaway participation:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getAllGiveaways,
  getGiveawayById,
  getUserGiveawayHistory,
  participateForGiveaway,
  getUserGiveawayHistoryById,
};
