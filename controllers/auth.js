const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

const getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
  });
};

const postLogin = (req, res, next) => {
  const { email } = req.body;
  transporter
    .sendMail({
      to: email,
      from: "bhanuthareja785@gmail.com",
      subject: "Singup succeeded",
      html: `<div>
        <h1>You successfully singned up!</h1>
        <p>Please click to subscribe</p>
      </div>`,
    })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
    return res.status(200)
};

module.exports = {
  getLogin,
  postLogin,
};
