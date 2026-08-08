// ==========================================
// GLOBAL VARIABLES (Always at the top)
// ==========================================
let visibleCardsCount = 8;
let currentDisplayedWords = [];
let availableVoices = [];

// Base Dictionary Data (8 Initial Words)
const sampleWords = [
    { word: "Spill the tea", level: "slang", meaning: "To reveal gossip or secret information.", example: "Come on, spill the tea! What happened last night?", arm: "Գաղտնիքը բացել / Բամբասել" },
    { word: "Hit the sack", level: "a1_a2", meaning: "To go to sleep.", example: "I'm extremely tired, time to hit the sack.", arm: "Քնելու գնալ" },
    { word: "Bite the bullet", level: "b1_b2", meaning: "To face a difficult situation with courage.", example: "You just have to bite the bullet and take the exam.", arm: "Ատամները սեղմել ու առաջ գնալ" },
    { word: "Clutch", level: "slang", meaning: "Doing something critical at the last possible moment.", example: "He scored in the last second, that was so clutch!", arm: "Վերջին վայրկյանին հաղթանակ ապահովող" },
    { word: "Burn the midnight oil", level: "c1_c2", meaning: "To work or study late into the night.", example: "She burned the midnight oil to finish the project.", arm: "Մինչև ուշ գիշեր աշխատել" },
    { word: "Lowkey", level: "slang", meaning: "Secretly or subtly.", example: "I lowkey want to stay home tonight.", arm: "Ծածուկ, չբարձրաձայնվող" },
    { word: "Glow up", level: "b1_b2", meaning: "A major positive transformation.", example: "His glow up after high school was insane.", arm: "Տեսքի/կյանքի կտրուկ բարելավում" },
    { word: "Touch grass", level: "slang", meaning: "To go outside and disconnect from online.", example: "You've been gaming all day, go touch grass!", arm: "Իրականություն վերադառնալ, դուրս գալ" }
];

// LocalStorage Data
let customWords = JSON.parse(localStorage.getItem('customSlangWords')) || [];
let favoriteWords = JSON.parse(localStorage.getItem('favoriteSlangWords')) || [];
let allWords = [...sampleWords, ...customWords];

// Setup current displayed list
currentDisplayedWords = [...allWords];

// ==========================================
// 🏆 GLOBAL XP & LEADERBOARD
// ==========================================
let totalXP = parseInt(localStorage.getItem('slangify_total_xp')) || 0;

function addXP(points) {
    if (points <= 0) return;
    totalXP += points;
    localStorage.setItem('slangify_total_xp', totalXP);
    updateLeaderboardUI();
}

function getUserRank(xp) {
    if (xp >= 300) return "🔥 Slang Legend";
    if (xp >= 150) return "⚡ Slang Master";
    if (xp >= 50)  return "🌱 Gen-Z Learner";
    return "🐣 Novice";
}

function updateLeaderboardUI() {
    const xpDisplay = document.getElementById('userTotalXP');
    const rankDisplay = document.getElementById('userRank');
    
    if (xpDisplay) xpDisplay.innerText = `${totalXP} XP`;
    if (rankDisplay) rankDisplay.innerText = getUserRank(totalXP);

    const leaderboardTable = document.getElementById('leaderboardList');
    if (leaderboardTable) {
        const players = [
            { name: "Alex R.", xp: 280 },
            { name: "You (Current User)", xp: totalXP, isUser: true },
            { name: "Sarah M.", xp: 140 },
            { name: "David P.", xp: 90 }
        ];

        players.sort((a, b) => b.xp - a.xp);

        let html = '';
        players.forEach((player, index) => {
            const highlightClass = player.isUser ? 'style="background: rgba(124, 58, 237, 0.2); font-weight: bold;"' : '';
            html += `
                <tr ${highlightClass}>
                    <td>#${index + 1}</td>
                    <td>${player.name}</td>
                    <td>${getUserRank(player.xp)}</td>
                    <td><strong>${player.xp} XP</strong></td>
                </tr>
            `;
        });
        leaderboardTable.innerHTML = html;
    }
}

