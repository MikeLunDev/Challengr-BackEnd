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

router.get("/", async (req, res) => {
  //filter difficulty, languages, type(n block)
  //filter[difficulty]=3&filter[languages]=NodeJs&filter[languages]=Javascript&filter[types]=quizId
  //sorting upvotes rating date
  //?sort[date,upvotes,difficulty]=asc/desc
  //?sort[date]=asc&limit
  //&skip=0 //inizio della riga
  //&limit = 8 //fine riga
  //{ $and: [ {languages:{$in:["NodeJs"]}},{difficulty:3},{'content.resourceType':{$in:["quizI"]}}  ] } final working
  //{$and:[ { languages: { '$in': ["Javascript"] } },{ difficulty: '1' },{ 'content.resourceType': { '$in': ["quizId"] } } ]}
  //{$and:[ { languages: { $in: ["NodeJs"] } },{ difficulty: 1 },{ 'content.resourceType': { $in: ["quizId"] } } ]}
  ///challenge?filter[difficulty]=3&filter[languages]=javascript&filter[languages]=nodejs&filter[types]=quizId for try

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
    } else
      var challenges = await Challengr.find({})
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort(sort);
    const numberOfChallenges = challenges.length;
    res.send({ challenges, numberOfChallenges });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
