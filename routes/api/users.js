const express = require("express");
const router = express.Router();
const passport = require("passport");
require("dotenv").config();
require("../../config/config-passport");
const multer = require("../../multer");

const {
  signUp,
  logIn,
  logOut,
  getCurrent,
  changeSubscription,
  updateAvatar,
} = require("../../controllers/user_controllers");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err || req.headers.authorization !== `Bearer ${user.token}`) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

router.post("/signup", signUp);

router.post("/login", logIn);

router.post("/logout", auth, logOut);

router.get("/current", auth, getCurrent);

router.patch("/", auth, changeSubscription);

router.patch("/avatars", auth, multer.single("picture"), updateAvatar)

module.exports = router;
