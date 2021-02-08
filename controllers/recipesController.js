const express = require("express");
const router = express.Router();
const Recipes = require("../models/RecipesSchema");
const { body, validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;

let userID = "";
const isAuthenticated = (req, res, next) => {
  console.log(req.session);
  if (req.session.currentUser) {
    userID = req.session.currentUser._id;
    next();
  } else {
    res.status(401).send("You are currently not logged in. Please log in.");
  }
};

const dbError = (res) => {
  return res
    .status(500)
    .send("Database error. Please contact your system administrator.");
};

// CREATE
router.post(
  "/new",
  isAuthenticated,
  [
    body("recipeName")
      .trim()
      .toLowerCase() //html capitalize recipeName when displaying
      .notEmpty()
      .withMessage("recipe name cannot be empty"),
    body("instructions")
      .trim()
      .notEmpty()
      .withMessage("instructions cannot be empty"),
    body("prepTime")
      .trim()
      .toInt()
      .notEmpty()
      .withMessage("prep time cannot be empty"),
    body("cookTime")
      .trim()
      .toInt()
      .notEmpty()
      .withMessage("cook time cannot be empty"),
  ],
  (req, res) => {
    const data = {
      ...req.body,
      userID,
    };
    Recipes.create(data, (err, recipe) => {
      if (err) {
        // return dbError(res);
        return res.send(err);
      } else {
        res.send(recipe);
      }
    });
  }
);

//Show recipe list from userid
router.get("/user", isAuthenticated, (req, res) => {
  // res.send(req.query);
  console.log("userid", req.session.currentUser._id);
  const query = {
    $and: [{ userID: req.session.currentUser._id }, { archived: false }],
  };
  Recipes.find(
    // { $and: [{ recipeName: /Egg/ }, { recipeName: /Tomato/ }] }, //test query with multiple keywords
    // { userID: req.session.currentUser._id },
    query,
    "recipeName tags description avgRating createdAt updatedAt",
    (err, recipe) => {
      if (err) {
        // return dbError(res);
        console.log(err);
        return res.send(err);
      } else {
        console.log(recipe);
        res.send(recipe);
      }
    }
  );
});

// SHOW (individual)
router.get("/:recipeID", (req, res) => {
  Recipes.findById(req.params.recipeID)
    .populate({ path: "tags", select: "tagName tagCategory" })
    .populate({ path: "userID", select: "username" })
    .populate({ path: "ingredientList.ingredient", select: "ingredientName" })
    .exec((err, recipe) => {
      if (err) {
        // return dbError(res);
        return res.send(err);
      } else {
        res.send(recipe);
      }
    });
  // res.send("SHOW RECIPES");
});

// SHOW (listings)
router.get("/", (req, res) => {
  console.log(req.query);
  const limit = {};
  if (req.query.limit) {
    limit.limit = parseInt(req.query.limit);
    delete req.query.limit;
  }
  if (req.query.sort) {
    limit.sort = req.query.sort;
    delete req.query.sort;
  }
  if (req.query.keyword) {
    req.query.recipeName = new RegExp(req.query.keyword);
    delete req.query.keyword;
  }
  const query = { ...req.query, archived: false };

  console.log(query);
  Recipes.find(
    // { $and: [{ recipeName: /Egg/ }, { recipeName: /Tomato/ }] }, //test query with multiple keywords
    query,
    "recipeName tags description avgRating imgURL",
    limit
  )
    .populate({ path: "tags", select: "tagName" })
    .exec((err, recipe) => {
      if (err) {
        // return dbError(res);
        return res.send(err);
      } else {
        res.send(recipe);
      }
    });
});

// UPDATE
router.post("/:recipeID", isAuthenticated, (req, res) => {
  Recipes.findByIdAndUpdate(
    req.params.recipeID,
    req.body,
    { upsert: true, new: true },
    (err, recipe) => {
      if (err) {
        return dbError(res);
      } else {
        res.send(recipe);
      }
    }
  );
});

// DELETE / Archive
router.delete("/:recipeID", isAuthenticated, (req, res) => {
  Recipes.findByIdAndUpdate(
    req.params.recipeID,
    { archived: true },
    { upsert: true, new: true },
    (err, recipe) => {
      if (err) {
        return dbError(res);
      } else {
        res.send(recipe);
      }
    }
  );
});

module.exports = router;
