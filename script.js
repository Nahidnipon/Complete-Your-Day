document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeMessage = document.getElementById('welcome-message');
    const dateTimeDisplay = document.getElementById('date-time');
    const gameSelectDropdown = document.getElementById('game-select-dropdown');
    const gameTitle = document.getElementById('game-title');
    const gameVisual = document.getElementById('game-visual');
    const gameProgressArea = document.getElementById('game-progress');
    const gameStatusText = document.getElementById('game-status-text'); // Target this element
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

    // New Modal Elements (Incomplete Tasks)
    const incompleteDialogOverlay = document.getElementById('incomplete-dialog-overlay');
    const incompleteDialogTitle = document.getElementById('incomplete-dialog-title');
    const incompleteDialogMessage = document.getElementById('incomplete-dialog-message');
    const incompleteTaskList = document.getElementById('incomplete-task-list');
    const cancelCompleteBtn = document.getElementById('cancel-complete-btn');
    const forceCompleteBtn = document.getElementById('force-complete-btn');

    // New Profile Elements
    const profileSection = document.querySelector('.profile-section'); // Get the container
    const profileIconSpan = document.getElementById('profile-icon');
    const playerNameSpan = document.getElementById('player-name');
    const playerLevelSpan = document.getElementById('player-level');
    const editProfileBtn = document.getElementById('edit-profile-btn');

    // New Modal Elements (Profile Edit)
    const profileEditModal = document.getElementById('profile-edit-modal');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileIconSelection = document.getElementById('profile-icon-selection');
    const cancelProfileEditBtn = document.getElementById('cancel-profile-edit-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');


    // --- Audio ---
    let completeSound, victorySound;
    try {
        // Assuming 'audio' folder at root level containing complete.wav and victory.wav
        completeSound = new Audio('audio/complete.wav');
        victorySound = new Audio('audio/victory.wav');
        completeSound.preload = 'auto'; // Start loading early
        victorySound.preload = 'auto';   // Start loading early
        // Attempt to unlock audio context on first user interaction (e.g., a click)
        // This is a common workaround for browser autoplay policies.
        document.body.addEventListener('click', () => {
            // Attempt to play both sounds with volume 0 on first interaction
            // This should unlock them for later actual playback
             if (completeSound.paused && completeSound.readyState >= 2) { // Check if loaded (at least enough data)
                 completeSound.volume = 0;
                 completeSound.play().then(() => completeSound.volume = 1).catch(e => console.warn("Complete sound unlock failed:", e));
             }
             if (victorySound.paused && victorySound.readyState >= 2) {
                 victorySound.volume = 0;
                 victorySound.play().then(() => victorySound.volume = 1).catch(e => console.warn("Victory sound unlock failed:", e));
             }
        }, { once: true }); // Only trigger the listener once

    } catch (e) {
        console.error("Could not load audio files. Ensure 'audio/complete.wav' and 'audio/victory.wav' exist.", e);
        // Create dummy objects to prevent errors later
        completeSound = { play: () => {}, paused: true, readyState: 4, volume: 1 }; // Mimic Audio object properties
        victorySound = { play: () => {}, paused: true, readyState: 4, volume: 1 };
    }


    // --- Game Definitions (Full visual stages and descriptions) ---
    // visualStages[i] corresponds roughly to completing i tasks, capped at the last index.
    // The final stage (index length-1) is typically shown just before completion,
    // and defeatedVisual is shown *at* completion.
    const GAME_THEMES = [
        {
            id: 'dragon', name: "Dragon's Downfall", progressType: 'health',
            victoryText: "VICTORY! The Dragon is vanquished!",
            visualStages: [
                '🔥🐉🔥', '🛡️🐉', '⚔️🐉', '💥🐉', '🤕🐉', '😩🐉' // 0 to 5+ tasks
            ],
            defeatedVisual: '💀',
            stageDescriptions: [
                "The mighty Dragon awakens...", // 0 tasks
                "A brave adventurer approaches!", // 1 task
                "The battle begins!",          // 2 tasks
                "The Dragon takes damage!",     // 3 tasks
                "The Dragon is wounded!",       // 4 tasks
                "The Dragon falters..."         // 5+ tasks (until total reached)
            ],
            finalDescription: "The Dragon is defeated!", // When all tasks are done
            incompleteMessage: "The Dragon still breathes fire! Complete your remaining quests to defeat it."
        },
        {
            id: 'mountain', name: "Mountain Climb", progressType: 'steps',
            victoryText: "PEAK CONQUERED! You reached the summit!",
            visualStages: [
                '⛰️', '🧗⛰️', '🧗‍♀️⛰️', '🧗‍♂️⛰️', '🏔️旗' // 0 to 4+ tasks
            ],
            defeatedVisual: '🏆',
            stageDescriptions: [
                "The towering peak looms...", // 0 tasks
                "Beginning the ascent.",     // 1 task
                "Halfway up the treacherous path!", // 2 tasks
                "The summit is within reach!", // 3 tasks
                "Scaling the final section!" // 4+ tasks
            ],
            finalDescription: "You reached the summit!",
             incompleteMessage: "You haven't reached the top yet! Complete your remaining quests to conquer the peak."
        },
        {
            id: 'castle', name: "Build the Castle", progressType: 'build',
            victoryText: "FORTIFIED! Your castle stands strong!",
             visualStages: [
                 ' foundations ', // 0 tasks
                 '🧱',          // 1 task
                 '🧱🧱',        // 2 tasks
                 '🧱🏛️🧱',       // 3 tasks
                 '🏰旗'         // 4+ tasks
            ],
            defeatedVisual: '🏰✨',
            stageDescriptions: [
                 "Preparing the grounds...", // 0 tasks
                 "Laying the first bricks!", // 1 task
                 "Walls are rising!",       // 2 tasks
                 "Adding defenses and towers!",// 3 tasks
                 "The keep and banner are ready!" // 4+ tasks
             ],
             finalDescription: "Your castle stands strong!",
             incompleteMessage: "The castle is unfinished! Complete your remaining quests to secure the fort."
        },
        {
            id: 'map', name: "Uncover Treasure", progressType: 'reveal',
            victoryText: "TREASURE FOUND! X marks the spot!",
            visualStages: [
                '❓🗺️❓', // 0 tasks
                '🗺️🔍',   // 1 task
                '🗺️📍',   // 2 tasks
                '🗺️⛏️',   // 3 tasks
                '🗺️💎'    // 4+ tasks
            ],
            defeatedVisual: '💰👑',
            stageDescriptions: [
                "A worn, cryptic map...", // 0 tasks
                "Following faint clues...", // 1 task
                "The location is marked!", // 2 tasks
                "Digging for the buried chest...", // 3 tasks
                "A glint of gold appears!" // 4+ tasks
            ],
            finalDescription: "X marks the spot! Treasure found!",
             incompleteMessage: "The map is incomplete! Complete your remaining quests to find the treasure."
        },
        {
             id: 'escape', name: "The Great Escape", progressType: 'steps',
             victoryText: "ESCAPED! Freedom at last!",
             visualStages: [
                 '🔒🧱',  // 0 tasks
                 '🏃🧱',  // 1 task
                 '🏃💨🧱',// 2 tasks
                 '🏃💨🚧',// 3 tasks
                 '🏃💨🌳' // 4+ tasks
             ],
             defeatedVisual: '🌅',
             stageDescriptions: [
                 "Trapped in the dungeon!", // 0 tasks
                 "Searching for an exit...", // 1 task
                 "Found a way out!",       // 2 tasks
                 "Navigating obstacles!",  // 3 tasks
                 "Freedom is just ahead!"  // 4+ tasks
             ],
             finalDescription: "You have escaped!",
             incompleteMessage: "The path is blocked! Complete your remaining quests to make your escape."
        },
        {
             id: 'voyage', name: "Cosmic Voyage", progressType: 'steps',
             victoryText: "DESTINATION REACHED! A successful journey!",
             visualStages: [
                 '🚀',    // 0 tasks
                 '🚀🌌',  // 1 task
                 '🚀🪐',  // 2 tasks
                 '🪐✨',  // 3 tasks
                 '🪐🎉'   // 4+ tasks
             ],
             defeatedVisual: '🪐🏠',
             stageDescriptions: [
                 "Preparing for launch...",    // 0 tasks
                 "Cruising through the cosmos...",// 1 task
                 "Destination in sight!",    // 2 tasks
                 "Entering the planet's orbit!",// 3 tasks
                 "Successful landing!"        // 4+ tasks
             ],
             finalDescription: "Destination reached!",
             incompleteMessage: "The journey is unfinished! Complete your remaining quests to reach the destination."
        },
        {
             id: 'elixir', name: "Brew the Elixir", progressType: 'fill',
             victoryText: "POTION BREWED! Magical power awaits!",
             visualStages: [
                 '🧪',      // 0 tasks
                 '🧪🔴',    // 1 task
                 '🧪🟠',    // 2 tasks
                 '🧪🟡',    // 3 tasks
                 '🧪🟢',    // 4 tasks
                 '✨🧪✨'   // 5+ tasks
             ],
             defeatedVisual: '✨🧪✨',
             stageDescriptions: [
                 "Gathering rare ingredients...",// 0 tasks
                 "Adding the crimson leaf...", // 1 task
                 "The mixture simmers warmly...",// 2 tasks
                 "A golden light appears...", // 3 tasks
                 "Vibrant green hue forms!",  // 4 tasks
                 "Bubbling with magical energy!" // 5+ tasks
             ],
             finalDescription: "The Elixir is ready!",
             incompleteMessage: "The potion is incomplete! Complete your remaining quests to finish brewing it."
        },
         {
             id: 'bean', name: "Grow the Magic Bean", progressType: 'build',
             victoryText: "IT'S HUGE! The beanstalk reaches the clouds!",
             visualStages: [
                 '🌰',    // 0 tasks
                 '🌱',    // 1 task
                 '🌿',    // 2 tasks
                 '🌲',    // 3 tasks
                 '🌳',    // 4 tasks
                 '☁️🌳'   // 5+ tasks
             ],
             defeatedVisual: '☁️🌳',
             stageDescriptions: [
                 "Planting the tiny seed...", // 0 tasks
                 "A small sprout appears!",  // 1 task
                 "Leaves unfurl rapidly...", // 2 tasks
                 "A sturdy stem takes form!",// 3 tasks
                 "Growing towards the sky!", // 4 tasks
                 "Reaching the cloud layer!" // 5+ tasks
             ],
             finalDescription: "The beanstalk is massive!",
             incompleteMessage: "The beanstalk is still growing! Complete your remaining quests to reach the top."
         },
         {
             id: 'crystal', name: "Charge the Crystal", progressType: 'charge',
             victoryText: "FULLY CHARGED! The crystal glows with power!",
             visualStages: [
                 '💎',       // 0 tasks
                 '💎⚡',     // 1 task
                 '💎⚡⚡',   // 2 tasks
                 '💎⚡⚡⚡', // 3 tasks
                 '💎✨⚡⚡✨',// 4 tasks
                 '💎💥'     // 5+ tasks
             ],
             defeatedVisual: '💎💥',
             stageDescriptions: [
                 "Placing the dull crystal...", // 0 tasks
                 "Building the initial charge...", // 1 task
                 "Energy surges within...",    // 2 tasks
                 "The crystal is humming!",    // 3 tasks
                 "Glowing intensely!",       // 4 tasks
                 "Radiating raw power!"      // 5+ tasks
             ],
             finalDescription: "The crystal is fully charged!",
             incompleteMessage: "The crystal needs more energy! Complete your remaining quests to charge it."
         },
         {
             id: 'fort', name: "Defend the Fort", progressType: 'build',
             victoryText: "SECURE! The fort is impenetrable!",
             visualStages: [
                 '🏕️',       // 0 tasks
                 '🏕️🧱',     // 1 task
                 '🏕️🧱🛡️',   // 2 tasks
                 '🏕️🧱🛡️🏹', // 3 tasks
                 '🏕️🧱🛡️🏹🔥',// 4 tasks
                 '👑🚩'     // 5+ tasks
             ],
             defeatedVisual: '👑🚩',
             stageDescriptions: [
                 "Setting up the camp...",    // 0 tasks
                 "Building the first defense wall!",// 1 task
                 "Reinforcing the fortifications!",// 2 tasks
                 "Manning the towers!",      // 3 tasks
                 "Bracing for the final push!",// 4 tasks
                 "The fort stands undefeated!"// 5+ tasks
             ],
             finalDescription: "The fort is secure!",
             incompleteMessage: "The fort is still vulnerable! Complete your remaining quests to secure your defenses."
         }
    ];

    const PROFILE_ICONS = ['👤', '🌟', '🚀', '🏰', '🐉', '🏆', '🗡️', '🧙', '🤖', '👾', '🐱', '🐶', '✨', '💡'];


    // --- State ---
    let tasks = [];
    let currentGame = null;
    let dateTimeInterval = null; // Store interval ID
    let isDayCompleteState = false;
    let gameWinState = false;
    let profile = { name: 'Adventurer', icon: '👤', level: 1 }; // Profile state

    const STORAGE_KEYS = {
        TASKS: 'vintageTasks_v5', // Increment version for structure changes
        GAME_INFO: 'vintageGameInfo_v5', // Stores { id: string, date: string }
        DAY_COMPLETE: 'vintageDayComplete_v5', // Stores boolean
        PROFILE: 'vintageProfile_v1' // New key for profile
    };

    // --- Functions ---

    // Update Date and Time display
    function updateDateTime() {
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        const dateStr = now.toLocaleDateString(undefined, dateOptions);
        const timeStr = now.toLocaleTimeString(undefined, timeOptions);
        dateTimeDisplay.textContent = `${dateStr} ${timeStr}`;
    }
     // Function to start the date/time interval
     function startDateTimeInterval() {
         if (!dateTimeInterval) { // Only set interval if it hasn't been set before
             dateTimeInterval = setInterval(updateDateTime, 1000); // Update time every second
         }
     }
     // Function to stop the date/time interval (useful on page unload, not strictly necessary here)
     function stopDateTimeInterval() {
         if (dateTimeInterval) {
             clearInterval(dateTimeInterval);
             dateTimeInterval = null;
         }
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
        const storedDate = storedGameInfo.date;
        const storedGameId = storedGameInfo.id;

        let gameIdToUse = null;

        // If stored game is for today's date AND it's a valid theme, use it
        if (storedDate === todayStr && storedGameId && GAME_THEMES.find(g => g.id === storedGameId)) {
             gameIdToUse = storedGameId;
        } else {
             // New day or no valid stored game for today: Pick daily game based on date hash
             let hash = 0;
             for (let i = 0; i < todayStr.length; i++) {
                 const char = todayStr.charCodeAt(i);
                 hash = ((hash << 5) - hash) + char;
                 hash = hash & hash; // Convert to 32bit integer
             }
             const gameIndex = Math.abs(hash) % GAME_THEMES.length;
             gameIdToUse = GAME_THEMES[gameIndex].id;
             // Automatically select this game in the dropdown & save it as the day's game
             saveGameSelection(gameIdToUse, todayStr);
        }

        currentGame = GAME_THEMES.find(g => g.id === gameIdToUse);
        if (!currentGame) { // Fallback if gameId is invalid or not found
             console.warn(`Game ID "${gameIdToUse}" not found. Falling back to first game.`);
             currentGame = GAME_THEMES[0];
             gameIdToUse = currentGame.id;
             saveGameSelection(gameIdToUse, todayStr); // Save fallback choice
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
            gameSelectDropdown.value = currentGame.id; // Revert if disabled
            return;
        }
        const selectedId = gameSelectDropdown.value;
        const selectedGame = GAME_THEMES.find(g => g.id === selectedId);

        if (selectedGame) {
            currentGame = selectedGame;
            saveGameSelection(selectedId, getCurrentDateString()); // Persist user choice for today
            renderTasks(); // Re-render everything based on the new game
            console.log(`User changed game to: ${currentGame.name}`);
        } else {
            console.warn("Invalid game selection:", selectedId);
            gameSelectDropdown.value = currentGame.id; // Revert dropdown
        }
    }

    // Load tasks, game info, day completion state, and profile
    function loadState() {
        const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        tasks = storedTasks ? JSON.parse(storedTasks) : [];

        const storedDayComplete = localStorage.getItem(STORAGE_KEYS.DAY_COMPLETE);
        isDayCompleteState = storedDayComplete === 'true';

        const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
        profile = storedProfile ? JSON.parse(storedProfile) : { name: 'Adventurer', icon: '👤', level: 1 }; // Default profile

        // Check if it's a new day since the last visit *and* the day was completed
        const lastVisitedDate = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_INFO))?.date;
        const todayStr = getCurrentDateString();

        if (isDayCompleteState && lastVisitedDate && lastVisitedDate !== todayStr) {
             console.log("Detected new day after previous day was completed. Starting fresh automatically.");
             startNewDay(true); // Trigger automatic new day
             return; // Stop loading old state further
        }
        // If not an automatic new day, proceed to determine game and render in init()
    }

    // Save tasks, day completion state, and profile
    function saveState() {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.DAY_COMPLETE, isDayCompleteState);
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }

     // Render Profile Section
     function renderProfile() {
         profileIconSpan.textContent = profile.icon;
         playerNameSpan.textContent = profile.name;
         playerLevelSpan.textContent = `Lv. ${profile.level}`;
         welcomeMessage.textContent = `Welcome ${profile.name}!`; // Update welcome message
     }

    // Apply/Remove Day Completed Styling/Blocking and manage victory message
    function setDayCompletionStyling() {
        // gameWinState is updated by renderGameArea
        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;
        const isGameWon = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

        mainContainer.classList.toggle('day-completed', isDayCompleteState);

        // Manage button/input/select disabled state using the 'disabled' attribute
        completeDayBtn.disabled = isDayCompleteState || tasks.length === 0 || (completedTasksCount < totalTasksCount);
        newDayBtn.disabled = false; // Always allow starting a new day
        addTaskBtn.disabled = isDayCompleteState;
        newTaskInput.disabled = isDayCompleteState;
        gameSelectDropdown.disabled = isDayCompleteState; // Disable changing game when day is complete

        // Update victory message visibility based on game win state
         if (isGameWon) {
              victoryMessage.textContent = currentGame.victoryText || "Quest Complete!";
              victoryMessage.classList.remove('hidden');
              victoryMessage.classList.add('is-success');
              playSound(victorySound); // Play victory sound if just won

         } else {
              victoryMessage.classList.add('hidden');
              victoryMessage.classList.remove('is-success');
         }

        // Manage modal visibility based on day state
         if (isDayCompleteState && missionReportModal.classList.contains('hidden') && !incompleteDialogOverlay.classList.contains('hidden')) {
             // Day just completed, incomplete dialog might be showing, wait for it to close.
             // The finalizeDayCompletion -> setDayCompletionStyling flow handles showing the report after the incomplete dialog closes.
         } else if (isDayCompleteState && missionReportModal.classList.contains('hidden')) {
             // Day is complete, and report is not shown -> show report
             showMissionReport();
         } else if (!isDayCompleteState) {
             // Day is not complete, ensure report is hidden
             missionReportModal.classList.add('hidden');
         }

        // Update report game status color (if report is visible)
        if (!missionReportModal.classList.contains('hidden')) {
             reportGameStatus.classList.toggle('is-success', isGameWon);
        }
    }

    // --- Game Rendering --- Progressive Visuals ---
    function renderGameArea() {
        // This function updates the visual, status text, and progress based on the current task state.
        // It is called by renderTasks whenever tasks change.
        if (!currentGame) {
            // Handle initial state before a game is determined
            gameTitle.textContent = '[Game Title Loading...]';
            gameVisual.innerHTML = '[Game Visual Loading...]';
            gameProgressArea.innerHTML = '';
            gameStatusText.textContent = '[Game Status Loading...]';
            victoryMessage.classList.add('hidden');
             // Do not return here, let setDayCompletionStyling run for initial UI state
        } else {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.completed).length;
            gameWinState = totalTasks > 0 && completedTasks === totalTasks;

            gameTitle.textContent = currentGame.name;

            // --- Determine Visual Stage and Description ---
            let currentVisualHTML = '';
            let currentDescription = '';

            if (totalTasks === 0) {
                // Default state when no tasks are added
                currentVisualHTML = currentGame.visualStages?.[0] || '🎮'; // Use first stage or default icon
                currentDescription = "Add quests to begin!";
            } else if (gameWinState) {
                // Game is won state
                currentVisualHTML = currentGame.defeatedVisual || currentGame.visualStages?.[(currentGame.visualStages?.length || 1) - 1] || '🎉'; // Use defeated visual or last stage
                currentDescription = currentGame.finalDescription || currentGame.stageDescriptions?.[(currentGame.stageDescriptions?.length || 1) - 1] || "Quest Complete!"; // Use final description or last stage description
            } else {
                // In-progress state
                // Determine the index for visual and description based on completed tasks.
                // The index should directly correspond to completed tasks count, capped by the number of stages.
                // If visualStages has N stages, indices are 0 to N-1.
                // visualStages[0] for 0 completed, visualStages[1] for 1 completed, ..., visualStages[N-1] for N-1 or more completed tasks (before hitting total).
                const maxStageIndex = (currentGame.visualStages?.length || 1) - 1;
                const stageIndex = Math.min(completedTasks, maxStageIndex);

                currentVisualHTML = currentGame.visualStages?.[stageIndex] || '🎮';
                currentDescription = currentGame.stageDescriptions?.[stageIndex] || `Progress: ${completedTasks} / ${totalTasks}`;
            }

            // --- Update Main Visual DOM with Opacity Transition ---
            // Always update the innerHTML. CSS opacity transition handles the visual fade.
            gameVisual.innerHTML = currentVisualHTML;

            // Reset specific inline styles that might have been applied by previous dynamic stages
            gameVisual.style.filter = '';
            gameVisual.style.transform = '';
            const potion = gameVisual.querySelector('.potion-bottle');
            if (potion) potion.style.filter = '';
            const crystal = gameVisual.querySelector('.crystal-base');
            if (crystal) { crystal.style.transform = ''; crystal.style.filter = ''; }

            // Apply gameWinState class immediately for CSS effects like pulse
            gameVisual.classList.toggle('defeated', gameWinState);

            // Always apply dynamic styles based on current state (e.g. glow intensity, opacity)
            // This helper function handles styles based on the *fraction* of completed tasks.
            applyDynamicGameVisualStyles(completedTasks, totalTasks);

            // --- Update Status Text ---
            // Always set the status text based on the determined description
            gameStatusText.textContent = currentDescription;


            // Clear previous progress elements
            gameProgressArea.innerHTML = '';

            // --- Render Progress specific to game type ---
            if (totalTasks > 0) {
                const progressPercent = (completedTasks / totalTasks) * 100;

                switch (currentGame.progressType) {
                    case 'health':
                        const healthPercent = 100 - progressPercent;
                        gameProgressArea.innerHTML = `
                            <div class="progress-bar-container">
                                <progress class="Nes nes-progress ${healthPercent < 30 ? 'is-error' : (healthPercent < 60 ? 'is-warning' : 'is-success')}" value="${healthPercent}" max="100"></progress>
                            </div>`;
                        break;

                    case 'steps':
                        let stepsHTML = '<div class="progress-steps">';
                        const characterHTML = currentGame.stepChar || '🚶';
                        for (let i = 0; i < totalTasks; i++) {
                            const stepClass = i < completedTasks ? 'step completed' : 'step';
                             let stepContent = '';
                             // Show character marker based on completed tasks count, placed *after* the last completed step (or on the last step if won)
                             if (i === completedTasks && !gameWinState) { // Show character on the first incomplete step
                                  stepContent = characterHTML;
                             } else if (i === totalTasks -1 && gameWinState && currentGame.id === 'mountain'){
                                  // Show flag on the last step div for mountain when won
                                 stepContent = '🚩';
                             } else if (i === totalTasks -1 && gameWinState) {
                                 // Optional: show a generic win marker on the last step for other step games when won
                                  stepContent = '🏁';
                             }
                             // Wrap content in a span for centering within the step div (requires CSS)
                            stepsHTML += `<div class="${stepClass}">${stepContent ? `<span>${stepContent}</span>` : ''}</div>`;
                        }
                        stepsHTML += '</div>';
                        gameProgressArea.innerHTML = stepsHTML;
                        break;

                     case 'build':
                         const buildPieces = currentGame.pieces || Array(totalTasks).fill('█');
                         let buildHTML = '<div class="build-progress">';
                         // Show pieces based on completed tasks, up to the number of defined pieces or total tasks
                         const piecesToShow = Math.min(completedTasks, buildPieces.length);
                         for (let i = 0; i < piecesToShow; i++) {
                            // Wrap piece in span for styling/animation (requires CSS)
                            buildHTML += `<span class="build-piece added">${buildPieces[i]}</span> `;
                         }
                         buildHTML += '</div>';
                         gameProgressArea.innerHTML = buildHTML;
                         break;

                     case 'fill':
                         // Use a simple text representation of fill level in progress area
                         const fillItem = currentGame.item || '💧';
                         // Array(completedTasks + 1).join('') creates a string with `completedTasks` items.
                         gameProgressArea.innerHTML = `<span class="fill-visual">${Array(completedTasks + 1).join(fillItem)}</span>`;
                         break;

                     case 'charge':
                         // Show charge symbols in progress area
                         const chargeItem = currentGame.item || '⚡';
                         gameProgressArea.innerHTML = `<span class="charge-indicator">${Array(completedTasks + 1).join(chargeItem)}</span>`;
                         break;

                    case 'reveal':
                        let revealHTML = '<div class="reveal-area">';
                        const revealItemHTML = currentGame.item || '<span class="nes-icon diamond is-small"></span>';
                        const placeholderItemHTML = '<span class="nes-icon star is-empty is-small"></span>'; // Default placeholder
                        for (let i = 0; i < totalTasks; i++) {
                             const itemHtmlContent = i < completedTasks ? revealItemHTML : placeholderItemHTML;
                             const revealedClass = i < completedTasks ? ' revealed' : '';
                             // Wrap item in span for styling/animation (requires CSS)
                             revealHTML += `<span class="reveal-item${revealedClass}">${itemHtmlContent}</span>`;
                        }
                         revealHTML += '</div>';
                         gameProgressArea.innerHTML = revealHTML;
                        break;

                    default:
                        // Default progress display if type is missing or unknown
                        gameProgressArea.textContent = `Completed: ${completedTasks} / ${totalTasks}`;
                }
            } else {
                // No tasks, clear progress area
                 gameProgressArea.innerHTML = '';
            }
        }


        // setDayCompletionStyling() is called by renderTasks which calls renderGameArea
        // It will handle victory message visibility and sound based on gameWinState
    }

    // Helper function to apply dynamic styles to game visual elements
    // This function is called by renderGameArea *after* the main visual HTML is updated
    // and also on initial load/game change to ensure correct styles are applied.
    function applyDynamicGameVisualStyles(completedTasks, totalTasks) {
        if (!currentGame || !gameVisual) return;

        const progressFraction = totalTasks > 0 ? completedTasks / totalTasks : 0;

        // Reset any previous dynamic styles that might not apply anymore
        // Note: Some styles like 'defeated' class are handled directly in renderGameArea
        gameVisual.style.opacity = ''; // Reset opacity unless specifically set below
        gameVisual.style.transform = ''; // Reset transform unless specifically set below
        gameVisual.style.filter = ''; // Reset filter unless specifically set below

        const potion = gameVisual.querySelector('.potion-bottle');
        if (potion) potion.style.filter = '';
        const crystal = gameVisual.querySelector('.crystal-base');
        if (crystal) { crystal.style.transform = ''; crystal.style.filter = ''; }


        if (gameWinState) {
             // Apply specific final state styles if needed (override general progress styles)
             if (currentGame.id === 'crystal' && crystal) {
                  // Static, strong glow for final state
                  crystal.style.filter = 'drop-shadow(0 0 20px #fff) drop-shadow(0 0 10px cyan) saturate(150%)';
             }
              // CSS animation 'pulse-victory' is handled by .game-visual-area.defeated class

        } else if (totalTasks > 0) { // Only apply dynamic in-progress styles if there are tasks and not won
             // Apply dynamic styles based on progress fraction
             if (currentGame.id === 'elixir' && potion) {
                 const hue = 120 * progressFraction; // Green shift (0 to 120)
                 const satur = 50 + progressFraction * 100; // Saturation increase (50% to 150%)
                 const lightness = 50 + progressFraction * 20; // Slight lightness increase (50% to 70%)
                 potion.style.filter = `hue-rotate(${hue}deg) saturate(${satur}%) brightness(${lightness}%)`;
             }
             if (currentGame.id === 'crystal' && crystal) {
                 const glowIntensity = progressFraction * 15; // Max 15px glow
                 const scaleFactor = 1 + (progressFraction * 0.1); // Grow slightly (1 to 1.1)
                 crystal.style.transform = `scale(${scaleFactor})`;
                 crystal.style.filter = `drop-shadow(0 0 ${glowIntensity}px #fff) drop-shadow(0 0 ${glowIntensity/2}px cyan)`;
             }
             // Add other dynamic styles for different games here if needed
             if (currentGame.id === 'dragon') {
                 const healthPercent = 100 - progressFraction * 100;
                 // Adjust opacity based on remaining health (100% health = 1.0 opacity, 0% health = 0.6 opacity)
                 gameVisual.style.opacity = 0.6 + (healthPercent / 100) * 0.4;
                 // Could add a 'shaking' class here if health is very low (e.g., healthPercent < 20)
                 // if (healthPercent < 20 && !gameVisual.classList.contains('shaking')) gameVisual.classList.add('shaking');
                 // else if (healthPercent >= 20 && gameVisual.classList.contains('shaking')) gameVisual.classList.remove('shaking');
             }
        } else {
            // Case: totalTasks === 0
            // Ensure styles are reset to default (should mostly be handled by CSS defaults, but explicit reset is safe)
             gameVisual.style.opacity = 1;
             gameVisual.style.transform = 'scale(1)';
             gameVisual.style.filter = 'none';
        }
    }


    // Render the task lists UI
    function renderTasks() {
        // This function updates the lists and then triggers updates for the game area and UI styling.
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

        // Render game area needs to happen *after* tasks are rendered/counted as it depends on task state
        renderGameArea();

        // Save state needs to happen after tasks and game state are potentially updated by rendering
        saveState();

        // setDayCompletionStyling is called here to ensure UI state (button disabled, etc.) matches rendered tasks/game state
        setDayCompletionStyling();
    }

    // Create LI element for a task
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);
        li.classList.add('task-item');
        if (task.completed) {
             li.classList.add('is-completed');
             li.setAttribute('aria-checked', 'true');
        } else {
             li.setAttribute('aria-checked', 'false');
        }
        li.setAttribute('role', 'checkbox');


        const textSpan = document.createElement('span');
        textSpan.textContent = task.text;
        textSpan.classList.add('task-text');
        li.appendChild(textSpan);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');

        // Edit Button (only for ToDo tasks, and if day isn't complete)
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="Nes nes-icon edit is-small"></i>';
        editBtn.classList.add('Nes', 'nes-btn', 'is-small', 'is-warning');
        editBtn.title = "Edit Quest";
        // Disable if day complete or task is completed
        editBtn.disabled = isDayCompleteState || task.completed;
        editBtn.addEventListener('click', (e) => {
             e.stopPropagation();
             if (!editBtn.disabled) { // Check disabled state again on click
                 editTask(task.id, li);
             }
        });
        actionsDiv.appendChild(editBtn);


        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="Nes nes-icon close is-small"></i>';
        deleteBtn.classList.add('Nes', 'nes-btn', 'is-error', 'is-small');
        deleteBtn.title = "Discard Quest";
        // Allow deleting completed tasks even if day complete, but not incomplete ones
        deleteBtn.disabled = isDayCompleteState && !task.completed;
        deleteBtn.addEventListener('click', (e) => {
             e.stopPropagation();
              if (!deleteBtn.disabled) { // Check disabled state again on click
                 deleteTask(task.id);
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
        if (isDayCompleteState) return; // Prevent adding if day complete
        const text = newTaskInput.value.trim();
        if (text === '') {
            // Visual feedback instead of alert
            newTaskInput.classList.add('input-error');
            newTaskInput.placeholder = 'Quest cannot be empty!';
            // Reset placeholder and class after animation ends
            newTaskInput.addEventListener('animationend', () => {
                newTaskInput.classList.remove('input-error');
                newTaskInput.placeholder = 'Enter quest details...';
            }, { once: true });
            newTaskInput.focus();
            return;
        }
        tasks.push({ id: Date.now(), text: text, completed: false });
        newTaskInput.value = '';
        newTaskInput.focus();
        renderTasks(); // Re-render lists and update game area
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
             // Play sound *before* re-rendering which might remove the element from the DOM
             playSound(completeSound);
             // Add a temporary class for CSS animation before re-rendering moves the element
             const li = document.querySelector(`li[data-id='${id}']`);
             if(li) {
                 li.classList.add('completing');
                 // Re-render after a short delay to allow animation to be seen
                 setTimeout(renderTasks, 300); // Match CSS transition duration
             } else {
                 // Fallback if element not found, just re-render immediately
                 renderTasks();
             }
        } else {
            // If un-completing, just re-render immediately
            renderTasks();
        }
        // Win check, save, and styling are handled by renderTasks calling renderGameArea/setDayCompletionStyling
    }

    // Delete a task
    function deleteTask(id) {
        const taskToDelete = tasks.find(task => task.id === id);
        if (!taskToDelete) return;

        if (isDayCompleteState && !taskToDelete.completed) {
             // Prevent deleting incomplete tasks on a completed day
             console.log("Cannot delete incomplete tasks after completing the day.");
             return; // Or provide visual feedback
        }

        // Using NES dialogs would replace this confirm
        if (confirm('Discard this quest forever?')) {
            tasks = tasks.filter(task => task.id !== id);
            renderTasks(); // Re-render including game area update
        }
    }

    // Edit Task (Inline)
    function editTask(id, listItem) {
         if (isDayCompleteState) return; // Prevent editing if day complete
        const task = tasks.find(t => t.id === id);
        if (!task || task.completed) return; // Only edit incomplete tasks

        const textSpan = listItem.querySelector('.task-text');
        const currentText = task.text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input', 'Nes', 'nes-input');
        input.style.fontSize = 'inherit';
        input.style.flexGrow = '1';
        input.style.marginBottom = '0';
        input.style.boxSizing = 'border-box'; // Include padding in width

        textSpan.replaceWith(input); // Replace the span with the input
        input.focus();
        input.select(); // Select text for easy editing

        const saveEdit = () => {
            // Check if input is still in the DOM (not replaced by escape)
            if(listItem.contains(input)) {
                const newText = input.value.trim();
                tasks = tasks.map(t => t.id === id ? { ...t, text: newText || currentText } : t); // Keep old text if empty
                renderTasks(); // Always re-render to replace input with span and update game
            }
        };

        // Save on blur, only once.
        input.addEventListener('blur', saveEdit, { once: true });
        // Save on Enter keypress
        input.addEventListener('keypress', (e) => {
             if (e.key === 'Enter') {
                  input.blur(); // Trigger blur to save
             }
        });
        // Cancel on Escape keydown
        input.addEventListener('keydown', (e) => {
             if (e.key === 'Escape') {
                 input.removeEventListener('blur', saveEdit); // Prevent saving on blur after escape
                 // Re-create original span and replace input immediately
                 const originalSpan = document.createElement('span');
                 originalSpan.textContent = currentText;
                 originalSpan.classList.add('task-text');
                 input.replaceWith(originalSpan);
                 renderTasks(); // Re-render to ensure state consistency and re-attach event listeners
             }
        });
    }

    // --- Day Completion, Reports, and Leveling ---

    // Function to finalize the day completion process (called after confirm or force-complete)
    function finalizeDayCompletion() {
         if (isDayCompleteState) return; // Should not happen if called correctly

        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;
        const isGameWon = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

         isDayCompleteState = true; // Mark day as complete
         // Win check happens *before* saving state, so save includes final gameWinState
         saveState(); // Save completed state and tasks

         // Level Up if the game was won
         if (isGameWon) {
             levelUp(); // Increment level and update profile display (calls saveState internally)
         } else {
              // If not leveling up, ensure profile state is saved after day completion
              saveState();
         }


         setDayCompletionStyling(); // Apply UI blocking, show report
         // showMissionReport is called by setDayCompletionStyling
    }

     // Trigger day completion check
    function completeDay() {
        if (isDayCompleteState) return; // Already complete

        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;
        const allDone = completedTasksCount === totalTasksCount;
        const incompleteTasks = tasks.filter(task => !task.completed);


        if (totalTasksCount === 0) {
             // Prevent completing day with no tasks - provide feedback on input
             newTaskInput.classList.add('input-error');
             newTaskInput.placeholder = 'Add quests first!';
              newTaskInput.addEventListener('animationend', () => {
                 newTaskInput.classList.remove('input-error');
                 newTaskInput.placeholder = 'Enter quest details...';
             }, { once: true });
             newTaskInput.focus();
             return;
         }

         if (!allDone) {
             // Show incomplete tasks dialog if not all tasks are done
             showIncompleteTasksDialog(incompleteTasks);
         } else {
             // All tasks done, finalize day directly
             finalizeDayCompletion();
         }
    }

     // Show the incomplete tasks dialog
     function showIncompleteTasksDialog(incompleteTasks) {
         incompleteDialogTitle.textContent = currentGame.name; // Use game title for dialog theme
         incompleteDialogMessage.textContent = currentGame.incompleteMessage || "You still have quests to finish.";

         incompleteTaskList.innerHTML = '';
         if (incompleteTasks.length === 0) {
              incompleteTaskList.innerHTML = '<li>(No incomplete quests detected)</li>'; // Should not happen if called correctly
         } else {
             incompleteTasks.forEach(task => {
                 const li = document.createElement('li');
                 li.textContent = task.text;
                 incompleteTaskList.appendChild(li);
             });
         }

         incompleteDialogOverlay.classList.remove('hidden'); // Show the modal
     }

     // Hide the incomplete tasks dialog
     function closeIncompleteTasksDialog() {
         incompleteDialogOverlay.classList.add('hidden');
     }


    function showMissionReport() {
         // Ensure latest state is used for report
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

         reportGameStatus.textContent = `Daily Challenge (${currentGame.name}): ${gameWon ? 'SUCCESSFUL!' : 'Incomplete'}`;
         reportGameStatus.classList.toggle('is-success', gameWon);

         missionReportModal.classList.remove('hidden'); // Show the modal
     }


    function closeMissionReport() {
        missionReportModal.classList.add('hidden');
        // The day remains complete, UI stays blocked until "Start New Day" is clicked.
        // No further action needed here.
    }

    // Clear all tasks for a new day and reset state
    // auto: boolean - true if called automatically on new day load, false if user clicked button
    function startNewDay(auto = false) {
        // If not auto-started, confirm if there are unfinished tasks and the day wasn't completed
        if (!auto && !isDayCompleteState && tasks.length > 0 && tasks.filter(t => !t.completed).length > 0) {
            // Using NES dialogs would replace this confirm
            if (!confirm('Start a fresh day? Your unfinished quests will be lost forever.')) {
                 return; // User cancelled
             }
        }

        console.log("Starting new day...");
        isDayCompleteState = false; // Reset day completion state
        tasks = []; // Clear tasks
        gameWinState = false; // Reset win state

        saveState(); // Save cleared tasks and completion state

        // Determine a NEW game for the new day (based on the new date)
        determineGame(); // This function saves the new daily game selection automatically if needed

        renderTasks(); // Render empty lists and initial game state (calls renderGameArea and setDayCompletionStyling)

        // Reset specific game visual styles that might persist from winning/previous state
        gameVisual.style.transform = 'scale(1)';
        gameVisual.style.opacity = 1;
        gameVisual.style.filter = 'none';
         const potion = gameVisual.querySelector('.potion-bottle');
         if (potion) potion.style.filter = '';
         const crystal = gameVisual.querySelector('.crystal-base');
         if (crystal) { crystal.style.transform = ''; crystal.style.filter = ''; }


        missionReportModal.classList.add('hidden'); // Ensure report is hidden
        incompleteDialogOverlay.classList.add('hidden'); // Ensure incomplete dialog is hidden

        newTaskInput.focus(); // Focus input for quick start
        console.log("New day started.");
    }

    // Level Up function
    function levelUp() {
         profile.level++;
         console.log(`${profile.name} Leveled up to Lv. ${profile.level}!`);
         renderProfile(); // Update the profile display
         // saveState() is called by finalizeDayCompletion after levelUp
         // Optional: Add a visual level-up animation/effect
     }

    // --- Profile Editing ---
    function populateIconSelection() {
        profileIconSelection.innerHTML = ''; // Clear existing icons
        PROFILE_ICONS.forEach(icon => {
            const span = document.createElement('span');
            span.classList.add('icon-option');
            span.textContent = icon;
            span.setAttribute('data-icon', icon); // Store icon value
            if (icon === profile.icon) {
                span.classList.add('selected');
            }
            span.addEventListener('click', () => {
                // Deselect current
                profileIconSelection.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
                // Select clicked
                span.classList.add('selected');
            });
            profileIconSelection.appendChild(span);
        });
    }

    function showProfileEditModal() {
         // Populate modal fields with current profile data
         profileNameInput.value = profile.name;
         populateIconSelection(); // Populate and select current icon
         profileEditModal.classList.remove('hidden'); // Show modal
         profileNameInput.focus(); // Focus input
         profileNameInput.select(); // Select text on focus for easy replacement
     }

    function closeProfileEditModal() {
         profileEditModal.classList.add('hidden'); // Hide modal
     }

    function saveProfileEdit() {
         const newName = profileNameInput.value.trim();
         const selectedIconElement = profileIconSelection.querySelector('.icon-option.selected');
         const newIcon = selectedIconElement ? selectedIconElement.getAttribute('data-icon') : profile.icon; // Keep old icon if none selected

         // Update profile state
         profile.name = newName || profile.name; // Keep old name if empty
         profile.icon = newIcon;

         saveState(); // Save the updated profile
         renderProfile(); // Update the display in the header
         closeProfileEditModal();
     }


     // Helper to play sound safely
     function playSound(audioElement) {
         if (audioElement && typeof audioElement.play === 'function') {
             audioElement.currentTime = 0; // Rewind to start
             audioElement.play().catch(error => {
                 // Autoplay was prevented - common issue. Log but don't break.
                 console.warn("Audio playback prevented:", error);
             });
         }
     }

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
    gameSelectDropdown.addEventListener('change', handleGameChange);
    completeDayBtn.addEventListener('click', completeDay);
    newDayBtn.addEventListener('click', () => startNewDay(false)); // Explicitly not automatic start
    closeReportBtn.addEventListener('click', closeMissionReport);
    // Close modal if clicking overlay background
    missionReportModal.addEventListener('click', (e) => {
         if (e.target === missionReportModal) {
             closeMissionReport();
         }
     });

    // Incomplete Dialog Listeners
    cancelCompleteBtn.addEventListener('click', closeIncompleteTasksDialog);
    forceCompleteBtn.addEventListener('click', () => {
         closeIncompleteTasksDialog(); // Close dialog first
         finalizeDayCompletion(); // Then proceed with completing the day
     });
     // Close incomplete dialog if clicking overlay background
     incompleteDialogOverlay.addEventListener('click', (e) => {
          if (e.target === incompleteDialogOverlay) {
              closeIncompleteTasksDialog();
          }
     });

    // Profile Edit Listeners
    editProfileBtn.addEventListener('click', showProfileEditModal);
    cancelProfileEditBtn.addEventListener('click', closeProfileEditModal);
    saveProfileBtn.addEventListener('click', saveProfileEdit);
    // Close profile edit modal if clicking overlay background
    profileEditModal.addEventListener('click', (e) => {
         if (e.target === profileEditModal) {
             closeProfileEditModal();
         }
     });


    // --- Initial Load ---
    function init() {
        // Initial UI state setup - important for elements that might not be covered by renderTasks yet
         gameTitle.textContent = '[Game Title Loading...]';
         gameVisual.innerHTML = '[Game Visual Loading...]';
         gameProgressArea.innerHTML = '';
         gameStatusText.textContent = '[Game Status Loading...]';
         victoryMessage.classList.add('hidden');
         missionReportModal.classList.add('hidden');
         incompleteDialogOverlay.classList.add('hidden');
         profileEditModal.classList.add('hidden');


        loadState(); // Load all state first (tasks, day complete, profile, checks for auto new day)
        // determineGame() is called by loadState if auto new day, or needs to be called here otherwise
         if (!currentGame) { // Only call if loadState didn't trigger auto new day and set it
             determineGame(); // Sets currentGame and saves it for the day
         }

        renderProfile(); // Render profile display immediately based on loaded state

        // renderTasks() will be called next, which calls renderGameArea and setDayCompletionStyling
        // This handles the initial display of tasks and the game area based on the loaded state (or empty state).
        renderTasks();


        startDateTimeInterval(); // Start the clock interval


        if (!isDayCompleteState) {
             newTaskInput.focus(); // Focus input on start if day is not complete
         }

        console.log("App initialized.");
    }

    // --- Start the application ---
    init();
});
