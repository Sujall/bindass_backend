import mongoose, { Schema } from "mongoose";

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
  bannerUrl: {
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
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Participant" 
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Giveaway = mongoose.model("Giveaway", giveawaySchema);

export default Giveaway;
