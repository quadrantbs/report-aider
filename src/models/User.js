import { hash } from "bcrypt";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashedPassword = await hash(this.password, 10);
    this.password = hashedPassword;
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
