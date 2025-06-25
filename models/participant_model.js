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

const Participant = mongoose.model("Participant", participantSchema);

export default Participant;
