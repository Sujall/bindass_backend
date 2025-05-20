import Giveaway from "../models/giveaway_model.js";

const createGiveaway = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      bannerUrl,
      fee,
      totalSlots,
      startTime,
      endTime,
    } = req.body;

    // Validate all required fields
    if (!title || !type || !fee || !totalSlots || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    if (isNaN(parsedStart) || isNaN(parsedEnd)) {
      return res.status(400).json({ message: "Invalid start or end time" });
    }

    const giveaway = await Giveaway.create({
      title,
      type,
      description,
      bannerUrl,
      fee,
      totalSlots,
      startTime: parsedStart,
      endTime: parsedEnd,
      participants: [],
    });

    res.status(201).json({ message: "Giveaway created", giveaway });
  } catch (err) {
    console.error("Create giveaway error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export { createGiveaway };
