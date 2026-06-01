import mongoose from "mongoose";

/**
 * A reusable V3 report format. Holds a block tree (same shape as ReportV3.blocks,
 * validated via utils/reports-v3/validate.js) plus the variables a report
 * created from it should start with. Reports are seeded from a template and then
 * become self-contained, so editing a template never alters existing reports.
 */
const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    blocks: {
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
    isPublic: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const ReportV3Template =
  mongoose.models.ReportV3Template ||
  mongoose.model("ReportV3Template", templateSchema);

export default ReportV3Template;
