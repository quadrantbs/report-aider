import mongoose from "mongoose";

const textSourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["transcript", "article", "meeting-notes", "copied-text", "markdown", "other"],
      default: "other",
    },
    metadata: {
      type: Map,
      of: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TextSource =
  mongoose.models.TextSource || mongoose.model("TextSource", textSourceSchema);

export default TextSource;
