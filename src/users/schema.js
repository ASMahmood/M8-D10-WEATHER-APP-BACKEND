const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
  name: String,
  favorites: [{ location: String, lat: Number, lon: Number }],
  email: { type: String, unique: true },
  password: { type: String },
});

UserSchema.pre("save", async function (next) {
  const user = this;
  const plainPW = user.password;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

module.exports = model("user", UserSchema);
