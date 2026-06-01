import mongoose from "mongoose";

/**
 * ReportV3 stores its content as a recursive tree of "blocks".
 *
 * A block is one of:
 *   { type: "keyvalue", style, rows: [{ label, value }] }
 *   { type: "paragraph", style, text, prompt?, sourceIds? }
 *   { type: "divider" }
 *   { type: "list", label, labelStyle, markers, itemStyle, spacing, prompt?, items: [ListItem] }
 *
 * A ListItem is recursive (infinite nesting):
 *   { id, text, prompt?, sourceIds?, children: [ListItem] }
 *
 * The tree is stored as Mixed because Mongoose cannot model arbitrary-depth
 * recursion cleanly. Shape is validated in the API layer via
 * utils/reports-v3/validate.js before any write.
 */
const reportV3Schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional pointer to the preset/format this report was created from,
    // kept for reference only — the report is self-contained in `blocks`.
    presetKey: {
      type: String,
      default: "v1",
    },
    blocks: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    variables: {
      type: Map,
      of: String,
      default: {},
    },
    globalSourceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TextSource",
      },
    ],
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
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

const ReportV3 =
  mongoose.models.ReportV3 || mongoose.model("ReportV3", reportV3Schema);

export default ReportV3;
