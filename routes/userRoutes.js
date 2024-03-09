import express from "express";
import emailValidator from "deep-email-validator";
import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";
import generateAuthToken from "../utils/generateToken.js";
export const userRoutes = express.Router();

userRoutes.get("/get-all-user", async (req, res) => {
  try {
    const users = await User.find();
    return res.send({
      status: "success",
      message: "All users list",
      users,
    });
  } catch (error) {}
});
userRoutes.post("/register", async (req, res) => {
  const { username, email, password, confPassword } = req.body;
  //   console.log(await emailValidator.validate(email));
  const isValidEmail = await emailValidator.validate(email);
  //   console.log(isValidEmail.valid);
  //   console.log(username, email, password, confPassword);
  if (!(username && email && password && confPassword))
    return res.status(201).json({
      status: "failed",
      message: "Please fill all the fields",
    });

  if (!isValidEmail.valid)
    return res.status(201).json({
      status: "failed",
      message: "Please enter a valid email id",
    });

  if (password !== confPassword)
    return res.status(201).json({
      status: "failed",
      message: "Password and Confirm Password does not match",
    });
  try {
    if (await User.findOne({ email })) {
      return res.status(201).json({
        status: "failed",
        message: "User already exists",
      });
    }

    const user = new User({
      username,
      email,
      password,
    });
    user.save();
    res.status(201).json({
      status: "success",
      message: "User successfully registered",
    });
  } catch (error) {}
});
userRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //   const isValidEmail = await emailValidator.validate(email);
  if (!(email && password))
    return res.status(201).json({
      status: "failed",
      message: "Please fill all the fields",
    });
  //   if (!isValidEmail.valid)
  //     return res.status(201).json({
  //       status: "failed",
  //       message: "Please enter a valid email id",
  //     });
  const user = await User.findOne({ email });
  if (!user)
    return res.status(201).json({
      status: "failed",
      message: "Bad Credentials",
    });
  const dePassword = await bcryptjs.compare(password, user.password);
  if (!(user.email && dePassword))
    return res.status(201).json({
      status: "failed",
      message: "Bad Credentials",
    });
  return res.status(201).json({
    status: "success",
    message: "User Loggedin successfull",
  });
});
userRoutes.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(201).json({
      status: "failed",
      message: "Please fill all the fields",
    });
  const user = await User.findOne({ email });
  if (!user)
    return res.status(201).json({
      status: "failed",
      message: "Bad Credentials",
    });
  // Generate token
  const token = generateAuthToken(user._id);
  // Store token in the database
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 900000; // 15m
  await user.save();
  console.log(user._id);
  sendEmail(
    "roshan.2002kumr@gmail.com",
    "ccxf gtrl hkxv mvpj",
    email,
    "Reset Password",
    `To reset your password, click on the following link: http://localhost:8000/api/user/reset-password/${token}`
  );
  return res.status(201).json({
    status: "success",
    message: "Reset password link has been sent to your registered email id",
    token,
  });
});

userRoutes.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confPassword } = req.body;
    if (newPassword !== confPassword)
      return res.status(201).json({
        status: "failed",
        message: "Password and Confirm Password does not match",
      });
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: "failed", message: "Invalid or expired token" });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ status: "success", message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
