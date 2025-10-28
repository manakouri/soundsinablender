

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// --- INLINED CONSTANTS ---

const patterns = {
    consonants: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'],
    qu: ['qu'],
    vowels: ['a', 'e', 'i', 'o', 'u'],
    digraphs: ['sh', 'ch', 'th', 'wh', 'ph', 'ng'],
    floss: ['ff', 'll', 'ss', 'zz'],
    longConsonants: ['ck', 'tch', 'dge'],
    initialBlends: ['br', 'bl', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'pr', 'pl', 'sw', 'sm', 'spl', 'tr'],
    finalBlends: ['nt', 'rt', 'st', 'pt', 'mp'],
    longVowels: ['ai', 'ee', 'ea', 'ou'],
    sound_bdpq: ['b', 'd', 'p', 'q'],
    sound_consonants: ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'],
    sound_shortVowels: ['a', 'e', 'i', 'o', 'u'],
    sound_commonLongVowels: ['ai', 'ay', 'ee', 'ea', 'ou', 'ow', 'igh', 'oi', 'oy'],
    sound_rControlled: ['ar', 'er', 'ir', 'ur', 'or'],
    sound_lessCommonVowels: ['oo', 'ea', 'ey', 'y', 'ie', 'oe', 'ew', 'ue']
};

const forbiddenCombinations = [
    'f-u-ck', 'sh-i-t', 'c-o-ck', 'd-i-ck', 'p-i-ss', 'c-u-nt',
    'b-i-tch', 'a-ss', 's-l-u-t', 'r-a-p-e', 'r-ai-p', 'wh-o-r-e', 'f-u-x'
];

const fonts = ['font-poppins', 'font-nunito', 'font-lexend', 'font-comic-neue'];
const bdpqFonts = ['font-poppins', 'font-nunito', 'font-schoolbell', 'font-patrick-hand', 'font-opendyslexic'];

// --- INLINED COMPONENTS ---

// FIX: Added a default null value for the `children` prop to make it optional. This resolves TypeScript errors for React.createElement calls where children are passed as a separate argument instead of within the props object.
const Button = ({ children = null, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "w-full py-4 rounded-xl transition-all ease-in-out border-4 font-bold text-white";
    const shadowStyle = "shadow-[6px_6px_0px_#2D3748] border-[#2D3748] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#2D3748]";
    const variantStyles = {
        primary: "bg-green-600 hover:bg-green-700",
        secondary: "bg-blue-500 hover:bg-blue-600",
        special: "bg-orange-500 hover:bg-orange-600"
    };
    return React.createElement("button", { className: `${baseStyle} ${shadowStyle} ${variantStyles[variant]} ${className}`, ...props }, children);
};

// FIX: Added a default empty string value for the `className` prop to make it optional, as it was not being passed in some calls.
const CheckboxLabel = ({ label, checked, onChange, className = '' }) => {
    return React.createElement("label", { className: `w-full p-4 rounded-lg cursor-pointer border-2 transition-all ease-in-out ${checked ? 'bg-green-600 text-white border-green-700' : 'bg-white border-gray-300'} ${className}` },
        React.createElement("input", { type: "checkbox", className: "hidden", checked: checked, onChange: onChange }),
        label
    );
};

const RadioLabel = ({ label, name, value, checked, onChange }) => {
    return React.createElement("label", { className: `flex-1 p-4 rounded-lg cursor-pointer text-center border-2 transition-all ease-in-out ${checked ? 'bg-green-600 text-white border-green-700' : 'bg-white border-gray-300'}` },
        React.createElement("input", { type: "radio", name: name, value: value, className: "hidden", checked: checked, onChange: onChange }),
        label
    );
};

const GameModeScreen = ({ setScreen }) => {
    return React.createElement("div", { className: "space-y-8 animate-fade-in" },
        React.createElement("h1", { className: "text-4xl md:text-6xl font-bold text-center text-gray-700" }, "Sounds in a Blender"),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8" },
            React.createElement(Button, { variant: "secondary", onClick: () => setScreen('soundSetup'), className: "text-3xl md:text-5xl py-8 md:py-16" }, "Sound Pack"),
            React.createElement(Button, { variant: "primary", onClick: () => setScreen('wordSetup'), className: "text-3xl md:text-5xl py-8 md:py-16" }, "Word Generator")
        )
    );
};