// ==========================================
// FAVOURITES LOGIC
// ==========================================
function toggleFavorite(wordText) {
    const index = favoriteWords.findIndex(f => f.word === wordText);
    if (index > -1) {
        favoriteWords.splice(index, 1);
    } else {
        const found = allWords.find(w => w.word === wordText);
        if (found) favoriteWords.push(found);
    }
    localStorage.setItem('favoriteSlangWords', JSON.stringify(favoriteWords));
    renderCards(currentDisplayedWords, false);
}

// ==========================================
// 1. LIGHT / DARK THEME TOGGLE
// ==========================================
const themeToggleBtn = document.getElementById('themeToggleBtn');

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeToggleBtn.textContent = isLight ? '🌙' : '☀️';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}

// ==========================================
// 2. TEXT-TO-SPEECH (TTS)
// ==========================================
function loadVoices() {
    if ('speechSynthesis' in window) {
        availableVoices = window.speechSynthesis.getVoices();
        populateVoiceList();
    }
}

function populateVoiceList() {
    const voiceSelect = document.getElementById('wodVoiceSelect');
    const accentSelect = document.getElementById('wodAccentSelect');
    if (!voiceSelect || !accentSelect) return;
    
    const selectedAccent = accentSelect.value; 
    voiceSelect.innerHTML = '';

    let filteredVoices = availableVoices.filter(v => 
        v.lang.replace('_', '-').toLowerCase().includes(selectedAccent.toLowerCase())
    );
    
    if (filteredVoices.length === 0) {
        filteredVoices = availableVoices.filter(v => v.lang.startsWith('en'));
    }

    const isVoiceFemale = (name) => {
        return name.includes('female') || name.includes('zira') || name.includes('samantha') || 
               name.includes('victoria') || name.includes('jenny') || name.includes('aria') || 
               name.includes('susan') || name.includes('hazel');
    };

    const isVoiceMale = (name) => {
        return name.includes('male') || name.includes('david') || name.includes('mark') || 
               name.includes('george') || name.includes('guy') || name.includes('james');
    };

    filteredVoices.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.name;
        const name = voice.name.toLowerCase();
        let genderTag = isVoiceFemale(name) ? '👩 Female' : (isVoiceMale(name) ? '👨 Male' : '🔊');

        let cleanName = voice.name
            .replace(/Google|Microsoft|Apple|Desktop|English|\(United States\)|\(United Kingdom\)/gi, '')
            .replace(/-/g, '')
            .trim();

        option.textContent = `${genderTag} ${cleanName ? '(' + cleanName + ')' : ''}`;
        voiceSelect.appendChild(option);
    });

    if (voiceSelect.options.length === 0) {
        const option = document.createElement('option');
        option.textContent = "🔊 Default System Voice";
        option.value = "";
        voiceSelect.appendChild(option);
    }
}

function playAudio(text) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voiceSelect = document.getElementById('wodVoiceSelect');
    const accentSelect = document.getElementById('wodAccentSelect');

    const selectedVoiceName = voiceSelect ? voiceSelect.value : '';
    const selectedAccent = accentSelect ? accentSelect.value : 'en-US';

    const chosenVoice = availableVoices.find(v => v.name === selectedVoiceName);
    if (chosenVoice) {
        utterance.voice = chosenVoice;
    } else {
        utterance.lang = selectedAccent;
    }

    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

