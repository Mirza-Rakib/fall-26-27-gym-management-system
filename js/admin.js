/*
   admin.js  -  Everything the Admin can do (admin.html)
   Made by: Mirza Mohammad Rakib
   CRUD + Search : Membership plans (plans array)
   Unique 1      : User Approval (approve / reject / block / add admin)
   Unique 2      : Payment Verification (bKash / Nagad)
   Unique 3      : Gym Statistics with bar charts and a "needs your action" list
   The pages work together: plans are paid for, payments are verified,
   verified payments start memberships, and the statistics count all of it.
*/

const sections = ["plansSection", "usersSection", "paymentsSection", "statsSection"];

const planFields = ["planName", "planPrice", "planMonths", "planStatus", "planFacilities"];

// The admin who is logged in (later this comes from the PHP session)
const currentAdminId = "U-001";

let editPlanIndex = -1;


/* Membership plans: create, read, update, delete, search */

// how many members are using a plan
function membersOnPlan(planId) {
  let count = 0;
  for (const sub of subscriptions) {
    if (sub.planId === planId) {
      count++;
    }
  }
  return count;
}

// READ + SEARCH
function renderPlans() {
  let keyword = document.getElementById("planSearch").value;
  let statusFilter = document.getElementById("planStatusFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < plans.length; i++) {
    let plan = plans[i];
    let facilities = plan.facilities.join(", ");

    let matchesKeyword = containsText(plan.name, keyword) || containsText(facilities, keyword) ||
                         containsText(plan.id, keyword);
    let matchesStatus = (statusFilter === "All" || plan.status === statusFilter);

    if (matchesKeyword && matchesStatus) {
      let badge = "<span class='badge green'>Active</span>";
      if (plan.status === "Inactive") {
        badge = "<span class='badge'>Inactive</span>";
      }

      rows += "<tr>" +
                "<td>" + plan.id + "</td>" +
                "<td><strong>" + plan.name + "</strong><br><span class='hint'>" + membersOnPlan(plan.id) + " member(s)</span></td>" +
                "<td>" + plan.price + " BDT</td>" +
                "<td>" + plan.months + "</td>" +
                "<td>" + facilities + "</td>" +
                "<td>" + badge + "</td>" +
                "<td>" +
                  "<button type='button' class='btn btn-small' onclick='editPlan(" + i + ")'>Edit</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='deletePlan(" + i + ")'>Delete</button>" +
                "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>No plans match your search.</td></tr>";
  }

  document.getElementById("planTableBody").innerHTML = rows;
  document.getElementById("planCount").innerHTML = "Showing " + shown + " of " + plans.length + " plans";
}

// CREATE or UPDATE
function savePlan() {
  let name = document.getElementById("planName").value.trim();
  let priceText = document.getElementById("planPrice").value;
  let monthsText = document.getElementById("planMonths").value;
  let status = getRadioValue("planStatus");
  let facilities = getCheckedValues("planFacilities");
  let price = Number(priceText);

  let isValid = true;
  clearErrors(planFields);
  hideMessage("planMessage");

  if (name.length < 3) {
    showError("planName", "Plan name must be at least 3 characters.");
    isValid = false;
  } else {
    // the name must be unique (ignore the plan that is being edited)
    for (let i = 0; i < plans.length; i++) {
      if (i !== editPlanIndex && plans[i].name.toLowerCase() === name.toLowerCase()) {
        showError("planName", "A plan with this name already exists.");
        isValid = false;
      }
    }
  }

  if (priceText === "" || price < 500 || price > 20000) {
    showError("planPrice", "Price must be between 500 and 20,000 BDT.");
    isValid = false;
  }

  if (monthsText === "") {
    showError("planMonths", "Please choose a duration.");
    isValid = false;
  }

  if (status === "") {
    showError("planStatus", "Please choose a status.");
    isValid = false;
  }

  if (facilities.length === 0) {
    showError("planFacilities", "Tick at least one facility.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  if (editPlanIndex === -1) {
    let newPlan = {
      id: nextId("P", plans), name: name, price: price, months: Number(monthsText),
      facilities: facilities, status: status
    };
    plans.push(newPlan);
    showMessage("planMessage", "Plan \"" + name + "\" added.", "success");
  } else {
    let plan = plans[editPlanIndex];
    plan.name = name;
    plan.price = price;
    plan.months = Number(monthsText);
    plan.facilities = facilities;
    plan.status = status;
    showMessage("planMessage", "Plan \"" + name + "\" updated.", "success");
  }

  resetPlanForm();
  document.getElementById("planForm").reset();
  renderPlans();
  renderStats();
  return false;
}

// UPDATE step 1: copy the plan into the form
function editPlan(index) {
  let plan = plans[index];
  editPlanIndex = index;

  document.getElementById("planName").value = plan.name;
  document.getElementById("planPrice").value = plan.price;
  document.getElementById("planMonths").value = plan.months;
  setRadioValue("planStatus", plan.status);
  setCheckedValues("planFacilities", plan.facilities);

  document.getElementById("planFormTitle").innerHTML = "Edit Plan " + plan.id;
  document.getElementById("planSaveButton").value = "Update Plan";
  clearErrors(planFields);
}

// DELETE (refused while members use the plan)
function deletePlan(index) {
  let plan = plans[index];
  let count = membersOnPlan(plan.id);

  if (count > 0) {
    showMessage("planMessage", "Cannot delete \"" + plan.name + "\": " + count +
                " member(s) are using it. Set it to Inactive instead.", "error");
    return;
  }

  plans = removeAt(plans, index);
  showMessage("planMessage", "Plan \"" + plan.name + "\" deleted.", "info");
  resetPlanForm();
  document.getElementById("planForm").reset();
  renderPlans();
}

function resetPlanForm() {
  editPlanIndex = -1;
  clearErrors(planFields);
  document.getElementById("planFormTitle").innerHTML = "New Plan";
  document.getElementById("planSaveButton").value = "Save Plan";
}


/* Unique feature 1: user approval */
function statusBadge(status) {
  switch (status) {
    case "Active":
      return "<span class='badge green'>Active</span>";
    case "Pending":
      return "<span class='badge orange'>Pending</span>";
    default:
      return "<span class='badge red'>Blocked</span>";
  }
}

// a short line about the role-specific details
function userDetails(user) {
  switch (user.role) {
    case "Trainer":
      return user.employeeId + ", " + user.specialization + ", " + user.experience + " yrs";
    case "Nutritionist":
      return user.certificateNo + ", " + user.specialization + ", " + user.experience + " yrs";
    case "Member":
      return user.memberId + ", goal: " + user.goal + " " + membershipText(user.memberId);
    default:
      return user.email;
  }
}

function renderUsers() {
  let keyword = document.getElementById("userSearch").value;
  let roleFilter = document.getElementById("userRoleFilter").value;
  let statusFilter = document.getElementById("userStatusFilter").value;

  let rows = "";
  let shown = 0;

  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    let matchesKeyword = containsText(user.name, keyword) || containsText(user.username, keyword) ||
                         containsText(user.email, keyword);
    let matchesRole = (roleFilter === "All" || user.role === roleFilter);
    let matchesStatus = (statusFilter === "All" || user.status === statusFilter);

    if (matchesKeyword && matchesRole && matchesStatus) {
      // the buttons depend on the status
      let actions = "";
      if (user.status === "Pending") {
        actions = "<button type='button' class='btn btn-small btn-success' onclick='approveUser(" + i + ")'>Approve</button>" +
                  "<button type='button' class='btn btn-small btn-danger' onclick='rejectUser(" + i + ")'>Reject</button>";
      } else if (user.id === currentAdminId) {
        actions = "<span class='hint'>You</span>";
      } else if (user.status === "Active") {
        actions = "<button type='button' class='btn btn-small btn-danger' onclick='toggleBlock(" + i + ")'>Block</button>";
      } else {
        actions = "<button type='button' class='btn btn-small' onclick='toggleBlock(" + i + ")'>Unblock</button>";
      }

      rows += "<tr>" +
                "<td>" + user.id + "</td>" +
                "<td><strong>" + user.name + "</strong></td>" +
                "<td>" + user.username + "</td>" +
                "<td>" + user.role + "</td>" +
                "<td>" + userDetails(user) + "</td>" +
                "<td>" + statusBadge(user.status) + "</td>" +
                "<td>" + actions + "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='7' class='empty-row'>No users match your search.</td></tr>";
  }

  document.getElementById("userTableBody").innerHTML = rows;
  document.getElementById("userCount").innerHTML = "Showing " + shown + " of " + users.length + " users";
}

function approveUser(index) {
  users[index].status = "Active";
  showMessage("userMessage", users[index].name + " is approved, can now log in and is shown on the home page.", "success");
  renderUsers();
  renderStats();
}

function rejectUser(index) {
  let user = users[index];
  users = removeAt(users, index);
  showMessage("userMessage", "The sign-up of " + user.name + " was rejected.", "info");
  renderUsers();
  renderStats();
}

function toggleBlock(index) {
  let user = users[index];
  if (user.status === "Active") {
    user.status = "Blocked";
    showMessage("userMessage", user.name + " is blocked.", "error");
  } else {
    user.status = "Active";
    showMessage("userMessage", user.name + " is active again.", "success");
  }
  renderUsers();
}

// add another admin (admins cannot sign up on the public page)
function addAdmin() {
  let name = document.getElementById("adminName").value.trim();
  let username = document.getElementById("adminUsername").value.trim();
  let email = document.getElementById("adminEmail").value.trim();
  let password = document.getElementById("adminPassword").value;

  let isValid = true;
  clearErrors(["adminName", "adminUsername", "adminEmail", "adminPassword"]);

  if (name.length < 3) {
    showError("adminName", "Name must be at least 3 characters.");
    isValid = false;
  }

  if (username.length < 4 || isLettersAndDigits(username) === false) {
    showError("adminUsername", "Username must be at least 4 letters or digits.");
    isValid = false;
  } else {
    for (const user of users) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        showError("adminUsername", "This username is already taken.");
        isValid = false;
      }
    }
  }

  if (isValidEmail(email) === false) {
    showError("adminEmail", "Please enter a valid email.");
    isValid = false;
  }

  if (password.length < 8) {
    showError("adminPassword", "Password must be at least 8 characters.");
    isValid = false;
  }

  if (isValid === false) {
    return false;
  }

  users.push({ id: nextId("U", users), name: name, username: username, password: password,
               email: email, phone: "", role: "Admin", status: "Active" });
  showMessage("userMessage", name + " was added as an admin.", "success");
  document.getElementById("adminForm").reset();
  renderUsers();
  return false;
}


