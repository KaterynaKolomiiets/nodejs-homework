const Joi = require("joi");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const { nanoid } = require("nanoid");

const { findUser, sendVerificationEmail } = require("./service");

const { User} = require("./schema");

const joiSchema = Joi.object({
  email: Joi.string()
    .pattern(
      new RegExp(
        "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
      )
    )
    .required(),
  password: Joi.string()
    .min(5)
    .max(28)
    .pattern(/^\+?[0-9]+$/)
    .required(),
});

const joiPasswordSchema = Joi.object({
  email: Joi.string()
    .pattern(
      new RegExp(
        "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
      )
    )
    .required(),
});


const signUp = async (req, res, next) => {
  try {
    Joi.attempt(req.body, joiSchema);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  const { email, password } = req.body;
  const existingUser = await findUser(email);
  if (existingUser) {
    return res.status(409).json({ message: "Email in use" });
  }
  try {
    const newUser = new User({ email, password, verificationToken: nanoid() });
    newUser.setPassword(password);
    await newUser.save();
    await sendVerificationEmail(email, newUser.verificationToken)
    res.status(201).json({
      email: newUser.email,
      subscription: newUser.subscription,
    });
  } catch (err) {
    console.log(err);
  }
};

const logIn = async (req, res, next) => {
  try {
    Joi.attempt(req.body, joiSchema);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  const { email, password } = req.body;
  const existingUser = await findUser(email);
  if (!existingUser) {
    return res.status(404).json("User not found");
  }
  existingUser.validPassword(password);
  const payload = {
    id: existingUser.id,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });

  await User.updateOne({ email }, { token });
  res.json({
    status: "Success",
    code: 200,
    data: { token },
  });
};

const logOut = async (req, res, next) => {
  console.log(req.user.email);
  await User.findOneAndUpdate(req.user.email, { token: null });
  return res.status(204).json();
};

const getCurrent = (req, res, next) => {
  res.status(200).json({
    email: req.user.email,
    subscription: req.user.subscription,
  });
};

const changeSubscription = async (req, res, next) => {
  try {
    Joi.attempt(req.body, joiSchema);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
 


const verifyToken = async (req, res, next) => {
  try {
    const user = await findUser(req.params.verificationToken);
    if (!user) {
      return res.status(404).json("User not found");
    }
    await User.updateOne({ verificationToken: req.params.verificationToken }, { verify: true, verificationToken: null});
    return res.status(200).json('Verification successful');
  } catch (err) {
    console.log(err)
  }
}

const resendVerificationEmail = async (req, res, next) => {
   try {
     Joi.attempt(req.body, joiPasswordSchema);
   } catch (err) {
     return res.status(400).json({ message: err.message });
   }
  if (!req.body.email) {
    return res.status(400).json({ message: "missing required field email" });
  }
  try {
    const user = await User.findOne({ "email": req.body.email });
    console.log(user.verify)
    if (user.verify) {
return res.status(400).json({ message: "Verification has already been passed"})
    }
    await sendVerificationEmail(req.body.email, user.verificationToken);
    return res.status(200).json({ message: "Verification email sent" });
  }
  catch (err) {
    console.log(err)
  }
}

module.exports = {
  signUp,
  logIn,
  logOut,
  getCurrent,
  changeSubscription,
  verifyToken,
  resendVerificationEmail,
};
