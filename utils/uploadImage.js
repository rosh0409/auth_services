import multer from "multer";
import fs from "fs";

//! image uploading storage

// export let uniqueFileName = "";
export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
    }
    if (!fs.existsSync("public/uploads")) {
      fs.mkdirSync("public/uploads");
    }
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    // uniqueFileName = uniqueSuffix + "_" + file.originalname;
    cb(null, uniqueSuffix + "_" + file.originalname);
  },
});