function changeAccent() {
    populateVoiceList();
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

// ==========================================
// 3. WORD OF THE DAY
// ==========================================
function updateWordOfTheDay() {
    if (!allWords || allWords.length === 0) return;

    const yerevanDateStr = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Yerevan" });
    
    let hash = 0;
    for (let i = 0; i < yerevanDateStr.length; i++) {
        hash = yerevanDateStr.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % allWords.length;
    const todayWord = allWords[index];

    const wodTitle = document.getElementById('wodTitle');
    const wodMeaning = document.getElementById('wodMeaning');
    const wodExample = document.getElementById('wodExample');
    const wodArm = document.getElementById('wodArm');

    if (wodTitle) wodTitle.innerText = todayWord.word;
    if (wodMeaning) wodMeaning.innerText = todayWord.meaning || todayWord.definition || '';
    if (wodExample) wodExample.innerText = `"${todayWord.example || ''}"`;
    if (wodArm) wodArm.innerText = `🇦🇲 ${todayWord.arm || todayWord.armenian || ''}`;
}

// ==========================================
// 4. RENDER CARDS & PAGINATION
// ==========================================
function renderCards(words, resetPagination = true) {
    if (resetPagination) {
        currentDisplayedWords = words;
        visibleCardsCount = 8;
    }

    const grid = document.getElementById('dictionaryGrid') || document.getElementById('words-container');
    if (!grid) return;
    grid.innerHTML = '';

    if (!currentDisplayedWords || currentDisplayedWords.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; opacity: 0.7; padding: 20px;">No words found...</p>`;
        hideLoadMoreButton();
        return;
    }

    const wordsToRender = currentDisplayedWords.slice(0, visibleCardsCount);

    wordsToRender.forEach(item => {
        const isFav = favoriteWords.some(f => f.word === item.word);
        
        let rawLevel = item.level ? item.level.toString().trim().toUpperCase() : 'GENERAL';
        
        let displayLevel = rawLevel;
        if (rawLevel === 'A1_A2' || rawLevel === 'A1 A2') {
            displayLevel = item.subLevel ? item.subLevel.toUpperCase() : 'A1';
        } else if (rawLevel === 'B1_B2' || rawLevel === 'B1 B2') {
            displayLevel = item.subLevel ? item.subLevel.toUpperCase() : 'B1';
        } else if (rawLevel === 'C1_C2' || rawLevel === 'C1 C2') {
            displayLevel = item.subLevel ? item.subLevel.toUpperCase() : 'C1';
        } else {
            displayLevel = rawLevel.replace(/_/g, ' ');
        }

        const meaningText = item.meaning || item.definition || '';
        const armText = item.arm || item.armenian || '';
        const exampleText = item.example ? `"${item.example}"` : '';

        const cleanClassTag = displayLevel.toLowerCase().replace(/[^a-z0-9]/g, '');

        const card = document.createElement('div');
        card.className = 'word-card';
        card.innerHTML = `
            <div class="card-top" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <h3 class="card-title" style="font-size: 1.35rem; font-weight: 700; color: var(--text-main); margin: 0;">${item.word}</h3>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="card-tag tag-${cleanClassTag}">${displayLevel}</span>
                    <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite('${item.word.replace(/'/g, "\\'")}')" title="Save to Favorites" style="background: none; border: none; cursor: pointer; color: #a1a1aa; font-size: 1.2rem; padding: 0;">
                        ${isFav ? '⭐' : '☆'}
                    </button>
                </div>
            </div>
            <p class="card-def" style="margin-bottom: 8px; color: var(--text-muted); font-size: 0.95rem;">
                <strong style="color: var(--text-main);">Meaning:</strong> ${meaningText}
            </p>
            ${exampleText ? `<p class="card-ex" style="font-style: italic; margin-bottom: 12px; color: var(--text-muted); font-size: 0.9rem;">${exampleText}</p>` : ''}
            <div class="card-arm" style="color: var(--accent); font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 0.8rem; font-weight: bold; color: var(--primary);">AM</span> ${armText}
            </div>
        `;
        grid.appendChild(card);
    });

    updateLoadMoreButton();
}

// SEARCH BAR EVENT LISTENER
const globalSearch = document.getElementById('globalSearch');
if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            renderCards(allWords);
            return;
        }
        const filtered = allWords.filter(w => 
            w.word.toLowerCase().includes(query) || 
            (w.meaning && w.meaning.toLowerCase().includes(query)) ||
            (w.definition && w.definition.toLowerCase().includes(query)) ||
            (w.arm && w.arm.toLowerCase().includes(query)) ||
            (w.armenian && w.armenian.toLowerCase().includes(query))
        );
        renderCards(filtered);
    });
}

