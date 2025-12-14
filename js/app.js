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
        // Add a placeholder for the checkbox + Unicode symbol for an empty Ballotbox(remember to backslash, NOT foward slash).
        const checkbox = document.createElement('div');
        checkbox.className = 'habit-checkbox';
        checkbox.textContent = '\u2610';
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✕';
        deleteBtn.className = 'delete-btn';
        // Create edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.className = 'edit-btn';

        checkbox.addEventListener('click', function () {
            console.log('Clicked habit:', habit.id);
            habit.completeToday = !habit.completeToday;
            console.log('New Status', habit.completeToday);
            if (habit.completeToday){
                checkbox.textContent = '\u2611';
                card.classList.add('completed');
            } else {
                checkbox.textContent = '\u2610';
                card.classList.remove('completed');
            }
        });
        deleteBtn.addEventListener('click', function(){
            console.log('Delete clicked for habit:', habit.id);
            const index = habits.findIndex(function(h){
            /* findIndex() looks through the array
                For each habit (I'm calling it h), it checks: "Is this habit's ID the same as the one we clicked?"
                When it finds a match, it returns the position (0, 1, 2, etc.) */
                return h.id === habit.id;
            });
            habits.splice(index, 1);
            renderHabits();
        });
        editBtn.addEventListener('click', function(){
            console.log('Edit clicked for habit:', habit.id);
            // Create the input field
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = habit.name; // Pre-fill with current name
            editInput.className = 'edit-input';
            // Replace h3 with input
            card.replaceChild(editInput, habitName);
            editInput.focus(); // autofocus to input field!
            editInput.select(); // autoselects all text for automatic replacing!

            // Actually change to the new name
            editInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    // Save the new name
                    const newName = editInput.value.trim();
                    // Update the habit in the array
                    habit.name = newName;
                    // Re-render everything
                    renderHabits();
                }
            });
            // Also save when they click away (blur = lose focus)
            editInput.addEventListener('blur', function() {
                const newName = editInput.value.trim();
                habit.name = newName;
                renderHabits();
            });
        });

        // Put it all together
        card.appendChild(checkbox);
        card.appendChild(habitName);
        card.appendChild(editBtn);
        card.appendChild(deleteBtn);

        return card;
    }
});

// 2. Then: Mark habits as complete 
// 3. Then: Save to localStorage
// 4. Finally: Add streak tracking and stats

// Let's start with a simple test to make sure JS is connected