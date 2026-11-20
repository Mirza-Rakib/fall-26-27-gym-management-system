/*
   register.js  -  Sign-up page (register.html)
   Made by: Mohona Akter
   1. showRoleFields(): the "Type of user" radio buttons show only that
   role's fieldset (style.display)
   2. fillPlanChoice(): builds the plan <option>s with createElement
   3. toggleRegisterButton(): button disabled until terms are ticked
   4. validateRegister(): checks every field, then push()es the new user
*/

const commonFields = ["role", "fullName", "email", "phone", "dob", "gender",
                      "newUsername", "newPassword", "confirmPassword"];
const memberFieldIds = ["height", "weight", "goal", "planChoice"];
const trainerFieldIds = ["employeeId", "trainerSpecial", "trainerExperience", "certification", "shift"];
const nutritionistFieldIds = ["certificateNo", "nutriSpecial", "nutriExperience", "nutriDays"];


// 1. SHOW ONLY THE FIELDS OF THE CHOSEN ROLE
function showRoleFields() {
  let role = getRadioValue("userType");

  document.getElementById("memberFields").style.display = "none";
  document.getElementById("trainerFields").style.display = "none";
  document.getElementById("nutritionistFields").style.display = "none";

  switch (role) {
    case "Member":
      document.getElementById("memberFields").style.display = "block";
      break;
    case "Trainer":
      document.getElementById("trainerFields").style.display = "block";
      break;
    case "Nutritionist":
      document.getElementById("nutritionistFields").style.display = "block";
      break;
  }
}


// 2. PLAN DROP-DOWN BUILT FROM THE plans ARRAY
function fillPlanChoice() {
  let select = document.getElementById("planChoice");

  let first = document.createElement("option");
  first.value = "";
  first.innerHTML = "-- Select plan --";
  select.appendChild(first);

  for (const plan of plans) {
    if (plan.status === "Active") {
      let option = document.createElement("option");
      option.value = plan.id;
      option.innerHTML = plan.name + " (" + plan.price + " BDT)";
      select.appendChild(option);
    }
  }
}


// 3. THE BUTTON WORKS ONLY WHEN THE TERMS ARE TICKED
function toggleRegisterButton() {
  document.getElementById("registerButton").disabled = !document.getElementById("terms").checked;
}


// Age in whole years from a "YYYY-MM-DD" date of birth
function ageFrom(dob) {
  return Math.floor(daysBetween(dob, todayString()) / 365.25);
}

// true for text like "TR-1234": the prefix, then exactly 4 digits
function matchesCode(text, prefix) {
  return text.slice(0, prefix.length) === prefix &&
         text.length === prefix.length + 4 &&
         isDigitsOnly(text.slice(prefix.length));
}


