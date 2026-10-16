### Task Breakdown

**Task 1: Project scaffold & layout skeleton**
- Objective: Create the folder structure and static HTML layout matching the reference image
- Implementation: Create `index.html` with semantic sections for each widget (greeting, timer, tasks, quick links). Add the `css/` and `js/` folders
- Link the CSS and JS files in HTML (empty for now)
- Demo: Opening `index.html` in a browser shows all 4 widget areas in the correct layout positions with placeholder text

---

**Task 2: Styling — gradient background, cards, typography**
- Objective: Apply the full visual design in `style.css`
- Implementation:
  - Purple-to-blue gradient background (`#667eea` → `#764ba2` or similar)
  - White rounded cards with `border-radius: 16px` and `box-shadow`
  - Colorful buttons (blue primary, red for delete)
  - Responsive grid: full-width top, 2-col middle, bottom-left for links
  - Clean font (e.g. system-ui or Google Fonts — Poppins)
- Demo: Dashboard looks visually complete matching the reference image style with improved UI polish

---

**Task 3: Greeting widget — live clock, date, time-based greeting**
- Objective: Display live updating clock, current date, and dynamic greeting in `app.js`
- Implementation:
  - `setInterval` every second to update time display
  - Greeting logic: Morning (5–11), Afternoon (12–17), Evening (18–4)
  - Date formatted as "Tuesday, January 27, 2026"
- Demo: Clock ticks in real time, greeting changes based on time of day

---

**Task 4: Custom name — first-visit modal**
- Objective: Ask for the user's name on first visit and show it in the greeting
- Implementation:
  - Check `localStorage.getItem('username')` on load
  - If not set, show a styled modal: "What's your name?" with an input and confirm button
  - Save name to Local Storage; greeting becomes "Good Morning, Helmi 👋"
  - Settings icon/button to change name later
- Demo: First load shows modal, name appears in greeting, persists on refresh

---

**Task 5: Focus Timer**
- Objective: Implement a working countdown timer with Start, Stop, Reset
- Implementation:
  - Default 25:00, counts down to 00:00
  - `setInterval` for countdown, `clearInterval` for stop/reset
  - Visual indication when timer is running (button state change)
  - Play a soft sound or visual flash when timer reaches 00:00
- Demo: Timer counts down, stops, resets correctly

---

**Task 6: Changeable Pomodoro duration (Challenge)**
- Objective: Let users set a custom timer duration
- Implementation:
  - Small input field (or +/- buttons) to set minutes before starting
  - Only editable when timer is not running
  - Save preferred duration to Local Storage
- Demo: User sets 45 min, resets, timer now starts at 45:00 and persists on refresh

---

**Task 7: To-Do List — core CRUD**
- Objective: Full add/edit/complete/delete task functionality with Local Storage
- Implementation:
  - Input + Add button; tasks rendered as list items with checkbox, text, Edit, Delete buttons
  - Checkbox toggles `completed` state (strikethrough style)
  - Edit button turns task text into an inline input
  - All changes saved to `localStorage` as JSON array
  - Prevent duplicate task names (Challenge)
- Demo: Add, check off, edit, and delete tasks — all persist after page refresh; duplicate task shows an error/warning

---

**Task 8: Sort tasks (Challenge)**
- Objective: Allow sorting tasks by status or name
- Implementation:
  - Dropdown or toggle button: "Sort by: Default / A–Z / Completed Last"
  - Sort is applied on render, preference saved to Local Storage
- Demo: Switching sort order reorders the task list instantly

---

**Task 9: Quick Links — add and delete**
- Objective: Users can add named links and open/delete them, saved in Local Storage
- Implementation:
  - Two inputs: Link name + URL, and an "Add Link" button
  - Each link renders as a pill/button with an × delete button
  - Clicking a link opens URL in a new tab
  - All links saved to Local Storage as JSON array
- Demo: Add "YouTube" + URL, it appears as a button, clicking opens YouTube, persists on refresh

---

**Task 10: Light/Dark mode toggle (Challenge)**
- Objective: Add a toggle button that switches between light and dark themes
- Implementation:
  - Toggle button (☀️/🌙) fixed in the top-right corner
  - Dark mode overrides: dark background, dark cards, light text
  - Preference saved to `localStorage`; applied on page load before render (no flash)
- Demo: Toggle switches theme instantly, preference persists on refresh

---

**Task 11: Final polish & integration check**
- Objective: Ensure all features work together seamlessly
- Implementation:
  - Cross-feature test: name modal → greeting shows name, timer persists duration, tasks persist, links persist, dark mode persists
  - Fix any layout issues on different screen sizes
  - Add smooth CSS transitions (card hover, button press, modal fade-in)
  - Ensure all Local Storage keys are consistent
- Demo: Full walkthrough of all features on a fresh load — everything works end-to-end

---