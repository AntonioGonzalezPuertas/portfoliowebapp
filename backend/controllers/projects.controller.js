const Project = require("../models/project.model");
const mongoose = require("mongoose");

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

module.exports = projectController;
