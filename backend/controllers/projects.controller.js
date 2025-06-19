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
  const photosIncoming = req.body.photos || [];
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "ID not existant for update" });
    }
    // recupère les photos existantes
    const existingProject = await Project.findById(id);
    const existingPhotos = existingProject.photos || [];
    const photoToDelete = existingPhotos.filter(
      (photo) => !req.body.photos.includes(photo)
    );
    photoToDelete.forEach((photo) => {
      const imagePath = path.join(
        __dirname,
        "../public",
        photo.replace(/^.*\/projectsImages\//, "projectsImages/")
      );
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(
            `Erreur lors de la suppression de l'image : ${photo}`,
            err
          );
        } else {
          console.log(`Image supprimée : ${photo}`);
        }
      });
    });
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

    project.photos.push(imageUrl);
    await project.save();

    return res.status(200).json({ success: true, imageUrl });
  } catch (err) {
    console.error("Erreur upload image :", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

module.exports = projectController;
