/*
   login.js  -  One login form for ALL users (login.html)
   Made by: Mohona Akter
   1. Validate the two fields.
   2. Find the account in the users array (username OR email).
   3. Only "Active" accounts may log in.
   4. A switch on the role picks the dashboard page.
*/


function validateLogin() {
  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value;

  let isValid = true;
  clearLoginErrors();

  // 1. Check the fields
  if (isEmpty(username)) {
    showError("username", "Please enter your username or email.");
    isValid = false;
  }

  if (isEmpty(password)) {
    showError("password", "Please enter your password.");
    isValid = false;
  } else if (password.length < 8) {
    showError("password", "Password must be at least 8 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  // 2. Find the account
  let foundUser = null;
  for (const user of users) {
    let sameName = user.username.toLowerCase() === username.toLowerCase();
    let sameEmail = user.email.toLowerCase() === username.toLowerCase();
    if (sameName || sameEmail) {
      foundUser = user;
    }
  }

  if (foundUser === null || foundUser.password !== password) {
    showMessage("loginMessage", "Wrong username or password. Please try again.", "error");
    return false;
  }

  // 3. Check the account status
  if (foundUser.status === "Pending") {
    showMessage("loginMessage", "Hello " + foundUser.name + ", your " + foundUser.role.toLowerCase() +
                " account is waiting for the admin to approve it. Please try again later.", "info");
    return false;
  }
  if (foundUser.status === "Blocked") {
    showMessage("loginMessage", "This account is blocked. Please contact the gym admin.", "error");
    return false;
  }

  // 4. Open the right dashboard
  let form = document.getElementById("loginForm");
  switch (foundUser.role) {
    case "Admin":
      form.action = "admin.html";
      break;
    case "Trainer":
      form.action = "trainer.html";
      break;
    case "Member":
      form.action = "member.html";
      break;
    case "Nutritionist":
      form.action = "nutritionist.html";
      break;
  }

  console.log("Login OK: " + foundUser.name + " (" + foundUser.role + ") -> " + form.action);
  return true;
}


