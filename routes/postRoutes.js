import express from "express";
import Post from "../models/post.js";
import User from "../models/user.js";
import multer from "multer";
import { storage } from "../utils/uploadImage.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
export const postRoutes = express.Router();

const upload = multer({ storage: storage });


//! Get All Post
postRoutes.get("/get-all-post", async (req, res) => {
  try {
    const posts = await Post.find();
    return res.status(200).send({
      status: "success",
      message: "All posts list",
      posts,
    });
  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//! Get Post By ID
postRoutes.get("/get-post/:pid", async (req, res) => {
  try {
    console.log(req.params);
    const { pid } = req.params;
    const post = await Post.findById(pid);
    return res.status(200).send({
      status: "success",
      message: "All posts list",
      post,
    });
  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//! POST Request for creating new post
postRoutes.post("/create-post", upload.single("image"), async (req, res) => {
  const image = req.file.filename;
  try {
    const { title, caption, user } = req.body;
    const existingUser = await User.findById(user);
    console.log(existingUser);
    if (!existingUser) {
      fs.unlinkSync(path.join("public/uploads/", image));
      return res.status(400).json({
        status: "failed",
        message: "User does not exist",
      });
    }
    if (!(title && caption && user)) {
      fs.unlinkSync(path.join("public/uploads/", image));
      return res.status(400).json({
        status: "failed",
        message: "Please provide all fields",
      });
    }
    const post = new Post({
      title,
      caption,
      image,
      user,
    });
    const session = await mongoose.startSession();
    session.startTransaction();
    await post.save({ session });
    existingUser.posts.push(post);
    await existingUser.save({ session });
    await session.commitTransaction();

    return res.status(200).json({
      status: "success",
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    fs.unlinkSync(path.join("public/uploads/", image));
    return res.status(500).send({
      status: "failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//! PATCH Request for updating any field of post
postRoutes.patch("/update-post/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const update = req.body;
    const post = await Post.findById(pid);
    if (!post)
      return res.status(400).json({
        status: "failed",
        message: "Invailid Post ID",
      });
    const updatedPost = await Post.findOneAndUpdate({ _id: pid }, update, {
      new: true,
    });
    return res.status(200).json({
      status: "success",
      message: "Post updated successfully",
      updatedPost,
    });
  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//! DELETE Request for deleting post
postRoutes.delete("/delete-post/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    console.log(pid);
    const post = await Post.findById(pid);
    console.log(post);
    if (!post)
      return res.status(400).json({
        status: "failed",
        message: "Invailid Post ID",
      });
    const deletedPost = await Post.deleteOne({ _id: pid });
    const updateUserPost = await User.updateOne(
      { _id: post.user },
      { $pull: { posts: pid } }
    );
    fs.unlinkSync(path.join("public/uploads/", post.image));
    return res.status(200).json({
      status: "success",
      message: "Post deleted successfully",
      deletedPost,
      updateUserPost,
    });
  } catch (error) {
    return res.status(500).send({
      status: "failed",
      message: "Something went wrong",
      error: error.message,
    });
  }
});
