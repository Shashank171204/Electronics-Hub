import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
    toJSON: { transform: (_doc, ret) => { delete ret.pass; delete ret.password; return ret; } },
  }
);

export default mongoose.model("User", userSchema);