/* Unique feature 2: payment verification */
function renderPayments() {
  let keyword = document.getElementById("paymentSearch").value;
  let statusFilter = document.getElementById("paymentStatusFilter").value;

  let rows = "";
  let shown = 0;
  let pending = 0;

  for (let i = 0; i < payments.length; i++) {
    let pay = payments[i];
    if (pay.status === "Pending") {
      pending++;
    }

    let matchesKeyword = containsText(pay.memberName, keyword) || containsText(pay.trxId, keyword) ||
                         containsText(pay.id, keyword) || containsText(pay.memberId, keyword);
    let matchesStatus = (statusFilter === "All" || pay.status === statusFilter);

    if (matchesKeyword && matchesStatus) {
      let plan = findPlan(pay.planId);
      let planName = "Unknown plan";
      if (plan !== null) {
        planName = plan.name;
      }

      // only Pending payments can be changed; verified rows turn green and are locked
      let rowClass = "";
      let badge = "";
      let actions = "";
      switch (pay.status) {
        case "Pending":
          badge = "<span class='badge orange'>Pending</span>";
          actions = "<button type='button' class='btn btn-small btn-success' onclick='verifyPayment(" + i + ")'>Verify</button>" +
                    "<button type='button' class='btn btn-small btn-danger' onclick='rejectPayment(" + i + ")'>Reject</button>";
          break;
        case "Verified":
          rowClass = " class='row-green'";
          badge = "<span class='badge green'>Verified</span>";
          actions = "<span class='hint'>Locked</span>";
          break;
        default:
          badge = "<span class='badge red'>Rejected</span>";
          actions = "<span class='hint'>Closed</span>";
      }

      rows += "<tr" + rowClass + ">" +
                "<td>" + pay.id + "</td>" +
                "<td><strong>" + pay.memberName + "</strong><br><span class='hint'>" + pay.memberId + "</span></td>" +
                "<td>" + planName + "</td>" +
                "<td>" + pay.amount + " BDT</td>" +
                "<td>" + pay.method + "</td>" +
                "<td><code>" + pay.trxId + "</code></td>" +
                "<td>" + pay.date + "</td>" +
                "<td>" + membershipText(pay.memberId) + "</td>" +
                "<td>" + badge + "</td>" +
                "<td>" + actions + "</td>" +
              "</tr>";
      shown++;
    }
  }

  if (shown === 0) {
    rows = "<tr><td colspan='10' class='empty-row'>No payments match your search.</td></tr>";
  }

  document.getElementById("paymentTableBody").innerHTML = rows;
  document.getElementById("paymentCount").innerHTML = "Showing " + shown + " of " + payments.length +
                                                      " payments &middot; " + pending + " waiting for you";
}

