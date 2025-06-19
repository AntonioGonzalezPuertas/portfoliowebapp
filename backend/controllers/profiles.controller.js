const Profile = require("../models/profile.model");
const Session = require("../models/session.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Use env var in production
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h"; // Use env var in production
const JWT_EXPIRATION_VALIDATION = process.env.JWT_EXPIRES_IN || "24h"; // Use env var in production

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
    info = await sendEmailValidation(newProfile);

    // Fournir l’URL d’aperçu (utile pour tester avec ethereal)
    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.status(200).json({
      message: "New account craeted waiting for validation",
      previewUrl, // utile pour développement
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Unable to create profile", error: err.message });
  }
};

async function sendEmailValidation(newProfile) {
  // 1. Créer un transporteur de test (pas besoin de config réelle)
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // 2. Create JWT
  const token = jwt.sign(
    { id: newProfile._id, email: newProfile.email }, // payload
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION_VALIDATION } // token expiry
  );

  // 3. Envoyer le mail avec le lien pour valider le compte
  const info = await transporter.sendMail({
    from: '"Portfolio Projects" <no-reply@portfolio-projects.com>',
    to: newProfile.email,
    subject: "Portfolio - Validation de compte",
    text: `Bonjour ${newProfile.name},\n\nVoici le lien pour valider ton compte:\nhttp://localhost:3000/api/auth/validate/${token}\n\nMerci de cliquer sur ce lien pour activer ton compte.`,
    html: `Bonjour ${newProfile.name},<br><br>
    Voici le lien pour valider ton compte :<br>
    <a href="http://localhost:3000/api/auth/validate/${token}">Valider mon compte</a><br><br>
    Merci de cliquer sur ce lien pour activer ton compte.`,
  });
  return info;
}

profileController.update = async function (req, res) {
  const id = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Id not existant" });
    }
    const updatedProfile = await Profile.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedProfile) {
      return res.status(404).json({ message: "profile to update: not found" });
    }
    res.status(200).json({
      message: `the profile of ${updatedProfile.name} was successfully updated`,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "failure to update profile", error: err.message });
  }
};

profileController.delete = async function (req, res) {
  const id = req.params.id;

  try {
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
