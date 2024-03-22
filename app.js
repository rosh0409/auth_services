import express from "express";
import "./db/connection.js";
import dotenv from "dotenv";
import { userRoutes } from "./routes/userRoutes.js";
import bodyParser from "body-parser";
import { postRoutes } from "./routes/postRoutes.js";
import cookieParser from "cookie-parser";
import verifyUserToken from "./middleware/verifyUserToken.js";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
// app.get("/api/post/get-all-post", (req, res) => {
//   res.send("<h1>hello</h1>");
// });
app.use("/api/user", userRoutes);
app.use("/api/post",verifyUserToken, postRoutes);
// app.use("/api/post/get-all-post", (req, res) => {
//   res.send("rgf");
// });
// app.use("/api/post", postRoutes);

app.listen(8000, (err) => {
  if (err) return console.log(err.message);
  console.log(`server started... \nhttp://localhost:8000`);
});
