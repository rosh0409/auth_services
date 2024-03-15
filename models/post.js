import mongoose from "mongoose";

const Post = mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    caption: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "user",
        default: [],
      },
    ],
    comments: [
      {
        uid: {
          type: mongoose.Types.ObjectId,
          require: true,
          ref: "user",
        },
        comment: {
          type: String,
          require: true,
        },
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("post", Post);
