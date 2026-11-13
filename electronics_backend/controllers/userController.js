import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const register = async (req, res, next) => {
  try {
    const { name, email, pass } = req.body;
    if (await userModel.exists({ email })) return res.status(409).json({ message: "Email already registered" });
    const hash = await bcrypt.hash(pass, 12);
    const result = await userModel.create({ name, email, pass: hash });
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Email already registered" });
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, pass } = req.body;
    const result = await userModel.findOne({ email }).select("+pass");
    if (!result || !await bcrypt.compare(pass, result.pass || "")) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: String(result._id), email: result.email, role: result.role },
      process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });
    res.status(200).json({ ...result.toJSON(), token });
  } catch (err) { next(err); }
};

export { register, login };
