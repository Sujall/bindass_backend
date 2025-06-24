import Giveaway from "../models/giveaway_model.js";
import User from "../models/auth_model.js";
import mongoose from "mongoose";

const getAllGiveaways = async (req, res) => {
  try {
    const role = req.user?.role || "user"; // Default to 'user'

    const giveaways = await Giveaway.find({}).sort({ startTime: -1 });

    const formattedGiveaways = giveaways.map(g => ({
      id: g._id,
      title: g.title,
      type: g.type,
      description: g.description,
      qrCodeUrl: g.qrCodeUrl,
      bannerUrl: g.bannerUrl,
      fee: g.fee,
      totalSlots: g.totalSlots,
      startTime: g.startTime,
      endTime: g.endTime,
      participantsCount: g.participants?.length || 0,
      // qrCodeUrl is intentionally excluded here
    }));

    res.status(200).json({
      message: "Giveaways fetched successfully",
      giveaways: formattedGiveaways
    });

  } catch (err) {
    console.error("Fetch giveaways error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const participateForGiveaway = async (req, res) => {
  const { giveawayId, transactionId, email } = req.body;

  try {
    // Validate required inputs
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
    if (now < giveaway.startTime) {
      return res.status(400).json({ message: "Giveaway is not open yet" });
    }

    if (now > giveaway.endTime) {
      return res.status(400).json({ message: "Giveaway has ended" });
    }

    // Check if user already registered
    const alreadyRegistered = giveaway.participants.some(
      (p) => p.userId.toString() === user._id.toString()
    );
    
    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    // Check for available slots
    if (giveaway.participants.length >= giveaway.totalSlots) {
      return res.status(400).json({ message: "Giveaway is full" });
    }

    // Register user with pending status
    giveaway.participants.push({
      userId: user._id,
      transactionId,
      registeredAt: now,
      status: "pending"
    });

    await giveaway.save();

    return res.status(200).json({
      message: "Registered successfully, awaiting verification",
      status: "pending"
    });
  } catch (err) {
    console.error("Giveaway registration error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserGiveawayHistory = async (req, res) => {
  const userId = req.user._id;
  const now = new Date();

  try {
    // Find all giveaways where this user participated
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const giveaways = await Giveaway.find({
      "participants.userId": objectUserId,
    }).sort({ startTime: -1 });

    const active = [];
    const completed = [];
    const upcoming = [];

    giveaways.forEach((giveaway) => {
      if (now < giveaway.startTime) {
        upcoming.push(giveaway); // Not started yet
      } else if (now >= giveaway.startTime && now <= giveaway.endTime) {
        active.push(giveaway); // Ongoing
      } else if (now > giveaway.endTime) {
        completed.push(giveaway); // Time ended
      }
    });

    console.log("Current User ID:", req.user.id);

    console.log("Giveaways Found:", giveaways.length);

    const allGiveaways = await Giveaway.find({});
    console.log(JSON.stringify(allGiveaways, null, 2));

    return res.status(200).json({
      active,
      completed,
      upcoming,
    });
  } catch (err) {
    console.error("Error fetching giveaway history:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export { participateForGiveaway, getUserGiveawayHistory, getAllGiveaways };