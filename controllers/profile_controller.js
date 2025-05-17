import jwt from "jsonwebtoken";
import User from "../models/auth_model.js";

export async function updateProfile(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { fullName, mobile, address, profileImage } = req.body;

    const updateData = { fullName, mobile, address };

    // Allow profileImage update only if provided
    if (profileImage) updateData.profileImage = profileImage;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        fullName: updatedUser.fullName,
        mobile: updatedUser.mobile,
        email: updatedUser.email, // not editable
        address: updatedUser.address,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
