//  food_router.js

//  require modules
var express = require('express');
var unirest = require('unirest');
var myToken = "0z1Po89d11REJ";

//  require mongoose models
var UserPreference = require('../models/user_preference');
var ShoppingList = require('../models/shopping_list');
var ShoppingItem = require('../models/shopping_item');
var WeeklyPlan = require('../models/weekly_plan');
var Nutrient = require('../models/nutrient');
var Category = require('../models/category');
var Recipe = require('../models/recipe');
var Food = require('../models/food');
var User = require('../models/user');

//  router init
var router = express.Router();

router.route('/foods').post(function(req, res) {
  if (req.body.access_token == myToken) {
    var food = new Food();
    food.name = req.body.name;
    food.img_url = req.body.img_url;
    Category.findOne({
      name: req.body.category
    }).exec(function(err, category) {
      if (category != null) {
        food.category = category.id;
      } else {
        var newCat = new Category({
          name: req.body.category
        });
        newCat.save();
        food.category = newCat.id;
      }
      food.nutrients = [];
      for (i = 0; i < req.body.nutrients.length; i++) {
        var nutrient = new Nutrient(req.body.nutrients[i]);
        food.nutrients[food.nutrients.length] = nutrient;
      }
      food.save(function(err) {
        if (err) {
          res.send(err);
        } else {
          res.json({
            message: "Created",
            value: food
          });
        }
      });
    });
  } else {
    res.json({
      message: "invalid access token"
    });
  }
});

router.route('/foods').get(function(req, res) {
  Food.find().exec(function(err, foods) {
    if (err) {
      res.send(err);
    } else {
      res.json(foods);
    }
  });
});

router.route('/foods/:food_id').get(function(req, res) {
  Food.findById(req.params.food_id, function(err, food) {
    if (err) {
      res.send(err);
    } else {
      res.json(food);
    }
  });
});

router.route('/foodpreference').get(function(req, res) {
  if (req.query.mail) {
    Food.findRandom({
      user_preference: {
        $nin: [req.query.mail]
      }
    }).limit(10).exec(function(err, foods) {
      if (err) {
        res.send(err);
      } else {
        res.json(foods);
      }
    })
  } else {
    res.json({
      message: "Cannot modify user without identifier"
    });
  }
});

router.route('/foodpreference').post(function(req, res) {
  if (req.body.mail) {
    Food.findById(req.body.food_id).exec(function(err, food) {
      if (err) {
        res.send(err);
      } else {
        var user_preference = new UserPreference();
        user_preference.user_mail = req.body.mail;
        user_preference.food = req.body.food_id;
        user_preference.type = req.body.type;
        user_preference.save(function(err) {
          if (err) {
            res.send(err);
          } else {
            food.user_preference = food.user_preference || [];
            food.user_preference.push(req.body.mail);
            food.save(function(err) {
              if (err) {
                res.send(err);
              } else {
                res.json({
                  message: "Created",
                  value: user_preference
                });
              }
            });
          }
        });
      }
    });
  } else {
    res.json({
      message: "Cannot modify user without identifier"
    });
  }
});

router.route('/fooduserpreferences').get(function(req, res) {
  if (req.query.mail) {
    if (req.query.type != undefined) {
      UserPreference.find({
        user_mail: req.query.mail,
        type: req.query.type
      }).populate('food').exec(function(err, user_preferences) {
        if (err) {
          res.send(err);
        } else {
          res.json(user_preferences);
        }
      });
    } else {
      UserPreference.find({
        user_mail: req.query.mail
      }).populate('food').exec(function(err, user_preferences) {
        if (err) {
          res.send(err);
        } else {
          res.json(user_preferences);
        }
      });
    }
  } else {
    res.json({
      message: "Cannot modify user without identifier"
    });
  }
});

