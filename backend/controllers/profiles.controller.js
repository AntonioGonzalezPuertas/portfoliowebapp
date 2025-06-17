const Profile = require("../models/profile.model");
const Session = require("../models/session.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const profileController = {};

/*
profileController.findAll = async function (req, res) {
    try {
        const profiles = await Profile.find();
        res.status(200).json(profiles);
    } catch(err){
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}
*/

profileController.findAll = async function (req, res) {
  const rawFilter = req.body || {};
  const filter = { ...rawFilter, isDeleted: false };
  try {
    // added .select() to avoid display the hashed password for security
    const profiles = await Profile.find(filter).select("-password");
    res.status(200).json(profiles);
  } catch (err) {
    res.status(400).json({ message: "Filter failed", error: err.message });
  }
};

profileController.create = async function (req, res) {
  try {
    // add bcrypt for password hash before storing
    const pass = await bcrypt.hash(req.body.password, 10);
    req.body.password = pass;
    const newProfile = new Profile(req.body);
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Unable to create profile", error: err.message });
  }
};

profileController.update = async function (req, res) {
  const id = req.params.id;
  const token = req.params.token;

  try {
    const session = await Session.findOne({ _id: token });
    console.log("session found:", session);
    if (session?.status === true) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "Id not existant" });
      }
      const updatedProfile = await Profile.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedProfile) {
        return res
          .status(404)
          .json({ message: "profile to update: not found" });
      }
      res.status(200).json({
        message: `the profile of ${updatedProfile.name} was successfully updated`,
      });
    } else {
      return res.status(404).json({ message: "No valid session" });
    }
  } catch (err) {
    res
      .status(400)
      .json({ message: "failure to update profile", error: err.message });
  }
};

profileController.delete = async function (req, res) {
  const id = req.params.id;
  const token = req.params.token;

  try {
    const session = await Session.findOne({ _id: token });
    console.log("session found:", session);
    if (session?.status === true) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "Id not existant" });
      }
      const deletedProfile = await Profile.findByIdAndUpdate(id, {
        isDeleted: true,
      });
      if (!deletedProfile) {
        return res.status(400).json({ message: "failed to delete profile" });
      }
      res.status(200).json({ message: "Profile deleted successfully" });
    } else {
      return res.status(404).json({ message: "No valid session" });
    }
  } catch (err) {
    res
      .status(400)
      .json({ message: "failure to delete profile", error: err.message });
  }
};

profileController.deleteHard = async function (req, res) {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Id not existant" });
    }
    const deletedProfile = await Profile.findByIdAndDelete(id);
    if (!deletedProfile) {
      return res
        .status(404)
        .json({ message: "Profile not found / already deleted" });
    }
    res
      .status(200)
      .json({ message: "Profile permanently deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "failure to delete profile", error: err.message });
  }
};

module.exports = profileController;
