import CryptoJs from "crypto-js";

const decrypt = (text) => {
  return CryptoJs.AES.decrypt(text, process.env.CRYPTOJSSECRETKEY).toString(
    CryptoJs.enc.Utf8
  );
};

export const DecryptData = (req, res, next) => {
  try {
    console.log("before Decryption:", req.body);
    Object.keys(req.body).forEach((key) => {
      req.body[key] = decrypt(req.body[key]);
    });
    console.log("after Decryption:", req.body);
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(200).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
