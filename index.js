
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
        { sound: 'a', image: 'https://i.ibb.co/wYpBfB2/Apple-a.png', keyword: 'apple' },
        { sound: 'e', image: 'https://i.ibb.co/d2CgQx8/egg-e.png', keyword: 'egg' },
        { sound: 'i', image: 'https://i.ibb.co/mXzS0W2/igloo-i.png', keyword: 'igloo' },
        { sound: 'o', image: 'https://i.ibb.co/B2Ky52V/orange-o.png', keyword: 'orange' },
        { sound: 'u', image: 'https://i.ibb.co/fQzL9P6/umbrella-u.png', keyword: 'umbrella' }
    ],
    sound_commonLongVowels: ['ai', 'ay', 'ee', 'ea', 'ou', 'ow', 'igh', 'oi', 'oy'],
    sound_rControlled: ['ar', 'er', 'ir', 'ur', 'or'],
    sound_lessCommonVowels: ['oo', 'ea', 'ey', 'y', 'ie', 'oe', 'ew', 'ue']
};

const forbiddenCombinations = [
    'f-u-ck', 'sh-i-t', 'c-o-ck', 'd-i-ck', 'p-i-ss', 'c-u-nt',
    'b-i-tch', 'a-ss', 's-l-u-t', 'r-a-p-e', 'r-ai-p', 'wh-o-r-e', 'f-u-x'
];

const fonts = ['font-poppins', 'font-nunito', 'font-lexend', 'font-comic-neue', 'font-dyslexiclogic'];
const bdpqFonts = ['font-poppins', 'font-nunito', 'font-schoolbell', 'font-patrick-hand', 'font-opendyslexic', 'font-dyslexiclogic'];

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

const ToggleSwitch = ({ checked, onChange }) => {
    return React.createElement("label", { className: "flex items-center cursor-pointer" },
        React.createElement("span", { className: "mr-3 text-lg" }, "Images"),
        React.createElement("div", { className: "relative" },
            React.createElement("input", { type: "checkbox", className: "sr-only", checked: checked, onChange: onChange }),
            React.createElement("div", { className: `block ${checked ? 'bg-green-600' : 'bg-gray-300'} w-14 h-8 rounded-full transition-colors` }),
            React.createElement("div", { className: `dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}` })
        )
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
            React.createElement("h2", { className: "text-2xl font-bold mb-4 text-center" }, "Choose Your Patterns"),
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
        React.createElement(Button, { onClick: () => onStart('words'), disabled: isStartDisabled, className: "text-3xl" }, "Start Game")
    );
};

const SoundSetupScreen = ({ settings, setSettings, onStart, onBackToMenu }) => {
    const handleCheckboxChange = (e, key) => setSettings(prev => ({ ...prev, [key]: e.target.checked }));
    
    const handleShortVowelChange = (e) => {
        const isChecked = e.target.checked;
        setSettings(prev => ({
            ...prev,
            shortVowels: isChecked,
            showVowelImages: isChecked ? prev.showVowelImages : false
        }));
    };

    return React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "relative" },
            React.createElement("h1", { className: "text-4xl md:text-6xl font-bold text-center text-gray-700" }, "Sound Flashcards"),
            React.createElement("button", { onClick: onBackToMenu, title: "Back to Menu", className: "absolute top-1/2 -translate-y-1/2 right-0 p-2 bg-gray-300 text-gray-700 rounded-lg shadow-[4px_4px_0_#2D3748] border-2 border-[#2D3748] hover:bg-gray-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#2D3748]" }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" })))
        ),
        React.createElement("div", { className: "bg-white p-6 md:p-8 rounded-2xl shadow-lg border-2 border-gray-200" },
            React.createElement("h2", { className: "text-2xl font-bold mb-4 text-center" }, "Choose Your Sounds"),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 text-lg" },
                React.createElement(CheckboxLabel, { label: "b/d/p/q letter recognition", checked: settings.bdpq, onChange: e => handleCheckboxChange(e, 'bdpq') }),
                React.createElement(CheckboxLabel, { label: "Single Consonants", checked: settings.consonants, onChange: e => handleCheckboxChange(e, 'consonants') }),
                React.createElement("div", { className: `flex items-center justify-between w-full p-4 rounded-lg border-2 transition-all ease-in-out ${settings.shortVowels ? 'bg-green-600 text-white border-green-700' : 'bg-white border-gray-300'}` },
                    React.createElement("label", { className: "flex-grow cursor-pointer" },
                        React.createElement("input", { type: "checkbox", className: "hidden", checked: settings.shortVowels, onChange: handleShortVowelChange }),
                        "Short Vowels"
                    ),
                    settings.shortVowels && React.createElement("div", { className: "bg-green-700 p-2 rounded-lg ml-4 flex-shrink-0 animate-fade-in" },
                        React.createElement(ToggleSwitch, { checked: settings.showVowelImages, onChange: e => handleCheckboxChange(e, 'showVowelImages') })
                    )
                ),
                React.createElement(CheckboxLabel, { label: "Common Long Vowels (ai, igh...)", checked: settings.commonLongVowels, onChange: e => handleCheckboxChange(e, 'commonLongVowels') }),
                React.createElement(CheckboxLabel, { label: "R-Controlled (ar, or...)", checked: settings.rControlled, onChange: e => handleCheckboxChange(e, 'rControlled') }),
                React.createElement(CheckboxLabel, { label: "Less Common Vowels (oo, ew...)", checked: settings.lessCommonVowels, onChange: e => handleCheckboxChange(e, 'lessCommonVowels') })
            )
        ),
        React.createElement(Button, { variant: "secondary", onClick: () => onStart('sounds'), className: "text-3xl" }, "Start Game")
    );
};

