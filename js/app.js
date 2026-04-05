// Habdu - Habits'n to-do's Tracker App
console.log("Habdu is loading... ");
// First: Create habits and display, this array will store habits
let habits = [];
// ===== 24-HOUR CLOCK CODE =====
// Activities array for clock
let clockActivities = [];
let currentEditingIndex = -1;
let selectedIcon = '';
let isAddingNew = false;
//  Wait for the page to fully load before running code
document.addEventListener('DOMContentLoaded', function(){
    console.log("DOM is ready! Let's build Habdu!");
    // Tab Navigation System
    // Get all nav items
    const navItems = document.querySelectorAll('.nav-item');
    // Add click listeners to each nav item
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Get which view this nav item should show
            const targetView = this.getAttribute('data-view');
            
            // Remove 'active' class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add 'active' class to clicked nav item
            this.classList.add('active');
            
            // Hide all views
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
            });
            
            // Show the target view
            document.getElementById(targetView + '-view').classList.add('active');
        });
    });
    // Get references to HTML elements
    const habitInput = document.getElementById('habitInput');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const habitsContainer = document.getElementById('habitsContainer');
    // Load saved habits from localStorage !Needs to be after the habitsContainer const!
        /* Since localStorage only supports strings, you must convert complex data types like objects
            or arrays to JSON strings before storing them, and parse them back when retrieving. 
        Store an object:
            const user = { name: 'Alice', loggedIn: true };
            localStorage.setItem('user', JSON.stringify(user));
        Retrieve and parse an object:
            const savedUser = JSON.parse(localStorage.getItem('user'));
            console.log(savedUser.name); // 'Alice'
        It is important to check if the item exists before parsing to avoid errors if getItem returns null. */
    const savedHabits = localStorage.getItem('habduHabits');
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
        renderHabits();
    }
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
            isCompletedToday: false,
            completionDates: [], // Empty array, no completions yet
        }
        // Add to habits array
        habits.push(newHabit);
        // Save to localStorage. name/'key', 'value'. Local storage only stores text so array is converted with the 'value' to the 'key'
        localStorage.setItem('habduHabits', JSON.stringify(habits));
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
        // Add streak display
        const streak = calculateStreak(habit.completionDates);
        const streakDisplay = document.createElement('span');
        streakDisplay.className = 'streak-display';
        streakDisplay.textContent = streak > 0 ? `🔥 ${streak} day streak` : '';
        const checkbox = document.createElement('div');
        checkbox.className = 'habit-checkbox';
        // Set initial state of checkbox based on saved data(formerly had an unchecked box only always start at page refresh)
        // Set initial state based on saved data
        const today = new Date().toISOString().split('T')[0];
        const isCompletedToday = habit.completionDates.includes(today);
        if (isCompletedToday) {
            checkbox.textContent = '\u2611';  // Checked Ballot box Uniicode(remember backslash, NOT forward-slash(For comments))
            card.classList.add('completed');   // Add the completed styling
        } else {
            checkbox.textContent = '\u2610';  // Unchecked Ballot box Unicode
        }
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
            // Get today's date as a string (YYYY-MM-DD format)
            const today = new Date().toISOString().split('T')[0];
            console.log('Today is:', today);
            // Check if today is already completed
            const isCompletedToday = habit.completionDates.includes(today);
            console.log('Already completed today?', isCompletedToday);
            // Changes checked box status and symbol
            if (isCompletedToday) {
                // Already completed - remove today's date (unchecking)
                const index = habit.completionDates.indexOf(today);
                habit.completionDates.splice(index, 1);
                console.log('Unchecked - removed date');
                } else {
                    // Not completed - add today's date (checking)
                    habit.completionDates.push(today);
                    console.log('Checked - added date');
                }
            // Save to local storage
            localStorage.setItem('habduHabits', JSON.stringify(habits));
            renderHabits();
        });
        deleteBtn.addEventListener('click', function(){
            console.log('Delete clicked for habit:', habit.id);
            /* findIndex() looks through the array
            For each habit(h), it checks: "Is this habit's ID the same as the one we clicked?"
            When it finds a match, it returns the position (0, 1, 2, etc.) */
            const index = habits.findIndex(function(h){
                return h.id === habit.id;
            });
            habits.splice(index, 1);
            localStorage.setItem('habduHabits', JSON.stringify(habits));
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
            editInput.select(); // auto-highlights all text in input field
            
            // Actually change to the new name
            editInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    // Save the new name
                    const newName = editInput.value.trim();
                    // Update the habit in the array
                    habit.name = newName;
                    localStorage.setItem('habduHabits', JSON.stringify(habits));
                    // Re-render everything
                    renderHabits();
                }
            });
            // Also save when they click away (blur = lose focus)
            editInput.addEventListener('blur', function() {
                const newName = editInput.value.trim();
                habit.name = newName;
                localStorage.setItem('habduHabits', JSON.stringify(habits));
                renderHabits();
            });
        });
        // Put it all together
        card.appendChild(checkbox);
        card.appendChild(habitName);
        card.appendChild(streakDisplay);
        card.appendChild(editBtn);
        card.appendChild(deleteBtn);
        return card;
    }
    // Function to calculate current streak
    function calculateStreak(completionDates) {
        if (completionDates.length === 0)
            return 0; // No completions = no streak
        const today = new Date().toISOString().split('T')[0];
        // If today isn't completed, streak is 0
        if (!completionDates.includes(today)) {
            return 0;
        }
        let streak = 0;
        const todayDate = new Date();
        // Check each day going backwards from today
        for (let i = 0; i < 365; i++){
            const checkDate = new Date(todayDate);
            checkDate.setDate(todayDate.getDate() - i); // Go back i days
            const dateString = checkDate.toISOString().split('T')[0];
            if (completionDates.includes(dateString)){
                streak++;
            }
            else {
                break; // Stop at first missing day
            }
        }
        return streak;
    }

    // ===== CLOCK INITIALIZATION =====
    // Load clock activities from localStorage
    function loadClockFromStorage() {
        const saved = localStorage.getItem('lifeClockActivities');
        if (saved) {
            try {
                clockActivities = JSON.parse(saved);
            } catch (e) {
                clockActivities = [];
            }
        }
    }
    function saveClockToStorage() {
        localStorage.setItem('lifeClockActivities', JSON.stringify(clockActivities));
    }
    // ===== CLOCK DRAWING FUNCTIONS =====
    // Convert hours + minutes to degrees (0° = midnight at bottom)
    function timeToAngle(hours, minutes) {
        return (hours * 15) + (minutes * 0.25);
    }
    // Draw hour markers around the clock
    function drawHourMarkers(ctx, centerX, centerY, radius) {
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let hour = 0; hour < 24; hour++) {
            const angle = ((timeToAngle(hour, 0) + 90) % 360) * Math.PI / 180;
            const x = centerX + (radius + 25) * Math.cos(angle);
            const y = centerY + (radius + 25) * Math.sin(angle);
            ctx.fillText(hour.toString().padStart(2, '0'), x, y);
        }
    }
    // Draw sun/moon indicator showing current time
    function drawTimeIndicator(ctx, centerX, centerY, radius) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        const totalMinutes = (hours * 60) + minutes + (seconds / 60);
        const angle = (totalMinutes / (24 * 60)) * 360;
        const angleRad = ((angle + 90) % 360) * Math.PI / 180;
        
        const indicatorRadius = radius + 10;
        const x = centerX + indicatorRadius * Math.cos(angleRad);
        const y = centerY + indicatorRadius * Math.sin(angleRad);
        
        const isDay = hours >= 6 && hours < 18;
        
        ctx.save();
        ctx.translate(x, y);
        
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isDay ? '☀️' : '🌙', 0, 0);
        
        ctx.restore();
    }
    // Draw a single activity wedge
    function drawActivityWedge(ctx, centerX, centerY, radius, activity) {
        const startAngle = timeToAngle(activity.startHour, activity.startMin);
        const endAngle = timeToAngle(
            activity.startHour + activity.durationHours,
            activity.startMin + activity.durationMin
        );
        
        const startRad = ((startAngle + 90) % 360) * Math.PI / 180;
        const endRad = ((endAngle + 90) % 360) * Math.PI / 180;
        
        // Draw wedge
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startRad, endRad);
        ctx.closePath();
        ctx.fillStyle = activity.color;
        ctx.fill();
        
        // Draw icon with white background
        if (activity.icon) {
            const midAngle = (startAngle + endAngle) / 2;
            const midRad = ((midAngle + 90) % 360) * Math.PI / 180;
            const iconDistance = radius * 0.6;
            const iconX = centerX + iconDistance * Math.cos(midRad);
            const iconY = centerY + iconDistance * Math.sin(midRad);
            
            // White circle background
            ctx.beginPath();
            ctx.arc(iconX, iconY, 20, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
            
            // Icon
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(activity.icon, iconX, iconY);
        }
    }
    // Main draw function - renders the entire clock
    function drawClock() {
        const canvas = document.getElementById('clockCanvas');
        if (!canvas) return; // Exit if canvas doesn't exist
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 60;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ECF0F1';
        ctx.fill();
        ctx.strokeStyle = '#34495E';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw all activities
        clockActivities.forEach(activity => {
            drawActivityWedge(ctx, centerX, centerY, radius, activity);
        });
        
        drawHourMarkers(ctx, centerX, centerY, radius);
        drawTimeIndicator(ctx, centerX, centerY, radius);
        
        // Center dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#2C3E50';
        ctx.fill();
    }
    // ===== CLICK DETECTION FUNCTIONS =====
    // Get mouse position relative to canvas
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
    // Convert mouse position to angle
    function mouseToAngle(mouseX, mouseY, centerX, centerY) {
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        angle = angle - 90;
        if (angle < 0) angle += 360;
        return angle;
    }
    // Check if click is inside the clock circle
    function isInsideCircle(mouseX, mouseY, centerX, centerY, radius) {
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
    }
    // Find which activity was clicked
    function getClickedActivity(clickAngle) {
        for (let i = 0; i < clockActivities.length; i++) {
            const activity = clockActivities[i];
            const startAngle = timeToAngle(activity.startHour, activity.startMin);
            const endAngle = timeToAngle(
                activity.startHour + activity.durationHours,
                activity.startMin + activity.durationMin
            );
            
            if (endAngle < startAngle) {
                // Activity wraps around midnight
                if (clickAngle >= startAngle || clickAngle <= endAngle) {
                    return i;
                }
            } else {
                if (clickAngle >= startAngle && clickAngle <= endAngle) {
                    return i;
                }
            }
        }
        return -1; // No activity at this angle
    }
    // ===== SETTINGS PANEL FUNCTIONS =====
    // Open panel to edit an existing activity
    function openSettingsPanel(activityIndex) {
        isAddingNew = false;
        currentEditingIndex = activityIndex;
        const activity = clockActivities[activityIndex];
        
        document.querySelector('#settingsPanel h2').textContent = 'Edit Activity';
        document.getElementById('activityLabel').value = activity.label;
        document.getElementById('startHour').value = activity.startHour;
        document.getElementById('startMin').value = activity.startMin;
        document.getElementById('durationHours').value = activity.durationHours;
        document.getElementById('durationMin').value = activity.durationMin;
        document.getElementById('activityColor').value = activity.color;
        document.getElementById('colorHex').textContent = activity.color;
        
        selectedIcon = activity.icon;
        document.querySelectorAll('.icon-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.icon === selectedIcon);
        });
        
        document.getElementById('deleteActivity').style.display = '';
        document.getElementById('settingsPanel').classList.add('open');
    }
    // Open panel to create a new activity
    function openNewActivityPanel(clickAngle) {
        isAddingNew = true;
        currentEditingIndex = -1;
        const startHour = Math.floor(clickAngle / 15);
        
        document.querySelector('#settingsPanel h2').textContent = 'Add New Activity';
        document.getElementById('activityLabel').value = '';
        document.getElementById('startHour').value = startHour;
        document.getElementById('startMin').value = 0;
        document.getElementById('durationHours').value = 1;
        document.getElementById('durationMin').value = 0;
        document.getElementById('activityColor').value = '#3498DB';
        document.getElementById('colorHex').textContent = '#3498DB';
        
        selectedIcon = '';
        document.querySelectorAll('.icon-option').forEach(el => {
            el.classList.remove('selected');
        });
        
        document.getElementById('deleteActivity').style.display = 'none';
        document.getElementById('settingsPanel').classList.add('open');
    }
    // Close the settings panel
    function closeSettingsPanel() {
        document.getElementById('settingsPanel').classList.remove('open');
    }
    // ===== EVENT LISTENERS =====
    // Canvas click detection
    const clockCanvas = document.getElementById('clockCanvas');
    if (clockCanvas) {
        clockCanvas.addEventListener('click', function(evt) {
            const mousePos = getMousePos(clockCanvas, evt);
            const centerX = clockCanvas.width / 2;
            const centerY = clockCanvas.height / 2;
            const radius = Math.min(centerX, centerY) - 60;
            
            if (isInsideCircle(mousePos.x, mousePos.y, centerX, centerY, radius)) {
                const clickAngle = mouseToAngle(mousePos.x, mousePos.y, centerX, centerY);
                const activityIndex = getClickedActivity(clickAngle);
                
                if (activityIndex !== -1) {
                    openSettingsPanel(activityIndex);
                } else {
                    openNewActivityPanel(clickAngle);
                }
            }
        });
    }
    // Icon selector
    document.getElementById('iconSelector').addEventListener('click', function(e) {
        if (e.target.classList.contains('icon-option')) {
            selectedIcon = e.target.dataset.icon;
            document.querySelectorAll('.icon-option').forEach(el => {
                el.classList.remove('selected');
            });
            e.target.classList.add('selected');
        }
    });
    // Color picker updates hex display
    document.getElementById('activityColor').addEventListener('input', function(e) {
        document.getElementById('colorHex').textContent = e.target.value;
    });
    // Close and cancel buttons
    document.getElementById('closePanel').addEventListener('click', closeSettingsPanel);
    document.getElementById('cancelEdit').addEventListener('click', closeSettingsPanel);
    // Save button
    document.getElementById('saveActivity').addEventListener('click', function() {
        const newActivity = {
            startHour: parseInt(document.getElementById('startHour').value) || 0,
            startMin: parseInt(document.getElementById('startMin').value) || 0,
            durationHours: parseInt(document.getElementById('durationHours').value) || 0,
            durationMin: parseInt(document.getElementById('durationMin').value) || 0,
            color: document.getElementById('activityColor').value,
            icon: selectedIcon,
            label: document.getElementById('activityLabel').value || 'New Activity'
        };
        
        if (isAddingNew) {
            clockActivities.push(newActivity);
        } else if (currentEditingIndex !== -1) {
            clockActivities[currentEditingIndex] = newActivity;
        }
        
        saveClockToStorage();
        drawClock();
        closeSettingsPanel();
    });
    // Delete button
    document.getElementById('deleteActivity').addEventListener('click', function() {
        if (isAddingNew || currentEditingIndex === -1) return;
        clockActivities.splice(currentEditingIndex, 1);
        saveClockToStorage();
        drawClock();
        closeSettingsPanel();
    });
    // View Data button
    document.getElementById('viewData').addEventListener('click', function() {
        const saved = localStorage.getItem('lifeClockActivities');
        if (saved) {
            alert('Stored activities:\n\n' + JSON.stringify(JSON.parse(saved), null, 2));
        } else {
            alert('No stored data found!');
        }
    });
    // Clear Data button
    document.getElementById('clearData').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all clock data?')) {
            localStorage.removeItem('lifeClockActivities');
            clockActivities = [];
            drawClock();
            alert('All data cleared!');
        }
    });

    // Initialize clock when page loads
    loadClockFromStorage();
    // Start the clock animation (updates every second)
    setInterval(drawClock, 1000);
    drawClock(); // Draw immediately on load
});
