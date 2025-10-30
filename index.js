
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
    sound_shortVowels_with_images: [
        { sound: 'a', image: `data:image/jpeg;base64,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`, keyword: 'apple' },
        { sound: 'e', image: `data:image/jpeg;base64,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`, keyword: 'egg' },
        { sound: 'i', image: `data:image/jpeg;base64,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`, keyword: 'igloo' },
        { sound: 'o', image: `data:image/jpeg;base64,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`, keyword: 'orange' },
        { sound: 'u', image: `data:image/jpeg;base64,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`, keyword: 'umbrella' }
    ],
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

const Button = ({ children = null, variant = 'primary', className = '', disabled = false, ...props }) => {
    const baseStyle = "w-full py-4 rounded-xl transition-all ease-in-out border-4 font-bold text-white shadow-[6px_6px_0px_#2D3748] border-[#2D3748] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#2D3748] disabled:bg-gray-400 disabled:shadow-none disabled:translate-x-1 disabled:translate-y-1 disabled:cursor-not-allowed";
    const variantStyles = {
        primary: "bg-green-600 hover:bg-green-700",
        secondary: "bg-blue-500 hover:bg-blue-600",
        special: "bg-orange-500 hover:bg-orange-600"
    };
    return React.createElement("button", { className: `${baseStyle} ${variantStyles[variant]} ${className}`, disabled: disabled, ...props }, children);
};

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

const WordSetupScreen = ({ settings, setSettings, onStart, onBackToMenu }) => {
    const [mode, setMode] = useState('practice');
    const handleCheckboxChange = (e, key) => setSettings(prev => ({ ...prev, [key]: e.target.checked }));
    const handleShortVowelMasterChange = (e) => {
        const isChecked = e.target.checked;
        setSettings(prev => ({
            ...prev,
            useShortVowels: isChecked,
            selectedShortVowels: isChecked ? patterns.vowels : []
        }));
    };
    const handleSingleVowelChange = (vowel) => {
        setSettings(prev => {
            const newSelection = prev.selectedShortVowels.includes(vowel)
                ? prev.selectedShortVowels.filter(v => v !== vowel)
                : [...prev.selectedShortVowels, vowel];
            return { ...prev, selectedShortVowels: newSelection, useShortVowels: newSelection.length > 0 };
        });
    };

    const isStartDisabled = settings.selectedShortVowels.length === 0 && !settings.longVowels;

    return React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "relative" },
            React.createElement("h1", { className: "text-4xl md:text-6xl font-bold text-center text-gray-700" }, "Word Blender"),
            React.createElement("button", { onClick: onBackToMenu, title: "Back to Menu", className: "absolute top-1/2 -translate-y-1/2 right-0 p-2 bg-gray-300 text-gray-700 rounded-lg shadow-[4px_4px_0_#2D3748] border-2 border-[#2D3748] hover:bg-gray-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#2D3748]" }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" })))
        ),
        React.createElement("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-gray-200" },
            React.createElement("h2", { className: "text-2xl font-bold mb-4 text-center" }, "1. Choose Your Patterns"),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 text-lg" },
                React.createElement(CheckboxLabel, { label: "Consonant Digraphs (sh, ch...)", checked: settings.digraphs, onChange: e => handleCheckboxChange(e, 'digraphs') }),
                React.createElement(CheckboxLabel, { label: "Floss Pattern (ff, ll...)", checked: settings.floss, onChange: e => handleCheckboxChange(e, 'floss') }),
                React.createElement(CheckboxLabel, { label: "Long Consonants (ck, tch...)", checked: settings.longConsonants, onChange: e => handleCheckboxChange(e, 'longConsonants') }),
                React.createElement(CheckboxLabel, { label: "Initial Blends (br, cl...)", checked: settings.initialBlends, onChange: e => handleCheckboxChange(e, 'initialBlends') }),
                React.createElement(CheckboxLabel, { label: "Final Blends (nt, st...)", checked: settings.finalBlends, onChange: e => handleCheckboxChange(e, 'finalBlends') }),
                React.createElement(CheckboxLabel, { label: "Silent -e", checked: settings.silentE, onChange: e => handleCheckboxChange(e, 'silentE') }),
                React.createElement(CheckboxLabel, { label: "Long Vowel Teams (ai, ee...)", checked: settings.longVowels, onChange: e => handleCheckboxChange(e, 'longVowels') }),
                React.createElement(CheckboxLabel, { label: "Multisyllable Words", checked: settings.multisyllable, onChange: e => handleCheckboxChange(e, 'multisyllable') })
            ),
             React.createElement("div", { className: "mt-4 pt-4 border-t" },
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(CheckboxLabel, { label: "Short Vowel Selection", checked: settings.useShortVowels, onChange: handleShortVowelMasterChange }),
                    settings.useShortVowels && React.createElement("div", { className: "grid grid-cols-5 gap-2 p-2 bg-gray-50 rounded-lg border animate-fade-in" },
                        patterns.vowels.map(vowel =>
                            React.createElement(CheckboxLabel, { key: vowel, label: vowel, className: "text-center !p-2", checked: settings.selectedShortVowels.includes(vowel), onChange: () => handleSingleVowelChange(vowel) })
                        )
                    )
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
        React.createElement(Button, { onClick: () => onStart('words', mode), disabled: isStartDisabled, className: "text-3xl" }, "Start Game")
    );
};

