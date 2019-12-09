const express = require("express");
const userProfile = require("../../schemas/userProfileSchema");
const companyProfile = require("../../schemas/companyProfileSchema");
const Challengr = require("../../schemas/challengrSchema");
const Quiz = require("../../schemas/quizSchema");
const Demo = require("../../schemas/demoSchema");
const passport = require("passport");
const multer = require("multer");
const fs = require("fs-extra");
require("dotenv").config();

const router = express.Router();
const upload = multer({});

router.get("/:demoId", passport.authenticate("jwt"), async (req, res, next) => {
  try {
    let demoChallenge = await Demo.findById(req.params.demoId);
    res.status(200).send({
      error: "",
      status: "Demo found",
      success: true,
      demoChallenge
    });
  } catch (err) {
    res.status(404).send({
      error: "Check the id of the demo exists",
      status: "Demo not found",
      success: false
    });
  }
});

router.post("/", passport.authenticate("jwt"), async (req, res, next) => {
  let whiteList = ["pdfLink", "author", "description"];
  for (let key of Object.keys(req.body)) {
    if (!whiteList.includes(key)) {
      delete req.body[key];
    }
  }
  if (req.body.pdfLink === undefined) {
    res.status(400).send({
      error: "Pdf field missing",
      status: "Failed to save demo",
      success: false
    });
    next();
  }
  var ext = req.body.pdfLink.split(".").reverse()[0];
  if (ext !== "pdf") {
    res.status(400).send({
      error: "only pdf allowed",
      status: "Failed to save demo",
      success: false
    });
  } else {
    try {
      const { username } = await userProfile.findOne({ email: req.user.email });
      req.body.author = username;
      let demoChallenge = await Demo.create(req.body);
      res.status(201).send({
        error: "",
        status: "Demo created Successfully",
        success: true,
        demoChallenge,
        content: { resourceType: "demoId", value: demoChallenge._id } 
      });
    } catch (err) {
      res.status(500).send({
        error: err.message,
        status: "Failed to save demo",
        success: false
      });
    }
  }
});

router.post(
  "/upload_demo_pdf",
  passport.authenticate("jwt"),
  upload.single("demo_pdf"),
  async (req, res) => {
    var fullUrl = req.protocol + "://" + req.get("host") + "/demo_pdf/";
    if (req.file != undefined) {
      var ext = req.file.originalname.split(".").reverse()[0];
      if (ext !== "pdf") {
        res.status(400).send({
          error: "only pdf allowed",
          status: "Failed to upload",
          success: false
        });
      } else {
        let date = new Date();
        var fileName = `${req.user._id}${date
          .toString()
          .split(" ")
          .join("")
          .slice(3, 19)
          .replace(/:/g, "")}.${ext}`;
        var path = "./public/demo_pdf/" + fileName;
        try {
          await fs.writeFile(path, req.file.buffer);
          res.status(201).send({
            error: "",
            status: "Downloadable link created successfully",
            success: true,
            pdfLink: fullUrl + fileName
          });
        } catch (err) {
          res.status(500).send({
            error: err,
            status: "Failed to save the file on disk",
            success: false
          });
        }
      }
    } else {
      res.status(400).send({
        error: "File missing",
        status: "Not uploaded",
        success: false
      });
    }
  }
);

router.delete("/:demoId", passport.authenticate("jwt"), async (req, res) => {
  const { username } = await userProfile.findOne({ email: req.user.email });
  try {
    const { author } = await Demo.findById(req.params.demoId);
    if (author === username || username === admin) {
      try {
        await Demo.findByIdAndDelete(req.params.demoId);
        res.status(200).send({
          error: "",
          status: "Deleted successfully",
          success: true,
          deletedDemoId: req.params.demoId
        });
      } catch (err) {
        res.status(500).send({
          error: err,
          status: "Internal error on deleting, Couldn't delete",
          success: false
        });
      }
    }
  } catch (err) {
    res.status(404).send({
      error: "Check the id of the demo challenge exist",
      status: "Not found",
      success: false
    });
  }
});

module.exports = router;
