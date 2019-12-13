const express = require("express");
const userProfile = require("../../schemas/userProfileSchema");
const companyProfile = require("../../schemas/companyProfileSchema");
const Challengr = require("../../schemas/challengrSchema");
const passport = require("passport");
require("dotenv").config();

const router = express.Router();

router.get("/:profileId", passport.authenticate("jwt"), async (req, res) => {
  try {
    let profile = await userProfile.findById(req.params.id);
    if (profile != null) {
      res.status(200).send({
        error: "",
        status: "Profile found",
        success: true,
        profile
      });
    } else {
      res.status(404).send({
        error:
          "Not found. It seems the id is not correct or the profile does not exists",
        status: "Couldn't find the profile with id " + req.params.profileId,
        success: false
      });
    }
  } catch (err) {
    res.status(500).send({
      error: err.message,
      status: "Couldn't find the profile with id " + req.params.profileId,
      success: false
    });
  }
});

router.get("/personal/me", passport.authenticate("jwt"), async (req, res) => {
  try {
    let profileMe = await userProfile.findOne({ email: req.user.email });
    if (profileMe != null) {
      res.status(200).send({
        error: "",
        status: "Profile found",
        success: true,
        profileMe
      });
    } else {
      res.status(404).send({
        error:
          "Not found. It seems the id is not correct or the profile does not exists",
        status: "Couldn't find the profile with id " + req.user.email,
        success: false
      });
    }
  } catch (err) {
    res.status(500).send({
      error: err.message,
      status: "Couldn't find the profile with email " + req.user.email,
      success: false
    });
  }
});

router.put("/", passport.authenticate("jwt"), async (req, res) => {
  let whiteList = ["name", "surname", "username", "bio", "privacySettings"];
  for (let key of Object.keys(req.body)) {
    if (!whiteList.includes(key)) {
      delete req.body[key];
    }
  }
  try {
    let updatedProfile = await userProfile.findOneAndUpdate(
      { email: req.user.email },
      { $set: req.body },
      { new: true }
    );
    res.status(200).send({
      error: "err.message",
      status: "Updated successfully",
      success: true,
      updatedProfile
    });
  } catch (err) {
    res.status(500).send({
      error: err.message,
      status: "Couldn't update the profile with email " + req.user.email,
      success: false
    });
  }
});

router.delete("/:profileId", passport.authenticate("jwt"), async (req, res) => {
  try {
    let userProfileAuthenticated = await userProfile.findOne({
      email: req.user.email
    });
    let selectedProfile = await userProfile.findById(req.params.profileId);
    if (selectedProfile != null) {
      if (
        userProfileAuthenticated._id === req.params.profileId ||
        userProfileAuthenticated.admin
      ) {
        try {
          let deletedProfile = await userProfile.findByIdAndDelete(
            req.params.profileId
          );
          res.status(200).send({
            error: "err.message",
            status: "Deleted successfully",
            success: true,
            deletedProfile,
            deletedBy: req.user.email
          });
        } catch (err) {
          res.status(500).send({
            error: err.message,
            status: "Error during the delete of " + req.user.email,
            success: false
          });
        }
      } else {
        res.status(401).send({
          error:
            "Unauthorized. Profile can be deleted by the owner only or by an admin.",
          status: "Couldn't delete the profile with email " + req.user.email,
          success: false
        });
      }
    } else {
      res.status(404).send({
        error: "Profile not found, check if the id provided is correct",
        status: "Couldn't delete the profile with email " + req.user.email,
        success: false
      });
    }
  } catch (err) {
    res.status(500).send({
      error: err.message,
      status: "Couldn't delete the profile with email " + req.user.email,
      success: false
    });
  }
});

module.exports = router;
