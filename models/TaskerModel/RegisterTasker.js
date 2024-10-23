const mongoose = require("mongoose");
const bcrypt = require('bcrypt')

const registertaskerSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  zip: {
    type: Number,
  },
  service: [{ type: mongoose.Schema.Types.ObjectId, ref: "service" }],
});

// Hashing Passwords
registertaskerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    console.log(this.password);
  }
  next();
});

registertaskerSchema.methods.generateAuthToken = async function () {
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

const RegistertaskerModal = mongoose.model(
  "register tasker",
  registertaskerSchema
);

module.exports = { RegistertaskerModal };
