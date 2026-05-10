import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
      default: "KM 01",
      trim: true,
    },
    cc: {
      type: [String],
      required: true,
      default: ["KM 02", "KM 03"],
      trim: true,
    },
    from: {
      type: String,
      required: true,
      default: "LMG 01",
      trim: true,
    },
    field: {
      type: String,
      required: true,
      default: "Sosbud",
      trim: true,
    },
    code: {
      type: String,
      required: true,
      default: "🔴🟡🟢",
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    reportDate: {
      type: Date,
      required: true,
    },
    source: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          position: { type: String, required: true, trim: true },
        },
      ],
      _id: false,
      required: true,
    },
    twoSentencesConclusion: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: [[String]],
      required: true,
    },
    notesRecap: {
      type: String,
      required: true,
    },
    notesToDo: {
      type: String,
      required: true,
    },
    notesMonitoring: {
      type: String,
      required: true,
    },
    areaOfReport: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;
