document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeMessage = document.getElementById('welcome-message');
    const dateTimeDisplay = document.getElementById('date-time');
    const gameSelectDropdown = document.getElementById('game-select-dropdown');
    const gameTitle = document.getElementById('game-title');
    const gameVisual = document.getElementById('game-visual');
    const gameProgressArea = document.getElementById('game-progress');
    const gameStatusText = document.getElementById('game-status-text');
    const victoryMessage = document.getElementById('victory-message');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoList = document.getElementById('todo-list');
    const completedList = document.getElementById('completed-list');
    const completeDayBtn = document.getElementById('complete-day-btn');
    const newDayBtn = document.getElementById('new-day-btn');
    const missionReportModal = document.getElementById('mission-report-modal');
    const reportDate = document.getElementById('report-date');
    const reportSummary = document.getElementById('report-summary');
    const reportTaskList = document.getElementById('report-task-list');
    const reportGameStatus = document.getElementById('report-game-status');
    const closeReportBtn = document.getElementById('close-report-btn');
    const mainContainer = document.querySelector('.container');

    // --- Audio ---
    let completeSound, victorySound;
    try {
        // Ensure paths and formats are correct ('complete.wav', 'victory.wav' or .mp3)
        completeSound = new Audio('audio/complete.wav'); // Example: assuming /audio/ folder
        victorySound = new Audio('audio/victory.wav');   // Example: assuming /audio/ folder
        completeSound.preload = 'auto';
        victorySound.preload = 'auto';
         // Try playing a silent sound on first interaction to unlock audio
        document.body.addEventListener('click', () => {
            if (completeSound.paused && victorySound.paused) {
                 const silent = new Audio(); // Create a minimal audio element
                 silent.volume = 0;
                 silent.play().catch(e => console.log("Silent audio play failed:", e)); // Basic check
            }
        }, { once: true });

    } catch (e) {
        console.error("Could not load audio files.", e);
        // Create dummy objects to prevent errors later
        completeSound = { play: () => {} };
        victorySound = { play: () => {} };
    }


    // --- Game Definitions (Added visual detail hints) ---
    // Added unique classes/elements for more visual control via CSS
    const GAME_THEMES = [
        { id: 'dragon', name: "Dragon's Downfall", visual: '<span class="game-icon">🔥🐉🔥</span>', defeatedVisual: '<span class="game-icon is-defeated">💀</span>', progressType: 'health', victoryText: "VICTORY! The Dragon is vanquished!" },
        { id: 'mountain', name: "Mountain Climb", visual: '<span class="game-icon">⛰️</span>', progressType: 'steps', stepChar: '🚶', victoryText: "PEAK CONQUERED! You reached the summit!" },
        { id: 'castle', name: "Build the Castle", visual: '<span class="game-icon">🏰</span>', progressType: 'build', pieces: ['🧱','🧱🧱','🧱<span class="nes-icon is-small star"></span>🧱','🧱 <span class="nes-icon is-small trophy"></span> 🧱','🏰<span class="nes-icon is-small star"></span>'], victoryText: "FORTIFIED! Your castle stands strong!" },
        { id: 'map', name: "Uncover Treasure", visual: '<span class="game-icon">🗺️</span>', progressType: 'reveal', item: '<span class="nes-icon diamond is-small"></span>', victoryText: "TREASURE FOUND! X marks the spot!" },
        { id: 'escape', name: "The Great Escape", visual: '<span class="game-icon">🧱🚪</span>', progressType: 'steps', stepChar: '🏃💨', victoryText: "ESCAPED! Freedom at last!" },
        { id: 'voyage', name: "Cosmic Voyage", visual: '<span class="game-icon">🚀🌌🪐</span>', progressType: 'steps', stepChar: '✨', victoryText: "DESTINATION REACHED! A successful journey!" },
        { id: 'elixir', name: "Brew the Elixir", visual: '<span class="game-icon potion-bottle">🧪</span>', progressType: 'fill', item: '💧', victoryText: "POTION BREWED! Magical power awaits!", visualSteps: 5 }, // Added visualSteps hint
        { id: 'bean', name: "Grow the Magic Bean", visual: '<span class="game-icon">🌰</span>', progressType: 'build', pieces: ['🌱','🌿','🌲','🌳','✨🌳✨'], victoryText: "IT'S HUGE! The beanstalk reaches the clouds!" },
        { id: 'crystal', name: "Charge the Crystal", visual: '<span class="game-icon crystal-base">💎</span>', progressType: 'charge', item: '⚡', victoryText: "FULLY CHARGED! The crystal glows with power!" },
        { id: 'fort', name: "Defend the Fort", visual: '<span class="game-icon">🏕️🚧</span>', progressType: 'build', pieces: ['🧱','🧱🧱','🧱 M 🧱','🧱 M G 🧱','⚔️🛡️'], victoryText: "SECURE! The fort is impenetrable!" }
    ];

    // --- State ---
    let tasks = [];
    let currentGame = null;
    let dateTimeInterval = null;
    let isDayCompleteState = false;
    let gameWinState = false; // Track win state separately

    const STORAGE_KEYS = {
        TASKS: 'vintageTasks_v3', // Increment version for breaking changes
        GAME_INFO: 'vintageGameInfo_v3', // Stores { id: string, date: string }
        DAY_COMPLETE: 'vintageDayComplete_v3' // Stores boolean
    };

    // --- Functions ---

    // Update Date and Time display
    function updateDateTime() {
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false }; // Removed seconds for cleaner look
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
         // Add a default option if needed, or just populate themes
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
        const storedDate = storedGameInfo.date;
        const storedGameId = storedGameInfo.id; // User's last selected game

        let gameIdToUse = null;

        // If stored game is for today's date, use it
        if (storedGameDate === todayStr && storedGameId && GAME_THEMES.find(g => g.id === storedGameId)) {
             gameIdToUse = storedGameId;
        } else {
             // New day or no stored game for today: Pick daily game based on date
             const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
             const gameIndex = dayOfYear % GAME_THEMES.length;
             gameIdToUse = GAME_THEMES[gameIndex].id;
             // Automatically select this game in the dropdown & save it as the day's game
             saveGameSelection(gameIdToUse, todayStr);
        }


        currentGame = GAME_THEMES.find(g => g.id === gameIdToUse);
        if (!currentGame) { // Fallback if gameId is invalid
             currentGame = GAME_THEMES[0];
             gameIdToUse = currentGame.id;
        }

        gameSelectDropdown.value = gameIdToUse; // Sync dropdown
        console.log(`Determined Game for ${todayStr}: ${currentGame.name}`);
    }

    // Save the selected game ID and date
    function saveGameSelection(gameId, dateStr) {
         localStorage.setItem(STORAGE_KEYS.GAME_INFO, JSON.stringify({ id: gameId, date: dateStr }));
    }

    // Handle game selection change (User manually changing the game)
    function handleGameChange() {
        // This should only happen if the day is not complete
        if (isDayCompleteState) {
            // Revert dropdown if somehow changed
            gameSelectDropdown.value = currentGame.id;
            return;
        }
        const selectedId = gameSelectDropdown.value;
        currentGame = GAME_THEMES.find(g => g.id === selectedId);
        if (currentGame) {
            saveGameSelection(selectedId, getCurrentDateString()); // Persist user choice for today
            renderGameArea(); // Re-render game visuals with the new theme
            console.log(`User changed game to: ${currentGame.name}`);
        } else {
            // Handle invalid selection - maybe revert to current game or default?
            console.warn("Invalid game selection:", selectedId);
            gameSelectDropdown.value = currentGame.id; // Revert dropdown
        }
    }


    // Load tasks, game info, and day completion state
    function loadState() {
        const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        tasks = storedTasks ? JSON.parse(storedTasks) : [];

        const storedDayComplete = localStorage.getItem(STORAGE_KEYS.DAY_COMPLETE);
        isDayCompleteState = storedDayComplete === 'true';

        // Check if it's a new day since the last visit *and* the day was completed
        const lastVisitedDate = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_INFO))?.date;
        const todayStr = getCurrentDateString();

        if (isDayCompleteState && lastVisitedDate && lastVisitedDate !== todayStr) {
             console.log("Detected new day after previous day was completed. Starting fresh.");
             // Automatically start a new day if the previous day was complete and it's now a new calendar day
             startNewDay(true); // Pass true to indicate automatic new day
             return; // Stop loading old state
        }
         // If not an automatic new day, ensure state matches storage
         setDayCompletionStyling(); // Apply initial styling/blocking

    }

    // Save tasks and day completion state
    function saveState() {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.DAY_COMPLETE, isDayCompleteState);
    }

    // Apply/Remove Day Completed Styling/Blocking
    function setDayCompletionStyling() {
        const isGameWon = tasks.length > 0 && tasks.filter(task => task.completed).length === tasks.length;

        mainContainer.classList.toggle('day-completed', isDayCompleteState);

        // Manage button/input/select disabled state
        completeDayBtn.disabled = isDayCompleteState || tasks.length === 0 || tasks.filter(task => !task.completed).length > 0;
        newDayBtn.disabled = false; // Always allow starting a new day
        addTaskBtn.disabled = isDayCompleteState;
        newTaskInput.disabled = isDayCompleteState;
        gameSelectDropdown.disabled = isDayCompleteState;

        // Also disable click listeners on task items when day is complete
        document.querySelectorAll('#todo-list li, #completed-list li').forEach(li => {
            // Remove existing listener to avoid duplicates if this is called multiple times
            // This approach is complex. Relying on pointer-events: none and checking state inside the handler is simpler.
            // Let's stick to checking isDayCompleteState inside toggleTaskCompletion.
        });


        // Show report modal only if day is complete and it's not already visible
        if (isDayCompleteState && !missionReportModal.classList.contains('hidden')) {
             // Modal is already being handled, perhaps from loadState
        } else if (isDayCompleteState) {
             // Day is complete but modal isn't shown yet (e.g., just clicked completeDay)
             showMissionReport();
        } else {
             // Day is not complete, ensure modal is hidden
             missionReportModal.classList.add('hidden');
        }

         // Ensure victory message is shown if game is won AND day is complete
         if (isDayCompleteState && isGameWon) {
              victoryMessage.classList.remove('hidden');
              victoryMessage.textContent = currentGame.victoryText || "Quest Complete!";
              victoryMessage.classList.add('is-success'); // Use nes.css success text style
         } else {
              victoryMessage.classList.add('hidden');
              victoryMessage.classList.remove('is-success');
         }

         // Update report game status color
         reportGameStatus.classList.toggle('is-success', isGameWon);
    }

    // --- Game Rendering --- More Visuals! ---
    function renderGameArea() {
        if (!currentGame) return;

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        gameWinState = totalTasks > 0 && completedTasks === totalTasks; // Update win state

        // Set Title
        gameTitle.textContent = currentGame.name;

        // Determine main visual based on completion state
        let currentVisualHTML = gameWinState ? (currentGame.defeatedVisual || currentGame.visual) : currentGame.visual;

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
                    <div class="progress-bar-container">
                        <progress class="Nes nes-progress ${healthPercent < 30 ? 'is-error' : (healthPercent < 60 ? 'is-warning' : 'is-success')}" value="${healthPercent}" max="100"></progress>
                    </div>`;
                gameStatusText.textContent = `Enemy Health: ${Math.round(healthPercent)}%`;
                // Visual hint: opacity/scale change
                 gameVisual.style.opacity = 0.6 + (healthPercent / 100) * 0.4;
                 gameVisual.style.transform = `scale(${0.9 + (healthPercent / 100) * 0.1})`;
                break;

            case 'steps':
                let stepsHTML = '<div class="progress-steps">';
                for (let i = 0; i < totalTasks; i++) {
                    const stepClass = i < completedTasks ? 'step completed' : 'step';
                    // Add 'current-step' class for the character marker only on the *next* step
                    const currentClass = i === completedTasks && !gameWinState ? 'current-step' : '';
                    stepsHTML += `<div class="${stepClass} ${currentClass}"></div>`;
                }
                stepsHTML += '</div>';
                gameProgressArea.innerHTML = stepsHTML;
                gameStatusText.textContent = `Progress: ${completedTasks} / ${totalTasks} steps`;

                // Update main visual for step games (Show character or goal)
                 if (['mountain', 'escape', 'voyage'].includes(currentGame.id)) {
                    // The stepChar is now handled by the ::after pseudo-element on the step divs
                    // Keep the main visual static or show goal on win
                    currentVisualHTML = gameWinState ? (currentGame.defeatedVisual || currentGame.visual) : currentGame.visual;
                 }
                gameVisual.innerHTML = currentVisualHTML; // Update visual after step logic
                gameVisual.style.opacity = 1; // Reset
                gameVisual.style.transform = 'scale(1)'; // Reset

                break;

             case 'build':
             case 'fill':
             case 'charge':
                 const buildCount = Math.min(completedTasks, totalTasks); // Number of completed steps for visual
                 const visualProgress = totalTasks > 0 ? buildCount / totalTasks : 0; // Fraction for visuals

                 let itemsHTML = '';
                 if (currentGame.progressType === 'fill') {
                     const fillLevels = currentGame.visualSteps || 5; // Number of visual fill levels
                     const currentLevel = Math.floor(visualProgress * fillLevels);
                     // Use a div for fill level visualization
                     itemsHTML = `<div class="fill-visual"><span class="item-fill">${Array(currentLevel + 1).join(currentGame.item || '💧')}</span></div>`;

                      // Update main visual for potion - e.g., add color overlay?
                      if (currentGame.id === 'elixir') {
                          const hue = 120 * visualProgress; // Green shift
                          const satur = 50 + visualProgress * 50; // Saturation increase
                          const lightness = 50 + visualProgress * 10; // Slight lightness increase
                          // Use CSS filter on the potion-bottle span
                          gameVisual.querySelector('.potion-bottle').style.filter = `hue-rotate(${hue}deg) saturate(${satur}%) brightness(${lightness}%)`;
                      }

                 } else if (currentGame.progressType === 'charge') {
                     // Crystal Glow Effect
                     const glowIntensity = visualProgress * 15; // Max 15px glow
                     const scaleFactor = 1 + (visualProgress * 0.1); // Grow slightly
                      // Use CSS filter on the crystal-base span
                     gameVisual.querySelector('.crystal-base').style.transform = `scale(${scaleFactor})`;
                     gameVisual.querySelector('.crystal-base').style.filter = `drop-shadow(0 0 ${glowIntensity}px #fff) drop-shadow(0 0 ${glowIntensity/2}px cyan)`; // White and cyan glow

                     itemsHTML = `<div class="charge-indicator">${Array(Math.floor(visualProgress * 5) + 1).join(currentGame.item || '⚡')}</div>`; // Show charge symbols
                 }
                 else { // Build logic
                     const pieces = currentGame.pieces || Array(totalTasks).fill(currentGame.item || '█');
                     itemsHTML = '<div class="build-progress">';
                     const piecesToShow = Math.min(buildCount, pieces.length);
                     for (let i = 0; i < piecesToShow; i++) {
                        // Add 'added' class for CSS transition. Wrap piece in span if not already
                         itemsHTML += `<span class="build-piece added">${pieces[i]}</span> `;
                     }
                     itemsHTML += '</div>';
                     // Update main visual for build games based on last completed piece (optional, can keep static)
                     // Let's keep the main visual static and show progress via pieces added.
                 }

                 gameProgressArea.innerHTML = itemsHTML;
                 gameStatusText.textContent = `Progress: ${buildCount} / ${totalTasks}`;

                 if (currentGame.progressType !== 'charge' && currentGame.id !== 'elixir') {
                     gameVisual.style.opacity = 1; // Reset opacity/transform
                     gameVisual.style.transform = 'scale(1)';
                     gameVisual.style.filter = 'none';
                 }

                 break;

            case 'reveal':
                const totalSlots = totalTasks;
                let revealHTML = '<div class="reveal-area">';
                for (let i = 0; i < totalSlots; i++) {
                     // Add 'revealed' class for CSS transition
                     const revealedClass = i < completedTasks ? ' revealed' : '';
                     const iconType = i < completedTasks ? 'diamond is-small' : 'star is-empty is-small';
                     revealHTML += `<span class="reveal-item Nes nes-icon ${iconType}${revealedClass}"></span>`; // Use NES icon
                }
                 revealHTML += '</div>';
                 gameProgressArea.innerHTML = revealHTML;
                 gameStatusText.textContent = `Revealed: ${completedTasks} / ${totalTasks}`;

                 gameVisual.style.opacity = 1; // Reset
                 gameVisual.style.transform = 'scale(1)'; // Reset
                 gameVisual.style.filter = 'none';

                 break;

            default:
                gameStatusText.textContent = `Completed: ${completedTasks} / ${totalTasks}`;
                gameVisual.style.opacity = 1; // Reset
                gameVisual.style.transform = 'scale(1)'; // Reset
                 gameVisual.style.filter = 'none';
        }

         // Update main visual element with base HTML, CSS will handle transitions/effects
         // We update gameVisual.innerHTML only once per render, then CSS/JS manipulate spans within it
         if (['build', 'fill', 'charge'].includes(currentGame.progressType)) {
              // For build/fill/charge, the specific visual element (like potion/crystal) is in the base HTML
              // Don't overwrite gameVisual.innerHTML completely here if it contains spans we manipulate
              // Instead, rely on the initial render to set the base HTML structure
              // Let's set the base visual ONCE when game changes, then manipulate children in switch
              if (!gameVisual.innerHTML || gameVisual.dataset.gameId !== currentGame.id) {
                  gameVisual.innerHTML = currentVisualHTML;
                  gameVisual.dataset.gameId = currentGame.id; // Store current game ID on element
              }
              gameVisual.classList.toggle('defeated', gameWinState);

         } else {
             // For other types (health, steps, reveal), the whole visual might change or be simpler
             gameVisual.innerHTML = currentVisualHTML;
             gameVisual.dataset.gameId = currentGame.id;
             gameVisual.classList.toggle('defeated', gameWinState);
             gameVisual.style.opacity = gameWinState ? (currentGame.defeatedVisual ? 0.8 : 1) : 1; // Apply defeat opacity if defeatedVisual exists
             gameVisual.style.transform = gameWinState ? (currentGame.defeatedVisual ? 'rotate(-5deg) scale(0.95)' : 'scale(1)') : 'scale(1)';
             gameVisual.style.filter = 'none'; // Ensure filter is off for types that don't use it
         }


        // Show victory message if game is won
        if (gameWinState && !victoryMessage.classList.contains('is-success')) { // Check class to avoid re-triggering
            victoryMessage.textContent = currentGame.victoryText || "Quest Complete!";
            victoryMessage.classList.remove('hidden');
            victoryMessage.classList.add('is-success'); // Use nes.css success text style
            playSound(victorySound);

             // Add a small visual flourish on win (scale effect)
             gameVisual.style.transform = 'scale(1.1)';
             setTimeout(() => {
                 // Reset transform unless it's a type that uses transform for defeat state
                 if (!gameWinState || !currentGame.defeatedVisual) {
                      gameVisual.style.transform = 'scale(1)';
                 }
             }, 300);

        } else if (!gameWinState) {
            victoryMessage.classList.add('hidden');
            victoryMessage.classList.remove('is-success');
        }

         // Ensure victory message matches day completion state if applicable
         if(isDayCompleteState && gameWinState){
             victoryMessage.classList.remove('hidden');
             victoryMessage.textContent = currentGame.victoryText || "Quest Complete!";
             victoryMessage.classList.add('is-success');
         }


    }

    // Render the task lists UI
    function renderTasks() {
        todoList.innerHTML = '';
        completedList.innerHTML = '';

        let hasIncomplete = false;
        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;

        if (totalTasksCount === 0) {
            todoList.innerHTML = '<li class="task-placeholder">No quests yet... Add one!</li>';
             completedList.innerHTML = '<li class="task-placeholder">No completed quests yet.</li>';
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
             if (!hasIncomplete) {
                 todoList.innerHTML = '<li class="task-placeholder">All quests done!</li>';
             }
             if (completedTasksCount === 0) {
                 completedList.innerHTML = '<li class="task-placeholder">No completed quests yet.</li>';
             }
        }


        renderGameArea(); // Update game progress visuals
        saveState(); // Save tasks and completion state
        setDayCompletionStyling(); // Apply UI blocking based on state
    }

    // Create LI element for a task (minor changes for styling)
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);
        li.classList.add('task-item'); // Add class for potential future styling/transitions
        if (task.completed) {
             li.classList.add('is-completed');
             // Set the checked attribute for ARIA purposes
             li.setAttribute('aria-checked', 'true');
        } else {
             li.setAttribute('aria-checked', 'false');
        }
        li.setAttribute('role', 'checkbox'); // Indicate it's a toggleable item


        const textSpan = document.createElement('span');
        textSpan.textContent = task.text;
        textSpan.classList.add('task-text');
        li.appendChild(textSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');

        // Edit Button (only for ToDo tasks, and if day isn't complete)
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="Nes nes-icon edit is-small"></i>';
        editBtn.classList.add('Nes', 'nes-btn', 'is-small', 'is-warning'); // Warning color for edit
        editBtn.title = "Edit Quest";
        // Disabled state is handled by setDayCompletionStyling via pointer-events/disabled
        editBtn.addEventListener('click', (e) => {
             e.stopPropagation(); // Prevent triggering LI click
             if (!isDayCompleteState) {
                 editTask(task.id, li);
             }
        });
         // Add to actions regardless, CSS can hide/disable
        actionsDiv.appendChild(editBtn);


        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="Nes nes-icon close is-small"></i>';
        deleteBtn.classList.add('Nes', 'nes-btn', 'is-error', 'is-small');
        deleteBtn.title = "Discard Quest";
        // Disabled state is handled by setDayCompletionStyling
        deleteBtn.addEventListener('click', (e) => {
             e.stopPropagation(); // Prevent triggering LI click
             if (!isDayCompleteState) { // Only allow delete if day isn't complete
                 deleteTask(task.id);
             } else {
                  // Maybe allow deleting from completed list even if day complete? User preference.
                  // For now, restrict delete if day is complete for simplicity.
                  // To allow delete from completed: Remove this check OR add is-completed check.
             }
        });
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
        if (isDayCompleteState) return;
        const text = newTaskInput.value.trim();
        if (text === '') {
            // Visual feedback instead of alert
            newTaskInput.classList.add('input-error');
            newTaskInput.placeholder = 'Quest cannot be empty!';
            setTimeout(() => {
                 newTaskInput.classList.remove('input-error');
                 newTaskInput.placeholder = 'Enter quest details...';
            }, 1500); // Remove error state after 1.5 seconds
            newTaskInput.focus();
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

        let taskCompletedNow = false;
        tasks = tasks.map(task => {
            if (task.id === id) {
                taskCompletedNow = !task.completed;
                return { ...task, completed: taskCompletedNow };
            }
            return task;
        });

        if (taskCompletedNow) {
             // Optional: Add temporary animation class before re-rendering moves it
             const li = document.querySelector(`li[data-id='${id}']`);
             if(li) {
                 li.classList.add('completing'); // Add class for CSS animation
                 setTimeout(() => {
                     playSound(completeSound);
                     renderTasks(); // Re-render after a short delay to show animation
                 }, 300); // Match CSS transition duration
             } else {
                  // Fallback if element not found
                 playSound(completeSound);
                 renderTasks();
             }
        } else {
            // If un-completing, just re-render immediately
            renderTasks();
        }

        // Win condition check is now handled within renderGameArea, which is called by renderTasks
    }

    // Delete a task
    function deleteTask(id) {
        if (isDayCompleteState) return; // Restrict delete if day complete
        if (confirm('Discard this quest forever?')) {
            tasks = tasks.filter(task => task.id !== id);
            renderTasks();
        }
    }

    // Edit Task (Inline)
    function editTask(id, listItem) {
         if (isDayCompleteState) return;
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const textSpan = listItem.querySelector('.task-text');
        const currentText = task.text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input', 'Nes', 'nes-input');
        input.style.fontSize = 'inherit';
        input.style.flexGrow = '1';
        input.style.marginBottom = '0'; // Remove nes-input default margin if any
        input.style.boxSizing = 'border-box'; // Include padding in width

        textSpan.replaceWith(input);
        input.focus();
        input.select(); // Select text for easy editing

        const saveEdit = () => {
            // Check if input is still in the DOM (not replaced by escape)
            if(listItem.contains(input)) {
                const newText = input.value.trim();
                tasks = tasks.map(t => t.id === id ? { ...t, text: newText || currentText } : t); // Keep old text if empty
                renderTasks(); // Always re-render to replace input with span
            }
        };

        // Use event listeners on the input itself
        input.addEventListener('blur', saveEdit, { once: true }); // Save on blur, only once
        input.addEventListener('keypress', (e) => {
             if (e.key === 'Enter') {
                  input.blur(); // Trigger blur to save
             }
        });
        input.addEventListener('keydown', (e) => {
             if (e.key === 'Escape') {
                 // Stop the blur event from saving
                 input.removeEventListener('blur', saveEdit);
                 renderTasks(); // Re-render to cancel editing
             }
        });
    }

    // --- Day Completion and Report ---
    function completeDay() {
        if (isDayCompleteState) return; // Already complete

        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const allDone = completedTasks === totalTasks;

        if (totalTasks === 0) {
             // Replace alert with a temporary message or NES dialog
             newTaskInput.classList.add('input-error');
             newTaskInput.placeholder = 'Add quests first!';
             setTimeout(() => {
                  newTaskInput.classList.remove('input-error');
                  newTaskInput.placeholder = 'Enter quest details...';
             }, 2000);
             newTaskInput.focus();
             return;
         }
         if (!allDone) {
             // Replace confirm with NES dialog later if needed
             if (!confirm("You haven't finished all your quests. Complete the day anyway?")) {
                 return;
             }
         }

        // Mark day as complete
        isDayCompleteState = true;
        saveState();
        setDayCompletionStyling(); // Apply UI blocking and show modal

    }

    function showMissionReport() {
         // Generate Report content
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const gameWon = totalTasks > 0 && completedTasks === totalTasks;


        reportDate.textContent = `Date: ${new Date().toLocaleDateString()}`;
        reportSummary.textContent = `Quests Attempted: ${totalTasks} | Quests Completed: ${completedTasks}`;
        reportTaskList.innerHTML = ''; // Clear previous list
        if (completedTasks === 0) {
             reportTaskList.innerHTML = '<li>None completed.</li>';
        } else {
            tasks.filter(t => t.completed).forEach(t => {
                const li = document.createElement('li');
                li.textContent = t.text;
                reportTaskList.appendChild(li);
            });
        }

        // Game Status
        reportGameStatus.textContent = `Daily Challenge (${currentGame.name}): ${gameWon ? 'SUCCESSFUL!' : 'Incomplete'}`;
        reportGameStatus.classList.toggle('is-success', gameWon);


         // Show modal
         missionReportModal.classList.remove('hidden');
    }

    function closeMissionReport() {
        missionReportModal.classList.add('hidden');
        // The day remains complete, UI stays blocked until "Start New Day"
    }

    // Clear all tasks for a new day
    function startNewDay(auto = false) { // Added optional 'auto' parameter
        if (!auto && !isDayCompleteState && tasks.length > 0) {
            // Replace confirm with NES dialog later
            if (!confirm('Start a fresh day? Current unfinished quests will be lost.')) {
                 return;
             }
        }

        isDayCompleteState = false;
        tasks = [];
        saveState(); // Save cleared tasks and completion state

        // Determine a NEW game for the new day (based on new date)
        determineGame(); // This function now saves the new daily game selection automatically if needed

        renderTasks(); // Render empty lists and initial game state
        setDayCompletionStyling(); // Remove blocking styles
        missionReportModal.classList.add('hidden'); // Ensure report is hidden

        // Reset game visual specific styles that might persist
        gameVisual.style.transform = 'scale(1)';
        gameVisual.style.opacity = 1;
        gameVisual.style.filter = 'none';
         if(gameVisual.querySelector('.potion-bottle')) gameVisual.querySelector('.potion-bottle').style.filter = 'none';
         if(gameVisual.querySelector('.crystal-base')) {
              gameVisual.querySelector('.crystal-base').style.transform = 'scale(1)';
              gameVisual.querySelector('.crystal-base').style.filter = 'none';
         }


        newTaskInput.focus(); // Focus input for quick start
        console.log("New day started.");
    }

     // Helper to play sound safely
     function playSound(audioElement) {
         if (audioElement && typeof audioElement.play === 'function') {
             audioElement.currentTime = 0; // Rewind to start
             audioElement.play().catch(error => {
                 // Autoplay was prevented - common issue. Log but don't break.
                 // The 'click once' listener on body helps mitigate this.
                 console.warn("Audio playback prevented:", error);
             });
         }
     }

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
    gameSelectDropdown.addEventListener('change', handleGameChange);
    completeDayBtn.addEventListener('click', completeDay);
    newDayBtn.addEventListener('click', () => startNewDay(false)); // Explicitly not automatic
    closeReportBtn.addEventListener('click', closeMissionReport);
    missionReportModal.addEventListener('click', (e) => {
         // Only close if clicking the direct overlay, not the dialog content
         if (e.target === missionReportModal) {
             closeMissionReport();
         }
     });

    // --- Initial Load ---
    function init() {
        populateGameSelector(); // Populate dropdown first
        loadState(); // Load tasks, completion state, and check for auto new day
        // determineGame() is now called inside loadState if needed, or called here initially
        // to ensure currentGame is set if loadState didn't trigger new day
        if (!currentGame) {
             determineGame();
        }

        renderTasks(); // Render everything based on loaded state (includes renderGameArea)
        updateDateTime(); // Initial date/time display
        dateTimeInterval = setInterval(updateDateTime, 1000); // Update time every second

        // setDayCompletionStyling() is called by renderTasks and loadState

        if (!isDayCompleteState) {
             newTaskInput.focus();
         }

        console.log("App initialized.");
    }

    init();
});
