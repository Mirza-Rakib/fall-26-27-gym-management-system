# FitHub — Gym Management System (Frontend Version)

CSC 3215 Web Technologies project, Group 04. Built only with what the lecture and lab slides cover
(Weeks 1–6): HTML pages and forms, an external CSS file, external JavaScript files,
JavaScript form validation and DOM manipulation. The PHP + MySQL backend will be added later.

FitHub is for small independent gyms in Bangladesh that still keep members, fees, attendance,
workouts and diet advice in paper registers and check bKash / Nagad payments by hand.

> **Project status:** the Home, Login, Sign up and Nutritionist parts are uploaded.
> The Admin, Trainer and Member dashboards are the other group members' parts and have not been
> uploaded yet; they will be added through pull requests when they are ready.

## How to run

No installation needed. Open `index.html` in Chrome or Firefox
(double-click it, or use VS Code's Live Server).

Everyone uses the **same login page** with just a username (or email) and password.
The role stored in the account decides which dashboard opens.

| Role         | Username       | Password     |
|--------------|----------------|--------------|
| Nutritionist | `nutritionist` | `nutri1234`  |
| Admin        | `admin`        | `admin1234` (dashboard not uploaded yet) |
| Trainer      | `trainer`      | `trainer123` (dashboard not uploaded yet) |
| Member       | `member`       | `member123` (dashboard not uploaded yet) |
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
- New **trainers and nutritionists start as Pending**; an admin approves them.
- **Admins are not on the public page.**

> **Frontend only:** all data lives in JavaScript arrays of objects (`js/data.js`).
> Changes work while you stay on a page, and reset when the page reloads or you move to
> another page. This is expected until the backend stores the data in a database.

## Folder structure (HTML / CSS / JS separation)

```
fall-26-27-gym-management-system/
├── index.html          Home page: membership plans + plan search, how it works, team, opening hours
├── login.html          ONE login page for all four user types
├── register.html       ONE registration page; fields change with the user type
├── nutritionist.html   Nutritionist dashboard
├── css/
│   └── style.css       ONE external style sheet linked from every page
├── js/
│   ├── data.js         Sample data: arrays of objects (users, plans, dietPlans, foods, ...)
│   ├── common.js       Shared helpers: showSection, showError, validation, dates, search
│   ├── home.js         Home page plan cards, plan search, team, opening hours
│   ├── login.js        validateLogin() + switch on role
│   ├── register.js     showRoleFields() + validateRegister()
│   └── nutritionist.js Nutritionist features
└── project-evaluation/
    └── CO3_Mohona_23-53200-3.docx
```

Every page loads its scripts at the end of `<body>` in this order:
`data.js` → `common.js` → the page's own script.

## Features by user

Every user can **Create, Read, Update, Delete and Search** their own kind of record,
plus **3 unique features** that no other user has.

| User | CRUD + Search on | Unique feature 1 | Unique feature 2 | Unique feature 3 |
|---|---|---|---|---|
| **Nutritionist** | Diet plans (member, goal, start date, calories, meals, restrictions, notes); search by member, ID or notes; filter by goal; each row has *Macros* and *Meals* buttons | **Calorie Calculator**: choose a member to fill age, gender, height, latest weight and goal; Mifflin–St Jeor formula; "Create a diet plan with this" | **Macro Split Guide**: protein / carbs / fat bars for a diet plan's goal and calories (`switch`); gives the protein target | **Meal Planner**: local foods per meal for a diet plan (custom foods can be added); calories against the plan's target and protein against the step-2 target; "Save to Diet Plan" |
| **Admin** | *Not uploaded yet* | | | |
| **Trainer** | *Not uploaded yet* | | | |
| **Member** | *Not uploaded yet* | | | |

The Nutritionist's three features work on the same diet plan, one after the other:
calories (step 1) → diet plan → protein / carbs / fat split (step 2) → meals (step 3).

**Home page:** membership plan cards built from the `plans` array with `createElement`;
live plan search by name or facility (`onkeyup`) and a price filter (`onchange`);
team cards; opening hours with today's row highlighted and an "open now / closed" message.
Everyone, including people not logged in, can browse and search the membership plans.

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
| `let` / `const`, functions with `return`, `if / else if / else`, `===` | Week 05 JavaScript Intro |
| Events: `onclick`, `onchange`, `onkeyup`, `onsubmit` | Week 05 lecture, Lab 03 |
| `switch` (login redirect, role fieldsets, goal badges, macro split) | Week 06 JS DOM |
| `for`, `for...of`, `while` loops | Week 05–06 |
| Arrays: `push`, `slice`, `concat`, `indexOf`, `join`, `length` | Week 06 JS DOM, Lab 04 |
| Objects and arrays of objects (`users`, `plans`, `dietPlans`, `foods`, ...) | Week 06 JS DOM, Lab 04 |
| `getElementById`, `getElementsByName`, `.value`, `.innerHTML`, `.style.property`, `createElement`, `appendChild` | Week 02-03 DOM, Week 06 |
| `onsubmit="return validateForm()"`: `return false` stops the form | Week 06 Form Validation, Lab 04 |
| HTML5 input types and `min` / `max` attributes for simple rules, JavaScript for rules that compare fields (password = confirm password, age by user type) | Week 06 Built-in HTML5 validation |
| Errors shown in red next to each field with `element.style` | Lab 04 Task 1 |
| Redrawing tables with a `for` loop + `innerHTML` | Lab 04 Task 2 (to-do list) |
| `console.log` for checking arrays while testing | Week 05, Week 06 Debugging |

### Two small extras (explained in comments)

- **Dates:** `common.js` uses the built-in `Date` object only to read today's date
  and to count days between two `YYYY-MM-DD` texts (`todayString`, `daysBetween`),
  for ages and diet plan start dates.
- **`Math.round` / `Math.floor`:** used to round calories, grams, percentages and ages.

## How a CRUD section works (same pattern on every page)

1. **Read**: `renderDietPlans()` loops over the array and builds `<tr>` rows into `innerHTML`.
2. **Search**: the same function skips rows that do not contain the search text
   (`containsText()` uses `toLowerCase()` and `indexOf()`); it runs on every `onkeyup`.
3. **Create**: the form's `onsubmit="return saveDietPlan()"` validates, builds an object and `push()`es it.
4. **Update**: the **Edit** button copies the object into the form and sets `editDietIndex`;
   saving again changes that object's properties instead of pushing a new one.
5. **Delete**: `removeAt(array, index)` returns a new array using `slice()` + `concat()`.

## Plan for the backend (later labs)

| Frontend now | Backend later |
|---|---|
| Arrays in `data.js` | MySQL tables: `users`, `membership_plans`, `diet_plans`, `foods`, ... |
| `validateLogin()` checks the `users` array | `login.php` checks the database, starts `$_SESSION` (Lab 09) |
| `method="get"`, password without `name` | `method="post"` with `name="password"`, validated again in PHP (Lab 08) |
| `push()` / editing / `removeAt()` | `INSERT` / `UPDATE` / `DELETE` with prepared statements (Lab 11) |
| Search inside the array | `SELECT ... WHERE ... LIKE ?`, optionally live with AJAX + JSON (Lab 10) |

## Group members

| Member | ID | Part of the project | Status |
|---|---|---|---|
| AKTER, MOHONA (leader) | 23-53200-3 | `index.html`, `js/home.js`, `login.html`, `js/login.js`, `register.html`, `js/register.js`, `nutritionist.html`, `js/nutritionist.js`, shared base (`js/data.js`, `js/common.js`, base of `css/style.css`), `README.md` | Uploaded |
| RAKIB, MIRZA MOHAMMAD | 23-53160-3 | `admin.html`, `js/admin.js` | Not uploaded yet |
| JUBAYER, KHONDOKER MD ASIF | 23-51038-1 | `trainer.html`, `js/trainer.js` | Not uploaded yet |
| BHUIYAN, TANVIR HOSSAIN | 22-46731-1 | `member.html`, `js/member.js` | Not uploaded yet |
