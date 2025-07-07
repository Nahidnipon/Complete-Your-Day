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
    const todoList = document.getElementById('todo-list'); // Key element for drag-drop
    const completedList = document.getElementById('completed-list');
    const completeDayBtn = document.getElementById('complete-day-btn');
    const newDayBtn = document.getElementById('new-day-btn');
    const missionReportModal = document.getElementById('mission-report-modal');
    const reportDate = document.getElementById('report-date');
    const reportSummary = document.getElementById('report-summary');
    const reportTaskList = document.getElementById('report-task-list');
    const reportGameStatus = document.getElementById('report-game-status');
    const reportStreakStatus = document.getElementById('report-streak-status');
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
    const playerStreakSpan = document.getElementById('player-level');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileEditModal = document.getElementById('profile-edit-modal');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileIconSelection = document.getElementById('profile-icon-selection');
    const collectedItemsList = document.getElementById('collected-items-list');
    const noItemsMessage = document.getElementById('no-items-message');
    const cancelProfileEditBtn = document.getElementById('cancel-profile-edit-btn');
    const saveProfileBtn = document.getElementById('save-profile-btn');

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
    let profile = { name: 'Adventurer', icon: '👤', streak: 0, collectedItems: [] };
    const STORAGE_KEYS = {
        TASKS: 'vintageTasks_v8_dnd', GAME_INFO: 'vintageGameInfo_v8_dnd',
        DAY_COMPLETE: 'vintageDayComplete_v8_dnd', PROFILE: 'vintageProfile_v4_dnd'
    };
    let draggedTaskId = null; // For drag and drop

    // --- Functions ---
    function updateDateTime() {
        const now = new Date();
        dateTimeDisplay.textContent = `${now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}`;

    }
    function startDateTimeInterval() { if (!dateTimeInterval) dateTimeInterval = setInterval(updateDateTime, 1000); }
    function getCurrentDateString() { return new Date().toISOString().split('T')[0]; }

    function populateGameSelector() {
        gameSelectDropdown.innerHTML = GAME_THEMES.map(game => `<option value="${game.id}">${game.name}</option>`).join('');
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
        if (gameSelectDropdown.value !== currentGame.id) gameSelectDropdown.value = currentGame.id;
    }

    function handleGameChange() {
        if (isDayCompleteState) { gameSelectDropdown.value = currentGame.id; return; }
        const selectedGame = GAME_THEMES.find(g => g.id === gameSelectDropdown.value);
        if (selectedGame) {
            currentGame = selectedGame;
            saveGameSelection(selectedGame.id, getCurrentDateString());
            renderAll();
        } else {
            gameSelectDropdown.value = currentGame.id; // Revert if invalid
        }
    }

    function loadState() {
        tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
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
    }

    function renderProfile() {
        profileIconSpan.textContent = profile.icon;
        playerNameSpan.textContent = profile.name;
        playerStreakSpan.textContent = `Streak: ${profile.streak}`;
        playerStreakSpan.className = `streak-display ${profile.streak > 0 ? 'is-success' : 'is-error'}`;
        welcomeMessage.textContent = `Welcome ${profile.name}!`;
    }
    
    function setDayCompletionStyling() {
        const completedTasksCount = tasks.filter(task => task.completed).length;
        const totalTasksCount = tasks.length;
        const isGameWonCurrent = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

        mainContainer.classList.toggle('day-completed', isDayCompleteState);
        [addTaskBtn, newTaskInput, gameSelectDropdown].forEach(el => el.disabled = isDayCompleteState);
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
        const completedTasks = tasks.filter(task => task.completed).length;
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
        completedList.innerHTML = '';
        let hasIncomplete = false;

        tasks.forEach(task => {
            const li = createTaskElement(task);
            if (task.completed) {
                completedList.appendChild(li);
            } else {
                todoList.appendChild(li);
                hasIncomplete = true;
            }
        });

        if (tasks.length === 0) {
            todoList.innerHTML = '<li class="task-placeholder">No quests yet... Add one!</li>';
            completedList.innerHTML = '<li class="task-placeholder">No completed quests yet.</li>';
        } else {
            if (!hasIncomplete) todoList.innerHTML = '<li class="task-placeholder">All quests done!</li>';
            if (tasks.filter(t => t.completed).length === 0) completedList.innerHTML = '<li class="task-placeholder">No completed quests yet.</li>';
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
        li.className = `task-item ${task.completed ? 'is-completed' : ''}`;
        li.dataset.id = task.id;
        li.setAttribute('role', 'checkbox');
        li.setAttribute('aria-checked', task.completed.toString());

        // Draggable only if NOT completed AND day is NOT complete
        if (!task.completed && !isDayCompleteState) {
            li.draggable = true;
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragend', handleDragEnd);
        }

        const checkbox = document.createElement('div');
        checkbox.className = 'task-checkbox';
        if (isDayCompleteState || task.completed) checkbox.classList.add('disabled');
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isDayCompleteState && !task.completed) toggleTaskCompletion(task.id);
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
        editBtn.disabled = isDayCompleteState || task.completed;
        editBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!editBtn.disabled) editTask(task.id, li); });

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="Nes nes-icon close is-small"></i>';
        deleteBtn.className = 'Nes nes-btn is-error is-small';
        deleteBtn.title = "Discard Quest";
        deleteBtn.disabled = isDayCompleteState && !task.completed;
        deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!deleteBtn.disabled) deleteTask(task.id); });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(actionsDiv);
        return li;
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
        tasks.unshift({ id: Date.now(), text: text, completed: false }); // Add to top
        newTaskInput.value = '';
        newTaskInput.focus();
        renderAll();
    }

    function toggleTaskCompletion(id) {
        if (isDayCompleteState) return;
        let taskJustCompleted = false;
        tasks = tasks.map(task => {
            if (task.id === id && !task.completed) {
                taskJustCompleted = true;
                return { ...task, completed: true };
            }
            return task;
        });
        if (taskJustCompleted) {
            playSound(completeSound);
            const li = todoList.querySelector(`li[data-id='${id}']`); // Animate from todo list
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

    function deleteTask(id) {
        const taskToDelete = tasks.find(task => task.id === id);
        if (!taskToDelete || (isDayCompleteState && !taskToDelete.completed)) return;
        if (confirm('Discard this quest forever?')) {
            tasks = tasks.filter(task => task.id !== id);
            renderAll();
        }
    }

    function editTask(id, listItem) {
        if (isDayCompleteState) return;
        const task = tasks.find(t => t.id === id);
        if (!task || task.completed) return;

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

        const completedCount = tasks.filter(t => t.completed).length;
        const totalCount = tasks.length;
        const gameActuallyWon = totalCount > 0 && completedCount === totalCount;
        let streakMsg = "";

        if (gameActuallyWon) {
            profile.streak++;
            streakMsg = `Streak maintained! You are on a ${profile.streak} day streak!`;
            const reward = REWARDS.find(r => r.streak === profile.streak);
            if (reward && !profile.collectedItems.includes(reward.item)) {
                profile.collectedItems.push(reward.item);
                streakMsg += `\nReward unlocked: ${reward.item}!`;
            }
            playSound(victorySound);
        } else {
            streakMsg = profile.streak > 0 ? `Streak broken! Your streak of ${profile.streak} days is reset.` : "Daily quest incomplete. Streak remains 0.";
            profile.streak = 0;
        }
        isDayCompleteState = true;
        reportStreakStatus.textContent = streakMsg;
        reportStreakStatus.className = gameActuallyWon ? 'is-success' : 'is-error';
        
        renderProfile(); // Update header display
        renderAll(); // This will call setDayCompletionStyling, saveState, and re-render tasks (disabling draggable)
        showMissionReport();
    }

    function completeDay() {
        if (isDayCompleteState) return;
        if (tasks.length === 0) {
            newTaskInput.classList.add('input-error'); newTaskInput.placeholder = 'Add quests first!';
            setTimeout(() => { newTaskInput.classList.remove('input-error'); newTaskInput.placeholder = 'Enter quest details...'; }, 500);
            newTaskInput.focus(); return;
        }
        const incomplete = tasks.filter(t => !t.completed);
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
        const completed = tasks.filter(t => t.completed);
        reportDate.textContent = `Date: ${new Date().toLocaleDateString()}`;
        reportSummary.textContent = `Quests Attempted: ${tasks.length} | Completed: ${completed.length}`;
        reportTaskList.innerHTML = completed.length > 0 ? completed.map(t => `<li>${t.text}</li>`).join('') : '<li>None completed.</li>';
        
        const gameActuallyWon = tasks.length > 0 && completed.length === tasks.length;
        reportGameStatus.textContent = `Daily Challenge (${currentGame.name}): ${gameActuallyWon ? 'SUCCESSFUL!' : 'Incomplete'}`;
        reportGameStatus.className = gameActuallyWon ? 'is-success' : 'is-error';
        // reportStreakStatus is set in finalizeDayCompletion
        missionReportModal.classList.remove('hidden');
    }
    function closeMissionReport() { missionReportModal.classList.add('hidden'); }

    function startNewDay(auto = false) {
        if (!auto && !isDayCompleteState && tasks.some(t => !t.completed)) {
            if (!confirm('Start fresh? Unfinished quests will be lost. This will reset your streak if the current day\'s quest wasn\'t won!')) return;
            // Finalize the day as incomplete if not already completed to correctly handle streak.
             if (!isDayCompleteState) finalizeDayCompletion(); // This will reset streak if game not won
        } else if (!auto && isDayCompleteState){
            // Day was complete, just starting new one.
        }

        isDayCompleteState = false; tasks = []; gameWinState = false;
        // Profile (streak, items) is preserved unless reset by finalizeDayCompletion above
        determineGame(); // Sets new game for the new day
        renderAll(); // Clears lists, resets game area, saves state
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

    // --- Drag and Drop Functions ---
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li.task-item:not(.dragging):not(.is-completed)')];
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
        if (!e.target.classList.contains('task-item') || e.target.classList.contains('is-completed') || isDayCompleteState) {
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
        todoList.querySelectorAll('.drag-over-visual').forEach(el => el.classList.remove('drag-over-visual'));
        todoList.classList.remove('drag-over-empty');

        const afterElement = getDragAfterElement(todoList, e.clientY);
        if (afterElement) {
            afterElement.classList.add('drag-over-visual');
        } else {
            // If no element to drop before, check if todoList is effectively empty for drop target
            const currentDraggableItems = todoList.querySelectorAll('li.task-item:not(.is-completed):not(.dragging)');
            if (currentDraggableItems.length === 0) {
                todoList.classList.add('drag-over-empty');
            }
            // If dropping at the end of a populated list, no specific item visual needed
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        if (draggedTaskId === null || isDayCompleteState) {
            cleanupDragDropVisuals(); return;
        }

        let incompleteTasksData = tasks.filter(t => !t.completed);
        const completedTasksData = tasks.filter(t => t.completed);
        const draggedTaskActual = incompleteTasksData.find(task => task.id.toString() === draggedTaskId);

        if (!draggedTaskActual) {
            console.error("Dragged task data not found:", draggedTaskId);
            cleanupDragDropVisuals(); return;
        }

        incompleteTasksData = incompleteTasksData.filter(task => task.id.toString() !== draggedTaskId); // Remove from old position

        const afterElement = getDragAfterElement(todoList, e.clientY); // DOM element
        if (afterElement == null) { // Dropping at the end
            incompleteTasksData.push(draggedTaskActual);
        } else {
            const afterElementId = afterElement.dataset.id;
            const targetIndex = incompleteTasksData.findIndex(task => task.id.toString() === afterElementId);
            if (targetIndex !== -1) {
                incompleteTasksData.splice(targetIndex, 0, draggedTaskActual);
            } else { // Fallback if ID not found (shouldn't happen)
                incompleteTasksData.push(draggedTaskActual);
            }
        }
        tasks = [...incompleteTasksData, ...completedTasksData]; // Recombine
        
        cleanupDragDropVisuals(); // Clear classes before re-render
        draggedTaskId = null; // Reset draggedTaskId *before* renderAll
        renderAll(); // Re-render tasks based on new `tasks` order and save
    }
    
    function cleanupDragDropVisuals() {
        const draggingElement = document.querySelector('.task-item.dragging');
        if (draggingElement) draggingElement.classList.remove('dragging');
        
        todoList.querySelectorAll('.drag-over-visual').forEach(el => el.classList.remove('drag-over-visual'));
        todoList.classList.remove('drag-over-empty');
        // draggedTaskId is reset in handleDrop or handleDragEnd if drop is not successful
        if (event && event.type === "dragend" && draggedTaskId){ // only nullify if dragend and not handled by drop
             draggedTaskId = null;
        }
    }

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
    gameSelectDropdown.addEventListener('change', handleGameChange);
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

    // Drag and Drop Listeners for todoList container
    todoList.addEventListener('dragover', handleDragOver);
    todoList.addEventListener('drop', handleDrop);
    todoList.addEventListener('dragleave', (e) => {
        // If leaving todoList entirely (not just moving between its children)
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
        populateGameSelector();
        if (!autoNewDayStarted) determineGame(); // Sets currentGame and syncs dropdown

        renderProfile();
        renderAll(); // Initial render of tasks, game area, styles, and save
        startDateTimeInterval();
        if (!isDayCompleteState) newTaskInput.focus();
    }

    init();
});
