import mongoose from "mongoose";

const dynamicReportSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
  },

  nik: {
    type: String,
    required: true,
    unique: true,
  },

  nkk: {
    type: String,
  },

  ttl: {
    type: String,
  },

  jenisKelamin: {
    type: String,
    enum: ["Laki-laki", "Perempuan"],
  },

  alamat: {
    type: String,
  },

  status: {
    type: String,
  },

  agama: {
    type: String,
  },

  noHp: {
    type: String,
  },

  pekerjaan: {
    type: String,
  },

  pendidikan: {
    type: String,
  },

  mediaSosial: {
    type: String,
  },

  namaAyah: {
    type: String,
  },

  namaIbu: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.DynamicReports ||
  mongoose.model("DynamicReports", dynamicReportSchema);