const SoundSetupScreen = ({ settings, setSettings, onStart, onBackToMenu }) => {
    const [mode, setMode] = useState('practice');
    const handleCheckboxChange = (e, key) => setSettings(prev => ({ ...prev, [key]: e.target.checked }));
    return React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "relative" },
            React.createElement("h1", { className: "text-4xl md:text-6xl font-bold text-center text-gray-700" }, "Sound Flashcards"),
            React.createElement("button", { onClick: onBackToMenu, title: "Back to Menu", className: "absolute top-1/2 -translate-y-1/2 right-0 p-2 bg-gray-300 text-gray-700 rounded-lg shadow-[4px_4px_0_#2D3748] border-2 border-[#2D3748] hover:bg-gray-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#2D3748]" }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" })))
        ),
        React.createElement("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-gray-200" },
            React.createElement("h2", { className: "text-2xl font-bold mb-4 text-center" }, "1. Choose Your Sounds"),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 text-lg" },
                React.createElement(CheckboxLabel, { label: "b/d/p/q letter recognition", checked: settings.bdpq, onChange: e => handleCheckboxChange(e, 'bdpq') }),
                React.createElement(CheckboxLabel, { label: "Single Consonants", checked: settings.consonants, onChange: e => handleCheckboxChange(e, 'consonants') }),
                React.createElement(CheckboxLabel, { label: "Short Vowels", checked: settings.shortVowels, onChange: e => handleCheckboxChange(e, 'shortVowels') }),
                React.createElement(CheckboxLabel, { label: "Common Long Vowels (ai, igh...)", checked: settings.commonLongVowels, onChange: e => handleCheckboxChange(e, 'commonLongVowels') }),
                React.createElement(CheckboxLabel, { label: "R-Controlled (ar, or...)", checked: settings.rControlled, onChange: e => handleCheckboxChange(e, 'rControlled') }),
                React.createElement(CheckboxLabel, { label: "Less Common Vowels (oo, ew...)", checked: settings.lessCommonVowels, onChange: e => handleCheckboxChange(e, 'lessCommonVowels') }),
                React.createElement("div", { className: "col-span-1 sm:col-span-2" },
                     React.createElement(CheckboxLabel, { label: "Show Vowel Keyword Images", checked: settings.showVowelImages, onChange: e => handleCheckboxChange(e, 'showVowelImages') })
                )
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
    const [isSplit, setIsSplit] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        setIsSplit(false);
    }, [currentWord]);
    
    const highScore = localStorage.getItem(`soundsInABlender${gameType}HighScore`) || 0;
    const boxColors = ['bg-rose-200 text-rose-800', 'bg-amber-200 text-amber-800', 'bg-teal-200 text-teal-800', 'bg-sky-200 text-sky-800'];
    const isMultisyllable = Array.isArray(currentWord) && currentWord.length > 1 && Array.isArray(currentWord[0]);
    const isNextDisabled = isMultisyllable && isSplit;

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
                const item = gameType === 'words' ? currentWord.flat() : [currentSound.text];
                const incorrect = item.filter((_, i) => selectedIncorrect.includes(i));
                setIncorrectSounds(prev => [...new Set([...prev, ...incorrect])]);
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

    const renderWord = () => {
        if (!currentWord || !Array.isArray(currentWord) || currentWord.length === 0) return null;
        const wordParts = [];
        let globalIndex = 0;
        currentWord.forEach((syllable, s_idx) => {
            if (!Array.isArray(syllable)) return;
            syllable.forEach((part, p_idx) => {
                const colorIndex = p_idx % boxColors.length;
                wordParts.push(React.createElement("div", {
                    key: globalIndex,
                    onClick: () => toggleIncorrect(globalIndex),
                    className: `${wordCardStyle} ${boxColors[colorIndex]} ${selectedIncorrect.includes(globalIndex) ? 'border-red-500' : 'border-gray-700'} ${gameMode === 'skillCheck' ? 'cursor-pointer' : ''}`
                }, part));
                globalIndex++;
            });
            if (isSplit && s_idx < currentWord.length - 1) {
                wordParts.push(React.createElement("div", { key: `gap-${s_idx}`, className: "w-8 md:w-12 flex-shrink-0" }));
            }
        });
        return wordParts;
    };
    
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
        React.createElement("div", { className: "text-center font-bold" },
            gameType === 'words' && React.createElement("div", { className: `flex flex-wrap justify-center items-center gap-2 md:gap-4`}, ...renderWord()),
            gameType === 'sounds' && currentSound && React.createElement("div", { className: "flex items-center justify-center gap-4 md:gap-8" }, 
                 React.createElement("div", { 
                     onClick: () => toggleIncorrect(0), 
                     className: `w-48 h-48 md:w-64 md:h-64 ${soundCardStyle} ${currentSound.font} bg-green-200 text-green-800 p-4 ${selectedIncorrect.includes(0) ? 'border-red-500' : 'border-gray-700'} ${gameMode === 'skillCheck' ? 'cursor-pointer' : ''}` 
                 }, 
                    React.createElement("span", null, currentSound.text)
                ),
                currentSound.image && React.createElement("div", { className: `w-48 h-48 md:w-64 md:h-64 rounded-2xl border-4 border-gray-700 shadow-[8px_8px_0px_#4A5568] bg-white p-4`},
                    React.createElement("img", { src: currentSound.image, alt: currentSound.keyword, className: "w-full h-full object-contain" })
                )
            )
        ),
        isMultisyllable && React.createElement(Button, { onClick: () => setIsSplit(p => !p), variant: "special", className: "!py-2 !text-lg max-w-xs mx-auto mt-4" }, isSplit ? "Join" : "Split"),
        React.createElement("div", { className: "mt-8" },
            isNextDisabled && React.createElement("p", {className: "text-center text-red-500 mb-2 animate-pulse"}, "Please join the word before continuing."),
            React.createElement(Button, { onClick: handleNext, variant: "secondary", disabled: isNextDisabled }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 mx-auto", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" })))
        )
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
        let image = null, keyword = '';
        if (patterns.sound_shortVowels.includes(text)) {
            const vowelInfo = patterns.sound_shortVowels_with_images.find(v => v.sound === text);
            if (vowelInfo) {
                image = vowelInfo.image;
                keyword = vowelInfo.keyword;
            }
        }
        setCurrentSound({ text, font, image, keyword });
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
                React.createElement("div", { className: "flex items-center justify-center gap-4 md:gap-8" },
                    currentSound && React.createElement(React.Fragment, null,
                        React.createElement("div", { className: `w-48 h-48 md:w-64 md:h-64 ${soundCardStyle} ${currentSound.font} bg-orange-200 text-orange-800 border-gray-700 p-4` }, 
                            React.createElement("span", null, currentSound.text)
                        ),
                        currentSound.image && React.createElement("div", { className: "w-48 h-48 md:w-64 md:h-64 rounded-2xl border-4 border-gray-700 shadow-[8px_8px_0px_#4A5568] bg-white p-4" },
                             React.createElement("img", { src: currentSound.image, alt: currentSound.keyword, className: "w-full h-full object-contain" })
                        )
                    )
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
    const [wordSettings, setWordSettings] = useState({ digraphs: true, floss: false, longConsonants: false, initialBlends: false, finalBlends: false, silentE: false, longVowels: false, multisyllable: false, useShortVowels: true, selectedShortVowels: ['a', 'e', 'i', 'o', 'u'] });
    const [soundSettings, setSoundSettings] = useState({ bdpq: false, consonants: true, shortVowels: true, commonLongVowels: false, rControlled: false, lessCommonVowels: false, showVowelImages: false });
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
        
        let image = null, keyword = '';
        if (soundSettings.showVowelImages && patterns.sound_shortVowels.includes(text)) {
            const vowelInfo = patterns.sound_shortVowels_with_images.find(v => v.sound === text);
            if (vowelInfo) {
                image = vowelInfo.image;
                keyword = vowelInfo.keyword;
            }
        }
        setCurrentSound({ text, font, image, keyword });
    }, [soundSettings]);
    
    const generateWordBlend = useCallback(() => {
        const generateSyllable = () => {
            let part1, part2, part3, part4, currentCombination;
            do {
                const pool1 = [...patterns.consonants.filter(c => c !== 'x'), ...patterns.qu];
                if (wordSettings.digraphs) pool1.push(...patterns.digraphs.filter(d => d !== 'ng'));
                if (wordSettings.initialBlends) pool1.push(...patterns.initialBlends);

                const pool2 = [];
                if (wordSettings.useShortVowels) pool2.push(...wordSettings.selectedShortVowels);
                if (wordSettings.longVowels) pool2.push(...patterns.longVowels);
                
                if (pool2.length === 0) { // Safety net if no vowels are selected
                    setCurrentWord([['error']]);
                    return ['error'];
                }

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
            } while (forbiddenCombinations.includes(currentCombination) || (part1 === 'qu' && part2 === 'u'));
            return [part1, part2, part3, part4].filter(p => p !== '');
        };

        if (wordSettings.multisyllable) {
            const syllable1 = generateSyllable();
            const syllable2 = generateSyllable();
            setCurrentWord([syllable1, syllable2]);
        } else {
            setCurrentWord([generateSyllable()]);
        }
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
            case 'wordSetup': return React.createElement(WordSetupScreen, { settings: wordSettings, setSettings: setWordSettings, onStart: handleStartGame, onBackToMenu: () => setScreen('gameMode') });
            case 'soundSetup': return React.createElement(SoundSetupScreen, { settings: soundSettings, setSettings: setSoundSettings, onStart: handleStartGame, onBackToMenu: () => setScreen('gameMode') });
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
