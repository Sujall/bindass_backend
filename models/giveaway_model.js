import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "User", 
    required: true 
  },
  transactionId: { 
    type: String, 
    required: true 
  },
  registeredAt: { 
    type: Date, 
    default: Date.now 
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  verifiedAt: { 
    type: Date 
  },
  verifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
});

const giveawaySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["upcoming", "ongoing", "expired"],
      default: "upcoming",
    },
    description: {
      type: String,
    },
    bannerUrl: {
      type: String,
    },
    qrCodeUrl: {
      type: String, // URL of the uploaded QR code image
    },
    fee: {
      type: Number,
      required: true,
    },
    totalSlots: {
      type: Number,
      required: true,
    },
    participants: [participantSchema],
  },
  {
    timestamps: true,
  }
);

const Giveaway = mongoose.model("Giveaway", giveawaySchema);

export default Giveaway;
