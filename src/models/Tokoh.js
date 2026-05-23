import mongoose from "mongoose";

const tokohSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    jabatan: { type: String, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Tokoh = mongoose.models.Tokoh || mongoose.model("Tokoh", tokohSchema);

export default Tokoh;
