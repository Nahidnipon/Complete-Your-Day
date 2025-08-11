document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const welcomeMessage = document.getElementById('welcome-message');
    const dateTimeDisplay = document.getElementById('date-time');
    const gameTitle = document.getElementById('game-title');
    const gameVisual = document.getElementById('game-visual');
    const gameProgressArea = document.getElementById('game-progress');
    const gameStatusText = document.getElementById('game-status-text');
    const victoryMessage = document.getElementById('victory-message');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoList = document.getElementById('todo-list'); // Key element for drag-drop
    const ongoingList = document.getElementById('ongoing-list');
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
    const incompleteDialogOverlay = document.getElementById('incomplete-dialog-overlay');
    const incompleteDialogTitle = document.getElementById('incomplete-dialog-title');
    const incompleteDialogMessage = document.getElementById('incomplete-dialog-message');
    const incompleteTaskList = document.getElementById('incomplete-task-list');
    const cancelCompleteBtn = document.getElementById('cancel-complete-btn');
    const forceCompleteBtn = document.getElementById('force-complete-btn');
    const profileIconSpan = document.getElementById('profile-icon');
    const playerNameSpan = document.getElementById('player-name');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileEditModal = document.getElementById('profile-edit-modal');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileIconSelection = document.getElementById('profile-icon-selection');
    const collectedItemsList = document.getElementById('collected-items-list');
    const noItemsMessage = document.getElementById('no-items-message');
    const cancelProfileEditBtn = document.getElementById('cancel-profile-edit-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    
    // Timer elements
    const timerDisplay = document.getElementById('timer-display');
    const timerStartBtn = document.getElementById('timer-start');
    const timerPauseBtn = document.getElementById('timer-pause');
    const timerResetBtn = document.getElementById('timer-reset');
    const totalTimeDisplay = document.getElementById('total-time-display');

    // --- Audio ---
    let completeSound, victorySound;
    try {
        completeSound = new Audio('audio/complete.wav');
        victorySound = new Audio('audio/victory.wav');
        completeSound.preload = 'auto';
        victorySound.preload = 'auto';
        // Simplified sound unlock
        const unlockSounds = () => {
            if (completeSound.readyState >= 2 && completeSound.paused) { completeSound.volume = 0; completeSound.play().then(() => completeSound.volume = 1).catch(e => {}); }
            if (victorySound.readyState >= 2 && victorySound.paused) { victorySound.volume = 0; victorySound.play().then(() => victorySound.volume = 1).catch(e => {}); }
            document.body.removeEventListener('click', unlockSounds);
            document.body.removeEventListener('touchend', unlockSounds);
        };
        document.body.addEventListener('click', unlockSounds, { once: true });
        document.body.addEventListener('touchend', unlockSounds, { once: true });
    } catch (e) {
        console.error("Could not load audio files.", e);
        completeSound = { play: () => {}, paused: true, readyState: 0, volume: 1 };
        victorySound = { play: () => {}, paused: true, readyState: 0, volume: 1 };
    }

    // --- Game Definitions & Rewards ---
    const REWARDS = [
        { streak: 1, item: '✨ First Quest Completed!' }, { streak: 3, item: '🏆 Bronze Trophy' },
        { streak: 5, item: '🗡️ Rusty Sword' }, { streak: 7, item: '🛡️ Wooden Shield' },
        { streak: 10, item: '💎 Small Gem' }, { streak: 15, item: '👑 Iron Crown' },
        { streak: 20, item: '🔮 Mystic Orb' }, { streak: 25, item: '🐉 Dragon Scale' },
        { streak: 30, item: '🌟 Hero\'s Star' },
    ];
    const GAME_THEMES = [
        { id: 'dragon', name: "Dragon's Downfall", progressType: 'health', victoryText: "VICTORY! The Dragon is vanquished!", visualStages: ['🔥🐉🔥', '🛡️🐉', '⚔️🐉', '💥🐉', '🤕🐉', '😩🐉'], defeatedVisual: '💀', stageDescriptions: ["The mighty Dragon awakens...", "A brave adventurer approaches!", "The battle begins!", "The Dragon takes damage!", "The Dragon is wounded!", "The Dragon falters..."], finalDescription: "The Dragon is defeated!", incompleteMessage: "The Dragon still breathes fire! Complete your remaining quests to defeat it." },
        { id: 'mountain', name: "Mountain Climb", progressType: 'steps', stepChar: '🧗', victoryText: "PEAK CONQUERED! You reached the summit!", visualStages: ['⛰️', '⛰️', '⛰️', '⛰️', '🏔️'], defeatedVisual: '🏆', stageDescriptions: ["The towering peak looms...", "Beginning the ascent.", "Halfway up the treacherous path!", "The summit is within reach!", "Scaling the final section!"], finalDescription: "You reached the summit!", incompleteMessage: "You haven't reached the top yet! Complete your remaining quests to conquer the peak." },
        { id: 'castle', name: "Build the Castle", progressType: 'build', pieces: ['🧱','🧱','🏛️','🧱','🏰'], victoryText: "FORTIFIED! Your castle stands strong!", visualStages: [' foundations ', '🧱', '🧱🧱', '🧱🏛️🧱', '🏰旗'], defeatedVisual: '🏰✨', stageDescriptions: ["Preparing the grounds...", "Laying the first bricks!", "Walls are rising!", "Adding defenses and towers!", "The keep and banner are ready!"], finalDescription: "Your castle stands strong!", incompleteMessage: "The castle is unfinished! Complete your remaining quests to secure the fort." },
        { id: 'map', name: "Uncover Treasure", progressType: 'reveal', item: '<span class="nes-icon coin is-small"></span>', victoryText: "TREASURE FOUND! X marks the spot!", visualStages: ['❓🗺️❓', '🗺️🔍', '🗺️📍', '🗺️⛏️', '🗺️💎'], defeatedVisual: '💰👑', stageDescriptions: ["A worn, cryptic map...", "Following faint clues...", "The location is marked!", "Digging for the buried chest...", "A glint of gold appears!"], finalDescription: "X marks the spot! Treasure found!", incompleteMessage: "The map is incomplete! Complete your remaining quests to find the treasure." },
        { id: 'escape', name: "The Great Escape", progressType: 'steps', stepChar: '🏃', victoryText: "ESCAPED! Freedom at last!", visualStages: ['🔒🧱', '🧱', '🧱', '🚧', '🌳'], defeatedVisual: '🌅', stageDescriptions: ["Trapped in the dungeon!", "Searching for an exit...", "Found a way out!", "Navigating obstacles!", "Freedom is just ahead!"], finalDescription: "You have escaped!", incompleteMessage: "The path is blocked! Complete your remaining quests to make your escape." },
        { id: 'voyage', name: "Cosmic Voyage", progressType: 'steps', stepChar: '🚀', victoryText: "DESTINATION REACHED! A successful journey!", visualStages: ['🌌', '🌌', '🪐', '🪐', '🪐'], defeatedVisual: '🪐🏠', stageDescriptions: ["Preparing for launch...", "Cruising through the cosmos...", "Destination in sight!", "Entering the planet's orbit!", "Successful landing!"], finalDescription: "Destination reached!", incompleteMessage: "The journey is unfinished! Complete your remaining quests to reach the destination." },
        { id: 'elixir', name: "Brew the Elixir", progressType: 'fill', item: '💧', victoryText: "POTION BREWED! Magical power awaits!", visualStages: ['🧪', '🧪🔴', '🧪🟠', '🧪🟡', '🧪🟢', '✨🧪✨'], defeatedVisual: '✨🧪✨', stageDescriptions: ["Gathering rare ingredients...", "Adding the crimson leaf...", "The mixture simmers warmly...", "A golden light appears...", "Vibrant green hue forms!", "Bubbling with magical energy!"], finalDescription: "The Elixir is ready!", incompleteMessage: "The potion is incomplete! Complete your remaining quests to finish brewing it." },
        { id: 'bean', name: "Grow the Magic Bean", progressType: 'build', pieces: ['🌱','🌿','🌲','🌳','☁️'], victoryText: "IT'S HUGE! The beanstalk reaches the clouds!", visualStages: ['🌰', '🌱', '🌿', '🌲', '🌳', '☁️🌳'], defeatedVisual: '☁️🌳', stageDescriptions: ["Planting the tiny seed...", "A small sprout appears!", "Leaves unfurl rapidly...", "A sturdy stem takes form!", "Growing towards the sky!", "Reaching the cloud layer!"], finalDescription: "The beanstalk is massive!", incompleteMessage: "The beanstalk is still growing! Complete your remaining quests to reach the top." },
        { id: 'crystal', name: "Charge the Crystal", progressType: 'charge', item: '⚡', victoryText: "FULLY CHARGED! The crystal glows with power!", visualStages: ['💎', '💎⚡', '💎⚡⚡', '💎⚡⚡⚡', '💎✨⚡⚡✨', '💎💥'], defeatedVisual: '💎💥', stageDescriptions: ["Placing the dull crystal...", "Building the initial charge...", "Energy surges within...", "The crystal is humming!", "Glowing intensely!", "Radiating raw power!"], finalDescription: "The crystal is fully charged!", incompleteMessage: "The crystal needs more energy! Complete your remaining quests to charge it." },
        { id: 'fort', name: "Defend the Fort", progressType: 'build', pieces: ['🧱','🛡️','🏹','🔥','👑'], victoryText: "SECURE! The fort is impenetrable!", visualStages: ['🏕️', '🏕️🧱', '🏕️🧱🛡️', '🏕️🧱🛡️🏹', '🏕️🧱🛡️🏹🔥', '👑🚩'], defeatedVisual: '👑🚩', stageDescriptions: ["Setting up the camp...", "Building the first defense wall!", "Reinforcing the fortifications!", "Manning the towers!", "Bracing for the final push!", "The fort stands undefeated!"], finalDescription: "The fort is secure!", incompleteMessage: "The fort is still vulnerable! Complete your remaining quests to secure your defenses." }
    ];
    const PROFILE_ICONS = ['👤', '🌟', '🚀', '🏰', '🐉', '🏆', '🗡️', '🧙', '🤖', '👾', '🐱', '🐶', '✨', '💡'];

    // --- State ---
    let tasks = [];
    let currentGame = null;
    let dateTimeInterval = null;
    let isDayCompleteState = false;
    let gameWinState = false;
    let profile = { name: 'Adventurer', icon: '👤', collectedItems: [] };
    let timerState = {
        timeLeft: 25 * 60, // 25 minutes in seconds
        totalTime: 25 * 60,
        isRunning: false,
        interval: null,
        dailyTotal: 0,
        lastDate: getCurrentDateString()
    };
    const TIMER_STORAGE_KEY = 'vintageTimer_v1';
    
    // Timer state
    let timerInterval = null;
    let timerSeconds = 25 * 60; // 25 minutes in seconds
    let totalTimeToday = 0; // Total time spent today in seconds
    let isTimerRunning = false;
    
    const STORAGE_KEYS = {
        TASKS: 'vintageTasks_v10_subtasks', 
        GAME_INFO: 'vintageGameInfo_v10_subtasks',
        DAY_COMPLETE: 'vintageDayComplete_v10_subtasks', 
        PROFILE: 'vintageProfile_v6_subtasks',
        TIMER: 'vintageTimer_v1'
        TIMER: 'vintageTimer_v11_notimer'
    };
    let draggedTaskId = null; // For drag and drop

    // --- Functions ---
    function updateDateTime() {
        const now = new Date();
        dateTimeDisplay.textContent = `${now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/New_York' })} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/New_York' })}`;
    }
    function startDateTimeInterval() { if (!dateTimeInterval) dateTimeInterval = setInterval(updateDateTime, 1000); }
    function getCurrentDateString() { return new Date().toISOString().split('T')[0]; }

    // Timer Functions
    function updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        const totalTimeDisplay = document.getElementById('total-time-display');
        if (timerDisplay) timerDisplay.textContent = formatTime(timerState.timeLeft);
        if (totalTimeDisplay) totalTimeDisplay.textContent = `Total: ${formatTime(timerState.totalTimeToday)}`;
    }

    function updateTimerProgressBar() {
        const progressFill = document.getElementById('timer-progress-fill');
        if (progressFill) {
            const progress = ((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100;
            progressFill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        }
    }

    function updateTimer() {
        if (timerState.timeLeft > 0) {
            timerState.timeLeft--;
            timerState.totalTimeToday++;
            updateTimerDisplay();
            updateTimerProgressBar();
            saveTimerState();
        } else {
            // Timer finished
            pauseTimer();
            playSound(victorySound);
            alert('Focus session complete! Great job!');
        }
    }

    function startTimer() {
        if (!timerState.isRunning) {
            timerState.isRunning = true;
            timerState.interval = setInterval(updateTimer, 1000);
            updateTimerButtons();
        }
    }

    function pauseTimer() {
        if (timerState.isRunning) {
            timerState.isRunning = false;
            if (timerState.interval) {
                clearInterval(timerState.interval);
                timerState.interval = null;
            }
            updateTimerButtons();
        }
    }

    function resetTimer() {
        pauseTimer();
        timerState.timeLeft = timerState.totalTime;
        updateTimerDisplay();
        updateTimerProgressBar();
        saveTimerState();
    }

    function updateTimerButtons() {
        const startBtn = document.getElementById('timer-start');
        const pauseBtn = document.getElementById('timer-pause');
        if (startBtn) startBtn.disabled = timerState.isRunning;
        if (pauseBtn) pauseBtn.disabled = !timerState.isRunning;
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function saveTimerState() {
        localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(timerState));
    }

    function loadTimerState() {
        const saved = localStorage.getItem(STORAGE_KEYS.TIMER);
        if (saved) {
            const savedState = JSON.parse(saved);
            const today = getCurrentDateString();
            
            // Reset total time if it's a new day
            if (savedState.lastResetDate !== today) {
                savedState.totalTimeToday = 0;
                savedState.lastResetDate = today;
            }
            
            timerState = { ...timerState, ...savedState };
            // Don't restore running state - always start paused
            timerState.isRunning = false;
            timerState.interval = null;
        }
    }

    function saveGameSelection(gameId, dateStr) {
        localStorage.setItem(STORAGE_KEYS.GAME_INFO, JSON.stringify({ id: gameId, date: dateStr }));
    }

    function determineGame() {
        const todayStr = getCurrentDateString();
        const storedGameInfo = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_INFO)) || {};
        let gameIdToUse = storedGameInfo.date === todayStr && GAME_THEMES.find(g => g.id === storedGameInfo.id) ? storedGameInfo.id : null;

        if (!gameIdToUse) {
            let hash = 0;
            for (let i = 0; i < todayStr.length; i++) { hash = ((hash << 5) - hash) + todayStr.charCodeAt(i); hash &= hash; }
            gameIdToUse = GAME_THEMES[Math.abs(hash) % GAME_THEMES.length].id;
            saveGameSelection(gameIdToUse, todayStr);
        }
        currentGame = GAME_THEMES.find(g => g.id === gameIdToUse) || GAME_THEMES[0];
    }

    function loadState() {
        tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
        loadTimerState();
        // Migrate old tasks to include status field
        tasks = tasks.map(task => ({
            ...task,
            status: task.status || (task.completed ? 'completed' : 'todo'),
            subtasks: task.subtasks || []
        }));
        isDayCompleteState = localStorage.getItem(STORAGE_KEYS.DAY_COMPLETE) === 'true';
        const storedProfile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
        profile = { ...{ name: 'Adventurer', icon: '👤', streak: 0, collectedItems: [] }, ...storedProfile };
        if (!Array.isArray(profile.collectedItems)) profile.collectedItems = [];

        const storedGameInfo = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAME_INFO));
        if (isDayCompleteState && storedGameInfo?.date && storedGameInfo.date !== getCurrentDateString()) {
            startNewDay(true); return true;
        }
        return false;
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.DAY_COMPLETE, isDayCompleteState);
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        saveTimerState();
    }

    function renderProfile() {
        profileIconSpan.textContent = profile.icon;
        playerNameSpan.textContent = profile.name;
        welcomeMessage.textContent = `Welcome ${profile.name}!`;
    }
    
    function setDayCompletionStyling() {
        const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
        const totalTasksCount = tasks.length;
        const isGameWonCurrent = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

        mainContainer.classList.toggle('day-completed', isDayCompleteState);
        [addTaskBtn, newTaskInput].forEach(el => el.disabled = isDayCompleteState);
        completeDayBtn.disabled = isDayCompleteState || totalTasksCount === 0; // Simpler logic, allow completion with incomplete tasks via dialog

        if (isGameWonCurrent && isDayCompleteState) {
            victoryMessage.textContent = currentGame.victoryText || "Quest Complete!";
            victoryMessage.classList.remove('hidden');
        } else {
            victoryMessage.classList.add('hidden');
        }
        // Re-render tasks to update draggable attributes and styles
        renderTasksDOM();
    }

    function renderGameArea() {
        if (!currentGame) {
            gameTitle.textContent = '[Loading...]'; gameVisual.innerHTML = ''; gameProgressArea.innerHTML = ''; gameStatusText.textContent = '';
            return;
        }
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        gameWinState = totalTasks > 0 && completedTasks === totalTasks;
        gameTitle.textContent = currentGame.name;

        let currentVisualHTML, currentDescription;
        if (totalTasks === 0) {
            currentVisualHTML = currentGame.visualStages?.[0] || '🎮';
            currentDescription = "Add quests to begin!";
        } else if (gameWinState) {
            currentVisualHTML = currentGame.defeatedVisual || currentGame.visualStages?.[(currentGame.visualStages?.length || 1) - 1] || '🎉';
            currentDescription = currentGame.finalDescription || "Quest Complete!";
        } else {
            const stageIndex = Math.min(completedTasks, (currentGame.visualStages?.length || 1) - 1);
            currentVisualHTML = currentGame.visualStages?.[stageIndex] || '🎮';
            currentDescription = currentGame.stageDescriptions?.[stageIndex] || `Progress: ${completedTasks}/${totalTasks}`;
        }
        gameVisual.innerHTML = currentVisualHTML;
        gameVisual.classList.toggle('defeated', gameWinState);
        gameStatusText.textContent = currentDescription;
        gameProgressArea.innerHTML = ''; // Clear before rendering new progress

        if (totalTasks > 0) {
            const progressPercent = (completedTasks / totalTasks) * 100;
            switch (currentGame.progressType) {
                case 'health':
                    const health = 100 - progressPercent;
                    gameProgressArea.innerHTML = `<div class="progress-bar-container"><progress class="Nes nes-progress ${health < 30 ? 'is-error' : health < 60 ? 'is-warning' : 'is-success'}" value="${health}" max="100"></progress></div>`;
                    break;
                case 'steps':
                    let stepsHTML = '<div class="progress-steps">';
                    for (let i = 0; i < totalTasks; i++) {
                        let content = (i === completedTasks && !gameWinState) ? (currentGame.stepChar || '🚶') : (i === totalTasks - 1 && gameWinState ? '🏁' : '');
                        stepsHTML += `<div class="step ${i < completedTasks ? 'completed' : ''}"><span>${content}</span></div>`;
                    }
                    stepsHTML += '</div>';
                    gameProgressArea.innerHTML = stepsHTML;
                    break;
                case 'build':
                    const pieces = currentGame.pieces || Array(totalTasks).fill('█');
                    gameProgressArea.innerHTML = `<div class="build-progress">${pieces.slice(0, completedTasks).map(p => `<span class="build-piece added">${p}</span>`).join(' ')}</div>`;
                    break;
                case 'fill': gameProgressArea.innerHTML = `<span class="fill-visual">${Array(completedTasks + 1).join(currentGame.item || '💧')}</span>`; break;
                case 'charge': gameProgressArea.innerHTML = `<span class="charge-indicator">${Array(completedTasks + 1).join(currentGame.item || '⚡')}</span>`; break;
                case 'reveal':
                    let revealHTML = '<div class="reveal-area">';
                    for (let i = 0; i < totalTasks; i++) revealHTML += `<span class="reveal-item ${i < completedTasks ? 'revealed' : ''}">${i < completedTasks ? (currentGame.item || '💎') : '❓'}</span>`;
                    revealHTML += '</div>';
                    gameProgressArea.innerHTML = revealHTML;
                    break;
                default: gameProgressArea.innerHTML = `Completed: ${completedTasks}/${totalTasks}`;
            }
        }
    }
    
    // Renders only the task DOM, used by renderAll and drag/drop
    function renderTasksDOM() {
        todoList.innerHTML = '';
        ongoingList.innerHTML = '';
        completedList.innerHTML = '';
        let hasTodo = false;
        let hasOngoing = false;
        let hasCompleted = false;

        tasks.forEach(task => {
            const li = createTaskElement(task);
            if (task.status === 'completed') {
                completedList.appendChild(li);
                hasCompleted = true;
            } else if (task.status === 'ongoing') {
                ongoingList.appendChild(li);
                hasOngoing = true;
            } else {
                todoList.appendChild(li);
                hasTodo = true;
            }
        });

        if (tasks.length === 0) {
            todoList.innerHTML = '<li class="task-placeholder">No quests yet... Add one!</li>';
            ongoingList.innerHTML = '<li class="task-placeholder">No ongoing quests yet.</li>';
            completedList.innerHTML = '<li class="task-placeholder">No completed quests yet.</li>';
        } else {
            if (!hasTodo) todoList.innerHTML = '<li class="task-placeholder">No pending quests!</li>';
            if (!hasOngoing) ongoingList.innerHTML = '<li class="task-placeholder">No ongoing quests yet.</li>';
            if (!hasCompleted) completedList.innerHTML = '<li class="task-placeholder">No completed quests yet.</li>';
        }
    }

    // Main render function
    function renderAll() {
        renderTasksDOM(); // Render task items
        renderGameArea(); // Render game visuals and progress
        setDayCompletionStyling(); // Apply styles based on day completion
        saveState(); // Persist any changes
    }


    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.status === 'completed' ? 'is-completed' : ''} ${task.status === 'ongoing' ? 'is-ongoing' : ''}`;
        li.dataset.id = task.id;
        li.setAttribute('role', 'checkbox');
        li.setAttribute('aria-checked', (task.status === 'completed').toString());

        // Draggable only if NOT completed AND day is NOT complete
        if (task.status !== 'completed' && !isDayCompleteState) {
            li.draggable = true;
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragend', handleDragEnd);
        }

        // For ongoing tasks, create a different structure
        if (task.status === 'ongoing') {
            // Create header container for ongoing tasks
            const headerDiv = document.createElement('div');
            headerDiv.className = 'ongoing-task-header';

            // Tick button for ongoing tasks
            const tickButton = document.createElement('button');
            tickButton.className = 'task-tick-btn Nes nes-btn is-success is-small';
            tickButton.innerHTML = '✓';
            tickButton.title = 'Complete Quest';
            tickButton.disabled = isDayCompleteState;
            tickButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!isDayCompleteState) completeOngoingTask(task.id);
            });

            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.textContent = task.text;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'task-actions';

            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="Nes nes-icon edit is-small"></i>';
            editBtn.className = 'Nes nes-btn is-small is-warning';
            editBtn.title = "Edit Quest";
            editBtn.disabled = isDayCompleteState;
            editBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!editBtn.disabled) editTask(task.id, li); });

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="Nes nes-icon close is-small"></i>';
            deleteBtn.className = 'Nes nes-btn is-error is-small';
            deleteBtn.title = "Discard Quest";
            deleteBtn.disabled = isDayCompleteState;
            deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!deleteBtn.disabled) deleteTask(task.id); });

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);

            headerDiv.appendChild(tickButton);
            headerDiv.appendChild(textSpan);
            headerDiv.appendChild(actionsDiv);

            li.appendChild(headerDiv);

            // Add subtasks container
            if (task.subtasks && task.subtasks.length > 0) {
                const subtasksContainer = createSubtasksContainer(task);
                li.appendChild(subtasksContainer);
            }

            // Add "Add Subtask" input if not day complete
            if (!isDayCompleteState) {
                const addSubtaskContainer = createAddSubtaskContainer(task.id);
                li.appendChild(addSubtaskContainer);
            }

            return li;
        } else {
            // Create appropriate action button based on task status
            let actionButton;
            // Regular checkbox for todo and completed tasks
            actionButton = document.createElement('div');
            actionButton.className = 'task-checkbox';
            if (isDayCompleteState || task.status === 'completed') actionButton.classList.add('disabled');
            actionButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!isDayCompleteState && task.status !== 'completed') toggleTaskCompletion(task.id);
            });

            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.textContent = task.text;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'task-actions';

            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="Nes nes-icon edit is-small"></i>';
            editBtn.className = 'Nes nes-btn is-small is-warning';
            editBtn.title = "Edit Quest";
            editBtn.disabled = isDayCompleteState || task.status === 'completed';
            editBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!editBtn.disabled) editTask(task.id, li); });

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="Nes nes-icon close is-small"></i>';
            deleteBtn.className = 'Nes nes-btn is-error is-small';
            deleteBtn.title = "Discard Quest";
            deleteBtn.disabled = isDayCompleteState && task.status !== 'completed';
            deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!deleteBtn.disabled) deleteTask(task.id); });

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            li.appendChild(actionButton);
            li.appendChild(textSpan);
            li.appendChild(actionsDiv);
            return li;
        }
    }

    function createSubtasksContainer(task) {
        const container = document.createElement('div');
        container.className = 'subtasks-container';
        
        task.subtasks.forEach(subtask => {
            const subtaskDiv = document.createElement('div');
            subtaskDiv.className = 'subtask-item';
            subtaskDiv.dataset.subtaskId = subtask.id;

            const checkbox = document.createElement('div');
            checkbox.className = `subtask-checkbox ${subtask.completed ? 'completed' : ''}`;
            checkbox.addEventListener('click', () => toggleSubtask(task.id, subtask.id));

            const textSpan = document.createElement('span');
            textSpan.className = `subtask-text ${subtask.completed ? 'completed' : ''}`;
            textSpan.textContent = subtask.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '×';
            deleteBtn.className = 'Nes nes-btn is-error is-small subtask-delete';
            deleteBtn.title = 'Delete Subtask';
            deleteBtn.addEventListener('click', () => deleteSubtask(task.id, subtask.id));

            subtaskDiv.appendChild(checkbox);
            subtaskDiv.appendChild(textSpan);
            subtaskDiv.appendChild(deleteBtn);
            container.appendChild(subtaskDiv);
        });

        return container;
    }

    function createAddSubtaskContainer(taskId) {
        const container = document.createElement('div');
        container.className = 'add-subtask-container';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'add-subtask-input Nes nes-input';
        input.placeholder = 'Add subtask...';

        const addBtn = document.createElement('button');
        addBtn.textContent = '+';
        addBtn.className = 'add-subtask-btn Nes nes-btn is-primary is-small';
        addBtn.title = 'Add Subtask';

        const addSubtask = () => {
            const text = input.value.trim();
            if (text) {
                addSubtaskToTask(taskId, text);
                input.value = '';
            }
        };

        addBtn.addEventListener('click', addSubtask);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addSubtask();
        });

        container.appendChild(input);
        container.appendChild(addBtn);
        return container;
    }

    function addTask() {
        if (isDayCompleteState) return;
        const text = newTaskInput.value.trim();
        if (text === '') {
            newTaskInput.classList.add('input-error');
            newTaskInput.placeholder = 'Quest cannot be empty!';
            setTimeout(() => { newTaskInput.classList.remove('input-error'); newTaskInput.placeholder = 'Enter quest details...'; }, 500);
            newTaskInput.focus();
            return;
        }
        tasks.unshift({ id: Date.now(), text: text, status: 'todo', subtasks: [] }); // Add to top
        newTaskInput.value = '';
        newTaskInput.focus();
        renderAll();
    }

    function toggleTaskCompletion(id) {
        if (isDayCompleteState) return;
        let taskJustCompleted = false;
        tasks = tasks.map(task => {
            if (task.id === id && task.status !== 'completed') {
                taskJustCompleted = true;
                return { ...task, status: 'completed' };
            }
            return task;
        });
        if (taskJustCompleted) {
            playSound(completeSound);
            const li = todoList.querySelector(`li[data-id='${id}']`) || ongoingList.querySelector(`li[data-id='${id}']`);
            if (li) {
                li.classList.add('completing');
                setTimeout(renderAll, 300); // Re-render after animation
            } else {
                renderAll(); // Fallback
            }
        } else {
            renderAll(); // If already completed or no change
        }
    }

    function completeOngoingTask(id) {
        if (isDayCompleteState) return;
        tasks = tasks.map(task => {
            if (task.id === id && task.status === 'ongoing') {
                return { ...task, status: 'completed' };
            }
            return task;
        });
        playSound(completeSound);
        const li = ongoingList.querySelector(`li[data-id='${id}']`);
        if (li) {
            li.classList.add('completing');
            setTimeout(renderAll, 300);
        } else {
            renderAll();
        }
    }

    function deleteTask(id) {
        const taskToDelete = tasks.find(task => task.id === id);
        if (!taskToDelete || (isDayCompleteState && taskToDelete.status !== 'completed')) return;
        if (confirm('Discard this quest forever?')) {
            tasks = tasks.filter(task => task.id !== id);
            renderAll();
        }
    }

    function editTask(id, listItem) {
        if (isDayCompleteState) return;
        const task = tasks.find(t => t.id === id);
        if (!task || task.status === 'completed') return;

        const textSpan = listItem.querySelector('.task-text');
        const currentText = task.text;
        const input = document.createElement('input');
        input.type = 'text'; input.value = currentText; input.className = 'edit-input Nes nes-input';
        Object.assign(input.style, { fontSize: 'inherit', flexGrow: '1', marginBottom: '0' });

        listItem.replaceChild(input, textSpan);
        input.focus(); input.select();

        const saveEdit = () => {
            if (!listItem.contains(input)) return; // Already saved or cancelled
            const newText = input.value.trim();
            tasks = tasks.map(t => t.id === id ? { ...t, text: newText || currentText } : t);
            renderAll(); // This will replace input with span
        };
        input.addEventListener('blur', saveEdit, { once: true });
        input.addEventListener('keypress', e => { if (e.key === 'Enter') input.blur(); });
        input.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                input.removeEventListener('blur', saveEdit);
                listItem.replaceChild(textSpan, input); // Put original span back
                // No need to call renderAll if only reverting visual, task data unchanged.
                // However, if other parts of renderAll are crucial, call it. For now, this is simpler.
            }
        });
    }

    function finalizeDayCompletion() {
        if (isDayCompleteState) return; // Should not happen

        const completedCount = tasks.filter(t => t.status === 'completed').length;
        const totalCount = tasks.length;
        const gameActuallyWon = totalCount > 0 && completedCount === totalCount;


        if (gameActuallyWon) {
            playSound(victorySound);
        }
        isDayCompleteState = true;
        
        renderProfile(); // Update header display
        renderAll(); // This will call setDayCompletionStyling, saveState, and re-render tasks (disabling draggable)
        showMissionReport();
    }

    function addSubtaskToTask(taskId, subtaskText) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                const newSubtask = {
                    id: Date.now() + Math.random(), // Ensure unique ID
                    text: subtaskText,
                    completed: false
                };
                return { ...task, subtasks: [...(task.subtasks || []), newSubtask] };
            }
            return task;
        });
        renderAll();
    }

    function toggleSubtask(taskId, subtaskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                const updatedSubtasks = task.subtasks.map(subtask => {
                    if (subtask.id === subtaskId) {
                        return { ...subtask, completed: !subtask.completed };
                    }
                    return subtask;
                });
                return { ...task, subtasks: updatedSubtasks };
            }
            return task;
        });
        renderAll();
    }

    function deleteSubtask(taskId, subtaskId) {
        if (confirm('Delete this subtask?')) {
            tasks = tasks.map(task => {
                if (task.id === taskId) {
                    const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
                    return { ...task, subtasks: updatedSubtasks };
                }
                return task;
            });
            renderAll();
        }
    }

    function completeDay() {
        if (isDayCompleteState) return;
        if (tasks.length === 0) {
            newTaskInput.classList.add('input-error'); newTaskInput.placeholder = 'Add quests first!';
            setTimeout(() => { newTaskInput.classList.remove('input-error'); newTaskInput.placeholder = 'Enter quest details...'; }, 500);
            newTaskInput.focus(); return;
        }
        const incomplete = tasks.filter(t => t.status !== 'completed');
        if (incomplete.length > 0) {
            showIncompleteTasksDialog(incomplete);
        } else {
            finalizeDayCompletion();
        }
    }

    function showIncompleteTasksDialog(incomplete) {
        incompleteDialogTitle.textContent = currentGame.name;
        incompleteDialogMessage.textContent = currentGame.incompleteMessage || "You still have quests to finish.";
        incompleteTaskList.innerHTML = incomplete.map(task => `<li>${task.text}</li>`).join('');
        incompleteDialogOverlay.classList.remove('hidden');
    }
    function closeIncompleteTasksDialog() { incompleteDialogOverlay.classList.add('hidden'); }

    function showMissionReport() {
        const completed = tasks.filter(t => t.status === 'completed');
        reportDate.textContent = `Date: ${new Date().toLocaleDateString()}`;
        reportSummary.textContent = `Quests Attempted: ${tasks.length} | Completed: ${completed.length}`;
        reportTaskList.innerHTML = completed.length > 0 ? completed.map(t => `<li>${t.text}</li>`).join('') : '<li>None completed.</li>';
        
        const gameActuallyWon = tasks.length > 0 && completed.length === tasks.length;
        reportGameStatus.textContent = `Daily Challenge (${currentGame.name}): ${gameActuallyWon ? 'SUCCESSFUL!' : 'Incomplete'}`;
        reportGameStatus.className = gameActuallyWon ? 'is-success' : 'is-error';
        missionReportModal.classList.remove('hidden');
    }
    function closeMissionReport() { missionReportModal.classList.add('hidden'); }

    function startNewDay(auto = false) {
        if (!auto && !isDayCompleteState && tasks.some(t => t.status !== 'completed')) {
            if (!confirm('Start fresh? Unfinished quests will be lost. This will reset your streak if the current day\'s quest wasn\'t won!')) return;
            // Finalize the day as incomplete if not already completed to correctly handle streak.
             if (!isDayCompleteState) finalizeDayCompletion(); // This will reset streak if game not won
        } else if (!auto && isDayCompleteState){
            // Day was complete, just starting new one.
        }

        isDayCompleteState = false; tasks = []; gameWinState = false;
        // Profile (streak, items) is preserved unless reset by finalizeDayCompletion above
        totalTimeToday = 0; // Reset timer for new day
        determineGame(); // Sets new game for the new day
        renderAll(); // Clears lists, resets game area, saves state
        updateTimerDisplay();
        [missionReportModal, incompleteDialogOverlay].forEach(m => m.classList.add('hidden'));
        if (!isDayCompleteState) newTaskInput.focus();
    }

    function populateIconSelection() {
        profileIconSelection.innerHTML = PROFILE_ICONS.map(icon =>
            `<span class="icon-option ${icon === profile.icon ? 'selected' : ''}" data-icon="${icon}">${icon}</span>`
        ).join('');
        profileIconSelection.querySelectorAll('.icon-option').forEach(opt => {
            opt.addEventListener('click', () => {
                profileIconSelection.querySelector('.icon-option.selected')?.classList.remove('selected');
                opt.classList.add('selected');
            });
        });
    }
    function populateCollectedItems() {
        if (profile.collectedItems.length === 0) {
            collectedItemsList.innerHTML = '';
            noItemsMessage.classList.remove('hidden');
        } else {
            noItemsMessage.classList.add('hidden');
            collectedItemsList.innerHTML = [...profile.collectedItems].sort().map(item => `<li>${item}</li>`).join('');
        }
    }
    function showProfileEditModal() {
        profileNameInput.value = profile.name;
        populateIconSelection(); populateCollectedItems();
        profileEditModal.classList.remove('hidden'); profileNameInput.focus(); profileNameInput.select();
    }
    function closeProfileEditModal() { profileEditModal.classList.add('hidden'); }
    function saveProfileEdit() {
        profile.name = profileNameInput.value.trim() || profile.name;
        profile.icon = profileIconSelection.querySelector('.icon-option.selected')?.dataset.icon || profile.icon;
        saveState(); renderProfile(); closeProfileEditModal();
    }
    function playSound(audio) {
        if (audio?.readyState >= 2) { audio.currentTime = 0; audio.play().catch(e => console.warn("Audio play failed", e)); }
    }
    
    // --- Timer Functions ---
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timerSeconds);
        totalTimeDisplay.textContent = `Total: ${formatTime(totalTimeToday)}`;
    }
        
        // Update progress bar
        const progress = ((timerState.duration - timerState.timeLeft) / timerState.duration) * 100;
        timerProgressFill.style.width = `${progress}%`;
    
    function startTimer() {
        if (isTimerRunning) return;
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            if (timerSeconds > 0) {
                timerSeconds--;
                totalTimeToday++;
                updateTimerDisplay();
                saveState();
            } else {
                // Timer finished
                pauseTimer();
                playSound(completeSound);
                alert('Focus session complete! Take a break.');
            }
        }, 1000);
    }
    
    function pauseTimer() {
        isTimerRunning = false;
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    
    function resetTimer() {
        pauseTimer();
        timerSeconds = 25 * 60; // Reset to 25 minutes
        updateTimerDisplay();
    }

    // --- Drag and Drop Functions ---
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li.task-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function handleDragStart(e) {
        if (!e.target.classList.contains('task-item') || isDayCompleteState) {
            e.preventDefault(); return;
        }
        draggedTaskId = e.target.dataset.id;
        e.dataTransfer.setData('text/plain', draggedTaskId);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => e.target.classList.add('dragging'), 0); // Timeout for drag image
    }

    function handleDragEnd(e) {
        cleanupDragDropVisuals(); // Universal cleanup
    }

    function handleDragOver(e) {
        e.preventDefault();
        if (isDayCompleteState || !draggedTaskId) return;
        e.dataTransfer.dropEffect = 'move';

        // Clear previous visual cues first
        [todoList, ongoingList, completedList].forEach(list => {
            list.querySelectorAll('.drag-over-visual').forEach(el => el.classList.remove('drag-over-visual'));
            list.classList.remove('drag-over-empty');
        });

        // Determine which list we're over
        const targetList = e.currentTarget;
        const afterElement = getDragAfterElement(targetList, e.clientY);
        if (afterElement) {
            afterElement.classList.add('drag-over-visual');
        } else {
            // If no element to drop before, check if list is effectively empty for drop target
            const currentDraggableItems = targetList.querySelectorAll('li.task-item:not(.dragging)');
            if (currentDraggableItems.length === 0) {
                targetList.classList.add('drag-over-empty');
            }
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        if (draggedTaskId === null || isDayCompleteState) {
            cleanupDragDropVisuals(); return;
        }

        const draggedTaskActual = tasks.find(task => task.id.toString() === draggedTaskId);
        if (!draggedTaskActual) {
            console.error("Dragged task data not found:", draggedTaskId);
        }
        // Determine target status based on which list we dropped on
        const targetList = e.currentTarget;
        let newStatus;
        if (targetList === todoList) {
            newStatus = 'todo';
        } else if (targetList === ongoingList) {
            newStatus = 'ongoing';
        } else if (targetList === completedList) {
            newStatus = 'completed';
        }

        // Determine target status based on which list we dropped on
        const targetList = e.currentTarget;
        let newStatus;
        if (targetList === todoList) {
            newStatus = 'todo';
        } else if (targetList === ongoingList) {
            newStatus = 'ongoing';
        } else if (targetList === completedList) {
            newStatus = 'completed';
        }

        // Update task status
        tasks = tasks.map(task => {
            if (task.id.toString() === draggedTaskId) {
                return { ...task, status: newStatus };
            }
            return task;
        });

        // Handle reordering within the same status group
        const afterElement = getDragAfterElement(targetList, e.clientY);
        if (afterElement) {
            const afterTaskId = afterElement.dataset.id;
            const sameStatusTasks = tasks.filter(t => t.status === newStatus);
            const otherTasks = tasks.filter(t => t.status !== newStatus);
            
            const draggedTask = sameStatusTasks.find(t => t.id.toString() === draggedTaskId);
            const filteredTasks = sameStatusTasks.filter(t => t.id.toString() !== draggedTaskId);
            const afterIndex = filteredTasks.findIndex(t => t.id.toString() === afterTaskId);
            
            if (afterIndex !== -1) {
                filteredTasks.splice(afterIndex, 0, draggedTask);
            }
        }
        // Update task status
        tasks = tasks.map(task => {
            if (task.id.toString() === draggedTaskId) {
                return { ...task, status: newStatus };
            }
            return task;
        });
                filteredTasks.push(draggedTask);
        // Handle reordering within the same status group
        const afterElement = getDragAfterElement(targetList, e.clientY);
        if (afterElement) {
            const afterTaskId = afterElement.dataset.id;
            const sameStatusTasks = tasks.filter(t => t.status === newStatus);
            const otherTasks = tasks.filter(t => t.status !== newStatus);
            
            const draggedTask = sameStatusTasks.find(t => t.id.toString() === draggedTaskId);
            const filteredTasks = sameStatusTasks.filter(t => t.id.toString() !== draggedTaskId);
            const afterIndex = filteredTasks.findIndex(t => t.id.toString() === afterTaskId);
            
            if (afterIndex !== -1) {
                filteredTasks.splice(afterIndex, 0, draggedTask);
            } else {
                filteredTasks.push(draggedTask);
            }
            
            tasks = [...filteredTasks, ...otherTasks];
        } else {
            // Dropping at the end, just reorder by status
            const todoTasks = tasks.filter(t => t.status === 'todo');
            const ongoingTasks = tasks.filter(t => t.status === 'ongoing');
            // Dropping at the end, just reorder by status
            const todoTasks = tasks.filter(t => t.status === 'todo');
            const ongoingTasks = tasks.filter(t => t.status === 'ongoing');
            const completedTasks = tasks.filter(t => t.status === 'completed');
            tasks = [...todoTasks, ...ongoingTasks, ...completedTasks];
        }

        // Play sound if task was completed
        if (newStatus === 'completed' && draggedTaskActual.status !== 'completed') {
            playSound(completeSound);
            playSound(completeSound);
        }
        
        cleanupDragDropVisuals(); // Clear classes before re-render
        draggedTaskId = null; // Reset draggedTaskId *before* renderAll
        renderAll(); // Re-render tasks based on new `tasks` order and save
    }
    
    function cleanupDragDropVisuals() {
        const draggingElement = document.querySelector('.task-item.dragging');
        if (draggingElement) draggingElement.classList.remove('dragging');
        
        [todoList, ongoingList, completedList].forEach(list => {
            list.querySelectorAll('.drag-over-visual').forEach(el => el.classList.remove('drag-over-visual'));
            list.classList.remove('drag-over-empty');
        });
        // draggedTaskId is reset in handleDrop or handleDragEnd if drop is not successful
        if (event && event.type === "dragend" && draggedTaskId){ // only nullify if dragend and not handled by drop
             draggedTaskId = null;
        }
    }

    // --- Event Listeners ---
    // Timer Event Listeners
    const timerStartBtn = document.getElementById('timer-start');
    const timerPauseBtn = document.getElementById('timer-pause');
    const timerResetBtn = document.getElementById('timer-reset');
    if (timerStartBtn) timerStartBtn.addEventListener('click', startTimer);
    if (timerPauseBtn) timerPauseBtn.addEventListener('click', pauseTimer);
    if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);

    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
    completeDayBtn.addEventListener('click', completeDay);
    newDayBtn.addEventListener('click', () => startNewDay(false));
    closeReportBtn.addEventListener('click', closeMissionReport);
    missionReportModal.addEventListener('click', (e) => { if (e.target === missionReportModal) closeMissionReport(); });
    cancelCompleteBtn.addEventListener('click', closeIncompleteTasksDialog);
    forceCompleteBtn.addEventListener('click', () => { closeIncompleteTasksDialog(); finalizeDayCompletion(); });
    incompleteDialogOverlay.addEventListener('click', (e) => { if (e.target === incompleteDialogOverlay) closeIncompleteTasksDialog(); });
    editProfileBtn.addEventListener('click', showProfileEditModal);
    cancelProfileEditBtn.addEventListener('click', closeProfileEditModal);
    saveProfileBtn.addEventListener('click', saveProfileEdit);
    profileEditModal.addEventListener('click', (e) => { if (e.target === profileEditModal) closeProfileEditModal(); });
    
    // Timer event listeners
    timerStartBtn.addEventListener('click', startTimer);
    timerPauseBtn.addEventListener('click', pauseTimer);
    timerResetBtn.addEventListener('click', resetTimer);

    // Drag and Drop Listeners for todoList container
    todoList.addEventListener('dragover', handleDragOver);
    todoList.addEventListener('drop', handleDrop);
    ongoingList.addEventListener('dragover', handleDragOver);
    ongoingList.addEventListener('drop', handleDrop);
    completedList.addEventListener('dragover', handleDragOver);
    completedList.addEventListener('drop', handleDrop);
    
    todoList.addEventListener('dragleave', (e) => {
        // If leaving todoList entirely (not just moving between its children)
        if (!e.currentTarget.contains(e.relatedTarget) || e.relatedTarget === null) {
            cleanupDragDropVisuals();
        }
    });
    ongoingList.addEventListener('dragleave', (e) => {
        if (!e.currentTarget.contains(e.relatedTarget) || e.relatedTarget === null) {
            cleanupDragDropVisuals();
        }
    });
    completedList.addEventListener('dragleave', (e) => {
        if (!e.currentTarget.contains(e.relatedTarget) || e.relatedTarget === null) {
            cleanupDragDropVisuals();
        }
    });


    // --- Initial Load ---
    function init() {
        // Initial UI state setup (text content for loading states)
        [gameTitle, gameVisual, gameProgressArea, gameStatusText].forEach(el => el.innerHTML = '[Loading...]');
        victoryMessage.classList.add('hidden');
        [missionReportModal, incompleteDialogOverlay, profileEditModal, noItemsMessage].forEach(el => el.classList.add('hidden'));

        const autoNewDayStarted = loadState();
        if (!autoNewDayStarted) determineGame(); // Sets currentGame and syncs dropdown

        renderProfile();
        renderAll(); // Initial render of tasks, game area, styles, and save
        updateTimerDisplay(); // Initialize timer display
        startDateTimeInterval();
        updateTimerDisplay();
        updateTimerProgressBar();
        updateTimerButtons();
        if (!isDayCompleteState) newTaskInput.focus();
    }

    init();
});