import nodemailer from "nodemailer";

export const sendEmail = (sender, password, reciever, subject, message) => {
  //   console.log(sender, password, reciever, pid, dprice, aprice);
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: sender || "youremail@gmail.com", //sender
      pass: password || "yourpassword",
    },
  });

  var mailOptions = {
    from: sender, //|| "youremail@gmail.com", //sender
    to: reciever, //|| "myfriend@yahoo.com", //reciever
    subject:subject,
    text: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.message);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

sendEmail(
  "roshan.2002kumr@gmail.com",
  "ccxf gtrl hkxv mvpj",
  "rosh0409singh@gmail.com",
  "hello new mail"
);
