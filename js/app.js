// Habdu - Habit Tracker App
console.log("Habdu is loading... ");
// 1. First: Create habits and display
// This array will store habits
let habits = [];

//  Wait for the page to fully load before running code
document.addEventListener('DOMContentLoaded', function(){
    console.log("DOM is ready! Let's build Habdu!");
    // Get references to HTML elements
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

    // Function to add a new habit
    function addHabit() {
        const habitName = habitInput.value.trim();
        // Check if input is empty
        if (habitName === '') {
            alert('Please enter a habit name!');
            return;
        }
        const newHabit = {
            id: Date.now(), // Unique ID using timestamp
            name: habitName,
            createdDate: new Date().toISOString(),
            completeToday: false,
        }
        // Add to habits array
        habits.push(newHabit);
        // Clear the input field
        habitInput.value = '';
        // Update display
        renderHabits();
        console.log('Habit added:', newHabit);
        console.log('All Habits:', habits);
    }

    // Function to display all habits on the page
    function renderHabits() {
        // Clear the container
        habitsContainer.innerHTML = '';
        // If no habits show emtpy state
        if (habits.length === 0) {
            habitsContainer.innerHTML = '<p class="empty-state">No habits yet. Add your first one above!</p>';
            return;
        } 
        // Create a card for each habit
        habits.forEach(habit => {
            const habitCard = createHabitCard(habit);
            habitsContainer.appendChild(habitCard);
        });
    }

    // Function to create a habit card element
    function createHabitCard(habit) {
        // Create the main card div
        const card = document.createElement('div');
        card.className = 'habit-card';
        // Add the habit name
        const habitName = document.createElement('h3');
        habitName.textContent = habit.name;
        // Add a placeholder for the checkbox(functional is next)
        const checkbox = document.createElement('div');
        checkbox.className = 'habit-checkbox';
        // Unicode symbol for an empty Ballotbox(remember to backslash, NOT foward slash).
        checkbox.textContent = '\u2610';

        // Put it all together
        card.appendChild(checkbox);
        card.appendChild(habitName);
        return card;
    }
});

// 2. Then: Mark habits as complete 
// 3. Then: Save to localStorage
// 4. Finally: Add streak tracking and stats

// Let's start with a simple test to make sure JS is connected