// the member's membership right now (from the subscriptions array)
function membershipText(memberId) {
  let sub = findSubscription(memberId);
  if (sub === null) {
    return "<span class='badge'>None yet</span>";
  }
  if (daysBetween(todayString(), sub.endDate) >= 0) {
    return "<span class='badge green'>Until " + sub.endDate + "</span>";
  }
  return "<span class='badge red'>Ended " + sub.endDate + "</span>";
}

function verifyPayment(index) {
  let pay = payments[index];
  pay.status = "Verified";
  let endDate = activateMembership(pay.memberId, pay.planId);
  showMessage("paymentMessage", "Payment " + pay.id + " from " + pay.memberName +
              " is verified. Membership is active until " + endDate + ".", "success");
  renderPayments();
  renderPlans();       // the plan's member count may change
  renderStats();
}

// A verified payment starts or extends the member's membership (subscriptions array).
// One month is counted as 30 days.
// The Trainer's Attendance Desk and the Member's status card read this same array.
function activateMembership(memberId, planId) {
  let plan = findPlan(planId);
  let sub = findSubscription(memberId);
  let today = todayString();

  if (sub === null) {
    // first membership: starts today
    sub = { id: nextId("S", subscriptions), memberId: memberId, planId: planId,
            startDate: today, endDate: addDays(today, plan.months * 30) };
    subscriptions.push(sub);
  } else if (daysBetween(today, sub.endDate) >= 0) {
    // still active: add the months after the current end date
    sub.planId = planId;
    sub.endDate = addDays(sub.endDate, plan.months * 30);
  } else {
    // expired: start again from today
    sub.planId = planId;
    sub.startDate = today;
    sub.endDate = addDays(today, plan.months * 30);
  }

  findMember(memberId).planId = planId;
  return sub.endDate;
}

