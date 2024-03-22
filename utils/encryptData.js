import cryptojs from "crypto-js";

export const encryptData = (data) => {
  return cryptojs.AES.encrypt(data, process.env.CRYPTOJSSECRETKEY);
};
