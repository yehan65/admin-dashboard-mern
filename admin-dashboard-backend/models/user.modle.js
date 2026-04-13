const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a name"],
      min: 3,
    },
    email: {
      type: String,
      required: [true, "Please enter a email"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          // Regular expression for basic email validation
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email address.",
      },
    },
    role: {
      type: String,
      enum: ["Admin", "Editor", "User"],
      default: "User",
    },
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active",
    },
    avatar: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      trim: true,
      min: 5,
      max: 16,
    },
  },
  { timestamps: true },
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role, avatar: this.avatar },
    process.env.JWT_PRIVATE_KEY,
  );
  return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
