import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const User = mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
User.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    // hash paaword
    console.log("1");
    const salt = await bcryptjs.genSalt(10);
    const hashPass = await bcryptjs.hash(this.password, salt);
    console.log(hashPass);
    this.password = hashPass;
    next();
  } catch (error) {
    console.log(error.message);
  }
});

export default mongoose.model("user", User);
