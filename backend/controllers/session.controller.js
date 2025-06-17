const Session = require("../models/session.model");
const Profile = require("../models/profile.model");
const mongoose = require("mongoose");

const sessionController = {};

sessionController.findByEmail = async function (req, res) {
  console.log("body", req.body);
  const filter = req?.body?.email ? { email: req.body?.email } : {};
  console.log("filter= ", filter);
  try {
    const sessions = await Session.find(filter);
    res.status(200).json(sessions);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to load sessions", error: err.message });
  }
};

sessionController.findByToken = async function (token) {
  const filter = token ? { _id: token } : {};
  console.log("filter= ", filter);
  try {
    const sessions = await Session.find(filter);
    res.status(200).json(sessions);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to load sessions", error: err.message });
  }
};

sessionController.findOnline = async function (req, res) {
  console.log("body", req.body);
  const filter = { status: 1 };
  console.log("filter= ", filter);
  try {
    const sessions = await Session.find(filter);
    res.status(200).json(sessions);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to load sessions", error: err.message });
  }
};

sessionController.findOffline = async function (req, res) {
  console.log("body", req.body);
  const online = { status: 1 };
  console.log("filter= ", online);
  try {
    const onlineSessions = await Session.find(online).select("email");
    console.log("Online email profile:", onlineSessions);

    const onlineEmails = onlineSessions.map((s) => s.email);

    const offlineProfiles = await Profile.find({
      email: { $nin: onlineEmails },
      isDeleted: false,
    }).select("-password");

    console.log("Offline profiles", offlineProfiles);

    res.status(200).json(offlineProfiles);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to load sessions", error: err.message });
  }
};

module.exports = sessionController;
