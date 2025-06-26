import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  verifiedAt: {
    type: Date,
  },
});

const giveawaySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  subTitle: {
    type: String,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
  },
  giveawayImageUrl: {
    type: String,
  },
  qrCodeUrl: {
    type: String,
  },
  fee: {
    type: Number,
    required: true,
  },
  totalSlots: {
    type: Number,
    required: true,
  },
  categories: [
    {
      type: String,
    },
  ],
  numberOfWinners: {
    type: Number,
    default: 1,
  },
  participants: [participantSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Giveaway = mongoose.model("Giveaway", giveawaySchema);

export default Giveaway;
