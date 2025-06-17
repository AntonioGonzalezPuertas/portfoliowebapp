const UserRequest = require("../models/userRequest.model");
const mongoose = require("mongoose");

const userRequestController = {};

userRequestController.findAll = async function (req, res) {
  const filter = req.body || {};
  try {
    const requests = await UserRequest.find(filter).populate(
      "userId",
      "name surname"
    );
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Filter failed", error: err.message });
  }
};

userRequestController.create = async function (req, res) {
  const token = req.params.token;

  try {
    const session = await Session.findOne({ _id: token });
    console.log("session found:", session);
    if (session?.status === true) {
      if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
        return res.status(404).json({ message: "invalid or missing userId" });
      }
      const newRequest = new UserRequest(req.body);
      await newRequest.save();
      res.status(201).json(newRequest);
    } else {
      return res.status(404).json({ message: "No valid session" });
    }
  } catch (err) {
    res
      .status(400)
      .json({ message: "Unable to create new request", error: err.message });
  }
};

userRequestController.update = async function (req, res) {
  const id = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "unable to update: unvalid request ID" });
    }
    const updatedRequest = await UserRequest.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedRequest) {
      return res
        .status(404)
        .json({ message: "unable to update: request not found" });
    }
    res
      .status(200)
      .json({
        message: `the request with id: ${id} was successfully updated: `,
        updatedRequest,
      });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update the request", error: err.message });
  }
};

module.exports = userRequestController;
