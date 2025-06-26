import { generateOTP } from "../utils/otp.js";
import jwt from "jsonwebtoken";
import User from "../models/auth_model.js";
import transporter from "../config/smtp.js";

const { sign, verify } = jwt;

export async function initiateRegistration(req, res) {
  const { fullName, email, mobile, address } = req.body;
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    let user = await User.findOne({ email, isVerified: false });

    if (!user) {
      user = new User({
        fullName,
        email,
        mobile,
        address,
        otp,
        otpExpires,
        isVerified: false,
      });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
      console.log(otp);
    }

    await user.save();

    try {
      console.log("OTP Send is as: ", otp)
      await transporter.sendMail({
        from: '"Bindaas" <bindaaspay@gmail.com>',
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}`,
      });
    } catch (mailError) {
      console.error("Email failed:", mailError);
    }

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Init Register Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function completeRegistration(req, res) {
  const { email, otp, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = password;
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;

    await user.save();

    res.status(200).json({ message: "Registration completed successfully" });
  } catch (error) {
    console.error("Complete Register Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function loginUser(req, res) {


  const { email, password } = req.body;

  console.log("Login Body", req.body)
  
  const user = await User.findOne({ email });

  if (!user || user.password !== password)
    return res.status(401).json({ message: "Invalid credentials" });

  if (!user.isVerified)
    return res.status(403).json({ message: "Please verify your email first" });

  const token = sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  console.log("Login Response", res.data);

  res.json({ user, token, message: "Logged in Successfully" });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await transporter.sendMail({
    from: '"Bindaas" <no-reply@giveaway.com>',
    to: email,
    subject: "Reset Password OTP",
    text: `Use this OTP to reset your password: ${otp}`,
  });

  res.status(200).json({ message: "Reset OTP sent to email" });
}

export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < Date.now())
    return res.status(400).json({ message: "Invalid or expired OTP" });

  user.password = newPassword;
  user.otp = null;
  user.otpExpires = null;

  await user.save();

  res.json({ message: "Password updated successfully" });
}

export async function logoutUser(req, res) {
  try {
    // No token invalidation unless using a blacklist
    res.status(200).json({ message: "Logged out successfully. Please discard your token on the client." });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}