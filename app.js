import express from "express";
import "./db/connection.js";
import dotenv from "dotenv";
import { userRoutes } from "./routes/userRoutes.js";
import bodyParser from "body-parser";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("<h1>hello</h1>");
});
app.use("/api/user", userRoutes);

app.listen(8000, (err) => {
  if (err) return console.log(err.message);
  console.log(`server started... \nhttp://localhost:8000`);
});