// FILTER BUTTONS
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const level = btn.getAttribute('data-level');
            if (level === 'all') {
                renderCards(allWords);
            } else if (level === 'favorites') {
                renderCards(favoriteWords);
            } else {
                const filtered = allWords.filter(w => {
                    const wordLevel = (w.level || '').toLowerCase().replace('-', '_');
                    return wordLevel === level.toLowerCase();
                });
                renderCards(filtered);
            }
        });
    });
}

// ==========================================
// 5. MODAL LOGIC
// ==========================================
const modal = document.getElementById('addWordModal');
const btnOpenModal = document.getElementById('btnOpenModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const addWordForm = document.getElementById('addWordForm');

if (btnOpenModal) btnOpenModal.addEventListener('click', () => modal.classList.add('show'));
if (btnCloseModal) btnCloseModal.addEventListener('click', () => modal.classList.remove('show'));

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
});

if (addWordForm) {
    addWordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newPhrase = {
            word: document.getElementById('newWord').value.trim(),
            level: document.getElementById('newLevel').value,
            meaning: document.getElementById('newMeaning').value.trim(),
            example: document.getElementById('newExample').value.trim(),
            arm: document.getElementById('newArm').value.trim()
        };

        customWords.push(newPhrase);
        allWords.push(newPhrase);

        localStorage.setItem('customSlangWords', JSON.stringify(customWords));

        renderCards(allWords);

        addWordForm.reset();
        modal.classList.remove('show');

        alert(`"${newPhrase.word}" phrase was successfully added! 🎉`);
    });
}

// ==========================================
// 6. MINI-GAMES LOGIC
// ==========================================
function switchGame(gameType, btnElement) {
    document.querySelectorAll('.game-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.game-box').forEach(box => box.style.display = 'none');

    if (btnElement) btnElement.classList.add('active');

    if (gameType === 'quiz') {
        document.getElementById('gameQuiz').style.display = 'block';
        initQuizGame();
    } else if (gameType === 'match') {
        document.getElementById('gameMatch').style.display = 'block';
        initMatchGame();
    } else if (gameType === 'scramble') {
        document.getElementById('gameScramble').style.display = 'block';
        initScrambleGame();
    }
}

// QUIZ GAME
let quizCurrentIndex = 0;
let quizScore = 0;
let quizQuestions = [];
let quizAnswered = false;

function initQuizGame() {
    if (allWords.length < 4) return;

    quizQuestions = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 10);
    quizCurrentIndex = 0;
    quizScore = 0;
    
    const scoreElem = document.getElementById('quizScore');
    if (scoreElem) scoreElem.innerText = `Score: ${quizScore}`;
    renderQuizQuestion();
}

function renderQuizQuestion() {
    quizAnswered = false;
    const btnNext = document.getElementById('btnNextQuiz');
    if (btnNext) btnNext.style.display = 'none';

    if (quizCurrentIndex >= quizQuestions.length) {
        document.getElementById('quizQuestion').innerHTML = `🎉 Quiz Completed!<br>Your Final Score: <strong>${quizScore} / ${quizQuestions.length * 10}</strong>`;
        document.getElementById('quizOptions').innerHTML = '';
        document.getElementById('quizProgress').innerText = `Completed!`;
        return;
    }

    const currentW = quizQuestions[quizCurrentIndex];
    const targetMeaning = currentW.meaning || currentW.definition;

    document.getElementById('quizProgress').innerText = `Question ${quizCurrentIndex + 1} / ${quizQuestions.length}`;
    document.getElementById('quizQuestion').innerText = `What does "${currentW.word}" mean?`;

    const optionsOptions = [targetMeaning];
    const otherMeanings = allWords
        .filter(w => w.word !== currentW.word)
        .map(w => w.meaning || w.definition)
        .sort(() => 0.5 - Math.random());

    for (let i = 0; i < 3 && i < otherMeanings.length; i++) {
        optionsOptions.push(otherMeanings[i]);
    }

    optionsOptions.sort(() => 0.5 - Math.random());

    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';

    optionsOptions.forEach(optText => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = optText;
        btn.onclick = () => selectQuizOption(btn, optText, targetMeaning);
        optionsContainer.appendChild(btn);
    });
}

