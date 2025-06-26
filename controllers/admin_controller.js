import sendMail from "../config/smtp.js";
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
    } = req.body;

    // Required fields validation
    if (!title || !subTitle || !endDate || !fee || !totalSlots) {
      return res.status(500).json({ message: "Missing required fields" });
    }

    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate)) {
      return res.status(500).json({ message: "Invalid end date format" });
    }

    // Get uploaded file URLs from Cloudinary
    const giveawayImageUrl = req.files?.giveawayImage?.[0]?.path;
    const qrCodeUrl = req.files?.qrCode?.[0]?.path;

    // if (!giveawayImageUrl || !qrCodeUrl) {
    //   return res
    //     .status(500)
    //     .json({ message: "Banner and QR Code are required." });
    // }

    const giveaway = await Giveaway.create({
      title,
      subTitle,
      endDate: parsedEndDate,
      description,
      giveawayImageUrl,
      qrCodeUrl,
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

    console.log("Hit updateParticipantStatusByUserId with params:", req.params);


    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const update = { status };
    if (status === "verified") update.verifiedAt = new Date();

    const participant = await Participant.findOneAndUpdate(
      { userId }, // Lookup by userId instead of _id
      update,
      { new: true }
    ).populate("userId", "email fullName");

    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

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

    await sendMail({ to: userEmail, subject, html });

    return res.status(200).json({ message: "Status updated", participant });
  } catch (err) {
    console.error("Update participant by userId error:", err);
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
