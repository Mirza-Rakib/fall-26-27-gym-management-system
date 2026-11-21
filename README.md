# FitHub — Gym Management System (Frontend Version)

CSC 3215 Web Technologies project, Group 04. Built only with HTML, one external CSS file and
external JavaScript (form validation + DOM manipulation) from Weeks 1–6. The PHP + MySQL backend comes later.

FitHub is for small gyms in Bangladesh that still keep members, fees, attendance and diet advice
in paper registers.

> **Status:** Home, Login, Sign up, Nutritionist and Admin are uploaded. The Trainer and Member
> dashboards belong to other group members and are not uploaded yet.

## How to run

Open `index.html` in Chrome or Firefox. No installation needed.
All users use the **same login page**; the role stored in the account decides which dashboard opens.

| Role | Username | Password |
|---|---|---|
| Nutritionist | `nutritionist` | `nutri1234` |
| Admin | `admin` | `admin1234` |
| Trainer / Member | `trainer` / `member` | `trainer123` / `member123` (dashboards not uploaded yet) |
| Trainer waiting for approval | `berry` | `berry1234` (login refused until an admin approves) |

> **Frontend only:** data lives in JavaScript arrays (`js/data.js`) and resets when the page reloads.

## Folder structure

```
├── index.html          Home: membership plans + search, team, opening hours
├── login.html          One login page for all users
├── register.html       One sign up page; fields change with the user type
├── nutritionist.html   Nutritionist dashboard
├── admin.html          Admin dashboard
├── css/style.css       One external style sheet for every page
├── js/
│   ├── data.js         Sample data (arrays of objects)
│   ├── common.js       Shared helpers (validation, dates, search)
│   ├── home.js  login.js  register.js  nutritionist.js  admin.js   One script per page
└── project-evaluation/ CO3 forms
```

Scripts load at the end of `<body>`: `data.js` → `common.js` → the page's own script.

## What each part does

- **Home:** plan cards built with `createElement`; live search (`onkeyup`) and price filter (`onchange`);
  opening hours with today highlighted.
- **Login:** `validateLogin()` checks the `users` array, then a `switch` on the role picks the dashboard.
  Pending accounts are refused.
- **Sign up:** Step 1 picks Member, Trainer or Nutritionist; JavaScript shows only that type's fields.
  Minimum age: Member 14, others 18. New trainers and nutritionists start as Pending.
- **Nutritionist:** CRUD + search on diet plans, plus 3 features that work in order:
  1. **Calorie Calculator** (Mifflin–St Jeor) → "Create a diet plan with this"
  2. **Macro Split Guide** (protein / carbs / fat by goal, uses `switch`)
  3. **Meal Planner** (foods per meal, calories and protein against the targets, "Save to Diet Plan")
- **Admin:** CRUD + search on membership plans, plus 3 features:
  1. **User Approval** (approve / reject / block users, add another admin)
  2. **Payment Verification** (bKash / Nagad; verifying starts or extends the membership)
  3. **Gym Statistics** (summary cards, bar charts and a "needs your action" list)

## How CRUD works (same pattern everywhere)

1. **Read:** `renderDietPlans()` loops over the array and builds `<tr>` rows into `innerHTML`.
2. **Search:** the same function skips rows without the search text (`toLowerCase()` + `indexOf()`).
3. **Create:** `onsubmit="return saveDietPlan()"` validates, builds an object and `push()`es it.
4. **Update:** Edit copies the object into the form and sets `editDietIndex`; saving changes that object.
5. **Delete:** `removeAt(array, index)` returns a new array using `slice()` + `concat()`.

## Main course topics used

HTML forms and input types · external CSS (selectors, box model, flex/grid, `:hover`) ·
`let`/`const`, functions, `if`/`switch`, loops · arrays and arrays of objects ·
DOM (`getElementById`, `.value`, `.innerHTML`, `.style`, `createElement`, `appendChild`) ·
events (`onclick`, `onchange`, `onkeyup`, `onsubmit`) · `return false` to stop a form ·
errors shown in red next to each field.

## Backend plan (later)

Arrays → MySQL tables · `validateLogin()` → `login.php` with `$_SESSION` ·
`method="get"` → `method="post"` · `push()` / `removeAt()` → `INSERT` / `UPDATE` / `DELETE`.

## Group members

| Member | ID | Part | Status |
|---|---|---|---|
| AKTER, MOHONA (leader) | 23-53200-3 | Home, Login, Sign up, Nutritionist, shared base, README | Uploaded |
| RAKIB, MIRZA MOHAMMAD | 23-53160-3 | `admin.html`, `js/admin.js` | Uploaded |
| JUBAYER, KHONDOKER MD ASIF | 23-51038-1 | `trainer.html`, `js/trainer.js` | Not uploaded yet |
| BHUIYAN, TANVIR HOSSAIN | 22-46731-1 | `member.html`, `js/member.js` | Not uploaded yet |
