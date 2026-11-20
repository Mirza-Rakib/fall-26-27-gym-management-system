/*
   nutritionist.js  -  Everything a Nutritionist can do (nutritionist.html)
   Made by: Mohona Akter
   CRUD + Search : Diet plans (dietPlans array)
   Unique 1      : Calorie Calculator (Mifflin-St Jeor formula)  -> step 1
   Unique 2      : Macro Split Guide with coloured bars          -> step 2
   Unique 3      : Meal Planner with local foods (+ custom foods) -> step 3
   The three features work on the SAME diet plan, one after the other:
   calories -> diet plan -> protein/carbs/fat split -> meals -> member sees it
*/

const sections = ["dietSection", "calorieSection", "macroSection", "mealSection"];

const dietFields = ["dietMember", "dietGoal", "dietStart", "dietCalories", "dietMeals", "dietNotes"];

let editDietIndex = -1;     // -1 = creating a new plan, otherwise the index being edited
let mealItems = [];         // the foods added in the Meal Planner


/* Diet plans: create, read, update, delete, search */

// READ + SEARCH: draw the table from the array, skipping rows that do not match
function renderDietPlans() {
  let keyword = document.getElementById("dietSearch").value;
  let goalFilter = document.getElementById("dietGoalFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < dietPlans.length; i++) {
    let plan = dietPlans[i];

    let matchesKeyword = containsText(plan.memberName, keyword) || containsText(plan.memberId, keyword) ||
                         containsText(plan.notes, keyword) || containsText(plan.id, keyword);
    let matchesGoal = (goalFilter === "All" || plan.goal === goalFilter);

    if (matchesKeyword && matchesGoal) {
      let restrictions = "None";
      if (plan.restrictions.length > 0) {
        restrictions = plan.restrictions.join(", ");
      }

      rows += "<tr>" +
                "<td>" + plan.id + "</td>" +
                "<td><strong>" + plan.memberName + "</strong><br><span class='hint'>" + plan.memberId +
                  " &middot; from " + plan.startDate + "</span></td>" +
                "<td>" + goalBadge(plan.goal) + "</td>" +
                "<td>" + plan.calories + " kcal</td>" +
                "<td>" + plan.meals + "<br><span class='hint'>" + plan.mealPlan.length + " foods saved</span></td>" +
                "<td>" + restrictions + "</td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editDietPlan(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deleteDietPlan(" + i + ")'>Delete</button><br>" +
                  "<button type='button' class='btn btn-small btn-secondary' onclick='openMacros(" + i + ")'>Macros</button>" +
                  "<button type='button' class='btn btn-small btn-success' onclick='openMealPlanner(" + i + ")'>Meals</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>No diet plans match your search.</td></tr>";
  }

  document.getElementById("dietTableBody").innerHTML = rows;
  fillDietPlanSelect("macroPlan");      // keep both drop-downs up to date
  fillDietPlanSelect("mealDietPlan");
  document.getElementById("dietCount").innerHTML = "Showing " + shown + " of " + dietPlans.length + " plans";
}

// a coloured badge for each goal
function goalBadge(goal) {
  switch (goal) {
    case "Lose":
      return "<span class='badge red'>Lose</span>";
    case "Gain":
      return "<span class='badge green'>Gain</span>";
    default:
      return "<span class='badge blue'>Maintain</span>";
  }
}

// CREATE or UPDATE (the same form does both)
function saveDietPlan() {
  let memberId = document.getElementById("dietMember").value;
  let goal = getRadioValue("dietGoal");
  let startDate = document.getElementById("dietStart").value;
  let caloriesText = document.getElementById("dietCalories").value;
  let mealsText = document.getElementById("dietMeals").value;
  let restrictions = getCheckedValues("dietRestrictions");
  let notes = document.getElementById("dietNotes").value.trim();

  let calories = Number(caloriesText);
  let meals = Number(mealsText);

  let isValid = true;
  clearErrors(dietFields);
  hideMessage("dietMessage");

  if (memberId === "") {
    showError("dietMember", "Please choose a member.");
    isValid = false;
  }

  if (goal === "") {
    showError("dietGoal", "Please choose a goal.");
    isValid = false;
  }

  // a NEW plan cannot start in the past (an old plan being edited may keep its date)
  if (startDate === "") {
    showError("dietStart", "Please choose a start date.");
    isValid = false;
  } else if (editDietIndex === -1 && daysBetween(todayString(), startDate) < 0) {
    showError("dietStart", "The start date cannot be in the past.");
    isValid = false;
  }

  if (caloriesText === "" || calories < 1200 || calories > 4000) {
    showError("dietCalories", "Calories must be between 1200 and 4000.");
    isValid = false;
  }

  if (mealsText === "" || meals < 3 || meals > 6) {
    showError("dietMeals", "Meals per day must be 3 to 6.");
    isValid = false;
  }

  if (notes.length > 200) {
    showError("dietNotes", "Notes can be at most 200 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  let member = findMember(memberId);

  if (editDietIndex === -1) {
    // CREATE: build a new object and push() it
    let newPlan = {
      id: nextId("D", dietPlans), memberId: memberId, memberName: member.name, goal: goal,
      startDate: startDate, calories: calories, meals: meals, restrictions: restrictions, notes: notes,
      mealPlan: []
    };
    dietPlans.push(newPlan);
    showMessage("dietMessage", "Diet plan " + newPlan.id + " created for " + member.name + ".", "success");
  } else {
    // UPDATE: change the properties of the object being edited
    let plan = dietPlans[editDietIndex];
    plan.memberId = memberId;
    plan.memberName = member.name;
    plan.goal = goal;
    plan.startDate = startDate;
    plan.calories = calories;
    plan.meals = meals;
    plan.restrictions = restrictions;
    plan.notes = notes;
    showMessage("dietMessage", "Diet plan " + plan.id + " updated.", "success");
  }

  resetDietForm();
  document.getElementById("dietForm").reset();
  renderDietPlans();
  return false;     // stay on the page
}

// shows the member's goal, weight, membership and workouts (from the shared data)
function showDietMemberInfo() {
  let memberId = document.getElementById("dietMember").value;
  document.getElementById("dietMemberInfo").innerHTML = memberSummary(memberId);
}

// UPDATE step 1: copy the plan into the form
function editDietPlan(index) {
  let plan = dietPlans[index];
  editDietIndex = index;

  document.getElementById("dietMember").value = plan.memberId;
  showDietMemberInfo();
  setRadioValue("dietGoal", plan.goal);
  document.getElementById("dietStart").value = plan.startDate;
  document.getElementById("dietCalories").value = plan.calories;
  document.getElementById("dietMeals").value = plan.meals;
  setCheckedValues("dietRestrictions", plan.restrictions);
  document.getElementById("dietNotes").value = plan.notes;
  countNoteCharacters();

  document.getElementById("dietFormTitle").innerHTML = "Edit Diet Plan " + plan.id;
  document.getElementById("dietSaveButton").value = "Update Plan";
  clearErrors(dietFields);
}

// DELETE
function deleteDietPlan(index) {
  let plan = dietPlans[index];
  dietPlans = removeAt(dietPlans, index);
  showMessage("dietMessage", "Diet plan " + plan.id + " deleted.", "info");
  resetDietForm();
  document.getElementById("dietForm").reset();
  renderDietPlans();
}

// Cancel / after saving: back to "New Diet Plan"
function resetDietForm() {
  editDietIndex = -1;
  document.getElementById("dietMemberInfo").innerHTML = "";
  clearErrors(dietFields);
  document.getElementById("dietFormTitle").innerHTML = "New Diet Plan";
  document.getElementById("dietSaveButton").value = "Save Plan";
  document.getElementById("noteCounter").innerHTML = "0 / 200";
  document.getElementById("noteCounter").style.color = "";
}

// live character counter for the notes box (turns red above 200)
function countNoteCharacters() {
  let length = document.getElementById("dietNotes").value.length;
  let counter = document.getElementById("noteCounter");
  counter.innerHTML = length + " / 200";
  if (length > 200) {
    counter.style.color = "#dc2626";
  } else {
    counter.style.color = "";
  }
}


/* Shared by the three features */

// drop-down of diet plans (built with createElement); used by steps 2 and 3
function fillDietPlanSelect(selectId) {
  let select = document.getElementById(selectId);
  let chosen = select.value;                 // keep the choice when the list is rebuilt
  select.innerHTML = "";

  let first = document.createElement("option");
  first.value = "";
  first.innerHTML = "-- Choose a member's diet plan --";
  select.appendChild(first);

  for (const plan of dietPlans) {
    let option = document.createElement("option");
    option.value = plan.id;
    option.innerHTML = plan.id + " - " + plan.memberName + " (" + plan.goal + ", " + plan.calories + " kcal)";
    select.appendChild(option);
  }
  select.value = chosen;
}

// the percentages of protein, carbs and fat for a goal: [protein, carbs, fat]
function macroSplit(goal) {
  switch (goal) {
    case "Lose":
      return [35, 40, 25];
    case "Gain":
      return [30, 50, 20];
    default:
      return [30, 40, 30];
  }
}

// grams of protein a day: protein gives 4 kcal per gram
function proteinTarget(goal, calories) {
  return Math.round(calories * macroSplit(goal)[0] / 100 / 4);
}

// the latest weight of a member (from the Member's own progress log)
function latestWeightOf(member) {
  let weight = member.weight;
  let latestDate = "";
  for (const log of progressLogs) {
    if (log.userId === member.id && log.date > latestDate) {
      latestDate = log.date;
      weight = log.weight;
    }
  }
  return weight;
}

// the member's sign-up goal in the words the diet plan uses
function planGoalFrom(memberGoal) {
  switch (memberGoal) {
    case "Lose weight":
      return "Lose";
    case "Gain muscle":
      return "Gain";
    default:
      return "Maintain";
  }
}


/*
   UNIQUE FEATURE 1 (STEP 1): CALORIE CALCULATOR
   BMR (Mifflin-St Jeor):  men   = 10 x kg + 6.25 x cm - 5 x age + 5
   women = 10 x kg + 6.25 x cm - 5 x age - 161
   Daily calories = BMR x activity level, then -500 to lose or +300 to gain
*/
let lastCalories = 0;

// choosing a member fills age, gender, height, weight and goal from the shared data
function fillCalculatorFromMember() {
  let member = findMember(document.getElementById("calMember").value);
  if (member === null) {
    return;
  }
  document.getElementById("calAge").value = Math.floor(daysBetween(member.dob, todayString()) / 365.25);
  setRadioValue("calGender", member.gender);
  document.getElementById("calHeight").value = member.height;
  document.getElementById("calWeight").value = latestWeightOf(member);
  document.getElementById("calGoal").value = planGoalFrom(member.goal);
  document.getElementById("calorieResult").style.display = "none";
}

function calculateCalories() {
  let age = Number(document.getElementById("calAge").value);
  let gender = getRadioValue("calGender");
  let height = Number(document.getElementById("calHeight").value);
  let weight = Number(document.getElementById("calWeight").value);
  let activityText = document.getElementById("calActivity").value;
  let goal = document.getElementById("calGoal").value;

  let isValid = true;
  clearErrors(["calAge", "calGender", "calHeight", "calWeight", "calActivity"]);

  if (age < 14 || age > 80) {
    showError("calAge", "Age must be 14 to 80.");
    isValid = false;
  }
  if (gender === "") {
    showError("calGender", "Please choose a gender.");
    isValid = false;
  }
  if (height < 100 || height > 230) {
    showError("calHeight", "Height must be 100 to 230 cm.");
    isValid = false;
  }
  if (weight < 25 || weight > 250) {
    showError("calWeight", "Weight must be 25 to 250 kg.");
    isValid = false;
  }
  if (activityText === "") {
    showError("calActivity", "Please choose an activity level.");
    isValid = false;
  }

  if (isValid === false) {
    document.getElementById("calorieResult").style.display = "none";
    return false;
  }

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "Male") {
    bmr = bmr + 5;
  } else {
    bmr = bmr - 161;
  }

  let maintenance = bmr * Number(activityText);
  let target = maintenance;
  if (goal === "Lose") {
    target = maintenance - 500;
  } else if (goal === "Gain") {
    target = maintenance + 300;
  }
  target = Math.round(target);

  // a diet plan must be between 1200 and 4000 kcal
  if (target < 1200) {
    target = 1200;
  } else if (target > 4000) {
    target = 4000;
  }
  lastCalories = target;

  document.getElementById("calorieNumber").innerHTML = target + " kcal";
  document.getElementById("calorieDetails").innerHTML =
      "BMR: " + Math.round(bmr) + " kcal &middot; Maintenance: " + Math.round(maintenance) + " kcal &middot; Goal: " + goal +
      " &middot; Protein target: " + proteinTarget(goal, target) + " g";
  document.getElementById("calorieResult").style.display = "block";
  return false;
}

// step 1 -> diet plan: copy member, goal and calories into the diet plan form
function useCaloriesInPlan() {
  resetDietForm();
  document.getElementById("dietForm").reset();

  let memberId = document.getElementById("calMember").value;
  document.getElementById("dietMember").value = memberId;
  showDietMemberInfo();
  setRadioValue("dietGoal", document.getElementById("calGoal").value);
  document.getElementById("dietCalories").value = lastCalories;
  document.getElementById("dietStart").value = todayString();

  showSection("dietSection");
  showMessage("dietMessage", "Calories copied from the calculator. Add the meals per day and restrictions, then press Save Plan.", "info");
}


/*
   UNIQUE FEATURE 2 (STEP 2): MACRO SPLIT GUIDE
   protein and carbs give 4 kcal per gram, fat gives 9 kcal per gram
*/

// the "Macros" button in the diet plan table opens this step for that plan
function openMacros(index) {
  document.getElementById("macroPlan").value = dietPlans[index].id;
  useMacroPlan();
  showSection("macroSection");
}

// choosing a diet plan copies its goal and calories
function useMacroPlan() {
  let planId = document.getElementById("macroPlan").value;
  clearError("macroPlan");
  if (planId !== "") {
    let plan = dietPlans[findIndexById(dietPlans, planId)];
    document.getElementById("macroGoal").value = plan.goal;
    document.getElementById("macroCalories").value = plan.calories;
  }
  showMacros();
}

function showMacros() {
  let goal = document.getElementById("macroGoal").value;
  let calories = Number(document.getElementById("macroCalories").value);

  clearError("macroCalories");
  if (calories < 1200 || calories > 4000) {
    showError("macroCalories", "Calories must be 1200 to 4000.");
    return;
  }

  let split = macroSplit(goal);
  let tip;
  switch (goal) {
    case "Lose":
      tip = "High protein keeps you full and protects muscle while losing fat.";
      break;
    case "Gain":
      tip = "More carbs give energy for heavy training and muscle growth.";
      break;
    default:
      tip = "A balanced split for staying at the same weight.";
  }

  setMacroBar("proteinBar", "proteinValue", split[0], Math.round(calories * split[0] / 100 / 4), "#dc2626");
  setMacroBar("carbBar", "carbValue", split[1], Math.round(calories * split[1] / 100 / 4), "#2563eb");
  setMacroBar("fatBar", "fatValue", split[2], Math.round(calories * split[2] / 100 / 9), "#f59e0b");
  document.getElementById("macroTip").innerHTML = tip;
}

// sets one bar's width and colour with element.style
function setMacroBar(barId, valueId, percent, grams, colour) {
  let bar = document.getElementById(barId);
  bar.style.width = percent + "%";
  bar.style.backgroundColor = colour;
  document.getElementById(valueId).innerHTML = percent + "% &middot; " + grams + " g";
}

// step 2 -> step 3: open the Meal Planner for the same diet plan
function planMealsFromMacros() {
  let planId = document.getElementById("macroPlan").value;
  clearError("macroPlan");
  if (planId === "") {
    showError("macroPlan", "Choose a diet plan first.");
    return;
  }
  openMealPlanner(findIndexById(dietPlans, planId));
}


/*
   UNIQUE FEATURE 3 (STEP 3): MEAL PLANNER
   Each added food is an object in mealItems. renderMeals() builds the
   four meal cards with createElement + appendChild.
*/

// food drop-down built from the foods array (custom foods are marked)
function fillFoodSelect() {
  let select = document.getElementById("mealFood");
  select.innerHTML = "";
  for (let i = 0; i < foods.length; i++) {
    let option = document.createElement("option");
    option.value = i;                        // the index in the foods array
    option.innerHTML = foods[i].name + " - " + foods[i].calories + " kcal";
    if (foods[i].custom === true) {
      option.innerHTML += " (custom)";
    }
    select.appendChild(option);
  }
}

// adds a food that is not in the list; it can then be used in any meal
function addCustomFood() {
  let name = document.getElementById("customName").value.trim();
  let caloriesText = document.getElementById("customCalories").value;
  let proteinText = document.getElementById("customProtein").value;
  let calories = Number(caloriesText);
  let protein = Number(proteinText);

  let isValid = true;
  clearErrors(["customName", "customCalories", "customProtein"]);
  hideMessage("customFoodMessage");

  if (name.length < 3 || name.length > 40) {
    showError("customName", "Food name must be 3 to 40 characters.");
    isValid = false;
  } else {
    for (const food of foods) {
      if (food.name.toLowerCase() === name.toLowerCase()) {
        showError("customName", "This food is already in the list.");
        isValid = false;
      }
    }
  }

  if (caloriesText === "" || calories < 1 || calories > 1500) {
    showError("customCalories", "Calories must be 1 to 1500.");
    isValid = false;
  }

  if (proteinText === "" || protein < 0 || protein > 150) {
    showError("customProtein", "Protein must be 0 to 150 g.");
    isValid = false;
  } else if (protein * 4 > calories) {
    // 1 g of protein gives 4 kcal, so the protein cannot give more calories than the food has
    showError("customProtein", "Too much protein: " + protein + " g is " + (protein * 4) +
              " kcal, more than the food's " + calories + " kcal.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  foods.push({ name: name, calories: calories, protein: protein, custom: true });
  fillFoodSelect();
  document.getElementById("mealFood").value = foods.length - 1;    // select the new food
  showMessage("customFoodMessage", name + " was added to the food list and is selected above.", "success");
  document.getElementById("customFoodForm").reset();
  return false;
}

// the "Meals" button in the diet plan table opens this step for that plan
function openMealPlanner(index) {
  document.getElementById("mealDietPlan").value = dietPlans[index].id;
  loadMealsFromPlan();
  showSection("mealSection");
}

// choosing a diet plan loads its saved meals and its calorie target
function loadMealsFromPlan() {
  let planId = document.getElementById("mealDietPlan").value;
  clearError("mealDietPlan");
  hideMessage("mealMessage");

  if (planId === "") {
    mealItems = [];
    renderMeals();
    return;
  }

  let plan = dietPlans[findIndexById(dietPlans, planId)];
  mealItems = plan.mealPlan.slice();          // slice() makes a copy of the array
  document.getElementById("mealTarget").value = plan.calories;
  renderMeals();
}

function addFoodToMeal() {
  let mealTime = document.getElementById("mealTime").value;
  let foodIndex = document.getElementById("mealFood").value;
  let servings = Number(document.getElementById("mealServings").value);

  clearErrors(["mealFood", "mealServings"]);

  if (foodIndex === "") {
    showError("mealFood", "Please choose a food.");
    return;
  }
  if (servings < 1 || servings > 5) {
    showError("mealServings", "Servings must be 1 to 5.");
    return;
  }

  let food = foods[Number(foodIndex)];
  mealItems.push({
    meal: mealTime,
    name: food.name,
    servings: servings,
    calories: food.calories * servings,
    protein: food.protein * servings
  });
  renderMeals();
}

function removeMealItem(index) {
  mealItems = removeAt(mealItems, index);
  renderMeals();
}

function clearMeals() {
  mealItems = [];
  renderMeals();
}

function renderMeals() {
  let mealNames = ["Breakfast", "Lunch", "Snack", "Dinner"];
  let grid = document.getElementById("mealGrid");
  grid.innerHTML = "";

  let totalCalories = 0;
  let totalProtein = 0;

  for (const mealName of mealNames) {
    let card = document.createElement("div");
    card.className = "meal-card";

    let title = document.createElement("h3");
    title.innerHTML = mealName;
    card.appendChild(title);

    let list = document.createElement("ul");
    let mealCalories = 0;
    let count = 0;

    for (let i = 0; i < mealItems.length; i++) {
      if (mealItems[i].meal === mealName) {
        let item = document.createElement("li");
        item.innerHTML = "<span>" + mealItems[i].servings + " x " + mealItems[i].name + " (" + mealItems[i].calories + " kcal)</span>" +
                         "<button type='button' class='btn btn-small btn-danger' onclick='removeMealItem(" + i + ")'>x</button>";
        list.appendChild(item);
        count++;
        mealCalories += mealItems[i].calories;
        totalCalories += mealItems[i].calories;
        totalProtein += mealItems[i].protein;
      }
    }

    if (count === 0) {
      let empty = document.createElement("li");
      empty.className = "hint";
      empty.innerHTML = "No food added yet";
      list.appendChild(empty);
    }
    card.appendChild(list);

    let subtotal = document.createElement("p");
    subtotal.innerHTML = "<strong>" + mealCalories + " kcal</strong>";
    card.appendChild(subtotal);

    grid.appendChild(card);
  }

  // calories: the target comes from the diet plan; red when above it
  let target = Number(document.getElementById("mealTarget").value);
  clearError("mealTarget");
  if (target < 1200 || target > 4000) {
    showError("mealTarget", "Target must be 1200 to 4000.");
  }

  let totals = document.getElementById("mealTotals");
  totals.innerHTML = "Calories: " + totalCalories + " / " + target + " kcal";
  if (totalCalories > target) {
    totals.style.color = "#dc2626";
    totals.innerHTML += " &middot; over by " + (totalCalories - target) + " kcal";
  } else {
    totals.style.color = "#16a34a";
  }

  // protein: the target comes from the Macro Split Guide for the plan's goal
  let goal = "Maintain";
  let planId = document.getElementById("mealDietPlan").value;
  if (planId !== "") {
    goal = dietPlans[findIndexById(dietPlans, planId)].goal;
  }
  let proteinGoal = proteinTarget(goal, target);
  let proteinText = document.getElementById("proteinTotals");
  proteinText.innerHTML = "Protein: " + totalProtein + " / " + proteinGoal + " g (" + goal + " split from step 2)";
  // green when the meals give at least 90% of the protein target ("on track")
  if (totalProtein >= proteinGoal * 0.9) {
    proteinText.style.color = "#16a34a";
    proteinText.innerHTML += " &middot; on track";
  } else {
    proteinText.style.color = "#f59e0b";
    proteinText.innerHTML += " &middot; add more protein";
  }
}

// save the day of meals into the chosen diet plan, so the member can see it
function saveMealsToPlan() {
  let planId = document.getElementById("mealDietPlan").value;
  clearError("mealDietPlan");
  hideMessage("mealMessage");

  if (planId === "") {
    showError("mealDietPlan", "Please choose a diet plan.");
    return;
  }
  if (mealItems.length === 0) {
    showError("mealDietPlan", "Add at least one food first.");
    return;
  }

  let plan = dietPlans[findIndexById(dietPlans, planId)];
  plan.mealPlan = mealItems.slice();
  showMessage("mealMessage", mealItems.length + " foods saved to " + plan.memberName + "'s diet plan " + plan.id +
              ". The member sees them under \"My Diet, Workouts &amp; Visits\".", "success");
  renderDietPlans();
}


// Run when the page loads
fillMemberSelect("dietMember");
fillMemberSelect("calMember");
fillFoodSelect();
renderDietPlans();
renderMeals();
showMacros();
showSection("dietSection");
