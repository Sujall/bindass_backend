import transporter from "../config/smtp.js";
import sendMail from "../config/smtp.js";
import User from "../models/auth_model.js";
import Media from "../models/banner_model.js";
import Giveaway from "../models/giveaway_model.js";
import Participant from "../models/giveaway_model.js";

export const getAllGiveaways = async (req, res) => {
  try {
    const giveaways = await Giveaway.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All giveaways fetched successfully",
      giveaways,
    });
  } catch (err) {
    console.error("Error fetching giveaways:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createGiveaway = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      endDate,
      description,
      fee,
      totalSlots,
      categories,
      giveawayImageUrl,
      qrCodeUrl,
      numberOfWinners,
    } = req.body;

    if (!title || !subTitle || !endDate || !fee || !totalSlots) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate)) {
      return res.status(400).json({ message: "Invalid end date format" });
    }

    if (!giveawayImageUrl || !qrCodeUrl) {
      return res.status(400).json({ message: "Image URLs are required" });
    }

    const giveaway = await Giveaway.create({
      title,
      subTitle,
      endDate: parsedEndDate,
      description,
      giveawayImageUrl,
      qrCodeUrl,
      numberOfWinners,
      fee,
      totalSlots,
      categories,
      participants: [],
    });

    return res.status(201).json({
      message: "Giveaway created successfully",
      giveaway,
    });
  } catch (err) {
    console.error("Create giveaway error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateParticipantStatusByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Prepare the update object
    const update = {
      "participants.$[elem].status": status,
    };

    if (status === "verified") {
      update["participants.$[elem].verifiedAt"] = new Date();
    }

    // Apply update using arrayFilters to target the correct participant
    const giveaway = await Giveaway.findOneAndUpdate(
      { "participants.userId": userId },
      { $set: update },
      {
        new: true,
        arrayFilters: [{ "elem.userId": userId }],
      }
    ).populate("participants.userId", "email fullName");

    // Find the updated participant
    const participant = giveaway?.participants?.find((p) => {
      const participantId =
        typeof p.userId === "object" ? p.userId._id : p.userId;
      return participantId?.toString() === userId;
    });

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Compose email
    const userEmail = participant.userId.email;
    const userName = participant.userId.fullName;

    let subject, html;
    if (status === "verified") {
      subject = "🎉 Your participation has been verified!";
      html = `<p>Hi ${userName},</p><p>Your transaction ID <b>${participant.transactionId}</b> has been <strong style="color:green;">verified</strong>. You're now officially in the giveaway!</p>`;
    } else {
      subject = "❌ Participation rejected";
      html = `<p>Hi ${userName},</p><p>We're sorry to inform you that your transaction ID <b>${participant.transactionId}</b> has been <strong style="color:red;">rejected</strong>.</p>`;
    }

    // Send the email
    await transporter.sendMail({ to: userEmail, subject, html });

    console.log("✅ Updated participant:", participant);

    return res.status(200).json({ message: "Status updated", participant });
  } catch (err) {
    console.error("❌ Update participant by userId error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getGiveawayParticipants = async (req, res) => {
  try {
    const { giveawayId } = req.params;

    const giveaway = await Giveaway.findById(giveawayId).populate({
      path: "participants",
      populate: { path: "userId", select: "fullName email" },
    });

    if (!giveaway) {
      return res.status(404).json({ message: "Giveaway not found" });
    }

    return res.status(200).json({ participants: giveaway.participants });
  } catch (err) {
    console.error("Fetch participants error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadBanner = async (req, res) => {
  try {
    // Ensure a file is uploaded
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Save Cloudinary image URL to DB
    const media = await Media.create({ url: req.file.path });

    return res.status(201).json({ message: "Banner uploaded", media });
  } catch (err) {
    console.error("Banner upload error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Media.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Banner not found" });
    }

    return res.status(200).json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Delete banner error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const pickWinners = async (req, res) => {
  try {
    const { giveawayId } = req.params;
    const { winnerIds } = req.body; // Array of userIds selected as winners

    if (!winnerIds || !Array.isArray(winnerIds) || winnerIds.length === 0) {
      return res.status(400).json({ message: "No winners provided." });
    }

    const giveaway = await Giveaway.findById(giveawayId);
    if (!giveaway) {
      return res.status(404).json({ message: "Giveaway not found." });
    }

    // Filter verified participants
    const verifiedParticipants = giveaway.participants.filter(
      (p) => p.status === "verified"
    );

    const verifiedUserIds = verifiedParticipants.map((p) =>
      p.userId.toString()
    );

    // Validate all winners are verified participants
    const invalid = winnerIds.filter((id) => !verifiedUserIds.includes(id));
    if (invalid.length > 0) {
      return res.status(400).json({
        message: "Some selected winners are not verified participants.",
        invalid,
      });
    }

    // Check if winners already declared
    if (giveaway.winners.length >= giveaway.numberOfWinners) {
      return res.status(400).json({ message: "Winners already declared." });
    }

    // Update participants
    giveaway.participants = giveaway.participants.map((p) => {
      if (winnerIds.includes(p.userId.toString())) {
        return { ...p.toObject(), isWinner: true };
      }
      return p;
    });

    // Save winners
    giveaway.winners = [...new Set([...giveaway.winners, ...winnerIds])];

    await giveaway.save();

    // Get full user data for email sending
    const winnerUsers = await User.find({ _id: { $in: winnerIds } });

    // Send emails
    for (const user of winnerUsers) {
      await transporter.sendMail({
        from: `"Bindaas" <bindaaspay@gmail.com}>`,
        to: user.email,
        subject: `🎉 You're a Winner of "${giveaway.title}"`,
        html: `
          <h3>Congratulations ${user.fullName || user.email}!</h3>
          <p>You have been selected as a winner for the giveaway: <strong>${
            giveaway.title
          }</strong>.</p>
          <p>Thank you for participating!</p>
          <p>– Bindaas Team</p>
        `,
      });
    }

    return res.status(200).json({
      message: "Winners updated and notified successfully.",
      winners: giveaway.winners,
    });
  } catch (error) {
    console.error("Error picking winners:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
