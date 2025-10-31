// Updated index.js with improvements to Skill Check handling

const mySoundsDeck = [];

function populateMySoundsDeck(skillChecks) {
    skillChecks.forEach(check => {
        // Store only sounds, not whole words
        if (check.sound) {
            mySoundsDeck.push(check.sound);
        }
    });
    persistMySoundsDeck();
}

function persistMySoundsDeck() {
    localStorage.setItem('soundsInABlenderMySounds', JSON.stringify(mySoundsDeck));
}

function initializeGame() {
    let timer;
    const timeLimit = 60; // example time limit
    let timeLeft = timeLimit;

    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
        } else {
            clearInterval(timer);
            finalizeGame();
        }
    }, 1000);
}

function finalizeGame() {
    // Logic to finalize the game
    console.log('Game finalized.');
    disableInteractions();
}

function disableInteractions() {
    // Logic to disable all interactions
    console.log('Interactions disabled.');
}

// Pass mySoundsDeck to MySoundsScreen
function loadMySoundsScreen() {
    MySoundsScreen(mySoundsDeck);
}