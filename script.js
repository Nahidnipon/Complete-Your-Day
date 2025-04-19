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
        completeSound = new Audio('audio/complete.wav');
        victorySound = new Audio('audio/victory.wav');
        completeSound.preload = 'auto';
        victorySound.preload = 'auto';
        document.body.addEventListener('click', () => {
             if (completeSound.paused && completeSound.readyState >= 2) {
                 completeSound.volume = 0;
                 completeSound.play().then(() => completeSound.volume = 1).catch(e => console.warn("Complete sound unlock failed:", e));
             }
             if (victorySound.paused && victorySound.readyState >= 2) {
                 victorySound.volume = 0;
                 victorySound.play().then(() => victorySound.volume = 1).catch(e => console.warn("Victory sound unlock failed:", e));
             }
        }, { once: true });

    } catch (e) {
        console.error("Could not load audio files. Ensure 'audio/complete.wav' and 'audio/victory.wav' exist.", e);
        completeSound = { play: () => {}, paused: true, readyState: 4, volume: 1 };
        victorySound = { play: () => {}, paused: true, readyState: 4, volume: 1 };
    }


    // --- Game Definitions (Full visual stages and descriptions) ---
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
            id: 'mountain', name: "Mountain Climb", progressType: 'steps',
            victoryText: "PEAK CONQUERED! You reached the summit!",
            visualStages: [
                '⛰️', '🧗⛰️', '🧗‍♀️⛰️', '🧗‍♂️⛰️', '🏔️旗'
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
            id: 'castle', name: "Build the Castle", progressType: 'build',
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
            id: 'map', name: "Uncover Treasure", progressType: 'reveal',
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
             id: 'escape', name: "The Great Escape", progressType: 'steps',
             victoryText: "ESCAPED! Freedom at last!",
             visualStages: [
                 '🔒🧱',
                 '🏃🧱',
                 '🏃💨🧱',
                 '🏃💨🚧',
                 '🏃💨🌳'
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
             id: 'voyage', name: "Cosmic Voyage", progressType: 'steps',
             victoryText: "DESTINATION REACHED! A successful journey!",
             visualStages: [
                 '🚀',
                 '🚀🌌',
                 '🚀🪐',
                 '🪐✨',
                 '🪐🎉'
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
             id: 'elixir', name: "Brew the Elixir", progressType: 'fill',
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
             id: 'bean', name: "Grow the Magic Bean", progressType: 'build',
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
             id: 'crystal', name: "Charge the Crystal", progressType: 'charge',
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
             id: 'fort', name: "Defend the Fort", progressType: 'build',
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
    let profile = { name: 'Adventurer', icon: '👤', level: 1 };

    const STORAGE_KEYS = {
        TASKS: 'vintageTasks_v5',
        GAME_INFO: 'vintageGameInfo_v5',
        DAY_COMPLETE: 'vintageDayComplete_v5',
        PROFILE: 'vintageProfile_v1'
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
     function stopDateTimeInterval() {
         if (dateTimeInterval) {
             clearInterval(dateTimeInterval);
             dateTimeInterval = null;
         }
     }


    function getCurrentDateString() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // Populate Game Selection Dropdown
    function populateGameSelector() {
        console.log("Populating game selector...");
        gameSelectDropdown.innerHTML = '';
        GAME_THEMES.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            gameSelectDropdown.appendChild(option);
        });
        console.log("Game selector populated.");
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
             console.log(`Using saved game for today (${todayStr}): ${storedGameId}`);
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
             console.log(`New day or no saved game. Determined daily game for ${todayStr}: ${gameIdToUse}`);
             // Automatically select this game in the dropdown & save it as the day's game
             saveGameSelection(gameIdToUse, todayStr); // Save the newly determined daily game
        }

        currentGame = GAME_THEMES.find(g => g.id === gameIdToUse);
        if (!currentGame) { // Fallback if gameId is invalid or not found
             console.warn(`Game ID "${gameIdToUse}" not found in GAME_THEMES. Falling back to first game.`);
             currentGame = GAME_THEMES[0];
             gameIdToUse = currentGame.id;
             saveGameSelection(gameIdToUse, todayStr); // Save fallback choice
        }

        // Ensure the dropdown reflects the determined game
        gameSelectDropdown.value = currentGame.id;
         console.log(`Dropdown value set to: ${gameSelectDropdown.value}`);
    }

    // Save the selected game ID and date
    function saveGameSelection(gameId, dateStr) {
         console.log(`Saving game selection: ID=${gameId}, Date=${dateStr}`);
         localStorage.setItem(STORAGE_KEYS.GAME_INFO, JSON.stringify({ id: gameId, date: dateStr }));
    }

    // Handle game selection change (User manually changing the game)
    function handleGameChange() {
        console.log('handleGameChange fired');
        console.log('Current day complete state:', isDayCompleteState);

        // This should only happen if the day is not complete
        if (isDayCompleteState) {
            console.log('Day is complete. Reverting dropdown selection.');
             // Revert the dropdown to the *current* game (which is the one active when the day was completed)
            gameSelectDropdown.value = currentGame.id;
            return;
        }

        const selectedId = gameSelectDropdown.value;
        console.log('User selected ID:', selectedId);

        const selectedGame = GAME_THEMES.find(g => g.id === selectedId);

        if (selectedGame) {
            console.log('Found selected game:', selectedGame.name);
            currentGame = selectedGame;
            // Save the user's manual selection for the current day
            saveGameSelection(selectedId, getCurrentDateString());
            renderTasks(); // Re-render everything based on the new game
            console.log(`currentGame updated to: ${currentGame.name}`);
        } else {
            console.warn("Invalid game selection:", selectedId);
            // Revert to the current game if the selection is somehow invalid
            gameSelectDropdown.value = currentGame.id;
        }
    }

    // Load tasks, game info, day completion state, and profile
    function loadState() {
        console.log("Loading state...");
        const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        tasks = storedTasks ? JSON.parse(storedTasks) : [];
        console.log(`Loaded ${tasks.length} tasks.`);

        const storedDayComplete = localStorage.getItem(STORAGE_KEYS.DAY_COMPLETE);
        isDayCompleteState = storedDayComplete === 'true';
        console.log(`Loaded day completion state: ${isDayCompleteState}`);


        const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
        profile = storedProfile ? JSON.parse(storedProfile) : { name: 'Adventurer', icon: '👤', level: 1 };
        console.log(`Loaded profile for ${profile.name}, Lv. ${profile.level}`);

        // Check if it's a new day since the last visit *and* the day was completed
        // We need the gameInfo to check the last visited date
        const storedGameInfo = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_INFO)); // Get info here
        const lastVisitedDate = storedGameInfo?.date;
        const todayStr = getCurrentDateString();

        if (isDayCompleteState && lastVisitedDate && lastVisitedDate !== todayStr) {
             console.log("Detected new day after previous day was completed. Starting fresh automatically.");
             startNewDay(true); // Trigger automatic new day
             return true; // Indicate that an automatic new day started
        }

        console.log("State loaded. Not an automatic new day start.");
        return false; // Indicate no automatic new day started
    }

    // Save tasks, day completion state, and profile
    function saveState() {
        console.log("Saving state...");
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.DAY_COMPLETE, isDayCompleteState);
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        console.log("State saved.");
        // saveGameSelection is called separately when the game is determined or changed
    }

     // Render Profile Section
     function renderProfile() {
         console.log("Rendering profile...");
         profileIconSpan.textContent = profile.icon;
         playerNameSpan.textContent = profile.name;
         playerLevelSpan.textContent = `Lv. ${profile.level}`;
         welcomeMessage.textContent = `Welcome ${profile.name}!`;
     }

    // Apply/Remove Day Completed Styling/Blocking and manage victory message
    function setDayCompletionStyling() {
        console.log(`Setting day completion styling. Day complete: ${isDayCompleteState}`);
        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;
        const isGameWon = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

        mainContainer.classList.toggle('day-completed', isDayCompleteState);

        // Manage button/input/select disabled state using the 'disabled' attribute
        // Complete Day button is enabled only if day is NOT complete AND there are tasks AND all tasks are complete
        completeDayBtn.disabled = isDayCompleteState || tasks.length === 0 || (completedTasksCount < totalTasksCount);
        newDayBtn.disabled = false; // Always allow starting a new day
        addTaskBtn.disabled = isDayCompleteState;
        newTaskInput.disabled = isDayCompleteState;
        // Disable changing the game via the dropdown when the day is complete
        gameSelectDropdown.disabled = isDayCompleteState;
        console.log(`Dropdown disabled state set to: ${gameSelectDropdown.disabled}`);


        // Update victory message visibility based on game win state *and* if the day is complete
        // The victory message should ideally show *after* completing the day, if the game was won.
        // Let's link it directly to gameWinState AND isDayCompleteState for clarity.
         if (gameWinState && isDayCompleteState) {
              victoryMessage.textContent = currentGame.victoryText || "Quest Complete!";
              victoryMessage.classList.remove('hidden');
              victoryMessage.classList.add('is-success');
              // Sound is played when finalizing day if won
         } else {
              victoryMessage.classList.add('hidden');
              victoryMessage.classList.remove('is-success');
         }

        // Manage modal visibility based on day state
         if (isDayCompleteState && missionReportModal.classList.contains('hidden') && !incompleteDialogOverlay.classList.contains('hidden')) {
             // Day just completed, incomplete dialog might be showing, wait for it to close.
             // finalizeDayCompletion -> setDayCompletionStyling handles showing the report after the incomplete dialog closes.
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
        console.log("Rendering game area for:", currentGame?.name || 'No Game Loaded');
        if (!currentGame) {
            gameTitle.textContent = '[Game Title Loading...]';
            gameVisual.innerHTML = '[Game Visual Loading...]';
            gameProgressArea.innerHTML = '';
            gameStatusText.textContent = '[Game Status Loading...]';
            victoryMessage.classList.add('hidden');
        } else {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.completed).length;
            gameWinState = totalTasks > 0 && completedTasks === totalTasks;
             console.log(`Tasks: ${completedTasks}/${totalTasks}, Win State: ${gameWinState}`);

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
                const maxStageIndex = (currentGame.visualStages?.length || 1) - 1;
                const stageIndex = Math.min(completedTasks, maxStageIndex);

                currentVisualHTML = currentGame.visualStages?.[stageIndex] || '🎮';
                currentDescription = currentGame.stageDescriptions?.[stageIndex] || `Progress: ${completedTasks} / ${totalTasks}`;
            }

            // --- Update Main Visual DOM with Opacity Transition ---
            gameVisual.innerHTML = currentVisualHTML;

            // Reset specific inline styles that might have been applied dynamically
            gameVisual.style.filter = '';
            gameVisual.style.transform = '';
            const potion = gameVisual.querySelector('.potion-bottle');
            if (potion) potion.style.filter = '';
            const crystal = gameVisual.querySelector('.crystal-base');
            if (crystal) { crystal.style.transform = ''; crystal.style.filter = ''; }

            // Apply gameWinState class immediately for CSS effects like pulse
            gameVisual.classList.toggle('defeated', gameWinState);

            // Apply dynamic styles based on current state (e.g. glow intensity, opacity)
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
                             if (i === completedTasks && !gameWinState) {
                                  stepContent = characterHTML;
                             } else if (i === totalTasks -1 && gameWinState && currentGame.id === 'mountain'){
                                 stepContent = '🚩';
                             } else if (i === totalTasks -1 && gameWinState) {
                                  stepContent = '🏁';
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
                            buildHTML += `<span class="build-piece added">${buildPieces[i]}</span> `;
                         }
                         buildHTML += '</div>';
                         gameProgressArea.innerHTML = buildHTML;
                         break;

                     case 'fill':
                         const fillItem = currentGame.item || '💧';
                         gameProgressArea.innerHTML = `<span class="fill-visual">${Array(completedTasks + 1).join(fillItem)}</span>`;
                         break;

                     case 'charge':
                         const chargeItem = currentGame.item || '⚡';
                         gameProgressArea.innerHTML = `<span class="charge-indicator">${Array(completedTasks + 1).join(chargeItem)}</span>`;
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
                        gameProgressArea.textContent = `Completed: ${completedTasks} / ${totalTasks}`;
                }
            } else {
                 gameProgressArea.innerHTML = '';
            }
        }
        console.log("Game area rendering complete.");

        // setDayCompletionStyling is called by renderTasks
    }

    function applyDynamicGameVisualStyles(completedTasks, totalTasks) {
        if (!currentGame || !gameVisual) return;

        const progressFraction = totalTasks > 0 ? completedTasks / totalTasks : 0;

        gameVisual.style.opacity = '';
        gameVisual.style.transform = '';
        gameVisual.style.filter = '';

        const potion = gameVisual.querySelector('.potion-bottle');
        if (potion) potion.style.filter = '';
        const crystal = gameVisual.querySelector('.crystal-base');
        if (crystal) { crystal.style.transform = ''; crystal.style.filter = ''; }


        if (gameWinState) {
             if (currentGame.id === 'crystal' && crystal) {
                  crystal.style.filter = 'drop-shadow(0 0 20px #fff) drop-shadow(0 0 10px cyan) saturate(150%)';
             }
        } else if (totalTasks > 0) {
             if (currentGame.id === 'elixir' && potion) {
                 const hue = 120 * progressFraction;
                 const satur = 50 + progressFraction * 100;
                 const lightness = 50 + progressFraction * 20;
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
                 gameVisual.style.opacity = 0.6 + (healthPercent / 100) * 0.4;
             }
        } else {
             gameVisual.style.opacity = 1;
             gameVisual.style.transform = 'scale(1)';
             gameVisual.style.filter = 'none';
        }
    }


    // Render the task lists UI
    function renderTasks() {
        console.log("Rendering tasks...");
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

        // Render game area needs to happen *after* tasks are rendered/counted
        renderGameArea();

        // Save state after tasks and game state are potentially updated by rendering
        saveState();

        // setDayCompletionStyling is called here to ensure UI state matches
        setDayCompletionStyling();
        console.log("Tasks rendering complete.");
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
        editBtn.disabled = isDayCompleteState || task.completed;
        editBtn.addEventListener('click', (e) => {
             e.stopPropagation();
             if (!editBtn.disabled) {
                 editTask(task.id, li);
             }
        });
        actionsDiv.appendChild(editBtn);


        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="Nes nes-icon close is-small"></i>';
        deleteBtn.classList.add('Nes', 'nes-btn', 'is-error', 'is-small');
        deleteBtn.title = "Discard Quest";
        deleteBtn.disabled = isDayCompleteState && !task.completed; // Allow deleting completed on completed day
        deleteBtn.addEventListener('click', (e) => {
             e.stopPropagation();
              if (!deleteBtn.disabled) {
                 deleteTask(task.id);
              }
        });
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(actionsDiv);

        // Click listener to toggle completion
        li.addEventListener('click', () => {
             if (!isDayCompleteState) {
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
            newTaskInput.classList.add('input-error');
            newTaskInput.placeholder = 'Quest cannot be empty!';
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
        renderTasks();
    }

    // Toggle task completion status
    function toggleTaskCompletion(id) {
        if (isDayCompleteState) return;

        let taskCompletedNow = false;
        tasks = tasks.map(task => {
            if (task.id === id) {
                taskCompletedNow = !task.completed;
                return { ...task, completed: taskCompletedNow };
            }
            return task;
        });

        if (taskCompletedNow) {
             playSound(completeSound);
             const li = document.querySelector(`li[data-id='${id}']`);
             if(li) {
                 li.classList.add('completing');
                 setTimeout(renderTasks, 300);
             } else {
                 renderTasks();
             }
        } else {
            renderTasks();
        }
    }

    // Delete a task
    function deleteTask(id) {
        const taskToDelete = tasks.find(task => task.id === id);
        if (!taskToDelete) return;

        if (isDayCompleteState && !taskToDelete.completed) {
             console.log("Cannot delete incomplete tasks after completing the day.");
             return;
        }

        // Using NES dialogs would replace this confirm
        if (confirm('Discard this quest forever?')) {
            tasks = tasks.filter(task => task.id !== id);
            renderTasks();
        }
    }

    // Edit Task (Inline)
    function editTask(id, listItem) {
         if (isDayCompleteState) return;
        const task = tasks.find(t => t.id === id);
        if (!task || task.completed) return;

        const textSpan = listItem.querySelector('.task-text');
        const currentText = task.text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input', 'Nes', 'nes-input');
        input.style.fontSize = 'inherit';
        input.style.flexGrow = '1';
        input.style.marginBottom = '0';
        input.style.boxSizing = 'border-box';

        textSpan.replaceWith(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            if(listItem.contains(input)) {
                const newText = input.value.trim();
                tasks = tasks.map(t => t.id === id ? { ...t, text: newText || currentText } : t);
                renderTasks();
            }
        };

        input.addEventListener('blur', saveEdit, { once: true });
        input.addEventListener('keypress', (e) => {
             if (e.key === 'Enter') {
                  input.blur();
             }
        });
        input.addEventListener('keydown', (e) => {
             if (e.key === 'Escape') {
                 input.removeEventListener('blur', saveEdit);
                 const originalSpan = document.createElement('span');
                 originalSpan.textContent = currentText;
                 originalSpan.classList.add('task-text');
                 input.replaceWith(originalSpan);
                 renderTasks();
             }
        });
    }

    // --- Day Completion, Reports, and Leveling ---

    function finalizeDayCompletion() {
         if (isDayCompleteState) return;

        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;
        const isGameWon = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

         isDayCompleteState = true;
         saveState();

         if (isGameWon) {
             levelUp();
             playSound(victorySound); // Play victory sound here on win
         } else {
              saveState(); // Ensure state is saved even without level up
         }

         setDayCompletionStyling(); // Apply UI blocking, show report
         // showMissionReport is called by setDayCompletionStyling
    }

     function completeDay() {
        console.log("Attempting to complete day...");
        if (isDayCompleteState) {
            console.log("Day already complete.");
            return;
        }

        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;
        const allDone = totalTasksCount > 0 && completedTasksCount === totalTasksCount; // Must have tasks AND all done
        const incompleteTasks = tasks.filter(task => !task.completed);


        if (totalTasksCount === 0) {
             newTaskInput.classList.add('input-error');
             newTaskInput.placeholder = 'Add quests first!';
              newTaskInput.addEventListener('animationend', () => {
                 newTaskInput.classList.remove('input-error');
                 newTaskInput.placeholder = 'Enter quest details...';
             }, { once: true });
             newTaskInput.focus();
             console.log("Cannot complete day with no tasks.");
             return;
         }

         if (!allDone) {
             console.log(`Incomplete tasks remaining: ${incompleteTasks.length}. Showing dialog.`);
             showIncompleteTasksDialog(incompleteTasks);
         } else {
             console.log("All tasks complete. Finalizing day directly.");
             finalizeDayCompletion();
         }
    }

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

     function closeIncompleteTasksDialog() {
         incompleteDialogOverlay.classList.add('hidden');
     }


    function showMissionReport() {
        console.log("Showing mission report...");
         const completedTasks = tasks.filter(task => task.completed).length;
         const totalTasks = tasks.length;
         const gameWon = totalTasks > 0 && completedTasks === totalTasks;

         reportDate.textContent = `Date: ${new Date().toLocaleDateString()}`;
         reportSummary.textContent = `Quests Attempted: ${totalTasks} | Quests Completed: ${completedTasks}`;

         reportTaskList.innerHTML = '';
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

         missionReportModal.classList.remove('hidden');
         console.log("Mission report displayed.");
     }


    function closeMissionReport() {
        console.log("Closing mission report.");
        missionReportModal.classList.add('hidden');
    }

    // Clear all tasks for a new day and reset state
    function startNewDay(auto = false) {
        console.log(`Starting new day (auto: ${auto})...`);
        // If not auto-started, confirm if there are unfinished tasks and the day wasn't completed
        if (!auto && !isDayCompleteState && tasks.length > 0 && tasks.filter(t => !t.completed).length > 0) {
            // Using NES dialogs would replace this confirm
            if (!confirm('Start a fresh day? Your unfinished quests will be lost forever.')) {
                 console.log("Start new day cancelled by user.");
                 return; // User cancelled
             }
             console.log("User confirmed starting new day with unfinished tasks.");
        } else if (!auto && isDayCompleteState) {
            console.log("User clicked Start New Day after completion.");
            // No confirmation needed if day was already complete.
        } else if (!auto && tasks.length === 0) {
             console.log("User clicked Start New Day with no tasks.");
              // No confirmation needed if no tasks.
        }


        isDayCompleteState = false;
        tasks = [];
        gameWinState = false;

        saveState();

        // Determine a NEW game for the new day (based on the new date)
        determineGame(); // This function also saves the new daily game selection

        renderTasks(); // Render empty lists and initial game state

        // Reset specific game visual styles that might persist from winning/previous state
        gameVisual.style.transform = 'scale(1)';
        gameVisual.style.opacity = 1;
        gameVisual.style.filter = 'none';
         const potion = gameVisual.querySelector('.potion-bottle');
         if (potion) potion.style.filter = '';
         const crystal = gameVisual.querySelector('.crystal-base');
         if (crystal) { crystal.style.transform = ''; crystal.style.filter = ''; }


        missionReportModal.classList.add('hidden');
        incompleteDialogOverlay.classList.add('hidden');

        if (!isDayCompleteState) {
             newTaskInput.focus();
         }
        console.log("New day started.");
    }

    // Level Up function
    function levelUp() {
         profile.level++;
         console.log(`${profile.name} Leveled up to Lv. ${profile.level}!`);
         renderProfile();
         // saveState() is called by finalizeDayCompletion after levelUp
     }

    // --- Profile Editing ---
    function populateIconSelection() {
        profileIconSelection.innerHTML = '';
        PROFILE_ICONS.forEach(icon => {
            const span = document.createElement('span');
            span.classList.add('icon-option');
            span.textContent = icon;
            span.setAttribute('data-icon', icon);
            if (icon === profile.icon) {
                span.classList.add('selected');
            }
            span.addEventListener('click', () => {
                profileIconSelection.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
                span.classList.add('selected');
            });
            profileIconSelection.appendChild(span);
        });
    }

    function showProfileEditModal() {
         profileNameInput.value = profile.name;
         populateIconSelection();
         profileEditModal.classList.remove('hidden');
         profileNameInput.focus();
         profileNameInput.select();
     }

    function closeProfileEditModal() {
         profileEditModal.classList.add('hidden');
     }

    function saveProfileEdit() {
         const newName = profileNameInput.value.trim();
         const selectedIconElement = profileIconSelection.querySelector('.icon-option.selected');
         const newIcon = selectedIconElement ? selectedIconElement.getAttribute('data-icon') : profile.icon;

         profile.name = newName || profile.name;
         profile.icon = newIcon;

         saveState();
         renderProfile();
         closeProfileEditModal();
     }


     // Helper to play sound safely
     function playSound(audioElement) {
         if (audioElement && typeof audioElement.play === 'function') {
             audioElement.currentTime = 0;
             audioElement.play().catch(error => {
                 console.warn("Audio playback prevented:", error);
             });
         }
     }

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

    // Add the event listener AFTER the dropdown is populated and the initial game is determined
    gameSelectDropdown.addEventListener('change', handleGameChange);

    completeDayBtn.addEventListener('click', completeDay);
    newDayBtn.addEventListener('click', () => startNewDay(false)); // Explicitly not automatic start
    closeReportBtn.addEventListener('click', closeMissionReport);
    missionReportModal.addEventListener('click', (e) => {
         if (e.target === missionReportModal) {
             closeMissionReport();
         }
     });

    // Incomplete Dialog Listeners
    cancelCompleteBtn.addEventListener('click', closeIncompleteTasksDialog);
    forceCompleteBtn.addEventListener('click', () => {
         closeIncompleteTasksDialog();
         finalizeDayCompletion();
     });
     incompleteDialogOverlay.addEventListener('click', (e) => {
          if (e.target === incompleteDialogOverlay) {
              closeIncompleteTasksDialog();
          }
     });

    // Profile Edit Listeners
    editProfileBtn.addEventListener('click', showProfileEditModal);
    cancelProfileEditBtn.addEventListener('click', closeProfileEditModal);
    saveProfileBtn.addEventListener('click', saveProfileEdit);
    profileEditModal.addEventListener('click', (e) => {
         if (e.target === profileEditModal) {
             closeProfileEditModal();
         }
     });


    // --- Initial Load ---
    function init() {
        console.log("Initializing app...");
        // Initial UI state setup
         gameTitle.textContent = '[Game Title Loading...]';
         gameVisual.innerHTML = '[Game Visual Loading...]';
         gameProgressArea.innerHTML = '';
         gameStatusText.textContent = '[Game Status Loading...]';
         victoryMessage.classList.add('hidden');
         missionReportModal.classList.add('hidden');
         incompleteDialogOverlay.classList.add('hidden');
         profileEditModal.classList.add('hidden');

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

        renderProfile();

        // Render tasks and game area based on the determined initial state
        renderTasks();

        startDateTimeInterval();

        if (!isDayCompleteState) {
             newTaskInput.focus();
         }

        console.log("App initialization complete.");
    }

    // --- Start the application ---
    init();
});
