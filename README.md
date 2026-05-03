# Habdu - Habit Tracker
🔗 **[Live Demo](https://shadowsnacker.github.io/habdu)**

A simple yet beautiful habit tracking app built with vanilla JavaScript.

## 🎯 Project Goals
- Learn fundamental JavaScript (DOM manipulation, events, data structures)
- Understand state management concepts
- Practice clean code and project organization
- Create a portfolio piece that demonstrates problem-solving

## 🛠️ Tech Stack
- **HTML5** - Structure
- **CSS3** - Styling (with gradients and modern layout)
- **Vanilla JavaScript** - All functionality
- **localStorage** - Data persistence

## 📚 What I've Learned
- [ ] DOM manipulation and event handling
- [ ] Working with arrays and objects
- [ ] localStorage API
- [ ] Date handling in JavaScript
- [ ] Responsive design principles

## 🚀 Features
- [ ] Add new habits
- [ ] Mark habits as complete for today
- [ ] Track daily streaks
- [ ] Visual progress indicators
- [ ] Data persists across sessions
- [ ] Assign activities to a 24 day to visualize freetime

## Key Decisions
 
**Date-array over boolean for streaks** — instead of storing a simple true/false for daily completion, each habit stores an array of completion dates. This allows accurate streak calculation across days, retroactive checking, and future calendar features without refactoring.
 
**SPA navigation without a framework** — views are toggled using CSS class manipulation rather than page reloads or a router library. This kept the project dependency-free while teaching the core concept behind how frameworks handle view switching.
 
**Modular CSS architecture** — styles are separated by concern across multiple files rather than a single stylesheet. This mirrors professional project structure and makes future scaling manageable.
 
**ID selector scoping** — learned to scope ID-based styles carefully after debugging a specificity conflict where `#clock-view` was overriding `.view { display: none }`. Fixed by understanding CSS cascade and selector weight.
 
---

<img width="907" height="864" alt="image" src="https://github.com/user-attachments/assets/44ec9470-7bbb-4956-87da-55fedf200806" />


---
*This is my first real JavaScript project. Building it twice - once in vanilla JS to learn fundamentals, then rebuilding in React to understand modern frameworks.*
