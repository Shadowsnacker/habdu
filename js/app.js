// Habdu - Habit Tracker App
console.log("Habdu is loading... ");
// 1. First: Create habits and display
// This array will store our habits
let habits = [];
//  Wait for the page to fully load before running our code
document.addEventListener('DOMContentLoaded', function(){
    console.log("DOM is ready! Let's build Habdu!");
    // Get references to our HTML elements
    const habitInput = document.getElementById('habitInput');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const habitsContainer = document.getElementById('habitsContainer');
    // Listen for button clicks
    addHabitBtn.addEventListener('click', function() {
        addHabit();
    });
    // Also listen for Enter key in the input field
    habitInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addHabit();
        }
    });

});

// 2. Then: Mark habits as complete 
// 3. Then: Save to localStorage
// 4. Finally: Add streak tracking and stats

// Let's start with a simple test to make sure JS is connected
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM is ready! Let's build Habdu!");
});