const WordSetupScreen = ({ settings, setSettings, onStart }) => {
    const [mode, setMode] = useState('practice');
    const handleCheckboxChange = (e, key) => setSettings(prev => ({ ...prev, [key]: e.target.checked }));
    return React.createElement("div", { className: "space-y-6" },
        React.createElement("h1", { className: "text-4xl md:text-6xl font-bold text-center text-gray-700" }, "Word Blender"),
        React.createElement("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-gray-200" },
            React.createElement("h2", { className: "text-2xl font-bold mb-4 text-center" }, "1. Choose Your Patterns"),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-lg" },
                React.createElement(CheckboxLabel, { label: "Consonant Digraphs (sh, ch...)", checked: settings.digraphs, onChange: e => handleCheckboxChange(e, 'digraphs') }),
                React.createElement(CheckboxLabel, { label: "Floss Pattern (ff, ll...)", checked: settings.floss, onChange: e => handleCheckboxChange(e, 'floss') }),
                React.createElement(CheckboxLabel, { label: "Long Consonants (ck, tch...)", checked: settings.longConsonants, onChange: e => handleCheckboxChange(e, 'longConsonants') }),
                React.createElement(CheckboxLabel, { label: "Initial Blends (br, cl...)", checked: settings.initialBlends, onChange: e => handleCheckboxChange(e, 'initialBlends') }),
                React.createElement(CheckboxLabel, { label: "Final Blends (nt, st...)", checked: settings.finalBlends, onChange: e => handleCheckboxChange(e, 'finalBlends') }),
                React.createElement(CheckboxLabel, { label: "Silent -e", checked: settings.silentE, onChange: e => handleCheckboxChange(e, 'silentE') }),
                React.createElement("div", { className: "col-span-1 sm:col-span-2 lg:col-span-3" },
                    React.createElement(CheckboxLabel, { label: "Long Vowel Teams (ai, ee...)", checked: settings.longVowels, onChange: e => handleCheckboxChange(e, 'longVowels') })
                )
            )
        ),
        React.createElement("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-gray-200" },
            React.createElement("h2", { className: "text-2xl font-bold mb-4 text-center" }, "2. Choose Your Mode"),
            React.createElement("div", { className: "flex justify-center gap-4 text-xl" },
                React.createElement(RadioLabel, { label: "Practice", name: "word-mode", value: "practice", checked: mode === 'practice', onChange: () => setMode('practice') }),
                React.createElement(RadioLabel, { label: "Skill Check", name: "word-mode", value: "skillCheck", checked: mode === 'skillCheck', onChange: () => setMode('skillCheck') })
            ),
             mode === 'skillCheck' && React.createElement("div", { className: "mt-4 text-center text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded-lg" }, "Incorrect sounds will be saved to the 'My Sounds' deck for future practice.")
        ),
        React.createElement(Button, { onClick: () => onStart('words', mode), className: "text-3xl" }, "Start Game")
    );
};

const SoundSetupScreen = ({ settings, setSettings, onStart }) => {
    const [mode, setMode] = useState('practice');
    const handleCheckboxChange = (e, key) => setSettings(prev => ({ ...prev, [key]: e.target.checked }));
    return React.createElement("div", { className: "space-y-6" },
        React.createElement("h1", { className: "text-4xl md:text-6xl font-bold text-center text-gray-700" }, "Sound Flashcards"),
        React.createElement("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-gray-200" },
            React.createElement("h2", { className: "text-2xl font-bold mb-4 text-center" }, "1. Choose Your Sounds"),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-lg" },
                React.createElement(CheckboxLabel, { label: "b/d/p/q letter recognition", checked: settings.bdpq, onChange: e => handleCheckboxChange(e, 'bdpq') }),
                React.createElement(CheckboxLabel, { label: "Single Consonants", checked: settings.consonants, onChange: e => handleCheckboxChange(e, 'consonants') }),
                React.createElement(CheckboxLabel, { label: "Short Vowels", checked: settings.shortVowels, onChange: e => handleCheckboxChange(e, 'shortVowels') }),
                React.createElement(CheckboxLabel, { label: "Common Long Vowels (ai, igh...)", checked: settings.commonLongVowels, onChange: e => handleCheckboxChange(e, 'commonLongVowels') }),
                React.createElement(CheckboxLabel, { label: "R-Controlled (ar, or...)", checked: settings.rControlled, onChange: e => handleCheckboxChange(e, 'rControlled') }),
                React.createElement(CheckboxLabel, { label: "Less Common Vowels (oo, ew...)", checked: settings.lessCommonVowels, onChange: e => handleCheckboxChange(e, 'lessCommonVowels') })
            )
        ),
        React.createElement("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-gray-200" },
            React.createElement("h2", { className: "text-2xl font-bold mb-4 text-center" }, "2. Choose Your Mode"),
            React.createElement("div", { className: "flex justify-center gap-4 text-xl" },
                React.createElement(RadioLabel, { label: "Practice", name: "sound-mode", value: "practice", checked: mode === 'practice', onChange: () => setMode('practice') }),
                React.createElement(RadioLabel, { label: "Skill Check", name: "sound-mode", value: "skillCheck", checked: mode === 'skillCheck', onChange: () => setMode('skillCheck') })
            ),
            mode === 'skillCheck' && React.createElement("div", { className: "mt-4 text-center text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded-lg" }, "Incorrect sounds will be saved to the 'My Sounds' deck for future practice.")
        ),
        React.createElement(Button, { variant: "secondary", onClick: () => onStart('sounds', mode), className: "text-3xl" }, "Start Game")
    );
};

