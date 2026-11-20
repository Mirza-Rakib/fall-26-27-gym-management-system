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