function selectQuizOption(selectedBtn, selectedText, correctMeaning) {
    if (quizAnswered) return;
    quizAnswered = true;

    const allBtns = document.querySelectorAll('#quizOptions .option-btn');
    
    if (selectedText === correctMeaning) {
        selectedBtn.classList.add('correct');
        quizScore += 10;
        addXP(10);
        document.getElementById('quizScore').innerText = `Score: ${quizScore}`;
    } else {
        selectedBtn.classList.add('wrong');
        allBtns.forEach(btn => {
            if (btn.innerText === correctMeaning) btn.classList.add('correct');
        });
    }

    allBtns.forEach(btn => btn.style.pointerEvents = 'none');

    const btnNext = document.getElementById('btnNextQuiz');
    if (btnNext) {
        btnNext.innerText = "Next Question ➔";
        btnNext.onclick = () => {
            quizCurrentIndex++;
            renderQuizQuestion();
        };
        btnNext.style.display = 'inline-block';
    }
}

// MATCH GAME
let matchSelectedCard = null;
let matchPairsLeft = 0;
let matchIsChecking = false;

function initMatchGame() {
    const gridContainer = document.getElementById('matchGrid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    matchSelectedCard = null;
    matchIsChecking = false;

    if (allWords.length < 4) return;

    const randomWords = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 4);
    matchPairsLeft = randomWords.length;

    let cardsData = [];
    randomWords.forEach((item, index) => {
        const armText = item.arm || item.armenian;
        cardsData.push({ id: index, text: item.word, type: 'en' });
        cardsData.push({ id: index, text: armText, type: 'arm' });
    });

    cardsData.sort(() => 0.5 - Math.random());

    cardsData.forEach(cardInfo => {
        const cardElem = document.createElement('div');
        cardElem.className = 'match-card';
        cardElem.innerText = cardInfo.text;
        cardElem.dataset.id = cardInfo.id;
        cardElem.dataset.type = cardInfo.type;

        cardElem.onclick = () => handleMatchCardClick(cardElem);
        gridContainer.appendChild(cardElem);
    });
}

function handleMatchCardClick(cardElem) {
    if (matchIsChecking || cardElem.classList.contains('matched') || cardElem === matchSelectedCard) return;

    if (!matchSelectedCard) {
        matchSelectedCard = cardElem;
        cardElem.classList.add('selected');
        return;
    }

    if (matchSelectedCard.dataset.type === cardElem.dataset.type) {
        matchSelectedCard.classList.remove('selected');
        matchSelectedCard = cardElem;
        cardElem.classList.add('selected');
        return;
    }

    cardElem.classList.add('selected');
    matchIsChecking = true;

    if (matchSelectedCard.dataset.id === cardElem.dataset.id) {
        setTimeout(() => {
            matchSelectedCard.classList.remove('selected');
            cardElem.classList.remove('selected');
            matchSelectedCard.classList.add('matched');
            cardElem.classList.add('matched');

            matchSelectedCard = null;
            matchIsChecking = false;

            addXP(10);
            matchPairsLeft--;
        }, 300);
    } else {
        setTimeout(() => {
            matchSelectedCard.classList.remove('selected');
            cardElem.classList.remove('selected');
            matchSelectedCard = null;
            matchIsChecking = false;
        }, 800);
    }
}

// SCRAMBLE GAME
let scrambleCurrentIndex = 0;
let scrambleQuestions = [];
let scrambleCurrentWord = null;

function initScrambleGame() {
    if (allWords.length < 4) return;
    scrambleQuestions = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 5);
    scrambleCurrentIndex = 0;
    renderScrambleQuestion();
}

