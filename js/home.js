/*
   home.js  -  Home page (index.html)
   Made by: Mohona Akter
   1. Plan cards built from the "plans" array with createElement
   2. Plan search (onkeyup) and price filter (onchange)
   3. Team cards built from the "users" array
   4. Opening hours table with today's row highlighted
*/


// 1 + 2. PLAN CARDS WITH SEARCH
function renderPlanCards() {
  let keyword = document.getElementById("planSearch").value;
  let priceFilter = document.getElementById("planSort").value;
  let grid = document.getElementById("planGrid");

  grid.innerHTML = "";          // remove the old cards
  let shown = 0;

  for (const plan of plans) {
    // only Active plans are shown to the public
    let isActive = (plan.status === "Active");

    // search in the name AND in every facility
    let matches = containsText(plan.name, keyword);
    for (const facility of plan.facilities) {
      if (containsText(facility, keyword)) {
        matches = true;
      }
    }

    let priceOk = true;
    if (priceFilter === "under2000") {
      priceOk = plan.price < 2000;
    } else if (priceFilter === "over2000") {
      priceOk = plan.price >= 2000;
    }

    if (isActive && matches && priceOk) {
      grid.appendChild(makePlanCard(plan));
      shown++;
    }
  }

  if (shown === 0) {
    let empty = document.createElement("p");
    empty.className = "hint";
    empty.innerHTML = "No plans match your search.";
    grid.appendChild(empty);
  }

  document.getElementById("planCount").innerHTML = shown + " plan(s) found";
}

// Builds ONE plan card: <div class="plan-card"> <h3> <p class="price"> <ul> <a>
function makePlanCard(plan) {
  let card = document.createElement("div");
  card.className = "plan-card";

  let title = document.createElement("h3");
  title.innerHTML = plan.name;
  card.appendChild(title);

  let price = document.createElement("p");
  price.className = "price";
  price.innerHTML = plan.price + " BDT";
  card.appendChild(price);

  let duration = document.createElement("p");
  duration.className = "hint";
  duration.innerHTML = plan.months + " month(s), about " + Math.round(plan.price / plan.months) + " BDT per month";
  card.appendChild(duration);

  let list = document.createElement("ul");
  for (const facility of plan.facilities) {
    let item = document.createElement("li");
    item.innerHTML = facility;
    list.appendChild(item);
  }
  card.appendChild(list);

  let join = document.createElement("p");
  join.innerHTML = "<a href='register.html' class='btn btn-small'>Join with this plan</a>";
  card.appendChild(join);

  return card;
}


// 3. TEAM CARDS (admin, active trainers and nutritionists)
function renderTeam() {
  let grid = document.getElementById("trainerGrid");
  grid.innerHTML = "";

  for (const user of users) {
    let isStaff = (user.role === "Admin" || user.role === "Trainer" || user.role === "Nutritionist");
    if (isStaff && user.status === "Active") {
      let card = document.createElement("div");
      card.className = "trainer-card";

      let avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.innerHTML = user.name[0];          // first letter of the name
      card.appendChild(avatar);

      let name = document.createElement("h3");
      name.innerHTML = user.name;
      card.appendChild(name);

      let info = document.createElement("p");
      info.className = "hint";
      if (user.role === "Admin") {
        info.innerHTML = "Gym Manager";
      } else {
        info.innerHTML = user.role + " · " + user.specialization + " · " + user.experience + " years";
      }
      card.appendChild(info);

      grid.appendChild(card);
    }
  }
}


// 4. OPENING HOURS, today's row highlighted
function renderHours() {
  let today = new Date().getDay();           // 0 = Sunday
  let rows = "";

  for (let i = 0; i < gymHours.length; i++) {
    let rowClass = "";
    if (i === today) {
      rowClass = " class='today'";
    }
    rows += "<tr" + rowClass + "><td>" + gymHours[i].day + "</td><td>" +
            gymHours[i].open + "</td><td>" + gymHours[i].close + "</td></tr>";
  }
  document.getElementById("hoursBody").innerHTML = rows;

  // "HH:MM" texts can be compared directly, e.g. "07:30" < "22:00"
  let now = timeNowString();
  let todayHours = gymHours[today];
  let message = "";
  if (now >= todayHours.open && now < todayHours.close) {
    message = "We are OPEN now (closes at " + todayHours.close + ").";
  } else {
    message = "We are closed now. Today's hours: " + todayHours.open + " - " + todayHours.close + ".";
  }
  document.getElementById("openNow").innerHTML = message;
}


// Run when the page loads
renderPlanCards();
renderTeam();
renderHours();