const GameScreen = ({ gameType, gameMode, currentWord, currentSound, onNextItem, onSwitchMode, onGameOver, onBackToMenu }) => {
    const [timeLeft, setTimeLeft] = useState(120);
    const [score, setScore] = useState(0);
    const [totalSeen, setTotalSeen] = useState(0);
    const [incorrectSounds, setIncorrectSounds] = useState([]);
    const [selectedIncorrect, setSelectedIncorrect] = useState([]);
    const timerRef = useRef(null);
    const highScore = localStorage.getItem(`soundsInABlender${gameType}HighScore`) || 0;
    const boxColors = ['bg-yellow-200 text-yellow-800', 'bg-blue-200 text-blue-800', 'bg-pink-200 text-pink-800', 'bg-purple-200 text-purple-800'];
    useEffect(() => {
        if (gameMode === 'skillCheck') {
            timerRef.current = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameMode]);
    useEffect(() => {
        if (timeLeft <= 0 && gameMode === 'skillCheck') {
            if (timerRef.current) clearInterval(timerRef.current);
            const finalScore = score + (selectedIncorrect.length === 0 ? 1 : 0);
            onGameOver(finalScore, totalSeen + 1, incorrectSounds);
        }
    }, [timeLeft, gameMode, onGameOver, score, totalSeen, incorrectSounds, selectedIncorrect]);
    const handleNext = () => {
        if (gameMode === 'skillCheck') {
            if (selectedIncorrect.length === 0) {
                setScore(prev => prev + 1);
            } else {
                const incorrect = gameType === 'words' ? currentWord.filter((_, i) => selectedIncorrect.includes(i)) : [currentSound?.text.toLowerCase() ?? ''];
                setIncorrectSounds(prev => [...prev, ...incorrect]);
            }
            setTotalSeen(prev => prev + 1);
        }
        setSelectedIncorrect([]);
        onNextItem();
    };
    const toggleIncorrect = (index) => {
        if (gameMode !== 'skillCheck') return;
        setSelectedIncorrect(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    };
    const flashcardBaseStyle = "rounded-2xl flex items-center justify-center aspect-square border-4 shadow-[8px_8px_0px_#4A5568] transition-all";
    const soundCardStyle = `text-[clamp(3rem,25vw,10rem)] ${flashcardBaseStyle}`;
    const wordCardStyle = `text-[clamp(2rem,12vw,6rem)] ${flashcardBaseStyle}`;
    return React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex justify-end items-center gap-2 mb-2" },
            gameMode === 'practice' ?
                React.createElement("button", { onClick: () => onSwitchMode('skillCheck'), title: "Switch to Skill Check", className: "py-2 px-4 text-sm font-semibold text-white bg-orange-500 rounded-lg shadow-[4px_4px_0_#2D3748] border-2 border-[#2D3748] hover:bg-orange-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#2D3748]" }, "Skill Check") :
                React.createElement("button", { onClick: () => onSwitchMode('practice'), title: "Switch to Practice Mode", className: "py-2 px-4 text-sm font-semibold text-white bg-teal-500 rounded-lg shadow-[4px_4px_0_#2D3748] border-2 border-[#2D3748] hover:bg-teal-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#2D3748]" }, "Practice Mode"),
            React.createElement("button", { onClick: onBackToMenu, title: "Back to Menu", className: "p-2 bg-gray-300 text-gray-700 rounded-lg shadow-[4px_4px_0_#2D3748] border-2 border-[#2D3748] hover:bg-gray-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#2D3748]" }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" })))
        ),
        gameMode === 'skillCheck' && React.createElement("div", { className: "text-center md:flex justify-between items-center text-xl md:text-3xl font-bold" },
            React.createElement("div", { className: "bg-white p-3 rounded-lg shadow-md border-2 border-gray-200" }, "Time: ", React.createElement("span", { className: "text-red-500" }, timeLeft, "s")),
            React.createElement("div", { className: "bg-white p-3 rounded-lg shadow-md border-2 border-gray-200" }, "High Score: ", React.createElement("span", null, highScore)),
            React.createElement("div", { className: "bg-white p-3 rounded-lg shadow-md border-2 border-gray-200" }, "Correct: ", React.createElement("span", { className: "text-green-600" }, score))
        ),
         gameMode === 'skillCheck' && React.createElement("p", {className: "text-center text-gray-600 mb-2 animate-pulse"}, "Click on any sound you get wrong before hitting the checkmark."),
        React.createElement("div", { className: `grid ${gameType === 'words' ? 'grid-cols-4' : 'grid-cols-1'} gap-2 md:gap-4 text-center font-bold` },
            gameType === 'words' && currentWord.map((part, i) => React.createElement("div", { key: i, onClick: () => toggleIncorrect(i), className: `${wordCardStyle} ${boxColors[i]} ${selectedIncorrect.includes(i) ? 'border-red-500' : 'border-gray-700'} ${gameMode === 'skillCheck' ? 'cursor-pointer' : ''}` }, part)),
            gameType === 'sounds' && currentSound && React.createElement("div", { className: "max-w-xs mx-auto w-full" }, React.createElement("div", { onClick: () => toggleIncorrect(0), className: `${soundCardStyle} ${currentSound.font} bg-green-200 text-green-800 ${selectedIncorrect.includes(0) ? 'border-red-500' : 'border-gray-700'} ${gameMode === 'skillCheck' ? 'cursor-pointer' : ''}` }, currentSound.text))
        ),
        React.createElement(Button, { onClick: handleNext, variant: "secondary", className: "mt-8" }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 mx-auto", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" })))
    );
};