const GameScreen = ({ gameType, currentWord, currentSound, onNextItem, onBackToMenu }) => {
    const [isSplit, setIsSplit] = useState(false);
    
    useEffect(() => {
        setIsSplit(false);
    }, [currentWord]);
    
    const boxColors = ['bg-rose-200 text-rose-800', 'bg-amber-200 text-amber-800', 'bg-teal-200 text-teal-800', 'bg-sky-200 text-sky-800'];
    const isMultisyllable = Array.isArray(currentWord) && currentWord.length > 1 && Array.isArray(currentWord[0]);
    const isNextDisabled = isMultisyllable && isSplit;

    const flashcardBaseStyle = "rounded-2xl flex items-center justify-center ease-in-out shadow-[8px_8px_0px_#4A5568] duration-150 transition-transform";

    const renderWord = () => {
        if (!currentWord || !Array.isArray(currentWord) || currentWord.length === 0) return null;
        const wordParts = [];
        let globalIndex = 0;
        currentWord.forEach((syllable, s_idx) => {
            if (!Array.isArray(syllable)) return;
            syllable.forEach((part, p_idx) => {
                const colorClass = boxColors[p_idx % boxColors.length];
                const finalClassName = `${flashcardBaseStyle} p-4 md:p-6 aspect-square text-5xl md:text-6xl ${colorClass}`;
                
                wordParts.push(React.createElement("div", {
                    key: `part-${globalIndex}`,
                    className: finalClassName
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
            React.createElement("button", { onClick: onBackToMenu, title: "Back to Menu", className: "p-2 bg-gray-300 text-gray-700 rounded-lg shadow-[4px_4px_0_#2D3748] border-2 border-[#2D3748] hover:bg-gray-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#2D3748]" }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" })))
        ),
        React.createElement("div", { className: "text-center font-bold" },
            gameType === 'words' && React.createElement("div", { className: `flex flex-wrap justify-center items-stretch gap-2 md:gap-4`}, ...renderWord()),
            gameType === 'sounds' && currentSound && React.createElement("div", { className: "flex items-center justify-center gap-4 md:gap-8" }, 
                 React.createElement("div", { 
                     key: `sound-card-${currentSound.text}`,
                     className: `${flashcardBaseStyle} w-48 h-48 md:w-64 md:h-64 text-8xl md:text-9xl ${currentSound.font} bg-green-200 text-green-800`
                 }, 
                    currentSound.text
                ),
                currentSound.image && React.createElement("div", { key: `sound-image-${currentSound.text}`, className: `w-48 h-48 md:w-64 md:h-64 rounded-2xl border-4 border-gray-700 shadow-[8px_8px_0px_#4A5568] bg-white p-4`},
                    React.createElement("img", { src: currentSound.image, alt: currentSound.keyword, className: "w-full h-full object-contain" })
                )
            )
        ),
        isMultisyllable && React.createElement(Button, { onClick: () => setIsSplit(p => !p), variant: "special", className: "!py-2 !text-lg max-w-xs mx-auto mt-4" }, isSplit ? "Join" : "Split"),
        React.createElement("div", { className: "mt-8" },
            isNextDisabled && React.createElement("p", {className: "text-center text-red-500 mb-2 animate-pulse"}, "Please join the word before continuing."),
            React.createElement(Button, { onClick: onNextItem, variant: "secondary", disabled: isNextDisabled }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-12 w-12 mx-auto", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" })))
        )
    );
};

// --- INLINED APP ---

const App = () => {
    const [screen, setScreen] = useState('gameMode');
    const [gameType, setGameType] = useState('words');
    const [wordSettings, setWordSettings] = useState({ digraphs: true, floss: false, longConsonants: false, initialBlends: false, finalBlends: false, silentE: false, longVowels: false, multisyllable: false, useShortVowels: true, selectedShortVowels: ['a', 'e', 'i', 'o', 'u'] });
    const [soundSettings, setSoundSettings] = useState({ bdpq: false, consonants: true, shortVowels: true, commonLongVowels: false, rControlled: false, lessCommonVowels: false, showVowelImages: false });
    const [currentWord, setCurrentWord] = useState([]);
    const [currentSound, setCurrentSound] = useState(null);
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
        const generateCVCSyllable = (isFirstSyllable = false) => {
            const part1 = getRandomElement(patterns.consonants.filter(c => c !== 'x' && c !== 'q'));
            const shortVowelPool = wordSettings.selectedShortVowels.length > 0 
                ? wordSettings.selectedShortVowels 
                : patterns.vowels;
            const part2 = getRandomElement(shortVowelPool);
            const part3 = getRandomElement(patterns.consonants.filter(c => !['y', 'w', 'h', 'j', 'r', 'q'].includes(c)));
            return [part1, part2, part3];
        };

        const generateComplexSyllable = () => {
            let part1, part2, part3, part4, currentCombination;
            do {
                const pool1 = [...patterns.consonants.filter(c => c !== 'x'), ...patterns.qu];
                if (wordSettings.digraphs) pool1.push(...patterns.digraphs.filter(d => d !== 'ng'));
                if (wordSettings.initialBlends) pool1.push(...patterns.initialBlends);

                const pool2 = [];
                if (wordSettings.useShortVowels) pool2.push(...wordSettings.selectedShortVowels);
                if (wordSettings.longVowels) pool2.push(...patterns.longVowels);
                
                if (pool2.length === 0) {
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
            const syllable1 = generateCVCSyllable(true);
            const syllable2 = generateComplexSyllable();
            setCurrentWord([syllable1, syllable2]);
        } else {
            setCurrentWord([generateComplexSyllable()]);
        }
    }, [wordSettings]);

    useEffect(() => {
        patterns.sound_shortVowels_with_images.forEach(item => {
            const img = new Image();
            img.src = item.image;
        });
    }, []);

    const handleStartGame = (type) => {
        setGameType(type);
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

    const handleNextItem = useCallback(() => {
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
    }, [gameType, generateWordBlend, generateSound, soundSettings]);
    
    const renderScreen = () => {
        switch (screen) {
            case 'gameMode': return React.createElement(GameModeScreen, { setScreen: setScreen });
            case 'wordSetup': return React.createElement(WordSetupScreen, { settings: wordSettings, setSettings: setWordSettings, onStart: handleStartGame, onBackToMenu: () => setScreen('gameMode') });
            case 'soundSetup': return React.createElement(SoundSetupScreen, { settings: soundSettings, setSettings: setSoundSettings, onStart: handleStartGame, onBackToMenu: () => setScreen('gameMode') });
            case 'game': return React.createElement(GameScreen, { gameType: gameType, currentWord: currentWord, currentSound: currentSound, onNextItem: handleNextItem, onBackToMenu: () => setScreen('gameMode') });
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
