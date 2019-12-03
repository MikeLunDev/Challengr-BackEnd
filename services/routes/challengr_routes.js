const express = require("express");
const userProfile = require("../../schemas/userProfileSchema");
const companyProfile = require("../../schemas/companyProfileSchema");
const Challengr = require("../../schemas/challengrSchema");
const passport = require("passport");
require("dotenv").config();

const router = express.Router();

router.get("/all", passport.authenticate("jwt"), async (req, res) => {
  res.send(await Challengr.find({}));
});

router.post("/", passport.authenticate("jwt"), async (req, res) => {
  let currentCompany = await companyProfile.findOne({ email: req.user.email });
  let currentProfile = await userProfile.findOne({ email: req.user.email });
  req.body.author =
    currentCompany != null
      ? currentCompany.companyName
      : currentProfile.username;

  let whiteList = [
    "description",
    "difficulty",
    "languages",
    "time",
    "content",
    "author",
    "upvotes"
  ];
  for (let key of Object.keys(req.body)) {
    if (!whiteList.includes(key)) {
      delete req.body[key];
    }
  }
  try {
    let challenge = await Challengr.create(req.body);
    res.status(201).send({
      status: "Challenge created successfully",
      challengeId: challenge._id,
      success: true,
      error: ""
    });
  } catch (err) {
    res.status(400).send({
      error: err.message,
      success: false,
      status: "Challenge not created"
    });
  }
});

router.get("/:challengeId", passport.authenticate("jwt"), async (req, res) => {
  try {
    let challenge = await Challengr.findById(req.params.challengeId);

    challenge != null
      ? res.status(200).send({
          error: "",
          status: "Challenge found successfully",
          success: true,
          challenge
        })
      : res.status(404).send({
          error: "Challenge not found, check if the id is correct",
          status: "Not found",
          success: false
        });
  } catch (err) {
    res.status(500).send({
      error: err,
      status: "Failed to fetch",
      success: false
    });
  }
});

router.put(
  "/:challengeId/setCompleted",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      let userProfileId = await userProfile.findOne({ email: req.user.email });
      if (userProfileId != null) {
        try {
          await userProfile.findOneAndUpdate(
            { _id: userProfileId },
            {
              $push: {
                completedChallenge: {
                  challengeId: req.params.challengeId,
                  completedAt: new Date()
                }
              }
            },
            { new: true }
          );
          res.status(200).send({
            error: "",
            success: true,
            status: "correctly added to profile"
          });
        } catch (err) {
          res.status(500).send({
            error: err,
            status:
              "Failed to set challenge completed on user w/ id " + req.user._id,
            success: false
          });
        }
      } else {
        res.status(500).send({
          error: err,
          status:
            "Failed to set challenge completed on user w/ id " + req.user._id,
          success: false
        });
      }
    } catch (err) {
      res.status(500).send({
        error: err,
        status:
          "Failed to set challenge completed on user w/ id " + req.user._id,
        success: false
      });
    }
  }
);

router.put(
  "/:challengeId/setInProgress",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      let userProfileId = await userProfile.findOne({ email: req.user.email });
      if (userProfileId != null) {
        try {
          await userProfile.findOneAndUpdate(
            { _id: userProfileId },
            {
              $push: {
                inProgressChallenge: {
                  challengeId: req.params.challengeId,
                  lastSubmitAt: new Date(),
                  quizScore: req.body.quizScore,
                  demoRepoLink: req.body.repoLink
                }
              }
            },
            { new: true }
          );
          res.status(200).send({
            error: "",
            success: true,
            status: "correctly added to profile"
          });
        } catch (err) {
          res.status(500).send({
            error: err,
            status:
              "Failed to set challenge in progress on user w/ id " +
              req.user._id,
            success: false
          });
        }
      } else {
        res.status(500).send({
          error: err,
          status:
            "Failed to set challenge in progress on user w/ id " + req.user._id,
          success: false
        });
      }
    } catch (err) {
      res.status(500).send({
        error: err,
        status:
          "Failed to set challenge in progress on user w/ id " + req.user._id,
        success: false
      });
    }
  }
);