const GameOverScreen = ({ onPlayAgain, onPractice, onMySounds, gameType }) => {
    const [highScore, setHighScore] = useState(0);
    useEffect(() => {
        const hs = parseInt(localStorage.getItem(`soundsInABlender${gameType}HighScore`) || '0', 10);
        setHighScore(hs);
    }, [gameType]);
    return React.createElement("div", { className: "text-center space-y-6" },
        React.createElement("h2", { className: "text-6xl font-bold text-red-500" }, "Time's Up!"),
        React.createElement("div", { className: "bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200 space-y-4" },
            React.createElement("p", { className: "text-3xl" }, "Great effort!"),
            React.createElement("p", { className: "text-3xl" }, "High Score: ", React.createElement("span", { className: "font-bold" }, highScore))
        ),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto" },
            React.createElement(Button, { onClick: onMySounds, variant: "special", className: "text-xl" }, "My Sounds"),
            React.createElement(Button, { onClick: onPlayAgain, variant: "primary", className: "text-xl" }, "New Skill Check"),
            React.createElement(Button, { onClick: onPractice, variant: "secondary", className: "text-xl" }, "Practice Mode")
        )
    );
};

const MySoundsScreen = ({ deck, onBack }) => {
    const [currentSound, setCurrentSound] = useState(null);
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const generateNextSound = useCallback(() => {
        if (deck.length === 0) {
            setCurrentSound({ text: '👍', font: 'font-poppins' });
            return;
        }
        const text = getRandomElement(deck);
        const isBdpq = patterns.sound_bdpq.includes(text.toLowerCase());
        const font = getRandomElement(isBdpq ? bdpqFonts : fonts);
        setCurrentSound({ text: text, font });
    }, [deck]);
    useEffect(() => {
        generateNextSound();
    }, [generateNextSound]);
    const flashcardBaseStyle = "rounded-2xl flex items-center justify-center aspect-square border-4 shadow-[8px_8px_0px_#4A5568] transition-all";
    const soundCardStyle = `text-[clamp(3rem,25vw,10rem)] ${flashcardBaseStyle}`;
    return React.createElement("div", { className: "space-y-6" },
        React.createElement("h1", { className: "text-4xl md:text-6xl font-bold text-center text-gray-700" }, "My Sounds Deck"),
        deck.length === 0 ?
            React.createElement("p", { className: "text-center text-2xl bg-white p-8 rounded-lg" }, "Your deck is empty. Play a Skill Check to add sounds you find tricky!") :
            React.createElement(React.Fragment, null,
                React.createElement("div", { className: "max-w-xs mx-auto w-full" },
                    currentSound && React.createElement("div", { className: `${soundCardStyle} ${currentSound.font} bg-orange-200 text-orange-800 border-gray-700` }, currentSound.text)
                ),
                React.createElement(Button, { onClick: generateNextSound, variant: "secondary" },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 mx-auto", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M14 5l7 7m0 0l-7 7m7-7H3" })
                    )
                )
            ),
        React.createElement(Button, { onClick: onBack, variant: "special", className: "max-w-md mx-auto !py-2 !text-xl" }, "Back")
    );
};

