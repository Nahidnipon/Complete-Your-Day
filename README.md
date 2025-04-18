# Vintage Task Quest 🎮✅

**Your Daily Dose of Productivity and Pixels!**

[![Status](https://img.shields.io/badge/status-in%20progress-blue)](...)

A fun, gamified task management web application designed to motivate you by turning your daily to-do list into a mini retro-style game. Complete your tasks to progress and conquer the day's challenge!

![Screenshot of Vintage Task Quest](./screenshot.png)
*(Replace with an actual screenshot of the application!)*

## Overview

Vintage Task Quest is a simple, single-page web application built with HTML, CSS, and vanilla JavaScript. It uses the browser's `localStorage` to save your tasks and game progress, making it persistent across browser sessions *on the same computer*.

The core idea is that completing your daily tasks directly drives the progress of a simple, thematic mini-game. Each day presents a new challenge (like defeating a dragon, climbing a mountain, or building a castle), providing visual feedback and a sense of accomplishment as you check off your to-dos.

## Features ✨

*   **Task Management:** Add, complete, edit, and delete daily tasks.
*   **Intuitive UI:** Separate lists for "To Do" and "Completed" tasks.
*   **Gamified Progress:** Visual game area that updates with each completed task.
*   **Multiple Game Themes:** Choose from 10 different vintage-inspired game themes (or let it shuffle daily!).
    *   Dragon's Downfall
    *   Mountain Climb
    *   Build the Castle
    *   Uncover Treasure
    *   The Great Escape
    *   Cosmic Voyage
    *   Brew the Elixir
    *   Grow the Magic Bean
    *   Charge the Crystal
    *   Defend the Fort
*   **Daily Shuffle & Manual Selection:** Automatically gets a new theme daily, but you can manually select your favorite. Progress is maintained for the selected theme for that day.
*   **Persistence:** Tasks and game state are saved locally using `localStorage`.
*   **Retro Aesthetics:** Styled using the [NES.css](https://nostalgic-css.github.io/NES.css/) framework and the "Press Start 2P" font for a pixelated, vintage game feel.
*   **Completion Sounds:** Basic sound effects for task completion and winning the daily game.
*   **Mission Report:** "Complete Day" feature generates a summary report of your accomplishments.
*   **Full-Width Layout:** Utilizes the full browser window.
*   **Dynamic Header:** Displays a welcome message, current date, and time.

## Tech Stack 🛠️

*   **HTML5**
*   **CSS3**
    *   [NES.css](https://nostalgic-css.github.io/NES.css/) (vLatest)
    *   [Google Fonts](https://fonts.google.com/) (Press Start 2P)
*   **JavaScript (ES6+)** (Vanilla - no frameworks)
*   **Browser LocalStorage API**
*   **Web Audio API** (for sound effects)

## Setup and Installation ⚙️

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/vintage-task-quest.git
    cd vintage-task-quest
    ```
2.  **Audio Files (Required):**
    *   You need two audio files in the **root directory** of the project:
        *   `complete.wav` (or `.mp3`) - A short sound for completing a task.
        *   `victory.wav` (or `.mp3`) - A short sound for winning the day's game.
    *   *You can find free 8-bit sound effects on sites like [OpenGameArt](https://opengameart.org/), [freesound.org](https://freesound.org/), or generate some using tools like [jfxr](https://jfxr.frozenfractal.com/).*
3.  **Open the application:**
    *   Simply open the `index.html` file in your web browser.
    *   *Note:* The application uses a CDN link for NES.css. An internet connection is required for the styles to load correctly, unless you download NES.css and link it locally.

## How to Use 🕹️

1.  **Add Tasks:** Type your task into the "New Quest" input field and click "Add" or press Enter.
2.  **Select Game Theme:** Use the dropdown menu near the top to choose the visual theme for the day's game progress. Your selection will be remembered for the current day.
3.  **Complete Tasks:** Click on a task in the "To Do" list to mark it as complete. It will move to the "Completed" list, and the game progress visual will update. A sound effect will play.
4.  **Un-complete Tasks:** Click on a task in the "Completed" list to move it back to "To Do".
5.  **Edit Tasks:** Click the yellow pencil icon (<i class="Nes nes-icon edit is-small"></i>) on a "To Do" task to edit its text inline. Press Enter or click outside the input field to save, or press Escape to cancel.
6.  **Delete Tasks:** Click the red 'X' icon (<i class="Nes nes-icon close is-small"></i>) on any task to permanently delete it.
7.  **Track Progress:** Watch the game area visuals change as you complete tasks!
8.  **Complete the Day:** Once all tasks are completed, the "Complete Day" button becomes active. Click it to see your Mission Report summarizing your accomplishments.
9.  **Start New Day:** Click the "Start New Day" button to clear all tasks, reset the game progress for a potentially new theme (based on date or your selection), and start fresh.

## Future Ideas / Potential Improvements 🚀

*   More game themes and more dynamic visual progressions.
*   User accounts and cloud storage (e.g., Firebase) to sync tasks across devices.
*   More sophisticated sound effects and background music options.
*   Statistics and history tracking (e.g., streaks, completed tasks over time).
*   Customizable themes, sounds, or game elements.
*   Replace browser `alert()` and `confirm()` with NES.css dialogs.
*   Enhanced mobile responsiveness.

## License 📄

This project is licensed under the MIT License - see the `LICENSE` file for details (if you add one).

---

Happy Questing! ✨
