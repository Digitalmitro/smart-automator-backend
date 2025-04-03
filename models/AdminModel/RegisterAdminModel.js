const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const registeradminSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

});

// Hashing Passwords
registeradminSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    // console.log(this.password);
  }
  next();
});

registeradminSchema.methods.generateAuthToken = async function () {
  try {
    // const expirationTime = Math.floor(Date.now() / 1000) + (60 * 60);
    const expirationTime = process.env.expiry;
    let token = jwt.sign(
      { _id: this._id, expiresIn: expirationTime },
      process.env.secret_key
    );
    return token;
  } catch (e) {
    console.log(`Failed to generate token --> ${e}`);
  }
};

const RegisteradminModal = mongoose.model(
  "register admin",
  registeradminSchema
);

module.exports = { RegisteradminModal };
