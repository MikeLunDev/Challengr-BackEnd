const express = require("express");
const userProfile = require("../../schemas/userProfileSchema");
const companyProfile = require("../../schemas/companyProfileSchema");
const Challengr = require("../../schemas/challengrSchema");
const Quiz = require("../../schemas/quizSchema");
const passport = require("passport");
const multer = require("multer");
const fs = require("fs-extra");
require("dotenv").config();

const router = express.Router();

router.get("/all", async (req, res) => {
  res.send(await Quiz.find({}));
});

router.get("/:quizId", passport.authenticate("jwt"), async(req,res)=>{
  try{
    let quiz = await Quiz.findById(req.params.quizId)
    if(quiz != null){
      res.status(200).send({
        error: "",
        status: "Quiz found",
        success: true,
        quiz
      });
    }else {
      res.status(404).send({
        error: "Not found. Check if the id is correct",
        status: "Couldn't find the quiz",
        success: false
      });
    }

  }catch(err){
    res.status(500).send({
      error: err.message,
      status: "Couldn't find the quiz",
      success: false
    });
  }
})

router.post("/", passport.authenticate("jwt"), async (req, res) => {
  const { username, email } = await userProfile.findOne({
    email: req.user.email
  });
  //deleting unwanted fields of the req.bodys
  let whiteList = ["author", "questions", "time"];
  for (let key of Object.keys(req.body)) {
    if (!whiteList.includes(key)) {
      delete req.body[key];
    }
  }
  req.body.author = username;
  //checking that correctAnswer is exactly one of the answers
  if (!req.body.questions.every(el => el.answers.includes(el.correctAnswer))) {
    res.status(400).send({
      error: "correct answer must be one of the answer",
      status: "failed to add quiz",
      success: false
    });
  } else {
    try {
      let newQuiz = await Quiz.create(req.body);
      res.status(201).send({
        error: "",
        status: "New quiz created successfully",
        success: true,
        content: { resourceType: "quizId", value: newQuiz._id }
      });
    } catch (err) {
      res.status(500).send({
        error: err.message,
        status: "failed to post",
        success: false
      });
    }
  }
});

router.delete("/:quizId", passport.authenticate("jwt"), async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.quizId);
    if (quiz != null) {
      const { username } = await userProfile.findOne({
        email: req.user.email
      });
      if (quiz.author === username) {
        try {
          await Quiz.findByIdAndDelete(req.params.quizId);
          res.status(200).send({
            error: "",
            status: "Deleted successfully",
            success: true,
            deletedQuizId: req.params.quizId
          });
        } catch (err) {
          res.status(500).send({
            error: "This is probably an internal error during delete",
            status: "Not deleted",
            success: false
          });
        }
      } else {
        res.status(401).send({
          error: "Unauthorized",
          status:
            "Deleting operation can be done by the creator of the quiz only",
          success: false
        });
      }
    } else
      res.status(404).send({
        error: "Quiz not found",
        status:
          "Failed to delete, control the id of the quiz or if the quiz is missing",
        success: false
      });
  } catch (err) {
    res.status(500).send({
      error: err.message,
      status: "failed db call on quiz",
      success: false
    });
  }
});

const upload = multer({});
router.post(
  "/upload_question_images",
  passport.authenticate("jwt"),
  upload.single("question_images"),
  async (req, res) => {
    var fullUrl = req.protocol + "://" + req.get("host") + "/question_images/";
    if (req.file != undefined) {
      var ext = req.file.originalname.split(".").reverse()[0];
      if (ext !== "png" && ext !== "jpg" && ext !== "gif" && ext !== "jpeg") {
        res.status(400).send({
          error: "only images allowed",
          status: "Failed to upload",
          success: false
        });
      } else {
        let date = new Date();
        var fileName = `${req.user._id}${date
          .toString()
          .split(" ")
          .join("")
          .slice(3, 23)
          .replace(/:/g, "")}.${ext}`;
        var path = "./public/question_images/" + fileName;
        try {
          await fs.writeFile(path, req.file.buffer);
          res.status(201).send({
            error: "",
            status: "Downloadable link created successfully",
            success: true,
            imageLink: fullUrl + fileName
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

module.exports = router;
