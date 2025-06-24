import Giveaway from "../models/giveaway_model.js";

export const createGiveaway = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      endDate,
      description,
      bannerUrl,
      qrCodeUrl,
      fee,
      totalSlots,
      categories,
    } = req.body;

    // Required fields validation
    if (!title || !subTitle || !endDate || !fee || !totalSlots || !qrCodeUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate)) {
      return res.status(400).json({ message: "Invalid end date format" });
    }

    const giveaway = await Giveaway.create({
      title,
      subTitle,
      endDate: parsedEndDate,
      description,
      bannerUrl,
      qrCodeUrl,
      fee,
      totalSlots,
      categories,
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