router.route('/weeklyplan').get(function(req, res) {
  if (req.query.mail) {
    User.findOne({
      mail: req.query.mail
    }).populate('allergens').populate('diet').exec(function(err, user) {
      if (err) {
        res.send(err);
      } else {
        if (user) {
          var base_url = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/mealplans/generate?";
          var diet = "diet=" + user.diet.name + "&";
          var allergens = "exclude=";
          for (i = 0; i < user.allergens.length; i++) {
            if (i = user.allergens.length - 1) {
              allergens = allergens + user.allergens[i].name + "&";
            } else {
              allergens = allergens + user.allergens[i].name + "%2C+";
            }
          }
          var calories = "targetCalories=2000&";
          var url = base_url + diet + allergens + calories + "timeFrame=week";
          unirest.get(url).header("X-Mashape-Key", "a6eY3wNAkqmshOzAUe2Ox8diEDzvp1Ec6Fcjsnu0vMjcv5XAlE").header("Accept", "application/json").end(function(result) {
            var weekplan = new WeeklyPlan();
						var shoppingList = new ShoppingList();
						shoppingList.user = user._id;
						shoppingList.items = [];
            weekplan.user = user._id;
            weekplan.items = [];

            function checkRecipeId(i, array) {
              if (i < array.length) {
                var id = array[i];
                Recipe.findOne({
                  spoon_id: id
                }).exec(function(err, recipe) {
                  if (err) {
                    array[i] = "err";
                    checkRecipeId(i + 1, array);
                  } else if (recipe) {
                    array[i] = {
											recipe_id : recipe._id,
											title: recipe.title,
											img_url: recipe.img_url
										};;
                    checkRecipeId(i + 1, array);
                  } else {
                    var recipe_url = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" + id + "/information?includeNutrition=true";
                    unirest.get(recipe_url).header("X-Mashape-Key", "a6eY3wNAkqmshOzAUe2Ox8diEDzvp1Ec6Fcjsnu0vMjcv5XAlE").header("Accept", "application/json").end(function(result) {
                      if (result.status == 200) {
                        var data = result.body;
                        var newrecipe = new Recipe();

                        function checkIngredientsId(j, arrayIng, arrayNutr) {
                          if (j < arrayIng.length) {
                            var id = arrayIng[j].id;
                            Food.findOne({
                              spoon_id: id
                            }).exec(function(err, food) {
                              if (err) {
                                arrayIng[j] = "err2";
                                checkIngredientsId(j + 1, arrayIng, arrayNutr);
                              } else if (food) {
                                var ing = {
                                  food: food._id,
                                  amount: arrayIng[j].amount,
                                  unit: arrayIng[j].unit
                                };
                                arrayIng[j] = ing;
																var sItem = new ShoppingItem;
																sItem.name = food.name;
																sItem.unit = arrayIng[j].unit;
																sItem.value = arrayIng[j].amount;
																sItem.save(function(err){
																	if (err) {
																		console.log(err);
																	} else {
																		shoppingList.items.push(sItem);
																		checkIngredientsId(j + 1, arrayIng, arrayNutr);
																	}
																});
                              } else {
                                var newfood = new Food();
                                newfood.name = arrayIng[j].name;
                                newfood.spoon_id = arrayIng[j].id;
                                Category.findOne({
                                  name: arrayIng[j].aisle
                                }).exec(function(err, category) {
                                  if (category != null) {
                                    newfood.category = category.id;
                                  } else {
                                    var newCat = new Category({
                                      name: arrayIng[j].aisle
                                    });
                                    newCat.save();
                                    newfood.category = newCat.id;
                                  }
                                  newfood.img_url = arrayIng[j].image;
                                  newfood.nutrients = arrayNutr[j].nutrients;
                                  newfood.save(function(err) {
                                    if (err) {
                                      arrayIng[j] = "err3";
                                      checkIngredientsId(j + 1, arrayIng, arrayNutr);
                                    } else {
                                      var ing = {
                                        food: newfood._id,
                                        amount: arrayIng[j].amount,
                                        unit: arrayIng[j].unit
                                      };
                                      arrayIng[j] = ing;
																			var sItem = new ShoppingItem;
																			sItem.name = newfood.name;
																			sItem.unit = arrayIng[j].unit;
																			sItem.value = arrayIng[j].amount;
																			sItem.save(function(err){
																				if (err) {
																					console.log(err);
																				} else {
																					shoppingList.items.push(sItem);
																					checkIngredientsId(j + 1, arrayIng, arrayNutr);
																				}
																			});
                                    }
                                  });
                                });
                              }
                            });
                          } else {
                            newrecipe.ingredients = arrayIng;
                            newrecipe.save(function(err) {
                              if (err) {
                                array[i] = "err4";
                                checkRecipeId(i + 1, array);
                              } else {
                                array[i] = {
																	recipe_id : newrecipe._id,
																	title: newrecipe.title,
																	img_url: newrecipe.img_url
																};
                                checkRecipeId(i + 1, array);
                              }
                            });
                          }
                        }
                        newrecipe.spoon_id = id;
                        newrecipe.title = data.title;
                        newrecipe.img_url = data.image;
                        newrecipe.minutes = data.readyInMinutes;
                        newrecipe.instructions = data.instructions;
                        newrecipe.ingredients = [];
                        newrecipe.caloric_breakdown = data.nutrition.caloricBreakdown;
                        newrecipe.steps = data.analyzedInstructions;
                        newrecipe.nutrients = data.nutrition.nutrients;
                        var ingArray = data.extendedIngredients;
                        var nutrArray = data.nutrition.ingredients;
                        checkIngredientsId(0, ingArray, nutrArray);
                      } else {
                        array[i] = "err1";
                        checkRecipeId(i + 1, array);
                      }
                    });
                  }
                });
              } else {
								shoppingList.save(function(err){
									if (err) {
										res.send(err);
									} else {
										weekplan.items = array;
										weekplan.shopping_list = shoppingList._id;
		                weekplan.save(function(err) {
		                  if (err) {
		                    res.send(err);
		                  } else {
		                    res.json(weekplan);
		                  }
		                });
									}
								});
              }
            }
            var recipes = [];
            for (i = 0; i < result.body.items.length; i++) {
              var data = JSON.parse(result.body.items[i].value);
              recipes.push(data.id);
            }
            checkRecipeId(0, recipes);
          });
        } else {
          res.json({
            message: "invalid user"
          });
        }
      }
    });
  } else {
    res.json({
      message: "Cannot modify user without identifier"
    });
  }
});

router.route('/recipe').get(function(req, res) {
  if (req.query.id) {

  } else {
    res.json({
      message: "Cannot get recipe without identifier"
    });
  }
});

module.exports = router;
