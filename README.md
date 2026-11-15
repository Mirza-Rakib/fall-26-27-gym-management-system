# FitHub — Gym Management System (Frontend Version)

CSC 3215 Web Technologies project, Group 04. Built only with what the lecture and lab slides cover
(Weeks 1–6): HTML pages and forms, an external CSS file, external JavaScript files,
JavaScript form validation and DOM manipulation. The PHP + MySQL backend will be added later.

FitHub is for small independent gyms in Bangladesh that still keep members, fees, attendance,
workouts and diet advice in paper registers and check bKash / Nagad payments by hand.

## How to run

No installation needed. Open `index.html` in Chrome or Firefox
(double-click it, or use VS Code's Live Server).

Everyone uses the **same login page** with just a username (or email) and password.
The role stored in the account decides which dashboard opens.

| Role         | Username       | Password     |
|--------------|----------------|--------------|
| Admin        | `admin`        | `admin1234`  |
| Trainer      | `trainer`      | `trainer123` |
| Member       | `member`       | `member123`  |
| Nutritionist | `nutritionist` | `nutri1234`  |
| Trainer waiting for approval | `rafi` | `rafi12345` (login is refused until an admin approves) |

The login page also has "Use" buttons that fill these in.

### Registration and accounts

- **One registration page** (`register.html`) for Members, Trainers and Nutritionists.
  Step 1 asks for the type of user; JavaScript then shows the common fields plus only
  that type's fieldset (`element.style.display`):
  - **Member:** height (cm), weight (kg), fitness goal, membership plan
  - **Trainer:** Employee ID (TR-1234), specialization, years of experience, certification, preferred shift
  - **Nutritionist:** Certificate number (NUT-1234), specialization, years of experience, available days
- Minimum age changes by type (Member 14, Trainer and Nutritionist 18).
- New **trainers and nutritionists start as Pending**; an admin approves them in *User Approval*.
- **Admins are not on the public page.** An existing admin adds new admins from *User Approval*.

> **Frontend only:** all data lives in JavaScript arrays of objects (`js/data.js`).
> Changes work while you stay on a page, and reset when the page reloads or you move to
> another page. This is expected until the backend stores the data in a database.

## Folder structure (HTML / CSS / JS separation)

```
fall-26-27-gym-management-system/
├── index.html          Home page: membership plans + plan search, who it is for, team, opening hours
├── login.html          ONE login page for all four user types
├── register.html       ONE registration page; fields change with the user type
├── admin.html          Admin dashboard
├── trainer.html        Trainer dashboard
├── member.html         Member dashboard
├── nutritionist.html   Nutritionist dashboard
├── css/
│   └── style.css       ONE external style sheet: shared base + one section per member
├── js/
│   ├── data.js         Sample data: arrays of objects (users, plans, payments, workouts, ...)
│   ├── common.js       Shared helpers: showSection, showError, validation, dates, search, memberSummary
│   ├── home.js         Home page plan cards, plan search, team, opening hours
│   ├── login.js        validateLogin() + switch on role
│   ├── register.js     showRoleFields() + validateRegister()
│   ├── admin.js        Admin features
│   ├── trainer.js      Trainer features
│   ├── member.js       Member features
│   └── nutritionist.js Nutritionist features
└── project-evaluation/
    └── CO3_<name>_<id>.docx   One CO3 form per group member
```

Every page loads its scripts at the end of `<body>` in this order:
`data.js` → `common.js` → the page's own script.

## Features by user

Every user can **Create, Read, Update, Delete and Search** their own kind of record,
plus **3 unique features** that no other user has.

| User | CRUD + Search on | Unique feature 1 | Unique feature 2 | Unique feature 3 |
|---|---|---|---|---|
| **Admin** | Membership plans (name, price, months, facilities, status). A plan that members use cannot be deleted | **User Approval**: approve / reject pending trainers and nutritionists, block / unblock users, add a new admin; members show their membership | **Payment Verification**: check bKash / Nagad transaction IDs next to the member's current membership; Verify starts or extends it; verified rows turn green and are locked | **Gym Statistics**: members, active / expired memberships and revenue counted with loops; "Needs your action" opens the pending sign-ups or payments; revenue-by-plan bars |
| **Trainer** | Workout plans (member, exercise, sets, reps, days, notes); choosing a member shows their goal, weight, membership and diet plan | **Attendance Desk**: check a member in / out by member ID; refuses expired memberships and double check-in; shows the member's workouts for today | **Attendance Report**: visits per member in a month against a target of 12, coloured red / orange / green; "Workouts" opens that member's plan | **Class Schedule Board**: book members (active membership only) into weekly classes; 15-person limit, full classes turn red; members see their classes |
| **Member** | Fitness progress log (date, weight, body fat, workout, notes); newest first; summary cards on top | **BMI Calculator**: filled from height and the latest logged weight; category colour and advice | **Membership & Payment**: days-left card (green / orange / red); submit a bKash / Nagad payment for the admin to verify; only *Pending* ones can be edited or cancelled | **Goal Tracker**: progress from the first to the latest logged weight towards a saved target; weekly mini-goals with `push()` / `pop()` like the Lab 04 to-do list |
| **Nutritionist** | Diet plans (member, goal, start date, calories, meals, restrictions, notes); each row has *Macros* and *Meals* buttons | **1. Calorie Calculator**: choose a member to fill age, gender, height, latest weight and goal; Mifflin–St Jeor formula; "Create a diet plan with this" | **2. Macro Split Guide**: protein / carbs / fat bars for a diet plan's goal and calories (`switch`); gives the protein target | **3. Meal Planner**: local foods per meal for a diet plan (custom foods can be added to the list); calories against the plan's target and protein against the step-2 target; "Save to Diet Plan" so the member sees it |

Everyone (including people not logged in, on the home page) can browse and search the membership plans.

### How the users are connected

All pages read the same arrays in `data.js`, so each user works with what the others made,
and inside every dashboard the features work on the same records:

- **Admin**: plans → members pay for them → Payment Verification starts the membership → Gym Statistics counts
  all of it, and "Needs your action" opens the pending sign-ups and payments.
- **Trainer**: a member checks in at the Attendance Desk → their workouts for today are shown → the visit fills the
  Attendance Report → "Workouts" opens that member's plan. Classes are booked by members with an active membership.
- **Member**: the progress log's latest weight feeds the summary cards, the BMI Calculator and the Goal Tracker.
  *My Diet, Workouts & Visits* shows what the Nutritionist and the Trainer made for them.
- **Nutritionist**: calories (step 1) → diet plan → protein / carbs / fat split (step 2) → meals (step 3) → the member sees it.
- **Between users**: Admin plans → home page, sign-up and payment form; Member payments → Admin; Admin
  memberships → Trainer's desk and class booking; Trainer workouts, classes and check-ins → Member;
  Nutritionist plans and meals → Member; Member's weight → Trainer and Nutritionist (`memberSummary()`).

## Where each part comes from in the slides

| Topic in the code | Slide deck |
|---|---|
| `<!DOCTYPE html>`, `<head>`, `<meta charset>`, `<meta name="viewport">`, `<title>`, `<link>` | Week 02-03 HTML Forms & DOM |
| `<form>`, `<fieldset>`, `<legend>`, `<table>` layout, `<label for>` matching `id` | Week 02-03 lecture, Lab 01 |
| Input types: text, email, password, number, date, tel, radio, checkbox, submit, reset; `<select>`, `<textarea>` | Week 02-03 lecture, Lab 01 |
| Password field without `name` so it is not sent in the URL (`method="get"`) | Week 02-03 "Spot the Bugs" |
| Register button disabled until the terms are ticked | Week 02-03 "DHTML in our form" |
| External CSS, element / id / class / grouping selectors, `:hover`, `:focus`, `:nth-child` | Week 04 CSS |
| Box model: margin, padding, border, `box-sizing: border-box`, `max-width` + `margin: 0 auto` | Week 04 CSS, Lab 02 |
| Header / navigation / content / footer layout, `position: sticky` nav | Week 04 CSS (Exercise 2) |
| Cards with `border-radius` and `box-shadow`, buttons with `transition`, `transform` on hover | Week 04 CSS (Exercise 1, 4) |
| `display: none / block`, `display: flex`, `display: grid` | Week 04 CSS (Display, Looking ahead) |
| `let` / `const`, functions with `return`, `if / else if / else`, ternary `? :`, `===` | Week 05 JavaScript Intro |
| Events: `onclick`, `onchange`, `onkeyup`, `onsubmit`, `addEventListener` | Week 05 lecture, Lab 03 |
| `switch` (login redirect, role fieldsets, goal badges, macro split, payment status) | Week 06 JS DOM |
| `for`, `for...of`, `while` loops | Week 05–06 |
| Arrays: `push`, `pop`, `slice`, `concat`, `indexOf`, `join`, `length` | Week 06 JS DOM, Lab 04 |
| Objects and arrays of objects (`users`, `plans`, `payments`, `dietPlans`, ...) | Week 06 JS DOM, Lab 04 |
| `getElementById`, `getElementsByName`, `.value`, `.innerHTML`, `.style.property`, `createElement`, `appendChild` | Week 02-03 DOM, Week 06 |
| `onsubmit="return validateForm()"`: `return false` stops the form | Week 06 Form Validation, Lab 04 |
| HTML5 input types and `min` / `max` attributes for simple rules, JavaScript for rules that compare fields (password = confirm password, amount = plan price) | Week 06 Built-in HTML5 validation |
| Errors shown in red next to each field with `element.style` | Lab 04 Task 1 |
| Redrawing tables with a `for` loop + `innerHTML` | Lab 04 Task 2 (to-do list) |
| `console.log` for checking arrays while testing | Week 05, Week 06 Debugging |

### Two small extras (explained in comments)

- **Dates:** `common.js` uses the built-in `Date` object only to read today's date, to add days to a
  date and to count days between two `YYYY-MM-DD` texts (`todayString`, `addDays`, `daysBetween`).
  A membership month is counted as 30 days.
- **`Math.round` / `Math.floor`:** used to round BMI, calories, percentages and ages.

## How a CRUD section works (same pattern on every page)

1. **Read**: `renderX()` loops over the array and builds `<tr>` rows into `innerHTML`.
2. **Search**: the same `renderX()` skips rows that do not contain the search text
   (`containsText()` uses `toLowerCase()` and `indexOf()`); it runs on every `onkeyup`.
3. **Create**: the form's `onsubmit="return saveX()"` validates, builds an object and `push()`es it.
4. **Update**: the **Edit** button copies the object into the form and sets `editIndex`;
   saving again changes that object's properties instead of pushing a new one.
5. **Delete**: `removeAt(array, index)` returns a new array using `slice()` + `concat()`.

## Plan for the backend (later labs)

| Frontend now | Backend later |
|---|---|
| Arrays in `data.js` | MySQL tables: `users`, `membership_plans`, `subscriptions`, `payments`, `workout_plans`, `attendance`, `classes`, `fitness_logs`, `diet_plans`, `foods` |
| `validateLogin()` checks the `users` array | `login.php` checks the database, starts `$_SESSION` (Lab 09) |
| `const currentMemberId = "M-001"` | `$_SESSION['user_id']` |
| `method="get"`, password without `name` | `method="post"` with `name="password"`, validated again in PHP (Lab 08) |
| `push()` / editing / `removeAt()` | `INSERT` / `UPDATE` / `DELETE` with prepared statements (Lab 11) |
| Search inside the array | `SELECT ... WHERE ... LIKE ?`, optionally live with AJAX + JSON (Lab 10) |

## Group members

| Member | ID | Part of the project |
|---|---|---|
| AKTER, MOHONA (leader) | 23-53200-3 | `index.html`, `js/home.js`, `nutritionist.html`, `js/nutritionist.js`, her section of `css/style.css`, `README.md` |
| RAKIB, MIRZA MOHAMMAD | 23-53160-3 | `login.html`, `js/login.js`, `admin.html`, `js/admin.js`, his section of `css/style.css` |
| JUBAYER, KHONDOKER MD ASIF | 23-51038-1 | `register.html`, `js/register.js`, `trainer.html`, `js/trainer.js`, his section of `css/style.css` |
| BHUIYAN, TANVIR HOSSAIN | 22-46731-1 | `member.html`, `js/member.js`, his section of `css/style.css` |

The shared base (the first part of `css/style.css`, `js/data.js` and `js/common.js`) was planned by the whole group and uploaded first by the leader, so every member's pages work on their own branch.
