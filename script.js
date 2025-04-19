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
    const reportStreakStatus = document.getElementById('report-streak-status'); // Get the new streak status element
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
    const profileSection = document.querySelector('.profile-section');
    const profileIconSpan = document.getElementById('profile-icon');
    const playerNameSpan = document.getElementById('player-name');
    // const playerLevelSpan = document.getElementById('player-level'); // Reused for streak
    const playerStreakSpan = document.getElementById('player-level'); // Use this variable name instead
    // const playerXpSpan = document.getElementById('player-xp'); // Removed XP span
    const editProfileBtn = document.getElementById('edit-profile-btn');

    // New Modal Elements (Profile Edit)
    const profileEditModal = document.getElementById('profile-edit-modal');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileIconSelection = document.getElementById('profile-icon-selection');
    const collectedItemsList = document.getElementById('collected-items-list'); // New: Collected items list in modal
    const noItemsMessage = document.getElementById('no-items-message'); // New: No items message
    const cancelProfileEditBtn = document.getElementById('cancel-profile-edit-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');


    // --- Audio ---
    let completeSound, victorySound; // victorySound will be reused for streak rewards
    try {
        completeSound = new Audio('audio/complete.wav');
        victorySound = new Audio('audio/victory.wav'); // Reused for rewards
        completeSound.preload = 'auto';
        victorySound.preload = 'auto';
        document.body.addEventListener('click', () => {
             if (completeSound.readyState >= 2) {
                 completeSound.volume = 0;
                 completeSound.play().then(() => completeSound.volume = 1).catch(e => console.warn("Complete sound unlock failed:", e));
             }
             if (victorySound.readyState >= 2) {
                 victorySound.volume = 0;
                 victorySound.play().then(() => victorySound.volume = 1).catch(e => console.warn("Victory sound unlock failed:", e));
             }
        }, { once: true });

    } catch (e) {
        console.error("Could not load audio files.", e);
        completeSound = { play: () => {}, paused: true, readyState: 0, volume: 1 };
        victorySound = { play: () => {}, paused: true, readyState: 0, volume: 1 };
    }


    // --- Game Definitions & Rewards ---

    // Define rewards based on streak count
    const REWARDS = [
        { streak: 1, item: '✨ First Quest Completed!' },
        { streak: 3, item: '🏆 Bronze Trophy' },
        { streak: 5, item: '🗡️ Rusty Sword' },
        { streak: 7, item: '🛡️ Wooden Shield' },
        { streak: 10, item: '💎 Small Gem' },
        { streak: 15, item: '👑 Iron Crown' },
        { streak: 20, item: '🔮 Mystic Orb' },
        { streak: 25, item: '🐉 Dragon Scale' },
        { streak: 30, item: '🌟 Hero\'s Star' },
         // Add more rewards for higher streaks
    ];


    const GAME_THEMES = [
        {
            id: 'dragon', name: "Dragon's Downfall", progressType: 'health',
            victoryText: "VICTORY! The Dragon is vanquished!",
            visualStages: [
                '🔥🐉🔥', '🛡️🐉', '⚔️🐉', '💥🐉', '🤕🐉', '😩🐉'
            ],
            defeatedVisual: '💀',
            stageDescriptions: [
                "The mighty Dragon awakens...",
                "A brave adventurer approaches!",
                "The battle begins!",
                "The Dragon takes damage!",
                "The Dragon is wounded!",
                "The Dragon falters..."
            ],
            finalDescription: "The Dragon is defeated!",
            incompleteMessage: "The Dragon still breathes fire! Complete your remaining quests to defeat it."
        },
        {
            id: 'mountain', name: "Mountain Climb", progressType: 'steps', stepChar: '🧗',
            victoryText: "PEAK CONQUERED! You reached the summit!",
            visualStages: [
                '⛰️', '⛰️', '⛰️', '⛰️', '🏔️'
            ],
            defeatedVisual: '🏆',
            stageDescriptions: [
                "The towering peak looms...",
                "Beginning the ascent.",
                "Halfway up the treacherous path!",
                "The summit is within reach!",
                "Scaling the final section!"
            ],
            finalDescription: "You reached the summit!",
             incompleteMessage: "You haven't reached the top yet! Complete your remaining quests to conquer the peak."
        },
        {
            id: 'castle', name: "Build the Castle", progressType: 'build', pieces: ['🧱','🧱','🏛️','🧱','🏰'],
            victoryText: "FORTIFIED! Your castle stands strong!",
             visualStages: [
                 ' foundations ',
                 '🧱',
                 '🧱🧱',
                 '🧱🏛️🧱',
                 '🏰旗'
            ],
            defeatedVisual: '🏰✨',
            stageDescriptions: [
                 "Preparing the grounds...",
                 "Laying the first bricks!",
                 "Walls are rising!",
                 "Adding defenses and towers!",
                 "The keep and banner are ready!"
             ],
             finalDescription: "Your castle stands strong!",
             incompleteMessage: "The castle is unfinished! Complete your remaining quests to secure the fort."
        },
        {
            id: 'map', name: "Uncover Treasure", progressType: 'reveal', item: '<span class="nes-icon coin is-small"></span>',
            victoryText: "TREASURE FOUND! X marks the spot!",
            visualStages: [
                '❓🗺️❓',
                '🗺️🔍',
                '🗺️📍',
                '🗺️⛏️',
                '🗺️💎'
            ],
            defeatedVisual: '💰👑',
            stageDescriptions: [
                "A worn, cryptic map...",
                "Following faint clues...",
                "The location is marked!",
                "Digging for the buried chest...",
                "A glint of gold appears!"
            ],
            finalDescription: "X marks the spot! Treasure found!",
             incompleteMessage: "The map is incomplete! Complete your remaining quests to find the treasure."
        },
        {
             id: 'escape', name: "The Great Escape", progressType: 'steps', stepChar: '🏃',
             victoryText: "ESCAPED! Freedom at last!",
             visualStages: [
                 '🔒🧱',
                 '🧱',
                 '🧱',
                 '🚧',
                 '🌳'
             ],
             defeatedVisual: '🌅',
             stageDescriptions: [
                 "Trapped in the dungeon!",
                 "Searching for an exit...",
                 "Found a way out!",
                 "Navigating obstacles!",
                 "Freedom is just ahead!"
             ],
             finalDescription: "You have escaped!",
             incompleteMessage: "The path is blocked! Complete your remaining quests to make your escape."
        },
        {
             id: 'voyage', name: "Cosmic Voyage", progressType: 'steps', stepChar: '🚀',
             victoryText: "DESTINATION REACHED! A successful journey!",
             visualStages: [
                 '🌌',
                 '🌌',
                 '🪐',
                 '🪐',
                 '🪐'
             ],
             defeatedVisual: '🪐🏠',
             stageDescriptions: [
                 "Preparing for launch...",
                 "Cruising through the cosmos...",
                 "Destination in sight!",
                 "Entering the planet's orbit!",
                 "Successful landing!"
             ],
             finalDescription: "Destination reached!",
             incompleteMessage: "The journey is unfinished! Complete your remaining quests to reach the destination."
        },
        {
             id: 'elixir', name: "Brew the Elixir", progressType: 'fill', item: '💧',
             victoryText: "POTION BREWED! Magical power awaits!",
             visualStages: [
                 '🧪',
                 '🧪🔴',
                 '🧪🟠',
                 '🧪🟡',
                 '🧪🟢',
                 '✨🧪✨'
             ],
             defeatedVisual: '✨🧪✨',
             stageDescriptions: [
                 "Gathering rare ingredients...",
                 "Adding the crimson leaf...",
                 "The mixture simmers warmly...",
                 "A golden light appears...",
                 "Vibrant green hue forms!",
                 "Bubbling with magical energy!"
             ],
             finalDescription: "The Elixir is ready!",
             incompleteMessage: "The potion is incomplete! Complete your remaining quests to finish brewing it."
        },
         {
             id: 'bean', name: "Grow the Magic Bean", progressType: 'build', pieces: ['🌱','🌿','🌲','🌳','☁️'],
             victoryText: "IT'S HUGE! The beanstalk reaches the clouds!",
             visualStages: [
                 '🌰',
                 '🌱',
                 '🌿',
                 '🌲',
                 '🌳',
                 '☁️🌳'
             ],
             defeatedVisual: '☁️🌳',
             stageDescriptions: [
                 "Planting the tiny seed...",
                 "A small sprout appears!",
                 "Leaves unfurl rapidly...",
                 "A sturdy stem takes form!",
                 "Growing towards the sky!",
                 "Reaching the cloud layer!"
             ],
             finalDescription: "The beanstalk is massive!",
             incompleteMessage: "The beanstalk is still growing! Complete your remaining quests to reach the top."
         },
         {
             id: 'crystal', name: "Charge the Crystal", progressType: 'charge', item: '⚡',
             victoryText: "FULLY CHARGED! The crystal glows with power!",
             visualStages: [
                 '💎',
                 '💎⚡',
                 '💎⚡⚡',
                 '💎⚡⚡⚡',
                 '💎✨⚡⚡✨',
                 '💎💥'
             ],
             defeatedVisual: '💎💥',
             stageDescriptions: [
                 "Placing the dull crystal...",
                 "Building the initial charge...",
                 "Energy surges within...",
                 "The crystal is humming!",
                 "Glowing intensely!",
                 "Radiating raw power!"
             ],
             finalDescription: "The crystal is fully charged!",
             incompleteMessage: "The crystal needs more energy! Complete your remaining quests to charge it."
         },
         {
             id: 'fort', name: "Defend the Fort", progressType: 'build', pieces: ['🧱','🛡️','🏹','🔥','👑'],
             victoryText: "SECURE! The fort is impenetrable!",
             visualStages: [
                 '🏕️',
                 '🏕️🧱',
                 '🏕️🧱🛡️',
                 '🏕️🧱🛡️🏹',
                 '🏕️🧱🛡️🏹🔥',
                 '👑🚩'
             ],
             defeatedVisual: '👑🚩',
             stageDescriptions: [
                 "Setting up the camp...",
                 "Building the first defense wall!",
                 "Reinforcing the fortifications!",
                 "Manning the towers!",
                 "Bracing for the final push!",
                 "The fort stands undefeated!"
             ],
             finalDescription: "The fort is secure!",
             incompleteMessage: "The fort is still vulnerable! Complete your remaining quests to secure your defenses."
         }
    ];

    const PROFILE_ICONS = ['👤', '🌟', '🚀', '🏰', '🐉', '🏆', '🗡️', '🧙', '🤖', '👾', '🐱', '🐶', '✨', '💡'];


    // --- State ---
    let tasks = [];
    let currentGame = null;
    let dateTimeInterval = null;
    let isDayCompleteState = false;
    let gameWinState = false;
    // Updated profile state: streak and collectedItems
    let profile = { name: 'Adventurer', icon: '👤', streak: 0, collectedItems: [] };

    // Updated localStorage keys for state structure changes
    const STORAGE_KEYS = {
        TASKS: 'vintageTasks_v7', // Increment version
        GAME_INFO: 'vintageGameInfo_v7', // Increment version
        DAY_COMPLETE: 'vintageDayComplete_v7', // Increment version
        PROFILE: 'vintageProfile_v3' // Increment profile version
    };

    // --- Functions ---

    function updateDateTime() {
        const now = new Date();
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        const dateStr = now.toLocaleDateString(undefined, dateOptions);
        const timeStr = now.toLocaleTimeString(undefined, timeOptions);
        dateTimeDisplay.textContent = `${dateStr} ${timeStr}`;
    }
     function startDateTimeInterval() {
         if (!dateTimeInterval) {
             dateTimeInterval = setInterval(updateDateTime, 1000);
         }
     }
     // function stopDateTimeInterval() { ... } // Not strictly needed in this app lifecycle


    function getCurrentDateString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    function populateGameSelector() {
        gameSelectDropdown.innerHTML = '';
        GAME_THEMES.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            gameSelectDropdown.appendChild(option);
        });
    }

    function determineGame() {
        const todayStr = getCurrentDateString();
        const storedGameInfo = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_INFO)) || {};
        const storedDate = storedGameInfo.date;
        const storedGameId = storedGameInfo.id;

        let gameIdToUse = null;

        // Use stored game if it's for today AND valid
        if (storedDate === todayStr && storedGameId && GAME_THEMES.find(g => g.id === storedGameId)) {
             gameIdToUse = storedGameId;
        } else {
             // New day or invalid stored game: Pick daily game based on date hash
             let hash = 0;
             for (let i = 0; i < todayStr.length; i++) {
                 const char = todayStr.charCodeAt(i);
                 hash = ((hash << 5) - hash) + char;
                 hash = hash & hash;
             }
             const gameIndex = Math.abs(hash) % GAME_THEMES.length;
             gameIdToUse = GAME_THEMES[gameIndex].id;
             // Automatically save this new daily game selection
             saveGameSelection(gameIdToUse, todayStr);
        }

        currentGame = GAME_THEMES.find(g => g.id === gameIdToUse);
        if (!currentGame) { // Fallback if gameId not found (shouldn't happen with valid IDs)
             console.warn(`Game ID "${gameIdToUse}" not found in GAME_THEMES. Falling back to first game.`);
             currentGame = GAME_THEMES[0];
             gameIdToUse = currentGame.id;
             saveGameSelection(gameIdToUse, todayStr); // Save fallback choice
        }

        // Ensure the dropdown reflects the determined game
        gameSelectDropdown.value = currentGame.id;
    }

    function saveGameSelection(gameId, dateStr) {
         localStorage.setItem(STORAGE_KEYS.GAME_INFO, JSON.stringify({ id: gameId, date: dateStr }));
    }

    // Handle game selection change (User manually changing the game)
    function handleGameChange() {
        // This should only happen if the day is not complete
        if (isDayCompleteState) {
             // Revert dropdown selection if day is complete and user tried to change it
            gameSelectDropdown.value = currentGame.id;
            return;
        }

        const selectedId = gameSelectDropdown.value;
        const selectedGame = GAME_THEMES.find(g => g.id === selectedId);

        if (selectedGame) {
            currentGame = selectedGame;
            // Save the user's manual selection for the current day
            saveGameSelection(selectedId, getCurrentDateString());
            renderTasks(); // Re-render everything based on the new game
        } else {
            console.warn("Invalid game selection:", selectedId);
             // Revert to the current game if selection is invalid
            gameSelectDropdown.value = currentGame.id;
        }
    }

    // Load state from localStorage
    function loadState() {
        const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        tasks = storedTasks ? JSON.parse(storedTasks) : [];

        const storedDayComplete = localStorage.getItem(STORAGE_KEYS.DAY_COMPLETE);
        isDayCompleteState = storedDayComplete === 'true';

        const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
        // Merge default profile with loaded state, ensuring new properties (streak, collectedItems) are included
        // Provide default values for streak and collectedItems if they don't exist
        profile = { ...{ name: 'Adventurer', icon: '👤', streak: 0, collectedItems: [] }, ...(storedProfile ? JSON.parse(storedProfile) : {}) };

        // Ensure collectedItems is always an array (handle potential loading issues)
        if (!Array.isArray(profile.collectedItems)) {
            profile.collectedItems = [];
        }

        // Check if it's a new day since the last visit *and* the day was completed
        const storedGameInfo = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_INFO));
        const lastVisitedDate = storedGameInfo?.date;
        const todayStr = getCurrentDateString();

        if (isDayCompleteState && lastVisitedDate && lastVisitedDate !== todayStr) {
             // Automatic new day start if previous day was completed
             startNewDay(true);
             return true; // Indicate automatic new day started
        }

        return false; // Indicate no automatic new day started
    }

    // Save state to localStorage
    function saveState() {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.DAY_COMPLETE, isDayCompleteState);
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        // saveGameSelection is called separately when game is determined/changed
    }

     // Render Profile Section (Updated for Streak)
     function renderProfile() {
         profileIconSpan.textContent = profile.icon;
         playerNameSpan.textContent = profile.name;
         // Display Streak
         playerStreakSpan.textContent = `Streak: ${profile.streak}`;
         // Add NES.css styling class based on streak value
         playerStreakSpan.classList.remove('is-success', 'is-error'); // Remove previous classes
         if (profile.streak > 0) {
             playerStreakSpan.classList.add('is-success');
         } else {
              playerStreakSpan.classList.add('is-error');
         }

         welcomeMessage.textContent = `Welcome ${profile.name}!`;
     }

    // Apply/Remove Day Completed Styling/Blocking
    function setDayCompletionStyling() {
        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;
        const isGameWon = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

        mainContainer.classList.toggle('day-completed', isDayCompleteState);

        // Disable/Enable buttons, input, select
        completeDayBtn.disabled = isDayCompleteState || tasks.length === 0 || (completedTasksCount < totalTasksCount);
        newDayBtn.disabled = false; // Always allow starting a new day
        addTaskBtn.disabled = isDayCompleteState;
        newTaskInput.disabled = isDayCompleteState;
        // Disable changing the game via the dropdown when the day is complete
        gameSelectDropdown.disabled = isDayCompleteState;

        // Update victory message visibility based on game win state AND day completion
         if (isGameWon && isDayCompleteState) {
              victoryMessage.textContent = currentGame.victoryText || "Quest Complete!";
              victoryMessage.classList.remove('hidden');
              victoryMessage.classList.add('is-success');
              // Sound is played when finalizing day if won (handles rewards too)
         } else {
              victoryMessage.classList.add('hidden');
              victoryMessage.classList.remove('is-success');
         }

        // Manage modal visibility (show report if day complete and report not shown)
         if (isDayCompleteState && missionReportModal.classList.contains('hidden') && !incompleteDialogOverlay.classList.contains('hidden')) {
             // Day just completed, incomplete dialog might be showing, wait for it to close.
             // finalizeDayCompletion -> setDayCompletionStyling handles showing report after dialog close.
         } else if (isDayCompleteState && missionReportModal.classList.contains('hidden')) {
             // Day is complete, show report
             showMissionReport();
         } else if (!isDayCompleteState) {
             // Day not complete, ensure report is hidden
             missionReportModal.classList.add('hidden');
         }

         // Update report game status color (if report is visible)
        if (!missionReportModal.classList.contains('hidden')) {
             reportGameStatus.classList.toggle('is-success', isGameWon);
        }
    }

    // --- Game Rendering --- Progressive Visuals ---
    function renderGameArea() {
        if (!currentGame) {
            gameTitle.textContent = '[Game Title Loading...]';
            gameVisual.innerHTML = '[Game Visual Loading...]';
            gameProgressArea.innerHTML = '';
            gameStatusText.textContent = '[Game Status Loading...]';
            victoryMessage.classList.add('hidden');
        } else {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.completed).length;
            // Game is won if there are tasks and all are completed
            gameWinState = totalTasks > 0 && completedTasks === totalTasks;

            gameTitle.textContent = currentGame.name;

            // --- Determine Visual Stage and Description ---
            let currentVisualHTML = '';
            let currentDescription = '';

            if (totalTasks === 0) {
                currentVisualHTML = currentGame.visualStages?.[0] || '🎮';
                currentDescription = "Add quests to begin!";
            } else if (gameWinState) {
                currentVisualHTML = currentGame.defeatedVisual || currentGame.visualStages?.[(currentGame.visualStages?.length || 1) - 1] || '🎉';
                currentDescription = currentGame.finalDescription || currentGame.stageDescriptions?.[(currentGame.stageDescriptions?.length || 1) - 1] || "Quest Complete!";
            } else {
                 // Use completedTasks count to determine the stage index, capped by the number of stages
                const maxStageIndex = (currentGame.visualStages?.length || 1) - 1;
                const stageIndex = Math.min(completedTasks, maxStageIndex);

                currentVisualHTML = currentGame.visualStages?.[stageIndex] || '🎮';
                currentDescription = currentGame.stageDescriptions?.[stageIndex] || `Progress: ${completedTasks} / ${totalTasks}`;
            }

            // --- Update Main Visual DOM with Opacity Transition ---
            gameVisual.innerHTML = currentVisualHTML;
            gameVisual.classList.toggle('defeated', gameWinState);

            // Apply dynamic styles based on current state
            applyDynamicGameVisualStyles(completedTasks, totalTasks);

            // --- Update Status Text ---
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
                             // Show character on the first incomplete step, or at the end if all are complete
                             if (i === completedTasks && !gameWinState) {
                                  stepContent = characterHTML;
                             } else if (i === totalTasks -1 && gameWinState) {
                                 // Show win marker at the end if won
                                  stepContent = '🏁'; // Default win marker
                                 if (currentGame.id === 'mountain') stepContent = '🚩'; // Specific mountain flag
                                 if (currentGame.id === 'escape') stepContent = '🌅'; // Specific escape dawn
                                 if (currentGame.id === 'voyage') stepContent = '🏠'; // Specific voyage planet house? Or trophy?
                             }
                            stepsHTML += `<div class="${stepClass}">${stepContent ? `<span>${stepContent}</span>` : ''}</div>`;
                        }
                        stepsHTML += '</div>';
                        gameProgressArea.innerHTML = stepsHTML;
                        break;

                     case 'build':
                         const buildPieces = currentGame.pieces || Array(totalTasks).fill('█');
                         let buildHTML = '<div class="build-progress">';
                         const piecesToShow = Math.min(completedTasks, buildPieces.length);
                         for (let i = 0; i < piecesToShow; i++) {
                            // Ensure piece exists at index, fallback to generic block
                            buildHTML += `<span class="build-piece added">${buildPieces[i] || '█'}</span> `;
                         }
                         buildHTML += '</div>';
                         gameProgressArea.innerHTML = buildHTML;
                         break;

                     case 'fill':
                         // Use a simple text representation of fill level in progress area
                         const fillItem = currentGame.item || '💧';
                         // Array(completedTasks + 1).join('') creates a string with `completedTasks` items.
                         gameProgressArea.innerHTML = `<span class="fill-visual">${Array(completedTasks).join(fillItem)}</span>`; // Only show completed count
                         break;

                     case 'charge':
                         // Show charge symbols in progress area
                         const chargeItem = currentGame.item || '⚡';
                         // Array(completedTasks + 1).join('') creates a string with `completedTasks` items.
                         gameProgressArea.innerHTML = `<span class="charge-indicator">${Array(completedTasks).join(chargeItem)}</span>`; // Only show completed count
                         break;

                    case 'reveal':
                        let revealHTML = '<div class="reveal-area">';
                        const revealItemHTML = currentGame.item || '<span class="nes-icon diamond is-small"></span>';
                        const placeholderItemHTML = '<span class="nes-icon star is-empty is-small"></span>';
                        for (let i = 0; i < totalTasks; i++) {
                             const itemHtmlContent = i < completedTasks ? revealItemHTML : placeholderItemHTML;
                             const revealedClass = i < completedTasks ? ' revealed' : '';
                             revealHTML += `<span class="reveal-item${revealedClass}">${itemHtmlContent}</span>`;
                        }
                         revealHTML += '</div>';
                         gameProgressArea.innerHTML = revealHTML;
                        break;

                    default:
                        // Default progress display if type is missing or unknown
                         gameProgressArea.innerHTML = `Completed: ${completedTasks} / ${totalTasks}`;
                }
            } else {
                 gameProgressArea.innerHTML = '';
            }
        }
    }

    function applyDynamicGameVisualStyles(completedTasks, totalTasks) {
        if (!currentGame || !gameVisual) return;

        const progressFraction = totalTasks > 0 ? completedTasks / totalTasks : 0;

        // Reset any previous dynamic styles
        gameVisual.style.opacity = '';
        gameVisual.style.transform = '';
        gameVisual.style.filter = '';

        const potion = gameVisual.querySelector('.potion-bottle');
        if (potion) potion.style.filter = '';
        const crystal = gameVisual.querySelector('.crystal-base');
        if (crystal) { crystal.style.transform = ''; crystal.style.filter = ''; }


        if (gameWinState) {
             // Final state styles override in-progress styles
             if (currentGame.id === 'crystal' && crystal) {
                  crystal.style.filter = 'drop-shadow(0 0 20px #fff) drop-shadow(0 0 10px cyan) saturate(150%)';
             }
        } else if (totalTasks > 0) { // Only apply dynamic in-progress styles if tasks exist and not won
             // Apply dynamic styles based on progress fraction
             if (currentGame.id === 'elixir' && potion) {
                 const hue = 120 * progressFraction; // Green shift
                 const satur = 50 + progressFraction * 100; // Saturation increase
                 const lightness = 50 + progressFraction * 20; // Slight lightness
                 potion.style.filter = `hue-rotate(${hue}deg) saturate(${satur}%) brightness(${lightness}%)`;
             }
             if (currentGame.id === 'crystal' && crystal) {
                 const glowIntensity = progressFraction * 15;
                 const scaleFactor = 1 + (progressFraction * 0.1);
                 crystal.style.transform = `scale(${scaleFactor})`;
                 crystal.style.filter = `drop-shadow(0 0 ${glowIntensity}px #fff) drop-shadow(0 0 ${glowIntensity/2}px cyan)`;
             }
             if (currentGame.id === 'dragon') {
                 const healthPercent = 100 - progressFraction * 100;
                 // Adjust opacity based on remaining health
                 gameVisual.style.opacity = 0.6 + (healthPercent / 100) * 0.4;
             }
        } else {
            // Case: totalTasks === 0, ensure default styles
             gameVisual.style.opacity = 1;
             gameVisual.style.transform = 'scale(1)';
             gameVisual.style.filter = 'none';
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

        // Render game area and save state after task lists are built
        renderGameArea();
        saveState();
        // setDayCompletionStyling called by renderGameArea for synergy
        setDayCompletionStyling();
    }

    // Create LI element for a task (Refactored with checkbox)
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


        // Checkbox/Completion Indicator
        const checkbox = document.createElement('div'); // Using a div to style as a box
        checkbox.classList.add('task-checkbox');
        checkbox.setAttribute('role', 'presentation'); // It's part of the checkbox role on the LI
         // Add disabled state to the checkbox div based on day completion
         if (isDayCompleteState || task.completed) {
              checkbox.classList.add('disabled'); // Add a class for CSS styling
         }


        // Task Text
        const textSpan = document.createElement('span');
        textSpan.textContent = task.text;
        textSpan.classList.add('task-text');

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('task-actions');

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="Nes nes-icon edit is-small"></i>';
        editBtn.classList.add('Nes', 'nes-btn', 'is-small', 'is-warning');
        editBtn.title = "Edit Quest";
        // Disable if day complete or task is completed
        editBtn.disabled = isDayCompleteState || task.completed;
        editBtn.addEventListener('click', (e) => {
             e.stopPropagation(); // Prevent LI click event
             if (!editBtn.disabled) {
                 editTask(task.id, li);
             }
        });

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="Nes nes-icon close is-small"></i>';
        deleteBtn.classList.add('Nes', 'nes-btn', 'is-error', 'is-small');
        deleteBtn.title = "Discard Quest";
        // Allow deleting completed tasks even if day complete, but not incomplete ones if day complete
        deleteBtn.disabled = isDayCompleteState && !task.completed;
        deleteBtn.addEventListener('click', (e) => {
             e.stopPropagation(); // Prevent LI click event
              if (!deleteBtn.disabled) {
                 deleteTask(task.id);
              }
        });

        // Append elements to LI
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);

        // Add click listener to the checkbox area only for toggling
        checkbox.addEventListener('click', (e) => {
             e.stopPropagation(); // Prevent LI click event
             // Check both day state AND if task is already completed
             if (!isDayCompleteState && !task.completed) {
                 toggleTaskCompletion(task.id);
             }
        });
         // Optional: Allow clicking the text to toggle IF not in edit mode and day not complete
         // textSpan.addEventListener('click', (e) => {
         //      e.stopPropagation();
         //       // Check if it's the text span itself (not replaced by input) and if day not complete
         //       if (!li.querySelector('.edit-input') && !isDayCompleteState && !task.completed) {
         //           toggleTaskCompletion(task.id);
         //       }
         //  });


        return li;
    }

    // Add a new task
    function addTask() {
        if (isDayCompleteState) return;
        const text = newTaskInput.value.trim();
        if (text === '') {
            newTaskInput.classList.add('input-error');
            newTaskInput.placeholder = 'Quest cannot be empty!';
            newTaskInput.addEventListener('animationend', () => {
                newTaskInput.classList.remove('input-error');
                newTaskInput.placeholder = 'Enter quest details...';
            }, { once: true });
            newTaskInput.focus();
            return;
        }
        // Add new task to the beginning of the array (optional, makes newer tasks visible faster)
        tasks.unshift({ id: Date.now(), text: text, completed: false });
        newTaskInput.value = '';
        newTaskInput.focus();
        renderTasks(); // Re-render lists and update game area
    }

    // Toggle task completion status (Removed XP logic)
    function toggleTaskCompletion(id) {
        // Only allow toggling if day is NOT complete
        if (isDayCompleteState) return;

        let taskCompletedNow = false;
        tasks = tasks.map(task => {
            if (task.id === id) {
                // Only toggle if it's currently NOT completed
                if (!task.completed) {
                    taskCompletedNow = true; // Mark that a task *just* became completed
                    return { ...task, completed: true };
                }
            }
            return task;
        });

        // If a task was successfully marked completed in this action
        if (taskCompletedNow) {
             playSound(completeSound);
             const li = document.querySelector(`li[data-id='${id}']`);
             if(li) {
                 li.classList.add('completing');
                 // Re-render after animation delay to move the task
                 setTimeout(renderTasks, 300);
             } else {
                 // Fallback re-render immediately
                 renderTasks();
             }
        } else {
            // If the task was already completed (clicked again) or un-completed (if allowed, which it isn't currently)
            // or if the day was complete (checked at function start), just re-render immediately to reflect current state.
             renderTasks();
        }
        // saveState is called by renderTasks
    }


    // Delete a task
    function deleteTask(id) {
        const taskToDelete = tasks.find(task => task.id === id);
        if (!taskToDelete) return;

        if (isDayCompleteState && !taskToDelete.completed) {
             console.log("Cannot delete incomplete tasks after completing the day.");
             return; // Prevent deleting incomplete tasks on a completed day
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
        if (!textSpan) return;

        const currentText = task.text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input', 'Nes', 'nes-input');
        input.style.fontSize = 'inherit';
        input.style.flexGrow = '1';
        input.style.marginBottom = '0';
        input.style.boxSizing = 'border-box';

        // Replace the text span, keeping other elements (checkbox, actions)
        const checkbox = listItem.querySelector('.task-checkbox');
        const actionsDiv = listItem.querySelector('.task-actions');
        if (!checkbox || !actionsDiv) return;

        listItem.insertBefore(input, actionsDiv); // Insert input before actions
        textSpan.remove(); // Remove the original text span


        input.focus();
        input.select(); // Select text for easy editing

        const saveEdit = () => {
            // Check if input is still in the DOM
            if(listItem.contains(input)) {
                const newText = input.value.trim();
                tasks = tasks.map(t => t.id === id ? { ...t, text: newText || currentText } : t); // Keep old text if empty
                renderTasks(); // Always re-render to replace input with span and update game
            }
        };

        // Save on blur
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
                 input.removeEventListener('blur', saveEdit); // Prevent saving on blur
                 // Re-create original span and replace input immediately
                 const originalSpan = document.createElement('span');
                 originalSpan.textContent = currentText;
                 originalSpan.classList.add('task-text');
                 listItem.insertBefore(originalSpan, actionsDiv); // Insert span before actions
                 input.remove(); // Remove the input
                 renderTasks(); // Re-render to ensure state consistency
             }
        });
    }

    // --- Day Completion, Reports, and Streak/Rewards ---

    // Function to finalize the day completion process (called after confirm or force-complete)
    function finalizeDayCompletion() {
         if (isDayCompleteState) return; // Should not happen if called correctly

        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;
        const isGameWon = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

        let streakStatusMessage = ''; // Message for the report

         if (isGameWon) {
             profile.streak++; // Increment streak if the daily quest was won
             streakStatusMessage = `Streak maintained! You are on a ${profile.streak} day streak!`;

             // Check for rewards at the new streak count
             const earnedReward = REWARDS.find(reward => reward.streak === profile.streak);

             if (earnedReward) {
                 // Check if the item has already been collected
                 if (!profile.collectedItems.includes(earnedReward.item)) {
                     profile.collectedItems.push(earnedReward.item); // Add item to inventory
                     streakStatusMessage += `\nReward unlocked: ${earnedReward.item}!`; // Add reward message
                     playSound(victorySound); // Play a sound for the reward/streak
                 } else {
                      streakStatusMessage += ` (You already collected the reward for streak ${profile.streak})`;
                 }
             } else {
                  // Play victory sound even if no specific item reward at this streak
                  playSound(victorySound);
             }

         } else {
             // Streak is broken if the daily quest was NOT won
             if (profile.streak > 0) {
                 streakStatusMessage = `Streak broken! You failed the daily quest. Your streak of ${profile.streak} days is reset.`;
             } else {
                  streakStatusMessage = "Daily quest incomplete. Your streak remains 0.";
             }
             profile.streak = 0; // Reset streak
         }

         isDayCompleteState = true; // Mark day as complete
         // Save the updated profile (with new streak/items) and day state
         saveState();
         renderProfile(); // Update header display

         // Set the streak status message for the report *before* showing the report modal
         reportStreakStatus.textContent = streakStatusMessage;
         reportStreakStatus.classList.toggle('is-success', isGameWon);
         reportStreakStatus.classList.toggle('is-error', !isGameWon);


         setDayCompletionStyling(); // Apply UI blocking, show report (will call showMissionReport)
    }

     // Trigger day completion check
    function completeDay() {
        if (isDayCompleteState) return;

        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;
        // Day can be completed if there are tasks and all are done OR if user forces with incomplete tasks
        const allDone = totalTasksCount > 0 && completedTasksCount === totalTasksCount;
        const incompleteTasks = tasks.filter(task => !task.completed);


        if (totalTasksCount === 0) {
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
         incompleteDialogTitle.textContent = currentGame.name;
         incompleteDialogMessage.textContent = currentGame.incompleteMessage || "You still have quests to finish.";

         incompleteTaskList.innerHTML = '';
         incompleteTasks.forEach(task => {
             const li = document.createElement('li');
             li.textContent = task.text;
             incompleteTaskList.appendChild(li);
         });

         incompleteDialogOverlay.classList.remove('hidden');
     }

     // Hide the incomplete tasks dialog
     function closeIncompleteTasksDialog() {
         incompleteDialogOverlay.classList.add('hidden');
     }


    function showMissionReport() {
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
         reportGameStatus.classList.toggle('is-success', gameWon); // Apply success styling if won

         // Streak status message and styling are already set in finalizeDayCompletion
         // reportStreakStatus.textContent and its classes are updated there.

         missionReportModal.classList.remove('hidden');
     }


    function closeMissionReport() {
        missionReportModal.classList.add('hidden');
    }

    // Clear all tasks for a new day and reset task/game state
    // Streak reset logic happens in finalizeDayCompletion based on winning the quest
    // auto: boolean - true if called automatically on new day load, false if user clicked button
    function startNewDay(auto = false) {
        // If not auto-started, confirm if there are unfinished tasks and the day wasn't completed
        if (!auto && !isDayCompleteState && tasks.length > 0 && tasks.filter(t => !t.completed).length > 0) {
            // Warning: Starting a new day will break your streak if the current day's quest wasn't won!
             if (!confirm('Start a fresh day? Your unfinished quests will be lost forever. (Warning: This will reset your streak if you did not complete today\'s quest!)')) {
                 return; // User cancelled
             }
             // If user confirms, the streak reset will happen when finalizeDayCompletion is called implicitly
             // by the end of the day (or if they manually completed with incomplete tasks).
             // However, if they click "Start New Day" *before* completing the day, the streak should also reset.
             // Let's ensure the streak logic is handled *only* when the day is marked complete (via finalizeDayCompletion),
             // so the "Complete Day" button/flow is the primary way to advance/reset the streak.
             // Clicking "Start New Day" *before* completing the day effectively means the day's quest was failed.
             // We need to decide if clicking "Start New Day" early resets the streak immediately,
             // or if the streak only resets if you hit "Complete Day" and failed.
             // The current design links streak to the daily quest outcome via finalizeDayCompletion.
             // So, if a user clicks "Start New Day" with tasks still in ToDo, they effectively abandoned the quest.
             // We should probably still finalize the *previous* day as a failure.
             if (!isDayCompleteState) { // If day wasn't completed yet, finalize it as failed
                  console.log("User started new day before completing the previous. Finalizing previous day as incomplete.");
                  // Temporarily set tasks to reflect completion status for report/streak logic
                   finalizeDayCompletion(); // This will reset the streak
             }
        } else if (!auto && isDayCompleteState) {
            // User clicked Start New Day after completion. No confirmation needed.
             console.log("User started new day after completing the previous.");
        } else if (!auto && tasks.length === 0) {
             // User clicked Start New Day with no tasks. No confirmation needed.
             console.log("User started new day with no tasks.");
        }


        isDayCompleteState = false; // Reset day completion state
        tasks = []; // Clear tasks
        gameWinState = false; // Reset win state

        saveState(); // Save cleared tasks and completion state (profile already updated by finalizeDayCompletion if needed)

        // Determine a NEW game for the new day (based on the new date)
        determineGame(); // This function saves the new daily game selection automatically

        // Render empty lists and initial game state
        renderTasks();

        // Reset specific game visual styles that might persist
        gameVisual.style.transform = 'scale(1)';
        gameVisual.style.opacity = 1;
        gameVisual.style.filter = 'none';
         const potion = gameVisual.querySelector('.potion-bottle');
         if (potion) potion.style.filter = '';
         const crystal = gameVisual.querySelector('.crystal-base');
         if (crystal) { crystal.style.transform = ''; crystal.style.filter = ''; }


        missionReportModal.classList.add('hidden'); // Ensure report is hidden
        incompleteDialogOverlay.classList.add('hidden'); // Ensure incomplete dialog is hidden

        if (!isDayCompleteState) {
             newTaskInput.focus(); // Focus input on start if day is not complete
         }
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

    // Populate the Collected Items list in the modal
    function populateCollectedItems() {
        collectedItemsList.innerHTML = ''; // Clear list

        if (profile.collectedItems.length === 0) {
            noItemsMessage.classList.remove('hidden');
             // Add a placeholder item if the list is empty and noItemsMessage is hidden (shouldn't happen with the hidden class check)
             // collectedItemsList.innerHTML = '<li>(No items yet)</li>'; // Optional placeholder within the list
        } else {
             noItemsMessage.classList.add('hidden');
            // Sort items alphabetically for consistent display
            const sortedItems = [...profile.collectedItems].sort();
            sortedItems.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                collectedItemsList.appendChild(li);
            });
        }
    }


    function showProfileEditModal() {
         // Populate modal fields with current profile data
         profileNameInput.value = profile.name;
         populateIconSelection(); // Populate and select current icon
         populateCollectedItems(); // Populate the collected items list
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
         if (audioElement && typeof audioElement.play === 'function' && audioElement.readyState >= 2) {
             audioElement.currentTime = 0; // Rewind to start
             audioElement.play().catch(error => {
                 // Autoplay was prevented - common issue. Log but don't break.
                 console.warn("Audio playback prevented:", error);
             });
         } else if (audioElement && audioElement.readyState < 2) {
             console.warn("Audio not ready for playback.");
         } else {
              console.warn("Invalid audio element.");
         }
     }

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
    gameSelectDropdown.addEventListener('change', handleGameChange);
    completeDayBtn.addEventListener('click', completeDay);
    // Modified Start New Day listener to potentially finalize the previous day
    newDayBtn.addEventListener('click', () => startNewDay(false));
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
        // Initial UI state setup
         gameTitle.textContent = '[Game Title Loading...]';
         gameVisual.innerHTML = '[Game Visual Loading...]';
         gameProgressArea.innerHTML = '';
         gameStatusText.textContent = '[Game Status Loading...]';
         victoryMessage.classList.add('hidden');
         missionReportModal.classList.add('hidden');
         incompleteDialogOverlay.classList.add('hidden');
         profileEditModal.classList.add('hidden');
         // Hide the "no items" message initially until populateCollectedItems runs
         noItemsMessage.classList.add('hidden');


        // Load state, this might trigger an automatic new day
        const autoNewDayTriggered = loadState();

        // Populate dropdown FIRST
        populateGameSelector();

        // Determine/set the current game based on loaded state or new day calculation
        // Only run determineGame if an automatic new day wasn't triggered by loadState
        if (!autoNewDayTriggered) {
             determineGame(); // Sets currentGame and syncs dropdown value
        }
        // Note: If autoNewDayTriggered was true, startNewDay already called determineGame

        renderProfile(); // Render profile display based on loaded state

        // Render tasks and game area based on the determined initial state
        renderTasks(); // This also calls renderGameArea and setDayCompletionStyling

        startDateTimeInterval(); // Start the clock

        if (!isDayCompleteState) {
             newTaskInput.focus(); // Focus input on start if day is not complete
         }
    }

    // --- Start the application ---
    init();
});
