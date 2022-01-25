const passport = require("passport");
const passportJWT = require("passport-jwt");
const { User } = require("../model/User/schema");
require("dotenv").config();
const secret = process.env.SECRET;
const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;

const params = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(params, async function (payload, done) {
    try {
      const user = await User.findOne({ _id: payload.id });
      if (!user) {
        return done(new Error("User not found"));
      }
      return done(null, user);
    } catch (error) {
      done(error);
    }
  })
);
