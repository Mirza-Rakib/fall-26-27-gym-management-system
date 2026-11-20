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


// 4. VALIDATE AND CREATE THE ACCOUNT
function validateRegister() {
  let role = getRadioValue("userType");
  let fullName = document.getElementById("fullName").value.trim();
  let email = document.getElementById("email").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let dob = document.getElementById("dob").value;
  let gender = getRadioValue("gender");
  let username = document.getElementById("newUsername").value.trim();
  let password = document.getElementById("newPassword").value;
  let confirmPassword = document.getElementById("confirmPassword").value;

  let isValid = true;
  clearErrors(commonFields.concat(memberFieldIds, trainerFieldIds, nutritionistFieldIds));
  hideMessage("registerMessage");

  // common fields
  if (role === "") {
    showError("role", "Please choose the type of user.");
    isValid = false;
  }

  if (fullName.length < 3 || fullName.length > 50) {
    showError("fullName", "Name must be 3 to 50 characters.");
    isValid = false;
  } else {
    // letters and spaces only
    let letters = "abcdefghijklmnopqrstuvwxyz .";
    for (let i = 0; i < fullName.length; i++) {
      if (letters.indexOf(fullName[i].toLowerCase()) === -1) {
        showError("fullName", "Name can only have letters, spaces and dots.");
        isValid = false;
        break;
      }
    }
  }

  if (isValidEmail(email) === false) {
    showError("email", "Please enter a valid email, e.g. you@mail.com");
    isValid = false;
  }

  if (isValidPhone(phone) === false) {
    showError("phone", "Mobile must be 11 digits and start with 01.");
    isValid = false;
  }

  // members must be 14+, staff must be 18+
  let minimumAge = 14;
  if (role === "Trainer" || role === "Nutritionist") {
    minimumAge = 18;
  }
  if (dob === "") {
    showError("dob", "Please choose your date of birth.");
    isValid = false;
  } else if (ageFrom(dob) < minimumAge) {
    showError("dob", "You must be at least " + minimumAge + " years old.");
    isValid = false;
  } else if (ageFrom(dob) > 90) {
    showError("dob", "Please check the year of birth.");
    isValid = false;
  }

  if (gender === "") {
    showError("gender", "Please choose your gender.");
    isValid = false;
  }

  if (username.length < 4 || username.length > 15 || isLettersAndDigits(username) === false) {
    showError("newUsername", "Username must be 4-15 letters or digits, no spaces.");
    isValid = false;
  } else {
    for (const user of users) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        showError("newUsername", "This username is already taken.");
        isValid = false;
      }
    }
  }

  // password: at least 8 characters and at least one digit
  let hasDigit = false;
  for (let i = 0; i < password.length; i++) {
    if (isDigitsOnly(password[i])) {
      hasDigit = true;
    }
  }
  if (password.length < 8 || hasDigit === false) {
    showError("newPassword", "Password needs at least 8 characters including a digit.");
    isValid = false;
  }

  if (confirmPassword !== password || confirmPassword === "") {
    showError("confirmPassword", "Passwords do not match.");
    isValid = false;
  }

  // fields of the chosen role
  let newUser = {
    id: nextId("U", users), name: fullName, username: username, password: password,
    email: email, phone: phone, role: role, status: "Active", gender: gender, dob: dob
  };

  if (role === "Member") {
    let height = Number(document.getElementById("height").value);
    let weight = Number(document.getElementById("weight").value);
    let goal = document.getElementById("goal").value;
    let planId = document.getElementById("planChoice").value;

    if (height < 100 || height > 230) {
      showError("height", "Height must be between 100 and 230 cm.");
      isValid = false;
    }
    if (weight < 25 || weight > 250) {
      showError("weight", "Weight must be between 25 and 250 kg.");
      isValid = false;
    }
    if (goal === "") {
      showError("goal", "Please choose a goal.");
      isValid = false;
    }
    if (planId === "") {
      showError("planChoice", "Please choose a plan.");
      isValid = false;
    }

    newUser.height = height;
    newUser.weight = weight;
    newUser.goal = goal;
    newUser.planId = planId;
  }

  else if (role === "Trainer") {
    let employeeId = document.getElementById("employeeId").value.trim().toUpperCase();
    let special = document.getElementById("trainerSpecial").value;
    let experienceText = document.getElementById("trainerExperience").value;
    let certification = document.getElementById("certification").value.trim();
    let shift = getRadioValue("shift");

    if (matchesCode(employeeId, "TR-") === false) {
      showError("employeeId", "Employee ID must look like TR-1234.");
      isValid = false;
    }
    if (special === "") {
      showError("trainerSpecial", "Please choose a specialization.");
      isValid = false;
    }
    if (experienceText === "" || Number(experienceText) < 0 || Number(experienceText) > 40) {
      showError("trainerExperience", "Experience must be 0 to 40 years.");
      isValid = false;
    }
    if (certification.length < 3) {
      showError("certification", "Please enter your certification.");
      isValid = false;
    }
    if (shift === "") {
      showError("shift", "Please choose a shift.");
      isValid = false;
    }

    newUser.status = "Pending";
    newUser.employeeId = employeeId;
    newUser.specialization = special;
    newUser.experience = Number(experienceText);
    newUser.certification = certification;
    newUser.shift = shift;
  }

  else if (role === "Nutritionist") {
    let certificateNo = document.getElementById("certificateNo").value.trim().toUpperCase();
    let special = document.getElementById("nutriSpecial").value;
    let experienceText = document.getElementById("nutriExperience").value;
    let days = getCheckedValues("nutriDays");

    if (matchesCode(certificateNo, "NUT-") === false) {
      showError("certificateNo", "Certificate number must look like NUT-1234.");
      isValid = false;
    }
    if (special === "") {
      showError("nutriSpecial", "Please choose a specialization.");
      isValid = false;
    }
    if (experienceText === "" || Number(experienceText) < 0 || Number(experienceText) > 40) {
      showError("nutriExperience", "Experience must be 0 to 40 years.");
      isValid = false;
    }
    if (days.length === 0) {
      showError("nutriDays", "Tick at least one available day.");
      isValid = false;
    }

    newUser.status = "Pending";
    newUser.certificateNo = certificateNo;
    newUser.specialization = special;
    newUser.experience = Number(experienceText);
    newUser.days = days;
  }

  if (isValid === false) {
    showMessage("registerMessage", "Please fix the fields marked in red.", "error");
    return false;
  }

  // save the new account
  if (role === "Member") {
    // the next member number, e.g. "M-006"
    let memberCount = 0;
    for (const user of users) {
      if (user.role === "Member") {
        memberCount++;
      }
    }
    let number = memberCount + 1;
    if (number < 10) {
      newUser.memberId = "M-00" + number;
    } else {
      newUser.memberId = "M-0" + number;
    }
  }

  users.push(newUser);
  console.log("New account:", newUser);

  if (newUser.status === "Pending") {
    showMessage("registerMessage", "Thank you, " + fullName + "! Your " + role.toLowerCase() +
                " account was created and is waiting for the admin to approve it.", "info");
  } else {
    showMessage("registerMessage", "Welcome to FitHub, " + fullName + "! Your member ID is " +
                newUser.memberId + ". <a href='login.html'>Log in</a> and pay for your plan under Membership &amp; Payment; " +
                "the admin then activates your membership.", "success");
  }

  resetRegisterForm();
  document.getElementById("registerForm").reset();
  return false;     // stay on this page to show the message
}


