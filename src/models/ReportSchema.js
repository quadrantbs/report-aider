import mongoose from "mongoose";

const reportSchemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    structure: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    defaultVariables: [
      {
        key: { type: String, default: "" },
        label: { type: String, default: "" },
        defaultValue: { type: String, default: "" },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ReportSchema =
  mongoose.models.ReportSchema ||
  mongoose.model("ReportSchema", reportSchemaSchema);

export default ReportSchema;
