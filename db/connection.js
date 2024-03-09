import mongoose from "mongoose";

mongoose
  .connect(
    `mongodb+srv://rosh0409:rosh0409@cluster0.cvohyfl.mongodb.net/InternshipAuth?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("connected");
  })
  .catch((e) => {
    console.log("not connected");
    console.log(e);
  });
