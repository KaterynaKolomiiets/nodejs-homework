const Joi = require("joi");
const jwt = require("jsonwebtoken");
// new
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs").promises;
const Jimp = require("jimp");
// new
const secret = process.env.SECRET;

const { findUser } = require("../model");

const { User, joiSchema } = require("../model/schemas/user_schema");
const { resize } = require("jimp");

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
    const newUser = new User({ email, password, avatarURL: gravatar.url(email) });
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

const updateAvatar = async (req, res, next) => {
    
  const { path: temporaryName } = req.file;
  const format = req.file.filename.split(".")[1]
  const newLocation = path.join(__dirname, "/../public/avatars/", `${req.user.id}.${format}`);
  const url = `http://localhost:3000/avatars/${req.user.id}.${format}`;
  try {
    Jimp.read(temporaryName)
      .then((file) => {
        return file
          .resize(250, 250)
          .write(newLocation); 
      })
      .catch((err) => {
        console.error(err);
      });
    await User.findOneAndUpdate(req.user.id, {"avatarURL": url})
  } catch (err) {
    await fs.unlink(temporaryName);
    return next(err);
  }
  res.json({ avatarURL: url, status: 200 });
}

module.exports = {
  signUp,
  logIn,
  logOut,
  getCurrent,
  changeSubscription,
  updateAvatar,
};