import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    kepada: {
      type: String,
      required: true,
      default: "KM 01",
      trim: true,
    },

    tembusan: {
      type: [String],
      required: true,
      default: "KM 02 dan KM 03",
      trim: true,
    },

    dari: {
      type: String,
      required: true,
      default: "KBPOL",
      trim: true,
    },

    perihal: {
      type: String,
      required: true,
      trim: true,
    },

    reportDate: {
      type: Date,
      required: true,
    },

    narasumber: {
      type: [
        {
          name: { type: String, required: true, trim: true },
          position: { type: String, required: true, trim: true },
        },
      ],
      _id: false,
      required: true,
    },

    kesimpulanLead: {
      type: String,
      required: true,
      trim: true,
    },

    isi: {
      type: [[String]],
      required: true,
    },

    judgement: {
      type: String,
      required: true,
      trim: true,
    },

    earlyWarning: {
      type: String,
      required: true,
      trim: true,
    },

    forecasting: {
      type: String,
      required: true,
      trim: true,
    },

    problemSolving: {
      type: String,
      required: true,
      trim: true,
    },

    notesRecap: {
      type: String,
      required: true,
    },

    notesMonitoring: {
      type: String,
      required: true,
    },

    lokasi: {
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

const Report =
  mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;