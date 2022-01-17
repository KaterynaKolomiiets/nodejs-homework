const Joi = require("joi");
const mongoose = require("../db");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;
const SchemaTypes = mongoose.SchemaTypes;

const contacts = new Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: SchemaTypes.ObjectId,
    ref: "user",
  },
});

contacts.plugin(mongoosePaginate);

const Contacts = mongoose.model("contact", contacts);


const contactsSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .pattern(
      new RegExp(
        "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
      )
    )
    .required(),
  phone: Joi.string()
    .min(10)
    .max(14)
    .pattern(/^\+?[0-9]+$/)
    .required(),
  favorite: Joi.boolean(),
});

module.exports = { Contacts, contactsSchema };
