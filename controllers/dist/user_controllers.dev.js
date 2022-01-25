"use strict";

var Joi = require("joi");

var jwt = require("jsonwebtoken"); // new


var gravatar = require("gravatar");

var path = require("path");

var fs = require("fs").promises;

var Jimp = require("jimp"); // new


var secret = process.env.SECRET;

var _require = require("../model"),
    findUser = _require.findUser;

var _require2 = require("../model/schemas/user_schema"),
    User = _require2.User,
    joiSchema = _require2.joiSchema;

var _require3 = require("jimp"),
    resize = _require3.resize;

var signUp = function signUp(req, res, next) {
  var _req$body, email, password, existingUser, newUser;

  return regeneratorRuntime.async(function signUp$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          Joi.attempt(req.body, joiSchema);
          _context.next = 7;
          break;

        case 4:
          _context.prev = 4;
          _context.t0 = _context["catch"](0);
          return _context.abrupt("return", res.status(400).json({
            message: _context.t0.message
          }));

        case 7:
          _req$body = req.body, email = _req$body.email, password = _req$body.password;
          _context.next = 10;
          return regeneratorRuntime.awrap(findUser(email));

        case 10:
          existingUser = _context.sent;

          if (!existingUser) {
            _context.next = 13;
            break;
          }

          return _context.abrupt("return", res.status(409).json({
            message: "Email in use"
          }));

        case 13:
          _context.prev = 13;
          newUser = new User({
            email: email,
            password: password,
            avatarURL: gravatar.url(email)
          });
          console.log(newUser);
          newUser.setPassword(password);
          _context.next = 19;
          return regeneratorRuntime.awrap(newUser.save());

        case 19:
          res.status(201).json({
            email: newUser.email,
            subscription: newUser.subscription
          });
          _context.next = 25;
          break;

        case 22:
          _context.prev = 22;
          _context.t1 = _context["catch"](13);
          console.log(_context.t1);

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 4], [13, 22]]);
};

var logIn = function logIn(req, res, next) {
  var _req$body2, email, password, existingUser, payload, token;

  return regeneratorRuntime.async(function logIn$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          Joi.attempt(req.body, joiSchema);
          _context2.next = 7;
          break;

        case 4:
          _context2.prev = 4;
          _context2.t0 = _context2["catch"](0);
          return _context2.abrupt("return", res.status(400).json({
            message: _context2.t0.message
          }));

        case 7:
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;
          _context2.next = 10;
          return regeneratorRuntime.awrap(findUser(email));

        case 10:
          existingUser = _context2.sent;

          if (existingUser) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", res.status(404).json("User not found"));

        case 13:
          existingUser.validPassword(password);
          payload = {
            id: existingUser.id
          };
          token = jwt.sign(payload, secret, {
            expiresIn: "1h"
          });
          _context2.next = 18;
          return regeneratorRuntime.awrap(User.updateOne({
            email: email
          }, {
            token: token
          }));

        case 18:
          res.json({
            status: "Success",
            code: 200,
            data: {
              token: token
            }
          });

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 4]]);
};

var logOut = function logOut(req, res, next) {
  return regeneratorRuntime.async(function logOut$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(User.findOneAndUpdate(req.user.email, {
            token: null
          }));

        case 2:
          console.log(req.user);
          return _context3.abrupt("return", res.status(204).json());

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
};

var getCurrent = function getCurrent(req, res, next) {
  res.status(200).json({
    email: req.user.email,
    subscription: req.user.subscription
  });
};

var changeSubscription = function changeSubscription(req, res, next) {
  return regeneratorRuntime.async(function changeSubscription$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          Joi.attempt(req.body, joiSchema);
          _context4.next = 7;
          break;

        case 4:
          _context4.prev = 4;
          _context4.t0 = _context4["catch"](0);
          return _context4.abrupt("return", res.status(400).json({
            message: _context4.t0.message
          }));

        case 7:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 4]]);
};

var updateAvatar = function updateAvatar(req, res, next) {
  var temporaryName, format, newLocation;
  return regeneratorRuntime.async(function updateAvatar$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          temporaryName = req.file.path;
          console.log(req.file);
          format = req.file.filename.split(".")[1];
          newLocation = path.join(__dirname, "/../public/avatars/", "".concat(req.user.id, ".").concat(format));
          _context5.prev = 4;
          Jimp.read(temporaryName).then(function (file) {
            return file.resize(250, 250).write(newLocation);
          })["catch"](function (err) {
            console.error(err);
          });
          _context5.next = 8;
          return regeneratorRuntime.awrap(User.findOneAndUpdate(req.user.id, {
            "avatarURL": newLocation
          }));

        case 8:
          _context5.next = 15;
          break;

        case 10:
          _context5.prev = 10;
          _context5.t0 = _context5["catch"](4);
          _context5.next = 14;
          return regeneratorRuntime.awrap(fs.unlink(temporaryName));

        case 14:
          return _context5.abrupt("return", next(_context5.t0));

        case 15:
          res.json({
            avatarURL: newLocation,
            status: 200
          });

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[4, 10]]);
};

module.exports = {
  signUp: signUp,
  logIn: logIn,
  logOut: logOut,
  getCurrent: getCurrent,
  changeSubscription: changeSubscription,
  updateAvatar: updateAvatar
};