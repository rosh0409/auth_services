import jwt from "jsonwebtoken";

const generateAuthToken = (id, time = "15m") => {
  try {
    let token = jwt.sign({ userID: id }, process.env.JWTSECRETKEY, {
      expiresIn: time,
    });
    return token;
  } catch (error) {
    return new Error(error.message);
  }
};

console.log(generateAuthToken(1, "1m"));

export default generateAuthToken;
