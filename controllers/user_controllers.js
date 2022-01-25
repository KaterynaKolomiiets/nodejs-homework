const Joi = require("joi");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET;
const { nanoid }  = require("nanoid");

const { findUser, findByToken } = require("../model");

const { User, joiSchema } = require("../model/schemas/user_schema");
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
  console.log(req.user);
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
  // console.log(req.user, req.body)
};
 


const verifyToken = async (req, res, next) => {
  // console.log(req.params.verificationToken);
  try {
    const user = await findByToken(req.params.verificationToken);
    if (!user) {
      return res.status(404).json("User not found");
    }
    user.verificationToken = null,
      user.verify = true;
    // сохранить изменения пользователя в базу?
    return res.status(200).json('Verification successful');
    console.log(user)
  } catch (err) {
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
};