function rejectPayment(index) {
  let pay = payments[index];
  pay.status = "Rejected";
  showMessage("paymentMessage", "Payment " + pay.id + " was rejected. The member must pay again.", "error");
  renderPayments();
  renderStats();
}


/* Unique feature 3: gym statistics (loops + bar charts) */
function renderStats() {
  let today = todayString();

  // members and their memberships
  let memberCount = 0;
  let activeCount = 0;
  let expiredCount = 0;
  for (const user of users) {
    if (user.role === "Member") {
      memberCount++;
      let sub = findSubscription(user.memberId);
      if (sub !== null && daysBetween(today, sub.endDate) >= 0) {
        activeCount++;
      } else {
        expiredCount++;
      }
    }
  }

  // things waiting for the admin
  let pendingUsers = 0;
  for (const user of users) {
    if (user.status === "Pending") {
      pendingUsers++;
    }
  }
  let pendingPayments = 0;
  let pendingAmount = 0;
  for (const pay of payments) {
    if (pay.status === "Pending") {
      pendingPayments++;
      pendingAmount += pay.amount;
    }
  }

  // verified revenue, in total and for each plan
  let verifiedTotal = 0;
  let planNames = [];
  let planTotals = [];
  for (const plan of plans) {
    planNames.push(plan.name);
    planTotals.push(0);
  }
  for (const pay of payments) {
    if (pay.status === "Verified") {
      verifiedTotal += pay.amount;
      let position = findIndexById(plans, pay.planId);
      if (position !== -1) {
        planTotals[position] += pay.amount;
      }
    }
  }

  document.getElementById("statMembers").innerHTML = memberCount;
  document.getElementById("statActive").innerHTML = activeCount;
  document.getElementById("statExpired").innerHTML = expiredCount;
  document.getElementById("statRevenue").innerHTML = verifiedTotal;
  document.getElementById("todoApprovals").innerHTML = "<strong>" + pendingUsers + "</strong> trainer / nutritionist sign-up(s) waiting for approval.";
  document.getElementById("todoPayments").innerHTML = "<strong>" + pendingPayments + "</strong> payment(s) waiting for verification (" + pendingAmount + " BDT).";

  // users by role
  let roles = ["Admin", "Trainer", "Nutritionist", "Member"];
  let roleCounts = [0, 0, 0, 0];
  for (const user of users) {
    let position = roles.indexOf(user.role);
    roleCounts[position]++;
  }
  drawBars("roleBars", roles, roleCounts, users.length, "");
  drawBars("planBars", planNames, planTotals, verifiedTotal, " BDT");
}

