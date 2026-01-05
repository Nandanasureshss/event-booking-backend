import Login from "../Model/loginSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Login.findOne({ email });

    // ✅ AUTO REGISTER IF USER DOES NOT EXIST
    if (!user) {
      const hashed = await bcrypt.hash(password, 10);

      user = await Login.create({
        email,
        password: hashed,
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      msg: "Login Successful",
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

