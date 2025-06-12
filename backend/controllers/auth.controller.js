const Profile = require("../models/profile.model");
const Session = require("../models/session.model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
    if (!session) {
      return res.status(401).json({ message: "session does not exist" });
    }
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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Id not existant" });
  }
  try {
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
  const userEmail = req.body.email;
  try {
    const session = await Session.findOne({ email: userEmail, status: true });
    if (!session) {
      return res.status(400).json({ message: "session not found" });
    }

    const outcome = await Session.findOneAndUpdate(
      { _id: session._id },
      { status: false }
    );
    res.status(200).json({ message: "logout successfull" });
  } catch (err) {
    res.status(400).json({ message: "failure to log out", error: err.message });
  }
};

// forgot password
authController.forgotPassword = async function (req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await Profile.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Générer un mot de passe temporaire sécurisé
    const tempPassword = crypto.randomBytes(6).toString("hex"); // 12 caractères
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 2. Mettre à jour le mot de passe de l'utilisateur dans la base
    user.password = hashedPassword;
    await user.save();

    // 3. Créer un transporteur de test (pas besoin de config réelle)
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

    // 4. Envoyer le mail avec le mot de passe temporaire
    const info = await transporter.sendMail({
      from: '"Mon App" <no-reply@monapp.com>',
      to: email,
      subject: "Nouveau mot de passe",
      text: `Bonjour ${user.name},\n\nVoici ton nouveau mot de passe : ${tempPassword}\n\nTu peux maintenant te connecter avec ce mot de passe.`,
    });

    // 5. Fournir l’URL d’aperçu (utile pour tester avec ethereal)
    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.status(200).json({
      message: "Nouveau mot de passe envoyé par e-mail",
      previewUrl, // utile pour développement
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur lors de la réinitialisation",
      error: err.message,
    });
  }
};

// reset password

// forgot password

module.exports = authController;
