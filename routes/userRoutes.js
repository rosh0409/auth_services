import express from "express";
import emailValidator from "deep-email-validator";
import User from "../models/user.js";
import Post from "../models/post.js";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";
import generateAuthToken from "../utils/generateToken.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import verifyUserToken from "../middleware/verifyUserToken.js";
import { encryptData } from "../utils/encryptData.js";
import { DecryptData } from "../middleware/decryptData.js";

export const userRoutes = express.Router();

//! GET Request for getting all registered user
userRoutes.get("/get-all-user", verifyUserToken, async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).send({
      status: "success",
      message: "All users list",
      users,
    });
  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//! POST Request for registering new user
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

//! POST Request for Logging user
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
  const token = generateAuthToken(user._id, "1m");
  if (req.cookies["internship"]) {
    return res.status(201).json({
      message: "Already Logged in",
    });
    // res.clearCookie("internship");
    // console.log("true");
    // res.cookies["internship"] = "";
  }
  return res
    .cookie("internship", token, {
      path: "/",
      expires: new Date(Date.now() + 30000),
      httpOnly: true,
      sameSite: "strict",
    })
    .status(201)
    .json({
      status: "success",
      message: "User Loggedin successfully",
    })
    .end();
});

//! POST Request for forgot password
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
    process.env.SENDEREMAIL,
    process.env.SENDERPASSWORD,
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

//! POST Request for reseting password
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
    return res
      .status(500)
      .json({ status: "failed", message: "Internal server error" });
  }
});

//!POST Request for logging out a user
userRoutes.post("/logout", verifyUserToken, async (req, res) => {
  try {
    const token = req.headers?.cookie.split("=")[1];
    // console.log(token);
    if (!token) {
      return res.status(400).json({
        status: "failed",
        message: "Token not found",
      });
    }
    jwt.verify(token, process.env.JWTSECRETKEY, (err) => {
      // console.log(user);

      if (err) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid Token",
          error: err.message,
        });
      }
      return res
        .clearCookie("internship")
        .status(200)
        .json({
          status: "success",
          message: "Successfully Logged Out :-)",
        })
        .end();
      // res.clearCookie("internship");
      // req.cookies["internship"] = "";
    });
  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//!POST Request for ecrypting data
userRoutes.post("/encrypt-user", async (req, res) => {
  try {
    const { username, email, password, confPassword } = req.body;
    if (!(username && email && password && confPassword))
      return res.status(400).json({
        status: "failed",
        message: "Please fill all the fields",
      });
    const encrptedUsername = encryptData(username).toString();
    const encrptedEmail = encryptData(email).toString();
    const encrptedPassword = encryptData(password).toString();
    const encrptedConfPassword = encryptData(confPassword).toString();
    console.log(encrptedUsername);
    return res.status(200).json({
      status: "success",
      message: "Encrypted user",
      username: encrptedUsername,
      email: encrptedEmail,
      password: encrptedPassword,
      confPassword: encrptedConfPassword,
    });
  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//! POST Request for liking a post
userRoutes.post("/liked-post", verifyUserToken, async (req, res) => {
  try {
    const { user, post } = req.body;
    if (!(user && post))
      return res.status(400).json({
        status: "failed",
        message: "Please fill all fields",
      });
    const user_token = req.uid;
    if (user !== user_token)
      return res.status(400).json({
        status: "failed",
        message: "User ID and Loggedin user does not match",
      });
    const existingUser = await User.findById(user);
    if (!existingUser)
      return res.status(400).json({
        status: "failed",
        message: "Invaild User ID",
      });
    const existingPost = await Post.findById(post);
    if (!existingPost)
      return res.status(400).json({
        status: "failed",
        message: "Invaild Post ID",
      });
    const isLikedPost = await User.find({ _id: user, likes: post });
    if (isLikedPost.length !== 0)
      return res.status(400).json({
        status: "failed",
        message: "Already liked",
      });
    const isLikedByUser = await Post.find({ _id: post, likes: user });
    if (isLikedByUser.length !== 0)
      return res.status(400).json({
        status: "failed",
        message: "Already liked",
      });
    // const session = await mongoose.startSession();
    // session.startTransaction();
    await Post.findByIdAndUpdate(post, {
      $addToSet: { likes: user },
    });
    await User.findByIdAndUpdate(user, {
      $addToSet: { likes: post },
    });
    const updatedPost = await Post.findById(post);
    const updatedUser = await User.findById(user);
    // const updatedPost = await existingPost.likes.push(user);
    // await existingPost.save({ session });
    // const updatedUser = existingUser.likes.push(post);
    // await existingUser.save({ session });
    // await session.commitTransaction();

    return res.status(200).json({
      status: "success",
      message: "Post Liked",
      updatedPost,
      updatedUser,
    });
  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//! POST Request for posting comment on a post
userRoutes.post("/comment-on-post", verifyUserToken, async (req, res) => {
  try {
    const { user, post, comment } = req.body;
    const user_token = req.uid;
    if (user !== user_token)
      return res.status(400).json({
        status: "failed",
        message: "User ID and Loggedin user does not match",
      });
    if (!(user && post && comment))
      return res.status(400).json({
        status: "failed",
        message: "Please fill all fields",
      });

    const existingUser = await User.findById(user);
    if (!existingUser)
      return res.status(400).json({
        status: "failed",
        message: "Invaild User ID",
      });
    const existingPost = await Post.findById(post);
    if (!existingPost)
      return res.status(400).json({
        status: "failed",
        message: "Invaild Post ID",
      });
    const session = await mongoose.startSession();
    session.startTransaction();
    existingPost.comments.push({ uid: user, comment: comment });
    await existingPost.save({ session });
    existingUser.comments.push({ pid: post, comment: comment });
    await existingUser.save({ session });
    await session.commitTransaction();
    const commentedPost = await Post.findById(post);
    const commentedUser = await User.findById(user);
    return res.status(200).json({
      status: "success",
      message: "Comment posted successfully",
      commentedPost,
      commentedUser,
    });
  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
});
