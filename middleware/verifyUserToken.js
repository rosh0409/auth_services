import jwt from "jsonwebtoken";

const verifyUserToken = async (req, res, next) => {
  try {
    if (!req.headers?.cookie) {
      return res.status(400).json({
        status: "failed",
        message: "Not a verified user",
      });
    }
    // console.log("token :: ", req.headers?.cookie.split("=")[1]);
    const token = req.headers?.cookie.split("=")[1];
    jwt.verify(token, process.env.JWTSECRETKEY, (err, user) => {
      if (err) {
        return res.status(400).json({
          status: "failed",
          message: "Invalid Token",
        });
      }
      req.uid = user.userID;
    });
  } catch (error) {
    return res.json({
      status: "failed",
      message: ` ${error.message}`,
    });
  }
  next();
};
export default verifyUserToken;
