import Giveaway from "../models/giveaway_model.js";
import User from "../models/auth_model.js";
import mongoose from "mongoose";

const registerForGiveaway = async (req, res) => {
  const userId = req.user.id;
  const { giveawayId, useWallet } = req.body;

  try {
    const giveaway = await Giveaway.findById(giveawayId);
    const user = await User.findById(userId);

    if (!giveaway) {
      return res.status(404).json({ message: "Giveaway not found" });
    }

    const now = new Date();

    // Time-based validation
    if (now < giveaway.startTime) {
      return res.status(400).json({ message: "Giveaway is not open yet" });
    }

    if (now > giveaway.endTime) {
      return res.status(400).json({ message: "Giveaway has ended" });
    }

    // Check if already registered
    const alreadyRegistered = giveaway.participants.some(
      (p) => p.userId && p.userId.toString() === userId
    );

    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ message: "Already registered for this giveaway" });
    }

    // Check for available slots
    if (giveaway.participants.length >= giveaway.totalSlots) {
      return res.status(400).json({ message: "Giveaway is full" });
    }

    // Handle payment
    if (useWallet) {
      if (user.walletBalance < giveaway.fee) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      user.walletBalance -= giveaway.fee;
    } else {
      // Simulate direct payment
      console.log("Direct payment success (simulated)");
    }

    // Register user
    giveaway.participants.push({
      userId: user._id,
      registeredAt: now,
    });

    await giveaway.save();
    await user.save();

    return res.status(200).json({
      message: "Successfully registered for giveaway",
      newBalance: user.walletBalance,
    });
  } catch (err) {
    console.error("Giveaway registration failed:", err);
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

export { registerForGiveaway, getUserGiveawayHistory };
