const { Contacts } = require("./schemas/contacts_schema");
const { User } = require("./schemas/user_schema");

const listContacts = async (query) => {
  try {
    const { page, limit } = query;
    if (page || limit) {
      const { docs } = await Contacts.paginate({}, { page, limit });
      return docs;
    }
    return await Contacts.find(query);
  } catch (error) {}
};

const getContactById = async (contactId) => {
  try {
    return await Contacts.findOne(contactId);
  } catch (error) {
    console.log(error.message);
  }
};

const addContact = async ({ name, email, phone, favorite = false }) => {
  const newContact = {
    name: name,
    email: email,
    phone: phone,
    favorite: favorite,
  };
  try {
    return await Contacts.create(newContact);
  } catch (error) {
    console.log(error.message);
  }
};

const removeContact = async (contactId) => {
  try {
    return await Contacts.deleteOne(contactId);
  } catch (error) {
    console.log(error.message);
  }
};

const updateContact = async (query, update) => {
  try {
    return await Contacts.findOneAndUpdate(query, update, { new: true });
  } catch (error) {
    console.log(error.message);
  }
};

const updateStatusContact = async (query, update) => {
  try {
    await Contacts.updateOne(query, update);
    return await Contacts.findOne(query);
  } catch (error) {
    console.log(error.message);
  }
};

const findUser = async (email) => {
  return await User.findOne({ email });
};

findByToken = async (token) => {
  console.log(token)
  return await User.findOne({ 'verificationToken': token })
  
}


const userSignUp = async (user) => {
  try {
    return await User.create(user);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
  findUser,
  findByToken,
  userSignUp,
};
