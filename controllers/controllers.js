const Joi = require("joi");

const schema = Joi.object({
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
  favorite: Joi.boolean()
});

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("../model");

const list = async (req, res, next) => {
  res.json(await listContacts());
};

const get = async (req, res, next) => {
  let contact = await getContactById({ _id: req.params.contactId });
  if (contact) return res.json(contact);
  next();
};

const add = async (req, res, next) => {
  try {
    Joi.attempt(req.body, schema);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  return res.json(await addContact(req.body));
};

const remove = async (req, res, next) => {
  let { deletedCount } = await removeContact({
   " _id": req.params.contactId,
  });
  if (deletedCount) {
    return res.json({ message: "contact deleted" });
  }
  next();
};

const update = async (req, res, next) => {
  if (!Object.keys(req.body).length) {
    return res.status(400).json({ message: "missing fields" });
  }
  try {
    Joi.attempt(req.body, schema);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
    const data = await updateContact({ "_id": req.params.contactId }, req.body);
  if (data) {
    return res.json(data);
  }
  next();
};

const updateFavorite = async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ message: "missing fields" });
  }
  const updatedContact = await updateStatusContact(
    { _id: req.params.contactId },
    req.body
  );
  if (updatedContact) {
    return res.json(updatedContact);
  }
  next();
};

module.exports = {
  list,
  get,
  remove,
  add,
  update,
  updateFavorite,
};
