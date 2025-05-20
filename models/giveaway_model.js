import mongoose, { Schema } from "mongoose";

const giveawaySchema = new Schema({
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
  fee: {
    type: Number,
    required: true,
  },
  totalSlots: {
    type: Number,
    required: true,
  },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      registeredAt: { type: Date, default: Date.now },
    },
  ],
});

const Giveaway = mongoose.model("Giveaway", giveawaySchema);

export default Giveaway;
