const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { User } = require("./schema");

const findUser = async (query) => {
  console.log(query)
  return await User.findOne({ query });
};

const userSignUp = async (user) => {
  try {
    return await User.create(user);
  } catch (error) {
    console.log(error);
  }
};

const sendVerificationEmail = async (email, verificationToken) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_MY_EMAIL,
    subject: "Sending with SendGrid is Fun",
    text: ` Please finish your registration by clicking on this link: http://localhost:3000/api/users/verify/${verificationToken}`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  findUser,
  userSignUp,
  sendVerificationEmail,
};
