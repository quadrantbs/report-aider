import mongoose from "mongoose";

const partStateSchema = new mongoose.Schema({
  partKey: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  overridePrompt: {
    type: String,
  },
  overrideAiConfig: {
    model: String,
    temperature: Number,
    maxTokens: Number,
  },
  sourceIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TextSource",
    },
  ],
  isGenerated: {
    type: Boolean,
    default: false,
  },
  lastGeneratedAt: {
    type: Date,
  },
});

const reportV2Schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    schemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReportSchema",
      required: true,
    },
    globalSourceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TextSource",
      },
    ],
    parts: [partStateSchema],
    data: {
      type: Map,
      of: String,
      default: {},
    },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
    variables: {
      type: Map,
      of: String,
      default: {},
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

const ReportV2 =
  mongoose.models.ReportV2 || mongoose.model("ReportV2", reportV2Schema);

export default ReportV2;
