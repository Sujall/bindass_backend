import Giveaway from "../models/giveaway_model.js";

const createGiveaway = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      bannerUrl,
      qrCodeUrl,
      fee,
      totalSlots,
      startTime,
      endTime,
    } = req.body;

    // Required fields validation
    if (!title || !fee || !totalSlots || !startTime || !endTime || !qrCodeUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    if (isNaN(parsedStart) || isNaN(parsedEnd)) {
      return res.status(400).json({ message: "Invalid start or end time" });
    }

    // Optional: enforce time logic (e.g., start before end)
    if (parsedStart >= parsedEnd) {
      return res
        .status(400)
        .json({ message: "Start time must be before end time" });
    }

    const giveaway = await Giveaway.create({
      title,
      type,
      description,
      bannerUrl,
      qrCodeUrl,
      fee,
      totalSlots,
      startTime: parsedStart,
      endTime: parsedEnd,
      participants: [],
    });

    return res
      .status(201)
      .json({ message: "Giveaway created successfully", giveaway });
  } catch (err) {
    console.error("Create giveaway error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createGiveaway };