// "Review sign-ups": open User Approval showing only Pending users
function openPendingUsers() {
  document.getElementById("userSearch").value = "";
  document.getElementById("userRoleFilter").value = "All";
  document.getElementById("userStatusFilter").value = "Pending";
  renderUsers();
  showSection("usersSection");
}

// "Verify payments": open Payment Verification showing only Pending payments
function openPendingPayments() {
  document.getElementById("paymentSearch").value = "";
  document.getElementById("paymentStatusFilter").value = "Pending";
  renderPayments();
  showSection("paymentsSection");
}

// Draws one bar per label; each bar's width is its share of the total
function drawBars(containerId, labels, values, total, unit) {
  let colours = ["#f97316", "#2563eb", "#16a34a", "#7c3aed", "#dc2626", "#0891b2"];
  let container = document.getElementById(containerId);
  container.innerHTML = "";

  for (let i = 0; i < labels.length; i++) {
    let percent = 0;
    if (total > 0) {
      percent = Math.round(values[i] / total * 100);
    }

    let row = document.createElement("div");
    row.className = "bar-row";

    let label = document.createElement("span");
    label.className = "bar-label";
    label.innerHTML = labels[i];
    row.appendChild(label);

    let track = document.createElement("div");
    track.className = "bar-track";
    let fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = percent + "%";
    fill.style.backgroundColor = colours[i % colours.length];   // % repeats the colours
    track.appendChild(fill);
    row.appendChild(track);

    let value = document.createElement("span");
    value.className = "bar-value";
    value.innerHTML = values[i] + unit;
    row.appendChild(value);

    container.appendChild(row);
  }
}

// open the statistics section and count again
document.getElementById("nav-statsSection").addEventListener("click", renderStats);


// Run when the page loads
renderPlans();
renderUsers();
renderPayments();
renderStats();
showSection("plansSection");
