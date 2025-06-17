const Profile = require("../models/profile.model");
const Session = require("../models/session.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Use env var in production

const authController = {};

authController.login = async function (req, res) {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  if (!userEmail) {
    return res.status(400).json({ message: "email not found" });
  }
  try {
    const user = await Profile.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    const isValid = await bcrypt.compare(userPass, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "wrong password" });
    }
    const session = await Session.insertOne({ email: userEmail });
    //console.log("session created:", session);
    if (!session) {
      return res.status(401).json({ message: "session does not exist" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, admin: user.admin }, // payload
      JWT_SECRET,
      { expiresIn: "2h" } // token expiry
    );

    res.status(200).json({
      message: "successfully authentificated",
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        admin: user.admin,
        role: user.role,
        email: user.email,
        createdAt: user.createdAt,
        sessionId: session._id,
        token: token,
      },
    });
  } catch (err) {
    res.status(400).json({ message: "failed to login", error: err.message });
  }
};

// update password
authController.changePassword = async function (req, res) {
  const id = req.params.id;
  const currentPass = req.body.currentPassword;
  const newPass = req.body.newPassword;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Id not existant" });
    }
    // confirming the password typed is right before proceeding
    const user = await Profile.findById(id);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "wrong password" });
    }
    // add bcrypt for password hash if updated
    const hashedPass = await bcrypt.hash(newPass, 10);
    user.password = hashedPass;
    await user.save();

    res.status(200).json({
      message: `the password of ${user.name} was successfully updated`,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "failure to update password", error: err.message });
  }
};

// logout
authController.logout = async function (req, res) {
  const id = req.body.sessionId;
  console.log("id:", id);

  try {
    const session = await Session.findOne({ _id: id });
    console.log("session found:", session);
    if (session?.status === true) {
      const outcome = await Session.findOneAndUpdate(
        { _id: session._id },
        { status: false }
      );
      res.status(200).json({ message: "logout successfull" });
    } else {
      return res.status(404).json({ message: "No valid session" });
    }
  } catch (err) {
    res.status(400).json({ message: "failure to log out", error: err.message });
  }
};

// reset password

// forgot password

module.exports = authController;