// --- INLINED APP ---

const App = () => {
    const [screen, setScreen] = useState('gameMode');
    const [gameType, setGameType] = useState('words');
    const [gameMode, setGameMode] = useState('practice');
    const [wordSettings, setWordSettings] = useState({ digraphs: true, floss: false, longConsonants: false, initialBlends: false, finalBlends: false, silentE: false, longVowels: false });
    const [soundSettings, setSoundSettings] = useState({ bdpq: false, consonants: true, shortVowels: true, commonLongVowels: false, rControlled: false, lessCommonVowels: false });
    const [currentWord, setCurrentWord] = useState([]);
    const [currentSound, setCurrentSound] = useState(null);
    const [mySoundsDeck, setMySoundsDeck] = useState([]);
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const generateSound = useCallback((soundPool) => {
        if (soundPool.length === 0) {
            setCurrentSound({ text: '...', font: 'font-poppins' });
            return;
        }
        const text = getRandomElement(soundPool);
        const isBdpq = patterns.sound_bdpq.includes(text.toLowerCase());
        const useBdpqFonts = soundSettings.bdpq && isBdpq;
        const font = getRandomElement(useBdpqFonts ? bdpqFonts : fonts);
        setCurrentSound({ text: text, font });
    }, [soundSettings]);
    const generateWordBlend = useCallback(() => {
        let part1, part2, part3, part4, currentCombination;
        do {
            const pool1 = [...patterns.consonants.filter(c => c !== 'x'), ...patterns.qu];
            if (wordSettings.digraphs) pool1.push(...patterns.digraphs.filter(d => d !== 'ng'));
            if (wordSettings.initialBlends) pool1.push(...patterns.initialBlends);
            const pool2 = [...patterns.vowels];
            if (wordSettings.longVowels) pool2.push(...patterns.longVowels);
            part1 = getRandomElement(pool1);
            part2 = getRandomElement(pool2);
            const consonantsForPool3 = patterns.consonants.filter(c => !['y', 'w', 'h', 'j', 'r'].includes(c));
            const isLongVowel = patterns.longVowels.includes(part2);
            const pool3 = [...consonantsForPool3];
            if (wordSettings.digraphs) pool3.push('ng');
            if (wordSettings.floss && !isLongVowel) pool3.push(...patterns.floss);
            if (wordSettings.longConsonants && !isLongVowel) pool3.push(...patterns.longConsonants);
            if (wordSettings.finalBlends) {
                let finalBlendsToAdd = patterns.finalBlends.filter(b => b !== 'rt');
                if (isLongVowel) finalBlendsToAdd = finalBlendsToAdd.filter(b => !['rt', 'mp', 'pt'].includes(b));
                pool3.push(...finalBlendsToAdd);
            }
            part3 = ''; part4 = '';
            if (wordSettings.silentE && patterns.vowels.includes(part2) && Math.random() < 0.4) {
                const singleConsonantPool = pool3.filter(p => consonantsForPool3.includes(p));
                if (singleConsonantPool.length > 0) {
                    part3 = getRandomElement(singleConsonantPool);
                    part4 = 'e';
                }
            }
            if (part3 === '') {
                const safePool3 = pool3.filter(p => !['f', 'l', 's', 'z', 'c', 'v'].includes(p) && p);
                part3 = getRandomElement(safePool3.length > 0 ? safePool3 : pool3.filter(p => p));
                part4 = '';
            }
            part1 = part1 || ''; part2 = part2 || ''; part3 = part3 || '';
            currentCombination = [part1, part2, part3, part4].filter(Boolean).join('-');
        } while (forbiddenCombinations.includes(currentCombination));
        setCurrentWord([part1, part2, part3, part4].filter(p => p !== ''));
    }, [wordSettings]);
    useEffect(() => {
        const storedSounds = localStorage.getItem('soundsInABlenderMySounds');
        if (storedSounds) setMySoundsDeck(JSON.parse(storedSounds));
    }, []);
    const handleStartGame = (type, mode) => {
        setGameType(type);
        setGameMode(mode);
        if (type === 'words') {
            generateWordBlend();
        } else {
            let pool = [];
            if (soundSettings.bdpq) pool.push(...patterns.sound_bdpq);
            if (soundSettings.consonants) pool.push(...patterns.sound_consonants);
            if (soundSettings.shortVowels) pool.push(...patterns.sound_shortVowels);
            if (soundSettings.commonLongVowels) pool.push(...patterns.sound_commonLongVowels);
            if (soundSettings.rControlled) pool.push(...patterns.sound_rControlled);
            if (soundSettings.lessCommonVowels) pool.push(...patterns.sound_lessCommonVowels);
            generateSound([...new Set(pool)]);
        }
        setScreen('game');
    };
    const handleSwitchMode = (newMode) => {
        setGameMode(newMode);
        handleStartGame(gameType, newMode);
    };
    const handleNextItem = () => {
        if (gameType === 'words') {
            generateWordBlend();
        } else {
            let pool = [];
            if (soundSettings.bdpq) pool.push(...patterns.sound_bdpq);
            if (soundSettings.consonants) pool.push(...patterns.sound_consonants);
            if (soundSettings.shortVowels) pool.push(...patterns.sound_shortVowels);
            if (soundSettings.commonLongVowels) pool.push(...patterns.sound_commonLongVowels);
            if (soundSettings.rControlled) pool.push(...patterns.sound_rControlled);
            if (soundSettings.lessCommonVowels) pool.push(...patterns.sound_lessCommonVowels);
            generateSound([...new Set(pool)]);
        }
    };
    const handleGameOver = (finalScore, totalSeen, incorrectSounds) => {
        const newDeck = [...new Set([...mySoundsDeck, ...incorrectSounds])];
        setMySoundsDeck(newDeck);
        localStorage.setItem('soundsInABlenderMySounds', JSON.stringify(newDeck));
        const currentHighScore = parseInt(localStorage.getItem(`soundsInABlender${gameType}HighScore`) || '0', 10);
        if (finalScore > currentHighScore) {
            localStorage.setItem(`soundsInABlender${gameType}HighScore`, finalScore.toString());
        }
        setScreen('gameOver');
    };
    const renderScreen = () => {
        switch (screen) {
            case 'gameMode': return React.createElement(GameModeScreen, { setScreen: setScreen });
            case 'wordSetup': return React.createElement(WordSetupScreen, { settings: wordSettings, setSettings: setWordSettings, onStart: handleStartGame });
            case 'soundSetup': return React.createElement(SoundSetupScreen, { settings: soundSettings, setSettings: setSoundSettings, onStart: handleStartGame });
            case 'game': return React.createElement(GameScreen, { gameType: gameType, gameMode: gameMode, currentWord: currentWord, currentSound: currentSound, onNextItem: handleNextItem, onSwitchMode: handleSwitchMode, onGameOver: handleGameOver, onBackToMenu: () => setScreen('gameMode') });
            case 'gameOver': return React.createElement(GameOverScreen, { onPlayAgain: () => handleStartGame(gameType, 'skillCheck'), onPractice: () => handleStartGame(gameType, 'practice'), onMySounds: () => setScreen('mySounds'), gameType: gameType });
            case 'mySounds': return React.createElement(MySoundsScreen, { deck: mySoundsDeck, onBack: () => setScreen('gameOver') });
            default: return React.createElement(GameModeScreen, { setScreen: setScreen });
        }
    };
    return React.createElement("main", { className: "text-gray-800 flex items-center justify-center min-h-screen p-4 font-poppins" },
        React.createElement("div", { className: "w-full max-w-5xl mx-auto" }, renderScreen())
    );
};

// --- INLINED RENDER ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
root.render(React.createElement(React.StrictMode, null, React.createElement(App, null)));