function renderScrambleQuestion() {
    const questionContainer = document.getElementById('scrambleQuestion');
    const hintContainer = document.getElementById('scrambleHint');
    const inputField = document.getElementById('scrambleInput');
    const feedbackMsg = document.getElementById('scrambleFeedback');

    if (feedbackMsg) feedbackMsg.innerText = '';

    if (scrambleCurrentIndex >= scrambleQuestions.length) {
        if (questionContainer) questionContainer.innerHTML = `🎉 Scramble Completed!`;
        if (inputField) inputField.style.display = 'none';
        return;
    }

    scrambleCurrentWord = scrambleQuestions[scrambleCurrentIndex];
    if (inputField) {
        inputField.style.display = 'inline-block';
        inputField.value = '';
        inputField.focus();
    }

    const shuffled = scrambleCurrentWord.word.split('').sort(() => 0.5 - Math.random()).join('');
    if (questionContainer) questionContainer.innerText = shuffled.toUpperCase();
    if (hintContainer) hintContainer.innerText = `💡 Hint: ${scrambleCurrentWord.meaning || scrambleCurrentWord.definition}`;
}

function checkScrambleAnswer() {
    const inputField = document.getElementById('scrambleInput');
    const feedbackMsg = document.getElementById('scrambleFeedback');

    if (!inputField || !scrambleCurrentWord) return;

    if (inputField.value.trim().toLowerCase() === scrambleCurrentWord.word.trim().toLowerCase()) {
        addXP(10);
        if (feedbackMsg) {
            feedbackMsg.style.color = 'var(--success)';
            feedbackMsg.innerText = '✅ Correct!';
        }
        setTimeout(() => {
            scrambleCurrentIndex++;
            renderScrambleQuestion();
        }, 1000);
    } else {
        if (feedbackMsg) {
            feedbackMsg.style.color = 'var(--danger)';
            feedbackMsg.innerText = `❌ Try Again!`;
        }
    }
}

// ==========================================
// 7. ASYNC DATABASE LOADER
// ==========================================
async function fetchJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) return [];
        return await response.json();
    } catch (e) {
        console.warn(`Could not load ${path}`, e);
        return [];
    }
}

async function loadAllDatabases() {
    // Render initial sample words instantly
    renderCards(allWords);
    setupFilterButtons();

    const [a1_a2, b1_b2, c1_c2, slang_gaming] = await Promise.all([
        fetchJSON('data/a1_a2.json'),
        fetchJSON('data/b1_b2.json'),
        fetchJSON('data/c1_c2.json'),
        fetchJSON('data/slang_gaming.json')
    ]);

    // Merge full dataset
    allWords = [...sampleWords, ...customWords, ...a1_a2, ...b1_b2, ...c1_c2, ...slang_gaming];

    // Re-render with full dataset loaded (maintaining current visible page count)
    renderCards(allWords, false);
    updateWordOfTheDay();
    updateLeaderboardUI();
    initQuizGame();
}

// App Initialization
document.addEventListener('DOMContentLoaded', loadAllDatabases);

// ==========================================
// 8. LOAD MORE & BUTTON CONTROL
// ==========================================

const WORDS_PER_LOAD = 8;

// Load 8 more words
function loadMoreWords() {
    if (!currentDisplayedWords || currentDisplayedWords.length === 0) {
        return;
    }

    // Add exactly 8 more cards
    visibleCardsCount += WORDS_PER_LOAD;

    // Render without resetting pagination
    renderCards(currentDisplayedWords, false);
}

// Update Load More button visibility
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('btnLoadMore');

    if (!loadMoreBtn) return;

    // If there are no more words to show, hide the button
    if (
        !currentDisplayedWords ||
        visibleCardsCount >= currentDisplayedWords.length
    ) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
}

// Hide Load More button
function hideLoadMoreButton() {
    const loadMoreBtn = document.getElementById('btnLoadMore');

    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}