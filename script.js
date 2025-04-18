document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeMessage = document.getElementById('welcome-message'); // Added
    const dateTimeDisplay = document.getElementById('date-time'); // Added
    const gameSelectDropdown = document.getElementById('game-select-dropdown'); // Added
    const gameTitle = document.getElementById('game-title');
    const gameVisual = document.getElementById('game-visual');
    const gameProgressArea = document.getElementById('game-progress');
    const gameStatusText = document.getElementById('game-status-text');
    const victoryMessage = document.getElementById('victory-message');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');
    const completeDayBtn = document.getElementById('complete-day-btn'); // Added
    const newDayBtn = document.getElementById('new-day-btn');
    const missionReportModal = document.getElementById('mission-report-modal'); // Added
    const reportDate = document.getElementById('report-date'); // Added
    const reportSummary = document.getElementById('report-summary'); // Added
    const reportTaskList = document.getElementById('report-task-list'); // Added
    const reportGameStatus = document.getElementById('report-game-status'); // Added
    const closeReportBtn = document.getElementById('close-report-btn'); // Added
    const mainContainer = document.querySelector('.container'); // For disabling UI

    // --- Audio ---
    let completeSound, victorySound;
    try {
        completeSound = new Audio('complete.wav'); // Or .mp3
        victorySound = new Audio('victory.wav');   // Or .mp3
        completeSound.preload = 'auto';
        victorySound.preload = 'auto';
    } catch (e) {
        console.error("Could not load audio files. Ensure 'complete.wav' and 'victory.wav' exist.", e);
        // Create dummy objects to prevent errors later
        completeSound = { play: () => {} };
        victorySound = { play: () => {} };
    }


    // --- Game Definitions (Added visual detail hints) ---
    const GAME_THEMES = [
        { id: 'dragon', name: "Dragon's Downfall", visual: '🔥🐉🔥', defeatedVisual: '💀', progressType: 'health', victoryText: "VICTORY! The Dragon is vanquished!" },
        { id: 'mountain', name: "Mountain Climb", visual: '⛰️', progressType: 'steps', stepChar: '🧗', victoryText: "PEAK CONQUERED! You reached the summit!" },
        { id: 'castle', name: "Build the Castle", visual: '🏰', progressType: 'build', pieces: ['🧱', '🧱🧱', '🧱🚪🧱', '🧱 TOWER 🧱', '🏰 FLAG'], victoryText: "FORTIFIED! Your castle stands strong!" },
        { id: 'map', name: "Uncover Treasure", visual: '❓🗺️❓', progressType: 'reveal', item: '💎', victoryText: "TREASURE FOUND! X marks the spot!" },
        { id: 'escape', name: "The Great Escape", visual: '🧱🚪', progressType: 'steps', stepChar: '🏃💨', victoryText: "ESCAPED! Freedom at last!" },
        { id: 'voyage', name: "Cosmic Voyage", visual: '🚀🌌<span class="planet">🪐</span>', progressType: 'steps', stepChar: '✨', victoryText: "DESTINATION REACHED! A successful journey!" },
        { id: 'elixir', name: "Brew the Elixir", visual: '<span class="potion-bottle">🧪</span>', progressType: 'fill', item: '💧', victoryText: "POTION BREWED! Magical power awaits!", visualSteps: 5 }, // Added visualSteps hint
        { id: 'bean', name: "Grow the Magic Bean", visual: '🌰', progressType: 'build', pieces: ['🌱','🌿','🌲','🌳','✨🌳✨'], victoryText: "IT'S HUGE! The beanstalk reaches the clouds!" },
        { id: 'crystal', name: "Charge the Crystal", visual: '<span class="crystal-base">💎</span>', progressType: 'charge', item: '⚡', victoryText: "FULLY CHARGED! The crystal glows with power!" },
        { id: 'fort', name: "Defend the Fort", visual: '🏕️🚧', progressType: 'build', pieces: ['🧱','🧱🧱','🧱 M 🧱','🧱 M G 🧱','⚔️🛡️'], victoryText: "SECURE! The fort is impenetrable!" }
    ];

    // --- State ---
    let tasks = [];
    let currentGame = null;
    let dateTimeInterval = null;
    let isDayCompleteState = false; // Added

    const STORAGE_KEYS = {
        TASKS: 'vintageTasks_v2', // Increment version if structure changes
        GAME_INFO: 'vintageGameInfo_v2', // Stores { id: string, date: string }
        DAY_COMPLETE: 'vintageDayComplete_v2' // Stores boolean
    };

    // --- Functions ---

    // Update Date and Time display
    function updateDateTime() {
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const dateStr = now.toLocaleDateString(undefined, dateOptions);
        const timeStr = now.toLocaleTimeString(undefined, timeOptions);
        dateTimeDisplay.textContent = `${dateStr} ${timeStr}`;
    }

    // Get current date as YYYY-MM-DD string
    function getCurrentDateString() {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    // Populate Game Selection Dropdown
    function populateGameSelector() {
        gameSelectDropdown.innerHTML = ''; // Clear existing
        GAME_THEMES.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            gameSelectDropdown.appendChild(option);
        });
    }

    // Determine which game to use (handles daily change & user selection)
    function determineGame() {
        const todayStr = getCurrentDateString();
        const storedGameInfo = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_INFO)) || {};
        const selectedGameId = storedGameInfo.id; // User's last selected game
        const storedDate = storedGameInfo.date;

        let gameIdToUse = null;

        if (selectedGameId && GAME_THEMES.find(g => g.id === selectedGameId)) {
             // If user has selected a game before, prioritize it for today
             gameIdToUse = selectedGameId;
             // Update the stored date if it's a new day but keep the selection
             if (storedDate !== todayStr) {
                 saveGameSelection(selectedGameId, todayStr);
             }
        } else if (storedGameInfo.id && storedDate === todayStr) {
            // Fallback to stored game *if* it's for the current day (covers initial load case)
            gameIdToUse = storedGameInfo.id;
        } else {
            // New day and no sticky selection, or first load: Pick daily game
            const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            const gameIndex = dayOfYear % GAME_THEMES.length;
            gameIdToUse = GAME_THEMES[gameIndex].id;
            saveGameSelection(gameIdToUse, todayStr); // Save the daily choice
        }

        currentGame = GAME_THEMES.find(g => g.id === gameIdToUse);
        gameSelectDropdown.value = gameIdToUse; // Sync dropdown with current game

        console.log(`Using Game (${todayStr}): ${currentGame.name}`);
    }

    // Save the selected game ID and date
    function saveGameSelection(gameId, dateStr) {
         localStorage.setItem(STORAGE_KEYS.GAME_INFO, JSON.stringify({ id: gameId, date: dateStr }));
    }

    // Handle game selection change
    function handleGameChange() {
        const selectedId = gameSelectDropdown.value;
        currentGame = GAME_THEMES.find(g => g.id === selectedId);
        saveGameSelection(selectedId, getCurrentDateString()); // Persist user choice
        renderGameArea(); // Re-render game visuals with the new theme
        console.log(`Game changed to: ${currentGame.name}`);
    }

    // Load tasks and day completion state
    function loadState() {
        const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        tasks = storedTasks ? JSON.parse(storedTasks) : [];

        const storedDayComplete = localStorage.getItem(STORAGE_KEYS.DAY_COMPLETE);
        isDayCompleteState = storedDayComplete === 'true';
    }

    // Save tasks and day completion state
    function saveState() {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.DAY_COMPLETE, isDayCompleteState);
    }

    // Apply/Remove Day Completed Styling/Blocking
    function setDayCompletionStyling() {
        if (isDayCompleteState) {
            mainContainer.classList.add('day-completed');
            missionReportModal.classList.remove('hidden'); // Show report if day was already complete
        } else {
            mainContainer.classList.remove('day-completed');
             missionReportModal.classList.add('hidden'); // Ensure report is hidden
        }
         // Explicitly enable/disable buttons based on state
         completeDayBtn.disabled = isDayCompleteState;
         newDayBtn.disabled = false; // Always allow starting a new day
         addTaskBtn.disabled = isDayCompleteState;
         newTaskInput.disabled = isDayCompleteState;
         gameSelectDropdown.disabled = isDayCompleteState;
    }

    // --- Game Rendering --- More Visuals! ---
    function renderGameArea() {
        if (!currentGame) return;

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const isAllTasksComplete = totalTasks > 0 && completedTasks === totalTasks;
        const isGameWon = isAllTasksComplete; // Simple win condition for now

        // Set Title and Base Visual
        gameTitle.textContent = currentGame.name;

        // Determine main visual based on completion state
        let currentVisualHTML = isGameWon ? (currentGame.defeatedVisual || currentGame.visual) : currentGame.visual;

        // Clear previous progress elements
        gameProgressArea.innerHTML = '';
        gameStatusText.textContent = '';

        // Calculate Progress
        const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Render Progress specific to game type - WITH ENHANCED VISUALS
        if (totalTasks === 0) {
            gameStatusText.textContent = "Add quests to begin!";
            gameVisual.innerHTML = currentGame.visual; // Show normal visual
            gameVisual.classList.remove('defeated');
            victoryMessage.classList.add('hidden');
            gameVisual.style.filter = 'none'; // Reset filter
            gameVisual.style.transform = 'scale(1)'; // Reset scale
            return;
        }

        switch (currentGame.progressType) {
            case 'health':
                const healthPercent = 100 - progressPercent;
                gameProgressArea.innerHTML = `
                    <div class="progress-bar-container Nes">
                        <progress class="Nes nes-progress ${healthPercent < 30 ? 'is-error' : (healthPercent < 60 ? 'is-warning' : 'is-success')}" value="${healthPercent}" max="100"></progress>
                    </div>`;
                gameStatusText.textContent = `Enemy Health: ${Math.round(healthPercent)}%`;
                // Make dragon visually weaker? (Opacity/Shake?) - example
                 gameVisual.style.opacity = 0.6 + (healthPercent / 100) * 0.4;

                break;

            case 'steps':
                let stepsHTML = '<div class="progress-steps">';
                for (let i = 0; i < totalTasks; i++) {
                    const stepClass = i < completedTasks ? 'step completed' : 'step';
                    // Add 'current-step' class for the character marker
                    const currentClass = i === completedTasks && !isGameWon ? 'current-step' : '';
                    stepsHTML += `<div class="${stepClass} ${currentClass}"></div>`;
                }
                stepsHTML += '</div>';
                gameProgressArea.innerHTML = stepsHTML;
                gameStatusText.textContent = `Progress: ${completedTasks} / ${totalTasks} steps`;

                // Update main visual for step games (Show character or goal)
                 if (['mountain', 'escape', 'voyage'].includes(currentGame.id)) {
                    currentVisualHTML = isGameWon ? currentGame.visual : (currentGame.stepChar || '🏁');
                 }
                 // Add simple animation to character marker if possible via CSS maybe later
                break;

             case 'build':
             case 'fill': // Combines build/fill logic now
             case 'charge':
                 const pieces = currentGame.pieces || Array(totalTasks).fill(currentGame.item || '█');
                 const targetPieces = currentGame.visualSteps || pieces.length; // Use visualSteps hint or default to total pieces
                 const buildCount = Math.min(completedTasks, totalTasks); // Count completed tasks
                 const visualProgress = Math.min(buildCount / totalTasks, 1); // Progress fraction for visual effects

                 let itemsHTML = '';
                 if (currentGame.progressType === 'fill') {
                     const fillLevels = currentGame.visualSteps || 5; // Number of visual fill levels
                     const currentLevel = Math.floor(visualProgress * fillLevels);
                     itemsHTML = `<span class="fill-visual">${Array(currentLevel + 1).join(currentGame.item || '💧')}</span>`; // Simple text representation
                      // Update main visual for potion - e.g., add color overlay?
                      if (currentGame.id === 'elixir') {
                          const hue = 120 * visualProgress; // Green shift
                          currentVisualHTML = `<span class="potion-bottle" style="filter: hue-rotate(${hue}deg);">${currentGame.visual.match(/<span.*?>(.*?)<\/span>/)[1]}</span>`;
                      }

                 } else if (currentGame.progressType === 'charge') {
                     // Crystal Glow Effect
                     const glowIntensity = visualProgress * 15; // Max 15px glow
                     const scaleFactor = 1 + (visualProgress * 0.2); // Grow slightly
                     currentVisualHTML = `<span class="crystal-base" style="transform: scale(${scaleFactor}); filter: drop-shadow(0 0 ${glowIntensity}px #fff) drop-shadow(0 0 ${glowIntensity/2}px cyan);">${currentGame.visual.match(/<span.*?>(.*?)<\/span>/)[1]}</span>`;
                     itemsHTML = `<span class="charge-indicator">${Array(Math.floor(visualProgress * 5) + 1).join(currentGame.item || '⚡')}</span>`; // Show charge symbols
                 }
                 else { // Build logic
                     itemsHTML = '<div class="build-progress">';
                     // Show visual pieces based on completed tasks, up to the number of defined pieces
                     const piecesToShow = Math.min(buildCount, pieces.length);
                     for (let i = 0; i < piecesToShow; i++) {
                        // Add 'added' class for CSS transition
                         itemsHTML += `<span class="build-piece added">${pieces[i]}</span> `;
                     }
                     itemsHTML += '</div>';
                     // Update main visual for build games based on last completed piece
                     if (buildCount > 0 && buildCount <= pieces.length) {
                         currentVisualHTML = pieces[buildCount - 1];
                     } else if (buildCount === 0 && currentGame.id === 'bean') {
                          currentVisualHTML = '🌰'; // Start as seed
                     } else if (isGameWon) {
                          currentVisualHTML = currentGame.defeatedVisual || currentGame.visual; // Final visual if defined
                     }
                 }

                 gameProgressArea.innerHTML = itemsHTML;
                 gameStatusText.textContent = `Progress: ${completedTasks} / ${totalTasks}`;
                 break;

            case 'reveal':
                const totalSlots = totalTasks;
                let revealHTML = '<div class="reveal-area">';
                for (let i = 0; i < totalSlots; i++) {
                     if (i < completedTasks) {
                         // Add 'revealed' class for CSS transition
                         revealHTML += `<span class="reveal-item Nes nes-icon diamond is-small revealed"></span>`; // Use NES icon
                     } else {
                         revealHTML += `<span class="reveal-item Nes nes-icon star is-empty is-small"></span>`; // Placeholder icon
                     }
                }
                 revealHTML += '</div>';
                 gameProgressArea.innerHTML = revealHTML;
                 gameStatusText.textContent = `Revealed: ${completedTasks} / ${totalTasks}`;
                 break;

            default:
                gameStatusText.textContent = `Completed: ${completedTasks} / ${totalTasks}`;
        }

        // Update main visual element
        gameVisual.innerHTML = currentVisualHTML;
        gameVisual.classList.toggle('defeated', isGameWon);

        // Show victory message and play sound
        if (isGameWon && !victoryMessage.classList.contains('shown-this-session')) { // Prevent sound replaying on selection change
            victoryMessage.textContent = currentGame.victoryText || "Quest Complete!";
            victoryMessage.classList.remove('hidden');
            victoryMessage.classList.add('shown-this-session'); // Mark as shown
             if (tasks.length > 0) { // Only play victory if there were tasks
                 playSound(victorySound);
             }
             // Maybe add a small visual flourish on win
             gameVisual.style.transform = 'scale(1.1)';
             setTimeout(() => { gameVisual.style.transform = 'scale(1)'; }, 300);
        } else if (!isGameWon) {
            victoryMessage.classList.add('hidden');
            victoryMessage.classList.remove('shown-this-session'); // Reset for next win
        }
         // If day is already marked complete, force show victory message if applicable
         if(isDayCompleteState && isGameWon){
             victoryMessage.classList.remove('hidden');
             victoryMessage.textContent = currentGame.victoryText || "Quest Complete!";
         }

    }

    // Render the task lists UI
    function renderTasks() {
        todoList.innerHTML = '';
        completedList.innerHTML = '';

        let hasIncomplete = false;
        if (tasks.length === 0) {
            todoList.innerHTML = '<li class="task-placeholder">No quests yet... Add one!</li>';
        } else {
            tasks.forEach(task => {
                const li = createTaskElement(task);
                if (task.completed) {
                    completedList.appendChild(li);
                } else {
                    todoList.appendChild(li);
                    hasIncomplete = true;
                }
            });
             if (!hasIncomplete && tasks.length > 0) {
                 todoList.innerHTML = '<li class="task-placeholder">All quests done!</li>';
             }
             if (completedList.innerHTML === '') {
                 completedList.innerHTML = '<li class="task-placeholder">No completed quests yet.</li>';
             }
        }

        // Enable/Disable Complete Day button
        completeDayBtn.disabled = isDayCompleteState || tasks.length === 0 || hasIncomplete;


        renderGameArea(); // Update game progress
        saveState(); // Save tasks and completion state
        setDayCompletionStyling(); // Apply UI blocking if day is complete
    }

    // Create LI element for a task (minor changes for styling)
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);

        const textSpan = document.createElement('span');
        textSpan.textContent = task.text;
        textSpan.classList.add('task-text');
        li.appendChild(textSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');

        // Edit Button (only for ToDo tasks)
        if (!task.completed) {
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="Nes nes-icon edit is-small"></i>';
            editBtn.classList.add('Nes', 'nes-btn', 'is-small', 'is-warning'); // Warning color for edit
            editBtn.title = "Edit Quest";
            editBtn.addEventListener('click', (e) => { e.stopPropagation(); editTask(task.id, li); });
            actionsDiv.appendChild(editBtn);
        } else {
             // Add a placeholder or empty space if needed to align buttons
        }


        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="Nes nes-icon close is-small"></i>';
        deleteBtn.classList.add('Nes', 'nes-btn', 'is-error', 'is-small');
        deleteBtn.title = "Discard Quest";
        deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteTask(task.id); });
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(actionsDiv);

        // Click listener to toggle completion
        li.addEventListener('click', () => {
             if (!isDayCompleteState) { // Only allow toggle if day isn't complete
                 toggleTaskCompletion(task.id);
             }
        });

        return li;
    }

    // Add a new task
    function addTask() {
        if (isDayCompleteState) return; // Don't add if day complete
        const text = newTaskInput.value.trim();
        if (text === '') {
            // Maybe use a NES dialog later
            alert('Please enter a quest description.');
            return;
        }
        tasks.push({ id: Date.now(), text: text, completed: false });
        newTaskInput.value = '';
        newTaskInput.focus();
        renderTasks();
    }

    // Toggle task completion status
    function toggleTaskCompletion(id) {
        if (isDayCompleteState) return; // Don't toggle if day complete

        let taskCompleted = false;
        tasks = tasks.map(task => {
            if (task.id === id) {
                const newState = !task.completed;
                if (newState) { // Task is being marked complete
                    taskCompleted = true;
                }
                return { ...task, completed: newState };
            }
            return task;
        });

        if (taskCompleted) {
            playSound(completeSound);
        }
        renderTasks();
    }

    // Delete a task
    function deleteTask(id) {
        if (isDayCompleteState) return; // Don't delete if day complete
        if (confirm('Discard this quest forever?')) {
            tasks = tasks.filter(task => task.id !== id);
            renderTasks();
        }
    }

    // Edit Task (Inline) - No changes needed here
    function editTask(id, listItem) {
        if (isDayCompleteState) return;
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const textSpan = listItem.querySelector('.task-text');
        const currentText = task.text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input', 'Nes', 'nes-input'); // Simpler classes
        input.style.fontSize = 'inherit'; // Inherit size
        input.style.flexGrow = '1'; // Take space

        textSpan.replaceWith(input);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            tasks = tasks.map(t => t.id === id ? { ...t, text: newText || currentText } : t); // Keep old text if empty
            renderTasks(); // Always re-render
        };
        input.addEventListener('blur', saveEdit, { once: true }); // Save on blur
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') input.blur(); });
        input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { input.removeEventListener('blur', saveEdit); renderTasks(); } }); // Cancel on Escape
    }

    // --- Day Completion and Report ---
    function completeDay() {
        if (isDayCompleteState) return; // Already complete

        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const allDone = completedTasks === totalTasks;

        if (totalTasks === 0) {
             alert("Add some quests before completing the day!");
             return;
         }
         if (!allDone) {
             if (!confirm("You haven't finished all your quests. Complete the day anyway?")) {
                 return;
             }
         }


        // Generate Report
        reportDate.textContent = `Date: ${new Date().toLocaleDateString()}`;
        reportSummary.textContent = `Quests Attempted: ${totalTasks} | Quests Completed: ${completedTasks}`;
        reportTaskList.innerHTML = ''; // Clear previous list
        tasks.filter(t => t.completed).forEach(t => {
            const li = document.createElement('li');
            li.textContent = t.text;
            reportTaskList.appendChild(li);
        });
        if(completedTasks === 0){
             reportTaskList.innerHTML = '<li>None</li>';
        }

        // Game Status
        const gameWon = totalTasks > 0 && completedTasks === totalTasks;
        reportGameStatus.textContent = `Daily Challenge (${currentGame.name}): ${gameWon ? 'SUCCESSFUL!' : 'Incomplete'}`;

        // Mark day as complete and show report
        isDayCompleteState = true;
        saveState();
        setDayCompletionStyling(); // Apply UI blocking and show modal
    }

    function closeMissionReport() {
        missionReportModal.classList.add('hidden');
        // The day remains complete, UI stays blocked until "Start New Day"
    }

    // Clear all tasks for a new day
    function startNewDay() {
        if (!isDayCompleteState && tasks.length > 0) {
            if (!confirm('Start a fresh day? Current quests will be lost.')) {
                 return;
             }
        }

        isDayCompleteState = false;
        tasks = [];
        saveState(); // Save cleared tasks and completion state
        determineGame(); // Re-determine game for the new day (respects selection)
        renderTasks(); // Render empty lists and initial game state
        setDayCompletionStyling(); // Remove blocking styles
        missionReportModal.classList.add('hidden'); // Ensure report is hidden
        victoryMessage.classList.remove('shown-this-session'); // Allow victory sound again
        newTaskInput.focus();
    }

     // Helper to play sound safely
     function playSound(audioElement) {
         if (audioElement && typeof audioElement.play === 'function') {
             audioElement.currentTime = 0; // Rewind to start
             audioElement.play().catch(error => {
                 // Autoplay was prevented, common issue. User interaction usually enables it.
                 console.warn("Audio playback failed. User interaction might be needed first.", error);
             });
         }
     }

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
    gameSelectDropdown.addEventListener('change', handleGameChange); // Added
    completeDayBtn.addEventListener('click', completeDay); // Added
    newDayBtn.addEventListener('click', startNewDay);
    closeReportBtn.addEventListener('click', closeMissionReport); // Added
    // Close modal if clicking overlay background
    missionReportModal.addEventListener('click', (e) => {
         if (e.target === missionReportModal) { // Clicked on overlay, not dialog
             closeMissionReport();
         }
     });


    // --- Initial Load ---
    function init() {
        populateGameSelector(); // Populate dropdown first
        loadState(); // Load tasks and completion state
        determineGame(); // Determine game based on stored state/date
        renderTasks(); // Render everything based on loaded state
        updateDateTime(); // Initial date/time display
        dateTimeInterval = setInterval(updateDateTime, 1000); // Update time every second
        setDayCompletionStyling(); // Apply initial blocking if needed
        if (!isDayCompleteState) {
             newTaskInput.focus();
         }
    }

    init();
});
