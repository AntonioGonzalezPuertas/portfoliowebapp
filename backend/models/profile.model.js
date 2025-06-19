const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    admin: Boolean,
    name: String,
    surname: String,
    password: String,
    role: String,
    bio: String,
    email: String,
    phone: String,
    photo: String,
    technologies: [
      {
        name: String,
        version: String,
        _id: false,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isValidated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