router.put(
  "/:challengeId/setUploaded",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      let userProfileId = await userProfile.findOne({ email: req.user.email });
      if (userProfileId != null) {
        try {
          await userProfile.findOneAndUpdate(
            { _id: userProfileId },
            {
              $push: {
                uploadedChallenge: {
                  challengeId: req.params.challengeId,
                  completedAt: new Date()
                }
              }
            },
            { new: true }
          );
          res.status(200).send({
            error: "",
            success: true,
            status: "correctly added to profile"
          });
        } catch (err) {
          res.status(500).send({
            error: err,
            status:
              "Failed to set uploaded challenge on user w/ id " + req.user._id,
            success: false
          });
        }
      } else {
        res.status(500).send({
          error: err,
          status:
            "Failed to set uploaded challenge on user w/ id " + req.user._id,
          success: false
        });
      }
    } catch (err) {
      res.status(500).send({
        error: err,
        status:
          "Failed to set uploaded challenge on user w/ id " + req.user._id,
        success: false
      });
    }
  }
);

router.get("/", async (req, res) => {
  //{ $and: [ {languages:{$in:["NodeJs"]}},{difficulty:3},{'content.resourceType':{$in:["quizI"]}}  ] } final working
  ///challenge?filter[difficulty]=3&filter[languages]=javascript&filter[languages]=nodejs&filter[types]=quizId for try in postman

  try {
    const { skip, limit, filter, sort } = req.query;
    var queryArray = [];
    delete req.query.limit;
    delete req.query.skip;
    delete req.query.sort;
    if (filter != undefined) {
      const query = {
        languages:
          filter.languages != undefined
            ? {
                languages: {
                  //checking if is an array ["js","node"] or a single string "js" and work accordingly
                  $in:
                    Object.prototype.toString.call(filter.languages) ===
                    "[object Array]"
                      ? [...filter.languages]
                      : [filter.languages]
                }
              }
            : null,
        difficulty:
          filter.difficulty != undefined
            ? {
                difficulty: parseInt(filter.difficulty)
              }
            : null,
        content:
          filter.types != undefined
            ? {
                //checking if is an array ["js","node"] or a single string "js" and work accordingly
                "content.resourceType": {
                  $in:
                    Object.prototype.toString.call(filter.types) ===
                    "[object Array]"
                      ? [...filter.types]
                      : [filter.types]
                }
              }
            : null
      };
      for (let key in query) {
        if (query[key] != null) queryArray.push(query[key]);
      }
      var challenges = await Challengr.find({ $and: queryArray })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort(sort);
      var numberOfChallenges = await Challengr.find({ $and: queryArray });
    } else {
      var challenges = await Challengr.find({})
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort(sort);
      var numberOfChallenges = await Challengr.find({});
    }
    res.send({ challenges, numberOfChallenges: numberOfChallenges.length });
  } catch (err) {
    console.log(err);
  }
});

router.delete(
  "/:challengeId",
  passport.authenticate("jwt"),
  async (req, res) => {
    let challenge = await Challengr.findById(req.params.challengeId);
    let profile = await userProfile.findOne({ email: req.user.email });
    let isCreatedByUser = profile.uploadedChallenge.filter(
      el => el.challengeId === req.params.challengeId
    );
    if (
      profile != null &&
      challenge != null &&
      (isCreatedByUser.length === 1 || profile.admin === true)
    ) {
      try {
        let deleted = await Challengr.findByIdAndDelete(req.params.challengeId);
        res.status(200).send({
          error: "",
          status: "Deleted successfully",
          success: true,
          deleted
        });
      } catch (err) {
        res.status(500).send({
          error: err,
          status: "Failed to delete",
          success: false
        });
      }
    } else {
      res.status(400).send({
        error:
          "Incorrect data (challenge id, or challenge do not exist ) or unauthorized operation => User can only delete own challenge",
        status: "Failed to delete",
        success: false
      });
    }
  }
);

module.exports = router;
