const Project = require("../models/project.model");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const uploadImage = require("../utils/uploadImage");

const projectController = {};

/*
projectController.findAll = async function (req, res) {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch(err) {
        res.status(500).json( { message: 'Server Error', error: err.message } );
    }
}
*/

projectController.findAll = async function (req, res) {
  const rawFilter = req.body || {};
  const filter = { ...rawFilter, isDeleted: false };
  try {
    const projects = await Project.find(filter);
    res.status(200).json(projects);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to load projects", error: err.message });
  }
};

projectController.create = async function (req, res) {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Project creation failed", error: err.message });
  }
};

projectController.update = async function (req, res) {
  //
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "ID not existant for update" });
    }
    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedProject) {
      return res.status(404).json({ message: "no project found to update" });
    }
    res.status(200).json(updatedProject);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Project update failed", error: err.message });
  }
};

projectController.delete = async function (req, res) {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "ID not existant for deletion" });
    }
    const deletedProject = await Project.findByIdAndUpdate(id, {
      isDeleted: true,
    });
    if (!deletedProject) {
      return res.status(404).json({ message: "No project found for deletion" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Project deletion failed", error: err.message });
  }
};

projectController.deleteHard = async function (req, res) {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "ID not existant for deletion" });
    }
    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return res.status(404).json({ message: "No project found for deletion" });
    }
    res
      .status(200)
      .json({ message: "Project permanently deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Project deletion failed", error: err.message });
  }
};

projectController.uploadImage = async function (req, res) {
  const projectId = req.params.id;
  const base64Image = req.body.image;

  if (!base64Image || typeof base64Image !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Image base64 manquante." });
  }

  try {
    // Vérifie que le projet existe
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable." });
    }
    const imageUrl = await uploadImage(
      base64Image,
      projectId,
      req.headers.host
    );
    /*
    // Extraire les infos du base64
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res
        .status(400)
        .json({ success: false, message: "Format base64 invalide." });
    }

    const ext = matches[1]; // jpg, png...
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    // Créer le répertoire si besoin
    const uploadDir = path.join(
      __dirname,
      "../public/projectsImages",
      projectId
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nom unique pour l'image
    const filename = `${Date.now()}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Écrire le fichier
    fs.writeFileSync(filepath, buffer);

    // Construire l’URL d'accès publique (adapté à ton domaine)
    const imageUrl = `http://${req.headers.host}/projectsImages/${projectId}/${filename}`;
    */
    // (Optionnel) Ajouter l'image à project.photos[]
    project.photos.push(imageUrl);
    await project.save();

    return res.status(200).json({ success: true, imageUrl });
  } catch (err) {
    console.error("Erreur upload image :", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

projectController.updateImages = async function (req, res) {
  const projectId = req.params.id;
  const incomingPhotos = req.body.photos;
  const updatedPhotos = [];

  if (!Array.isArray(incomingPhotos) || incomingPhotos.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Aucune image fournie." });
  }

  try {
    // Vérifie que le projet existe
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Projet introuvable." });
    }

    // Met à jour les photos du projet
    //il faut comparer si les urls des images sont déjà présentes
    const existingImages = project.photos || [];
    for (const photo of incomingPhotos) {
      // Vérifie si cela commence par data:image/ pour savoir si c'est une image base64
      const isBase64 =
        typeof photo === "string" && photo.startsWith("data:image/");

      if (isBase64) {
        // ➕ C'est une nouvelle image à uploader^
        const uploadedUrl = await uploadImage(
          photo,
          projectId,
          req.headers.host
        );
        updatedPhotos.push(uploadedUrl);
      } else {
        // ➕ C'est une URL, on la garde si elle existait avant
        if (existingImages.includes(photo)) {
          updatedPhotos.push(photo);
        }
      }
    }
    // Supprimer les images qui ne sont plus utilisées
    const removedImages = existingImages.filter(
      (img) => !updatedPhotos.includes(img)
    );
    console.log(removedImages);

    for (const imgUrl of removedImages) {
      const imagePath = path.join(
        __dirname,
        "../public",
        imgUrl.replace(/^.*\/projectsImages\//, "projectsImages/")
      );
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(
            `Erreur lors de la suppression de l'image : ${imgUrl}`,
            err
          );
        } else {
          console.log(`Image supprimée : ${imgUrl}`);
        }
      });
    }

    project.photos = updatedPhotos;
    await project.save();

    return res
      .status(200)
      .json({ success: true, message: "Images mises à jour." });
  } catch (err) {
    console.error("Erreur mise à jour des images :", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = projectController;
