// Base Dictionary Data
const sampleWords = [
    { word: "Spill the tea", level: "slang", meaning: "To reveal gossip or secret information.", example: "Come on, spill the tea! What happened last night?", arm: "Գաղտնիքը բացել / Բամբասել" },
    { word: "Hit the sack", level: "a1_a2", meaning: "To go to sleep.", example: "I'm extremely tired, time to hit the sack.", arm: "Քնելու գնալ" },
    { word: "Bite the bullet", level: "b1_b2", meaning: "To face a difficult situation with courage.", example: "You just have to bite the bullet and take the exam.", arm: "Ատամները սեղմել ու առաջ գնալ" },
    { word: "Clutch", level: "slang", meaning: "Doing something critical at the last possible moment.", example: "He scored in the last second, that was so clutch!", arm: "Վերջին վայրկյանին հաղթանակ ապահովող" },
    { word: "Burn the midnight oil", level: "c1_c2", meaning: "To work or study late into the night.", example: "She burned the midnight oil to finish the project.", arm: "Մինչև ուշ գիշեր աշխատել" }
];

// Load Custom Saved Words from LocalStorage
let customWords = JSON.parse(localStorage.getItem('customSlangWords')) || [];
let allWords = [...sampleWords, ...customWords];

let availableVoices = [];

// ==========================================
// 🏆 GLOBAL XP & LOCAL LEADERBOARD SYSTEM
// ==========================================
let totalXP = parseInt(localStorage.getItem('slangify_total_xp')) || 0;

// Ֆունկցիա՝ XP ավելացնելու և LocalStorage-ում պահելու համար
function addXP(points) {
    if (points <= 0) return;
    totalXP += points;
    localStorage.setItem('slangify_total_xp', totalXP);
    updateLeaderboardUI();
}

// Ֆունկցիա՝ Օգտատիրոջ ռանկը որոշելու համար
function getUserRank(xp) {
    if (xp >= 300) return "🔥 Slang Legend";
    if (xp >= 150) return "⚡ Slang Master";
    if (xp >= 50)  return "🌱 Gen-Z Learner";
    return "🐣 Novice";
}

// Ֆունկցիա՝ Leaderboard UI-ն թարմացնելու համար (եթե HTML-ում կա leaderboard բաժինը)
function updateLeaderboardUI() {
    const xpDisplay = document.getElementById('userTotalXP');
    const rankDisplay = document.getElementById('userRank');
    
    if (xpDisplay) xpDisplay.innerText = `${totalXP} XP`;
    if (rankDisplay) rankDisplay.innerText = getUserRank(totalXP);

    const leaderboardTable = document.getElementById('leaderboardList');
    if (leaderboardTable) {
        // Դեմո լիդերներ + Օգտատիրոջ իրական XP-ն
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
// 2. TEXT-TO-SPEECH (US/UK ACCENTS & FEMALE/MALE)
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
        return name.includes('female') || 
               name.includes('zira') || 
               name.includes('samantha') || 
               name.includes('victoria') || 
               name.includes('jenny') || 
               name.includes('aria') || 
               name.includes('susan') || 
               name.includes('hazel') ||
               (name.includes('google us english') && !name.includes('male'));
    };

    const isVoiceMale = (name) => {
        return name.includes('male') || 
               name.includes('david') || 
               name.includes('mark') || 
               name.includes('george') || 
               name.includes('guy') || 
               name.includes('james') ||
               name.includes('richard');
    };

    let hasMaleVoice = false;

    filteredVoices.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.name;
        
        const name = voice.name.toLowerCase();
        let isFemale = isVoiceFemale(name);
        let isMale = isVoiceMale(name);

        if (isMale) hasMaleVoice = true;

        let genderTag = isFemale ? '👩 Female' : (isMale ? '👨 Male' : '🔊');

        let cleanName = voice.name
            .replace(/Google|Microsoft|Apple|Desktop|English|\(United States\)|\(United Kingdom\)/gi, '')
            .replace(/-/g, '')
            .trim();

        option.textContent = `${genderTag} ${cleanName ? '(' + cleanName + ')' : ''}`;
        voiceSelect.appendChild(option);
    });

    if (!hasMaleVoice) {
        const externalMaleVoice = availableVoices.find(v => v.lang.startsWith('en') && isVoiceMale(v.name.toLowerCase()));
        if (externalMaleVoice) {
            const option = document.createElement('option');
            option.value = externalMaleVoice.name;
            
            let cleanName = externalMaleVoice.name
                .replace(/Google|Microsoft|Apple|Desktop|English|\(United States\)|\(United Kingdom\)/gi, '')
                .replace(/-/g, '')
                .trim();

            option.textContent = `👨 Male (${cleanName || 'English Male'})`;
            voiceSelect.appendChild(option);
        }
    }

    if (voiceSelect.options.length === 0) {
        const option = document.createElement('option');
        option.textContent = "🔊 Default System Voice";
        option.value = "";
        voiceSelect.appendChild(option);
    }
}

function playAudio(text) {
    if (!('speechSynthesis' in window)) {
        alert('Your browser does not support text-to-speech.');
        return;
    }

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

function changeAccent(accent) {
    populateVoiceList();
}

if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

// Favorites Array loaded from Browser Storage
let favoriteWords = JSON.parse(localStorage.getItem('favoriteSlangWords')) || [];

// ==========================================
// 3. RENDER CARDS & FILTERS (WITH FAVORITES)
// ==========================================
function renderCards(words) {
    const grid = document.getElementById('dictionaryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (words.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; opacity: 0.7; padding: 20px;">No words found...</p>`;
        return;
    }

    words.forEach(item => {
        const isFav = favoriteWords.some(f => f.word === item.word);

        const card = document.createElement('div');
        card.className = 'word-card';
        card.innerHTML = `
            <div class="card-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span class="card-title" style="font-size:1.2rem; font-weight:700;">${item.word}</span>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="card-tag tag-${item.level}" style="font-size:0.8rem; opacity:0.8;">${item.level.toUpperCase()}</span>
                    <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite('${item.word.replace(/'/g, "\\'")}')" title="Save to Favorites">
                        ${isFav ? '⭐' : '☆'}
                    </button>
                </div>
            </div>
            <p class="card-def" style="margin-bottom:6px;"><strong>Meaning:</strong> ${item.meaning}</p>
            <p class="card-ex" style="font-style:italic; margin-bottom:10px; opacity:0.9;">"${item.example}"</p>
            <div class="card-arm">🇦🇲 ${item.arm}</div>
        `;
        grid.appendChild(card);
    });
}

function toggleFavorite(wordTitle) {
    const targetWord = allWords.find(w => w.word === wordTitle);
    if (!targetWord) return;

    const index = favoriteWords.findIndex(f => f.word === wordTitle);

    if (index > -1) {
        favoriteWords.splice(index, 1);
    } else {
        favoriteWords.push(targetWord);
    }

    localStorage.setItem('favoriteSlangWords', JSON.stringify(favoriteWords));

    const activeFilter = document.querySelector('.filter-btn.active');
    if (activeFilter && activeFilter.dataset.level === 'favorites') {
        renderCards(favoriteWords);
    } else {
        renderCards(allWords);
    }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const level = btn.dataset.level;

        if (level === 'all') {
            renderCards(allWords);
        } else if (level === 'favorites') {
            renderCards(favoriteWords);
        } else {
            renderCards(allWords.filter(w => w.level === level));
        }
    });
});

// ==========================================
// REAL-TIME SEARCH FUNCTIONALITY (WITH AUTO-SCROLL)
// ==========================================
const globalSearchInput = document.getElementById('globalSearch');

if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length > 0) {
            const dictionarySection = document.getElementById('dictionary');
            if (dictionarySection) {
                dictionarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        if (query === '') {
            renderCards(allWords);
            return;
        }

        const filteredWords = allWords.filter(item => {
            const matchesWord = item.word.toLowerCase().includes(query);
            const matchesMeaning = item.meaning.toLowerCase().includes(query);
            const matchesArm = item.arm.toLowerCase().includes(query);

            return matchesWord || matchesMeaning || matchesArm;
        });

        renderCards(filteredWords);
    });
}

// ==========================================
// 4. ADD CUSTOM IDIOM MODAL & LOCAL STORAGE
// ==========================================
const modal = document.getElementById('addWordModal');
const btnOpenModal = document.getElementById('btnOpenModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const addWordForm = document.getElementById('addWordForm');

if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => modal.classList.add('show'));
}

if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => modal.classList.remove('show'));
}

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

// Initial Card Load
renderCards(allWords);

// ==========================================
// 5. MINI-GAMES LOGIC: MULTIPLE CHOICE QUIZ
// ==========================================
let quizCurrentIndex = 0;
let quizScore = 0;
let quizQuestions = [];
let quizAnswered = false;
let quizErrorsList = [];

function switchGame(gameType) {
    document.querySelectorAll('.game-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.game-box').forEach(box => box.style.display = 'none');

    if (gameType === 'quiz') {
        if (event && event.target) event.target.classList.add('active');
        document.getElementById('gameQuiz').style.display = 'block';
        initQuizGame();
    } else if (gameType === 'match') {
        if (event && event.target) event.target.classList.add('active');
        document.getElementById('gameMatch').style.display = 'block';
        if (typeof initMatchGame === 'function') initMatchGame();
    } else if (gameType === 'scramble') {
        if (event && event.target) event.target.classList.add('active');
        document.getElementById('gameScramble').style.display = 'block';
        if (typeof initScrambleGame === 'function') initScrambleGame();
    }
}

function initQuizGame() {
    if (allWords.length < 4) {
        document.getElementById('quizQuestion').innerText = "Please add at least 4 words to start the quiz!";
        return;
    }

    const oldReview = document.getElementById('quizReviewBox');
    if (oldReview) oldReview.remove();
    const oldBtnReview = document.getElementById('btnQuizReview');
    if (oldBtnReview) oldBtnReview.remove();

    quizQuestions = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 10);
    quizCurrentIndex = 0;
    quizScore = 0;
    quizErrorsList = [];
    
    document.getElementById('quizScore').innerText = `Score: ${quizScore}`;
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
        
        if (btnNext) {
            btnNext.innerText = "🔄 Play Again";
            btnNext.style.display = "inline-block";
            btnNext.onclick = initQuizGame;
        }

        showQuizReviewButton();
        return;
    }

    const currentW = quizQuestions[quizCurrentIndex];
    document.getElementById('quizProgress').innerText = `Question ${quizCurrentIndex + 1} / ${quizQuestions.length}`;
    document.getElementById('quizQuestion').innerText = `What does "${currentW.word}" mean?`;

    const optionsOptions = [currentW.meaning];
    
    const otherMeanings = allWords
        .filter(w => w.word !== currentW.word)
        .map(w => w.meaning)
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
        btn.onclick = () => selectQuizOption(btn, optText, currentW.meaning, currentW.word);
        optionsContainer.appendChild(btn);
    });
}

function selectQuizOption(selectedBtn, selectedText, correctMeaning, currentWord) {
    if (quizAnswered) return;
    quizAnswered = true;

    const allBtns = document.querySelectorAll('#quizOptions .option-btn');
    
    if (selectedText === correctMeaning) {
        selectedBtn.classList.add('correct');
        quizScore += 10;
        addXP(10); // 🏆 Ավելացնում ենք Global XP
        document.getElementById('quizScore').innerText = `Score: ${quizScore}`;
    } else {
        selectedBtn.classList.add('wrong');
        
        quizErrorsList.push({
            word: currentWord,
            userChoice: selectedText,
            correctMeaning: correctMeaning
        });

        allBtns.forEach(btn => {
            if (btn.innerText === correctMeaning) {
                btn.classList.add('correct');
            }
        });
    }

    allBtns.forEach(btn => btn.style.pointerEvents = 'none');

    const btnNext = document.getElementById('btnNextQuiz');
    if (btnNext) {
        btnNext.innerText = "Next Question ➔";
        btnNext.onclick = nextQuizQuestion;
        btnNext.style.display = 'inline-block';
    }
}

function nextQuizQuestion() {
    quizCurrentIndex++;
    renderQuizQuestion();
}

function showQuizReviewButton() {
    const gameBox = document.getElementById('gameQuiz');
    if (!gameBox) return;

    let btnReview = document.getElementById('btnQuizReview');
    if (!btnReview) {
        btnReview = document.createElement('button');
        btnReview.id = 'btnQuizReview';
        btnReview.className = 'btn btn-primary';
        btnReview.style.marginTop = '15px';
        btnReview.style.marginLeft = '10px';
        btnReview.innerText = '📋 Review Mistakes';
        btnReview.onclick = toggleQuizReview;

        const btnNext = document.getElementById('btnNextQuiz');
        if (btnNext) btnNext.after(btnReview);
    }
    btnReview.style.display = 'inline-block';
}

function toggleQuizReview() {
    const gameBox = document.getElementById('gameQuiz');
    let reviewBox = document.getElementById('quizReviewBox');

    if (reviewBox) {
        reviewBox.remove();
        return;
    }

    reviewBox = document.createElement('div');
    reviewBox.id = 'quizReviewBox';
    reviewBox.style.marginTop = '20px';
    reviewBox.style.padding = '15px';
    reviewBox.style.background = 'var(--bg-primary)';
    reviewBox.style.borderRadius = '12px';
    reviewBox.style.border = '1px solid var(--border-color)';

    if (quizErrorsList.length === 0) {
        reviewBox.innerHTML = `<h4 style="color: var(--success); text-align: center;">🌟 Perfect Game! No mistakes made.</h4>`;
    } else {
        let html = `<h4 style="margin-bottom: 10px; color: var(--accent);">⚠️ Mistakes Analysis:</h4><ul style="list-style: none; padding: 0;">`;

        quizErrorsList.forEach(err => {
            html += `
                <li style="margin-bottom: 10px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                    <strong>${err.word}</strong><br>
                    <span style="color: var(--danger); font-size: 0.9rem;">❌ Your selection: ${err.userChoice}</span><br>
                    <span style="color: var(--success); font-size: 0.9rem;">✅ Correct meaning: ${err.correctMeaning}</span>
                </li>
            `;
        });
        html += `</ul>`;
        reviewBox.innerHTML = html;
    }

    gameBox.appendChild(reviewBox);
}

document.addEventListener('DOMContentLoaded', () => {
    initQuizGame();
    updateLeaderboardUI(); // 🏆 Ինիցիալիզացնում ենք Leaderboard-ը էջը բացելիս
});

// ==========================================
// 6. MINI-GAMES LOGIC: MATCH THE CARDS
// ==========================================
let matchSelectedCard = null;
let matchPairsLeft = 0;
let matchIsChecking = false;
let matchErrorsList = [];
let matchMistakesCount = 0;

function initMatchGame() {
    const gridContainer = document.getElementById('matchGrid');
    const scoreBadge = document.getElementById('matchScore');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    matchSelectedCard = null;
    matchIsChecking = false;
    matchErrorsList = [];
    matchMistakesCount = 0;

    const oldReview = document.getElementById('matchReviewBox');
    if (oldReview) oldReview.remove();
    const oldWarning = document.getElementById('matchWarningMsg');
    if (oldWarning) oldWarning.remove();

    if (typeof allWords === 'undefined' || allWords.length < 4) {
        gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Please add at least 4 words to play Match game!</p>`;
        return;
    }

    const randomWords = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 4);
    matchPairsLeft = randomWords.length;

    if (scoreBadge) scoreBadge.innerText = `Pairs Left: ${matchPairsLeft} | Mistakes: 0`;

    let cardsData = [];
    randomWords.forEach((item, index) => {
        cardsData.push({ id: index, text: item.word, type: 'en', pairText: item.arm });
        cardsData.push({ id: index, text: item.arm, type: 'arm', pairText: item.word });
    });

    cardsData.sort(() => 0.5 - Math.random());

    cardsData.forEach(cardInfo => {
        const cardElem = document.createElement('div');
        cardElem.className = 'match-card';
        cardElem.innerText = cardInfo.text;
        cardElem.dataset.id = cardInfo.id;
        cardElem.dataset.type = cardInfo.type;
        cardElem.dataset.text = cardInfo.text;
        cardElem.dataset.pairText = cardInfo.pairText;

        cardElem.onclick = () => handleMatchCardClick(cardElem);
        gridContainer.appendChild(cardElem);
    });
}

function handleMatchCardClick(cardElem) {
    if (matchIsChecking || cardElem.classList.contains('matched') || cardElem === matchSelectedCard) {
        return;
    }

    const oldWarning = document.getElementById('matchWarningMsg');
    if (oldWarning) oldWarning.remove();

    if (!matchSelectedCard) {
        matchSelectedCard = cardElem;
        cardElem.classList.add('selected');
        return;
    }

    const firstType = matchSelectedCard.dataset.type;
    const secondType = cardElem.dataset.type;

    if (firstType === secondType) {
        showMatchWarning("⚠️ Invalid Selection! Please pair an English phrase with its Armenian translation.");
        matchSelectedCard.classList.remove('selected');
        matchSelectedCard = cardElem;
        cardElem.classList.add('selected');
        return;
    }

    cardElem.classList.add('selected');
    matchIsChecking = true;

    const firstId = matchSelectedCard.dataset.id;
    const secondId = cardElem.dataset.id;
    const scoreBadge = document.getElementById('matchScore');

    if (firstId === secondId) {
        setTimeout(() => {
            matchSelectedCard.classList.remove('selected');
            cardElem.classList.remove('selected');

            matchSelectedCard.classList.add('matched');
            cardElem.classList.add('matched');

            matchSelectedCard = null;
            matchIsChecking = false;

            addXP(10); // 🏆 Ավելացնում ենք 10 XP ամեն ճիշտ զույգի համար

            matchPairsLeft--;
            if (scoreBadge) scoreBadge.innerText = `Pairs Left: ${matchPairsLeft} | Mistakes: ${matchMistakesCount}`;

            if (matchPairsLeft === 0) {
                if (scoreBadge) scoreBadge.innerText = `🎉 Game Finished! (${matchMistakesCount} Mistakes)`;
                showMatchReviewButton();
            }
        }, 300);
    } else {
        matchMistakesCount++;

        const enCard = firstType === 'en' ? matchSelectedCard : cardElem;
        const wrongArmCard = firstType === 'arm' ? matchSelectedCard : cardElem;

        matchErrorsList.push({
            word: enCard.dataset.text,
            correctArm: enCard.dataset.pairText,
            userChoice: wrongArmCard.dataset.text
        });

        const allCards = document.querySelectorAll('.match-card');
        let realArmPairCard = null;
        allCards.forEach(c => {
            if (c.dataset.id === enCard.dataset.id && c !== enCard) {
                realArmPairCard = c;
            }
        });

        wrongArmCard.classList.remove('selected');

        setTimeout(() => {
            enCard.classList.remove('selected');
            enCard.classList.add('wrong');
            if (realArmPairCard) realArmPairCard.classList.add('wrong');
        }, 150);

        setTimeout(() => {
            enCard.classList.remove('wrong');
            if (realArmPairCard) realArmPairCard.classList.remove('wrong');

            enCard.classList.add('matched');
            if (realArmPairCard) realArmPairCard.classList.add('matched');

            matchSelectedCard = null;
            matchIsChecking = false;

            matchPairsLeft--;
            if (scoreBadge) scoreBadge.innerText = `Pairs Left: ${matchPairsLeft} | Mistakes: ${matchMistakesCount}`;

            if (matchPairsLeft === 0) {
                if (scoreBadge) scoreBadge.innerText = `🎉 Game Finished! (${matchMistakesCount} Mistakes)`;
                showMatchReviewButton();
            }
        }, 1200);
    }
}

function showMatchWarning(msgText) {
    const gameBox = document.getElementById('gameMatch');
    if (!gameBox) return;
    let warning = document.getElementById('matchWarningMsg');
    if (!warning) {
        warning = document.createElement('div');
        warning.id = 'matchWarningMsg';
        warning.style.color = '#F59E0B';
        warning.style.fontSize = '0.9rem';
        warning.style.marginTop = '10px';
        warning.style.fontWeight = '600';
        warning.style.textAlign = 'center';
        const header = gameBox.querySelector('.game-header');
        if (header) header.after(warning);
    }
    warning.innerText = msgText;
}

function showMatchReviewButton() {
    const gameBox = document.getElementById('gameMatch');
    if (!gameBox) return;

    let btnReview = document.getElementById('btnMatchReview');
    if (!btnReview) {
        btnReview = document.createElement('button');
        btnReview.id = 'btnMatchReview';
        btnReview.className = 'btn btn-primary';
        btnReview.style.marginTop = '15px';
        btnReview.style.marginLeft = '10px';
        btnReview.innerText = '📋 Review Mistakes';
        btnReview.onclick = toggleMatchReview;

        const resetBtn = gameBox.querySelector('.btn-secondary');
        if (resetBtn) resetBtn.after(btnReview);
    }
    btnReview.style.display = 'inline-block';
}

function toggleMatchReview() {
    const gameBox = document.getElementById('gameMatch');
    let reviewBox = document.getElementById('matchReviewBox');

    if (reviewBox) {
        reviewBox.remove();
        return;
    }

    reviewBox = document.createElement('div');
    reviewBox.id = 'matchReviewBox';
    reviewBox.style.marginTop = '20px';
    reviewBox.style.padding = '15px';
    reviewBox.style.background = 'var(--bg-primary)';
    reviewBox.style.borderRadius = '12px';
    reviewBox.style.border = '1px solid var(--border-color)';

    if (matchErrorsList.length === 0) {
        reviewBox.innerHTML = `<h4 style="color: var(--success); text-align: center;">🌟 Perfect Game! No mistakes made.</h4>`;
    } else {
        let html = `<h4 style="margin-bottom: 10px; color: var(--accent);">⚠️ Mistakes Analysis:</h4><ul style="list-style: none; padding: 0;">`;

        const uniqueErrors = Array.from(new Set(matchErrorsList.map(a => a.word)))
            .map(word => matchErrorsList.find(a => a.word === word));

        uniqueErrors.forEach(err => {
            html += `
                <li style="margin-bottom: 8px; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
                    <strong>${err.word}</strong><br>
                    <span style="color: var(--danger); font-size: 0.9rem;">❌ Your selection: ${err.userChoice}</span><br>
                    <span style="color: var(--success); font-size: 0.9rem;">✅ Correct matching: ${err.correctArm}</span>
                </li>
            `;
        });
        html += `</ul>`;
        reviewBox.innerHTML = html;
    }

    gameBox.appendChild(reviewBox);
}

// ==========================================
// 7. MINI-GAMES LOGIC: WORD SCRAMBLE
// ==========================================
let scrambleCurrentIndex = 0;
let scrambleScore = 0;
let scrambleQuestions = [];
let scrambleErrorsList = [];
let scrambleCurrentWord = null;
let scrambleAnswered = false;

function initScrambleGame() {
    const gameBox = document.getElementById('gameScramble');
    if (!gameBox) return;

    if (typeof allWords === 'undefined' || allWords.length < 4) {
        gameBox.innerHTML = `<p style="text-align: center; color: var(--text-secondary);">Please add at least 4 words to play Word Scramble!</p>`;
        return;
    }

    const oldReview = document.getElementById('scrambleReviewBox');
    if (oldReview) oldReview.remove();
    const oldBtnReview = document.getElementById('btnScrambleReview');
    if (oldBtnReview) oldBtnReview.remove();
    const oldNextBtn = document.getElementById('btnNextScramble');
    if (oldNextBtn) oldNextBtn.remove();

    scrambleQuestions = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 5);
    scrambleCurrentIndex = 0;
    scrambleScore = 0;
    scrambleErrorsList = [];

    const scoreBadge = document.getElementById('scrambleScore');
    if (scoreBadge) scoreBadge.innerText = `Score: ${scrambleScore}`;

    renderScrambleQuestion();
}

function shuffleText(text) {
    const words = text.split(' ');
    const shuffledWords = words.map(word => {
        if (word.length <= 1) return word;
        let arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        let res = arr.join('');
        return res.toLowerCase() === word.toLowerCase() ? shuffleText(word) : res;
    });
    return shuffledWords.join(' ');
}

function renderScrambleQuestion() {
    scrambleAnswered = false;

    const questionContainer = document.getElementById('scrambleQuestion');
    const hintContainer = document.getElementById('scrambleHint');
    const inputField = document.getElementById('scrambleInput');
    const progressBadge = document.getElementById('scrambleProgress');
    const btnSubmit = document.getElementById('btnSubmitScramble');
    const feedbackMsg = document.getElementById('scrambleFeedback');

    if (feedbackMsg) feedbackMsg.innerText = '';
    
    const oldNextBtn = document.getElementById('btnNextScramble');
    if (oldNextBtn) oldNextBtn.remove();

    if (scrambleCurrentIndex >= scrambleQuestions.length) {
        if (questionContainer) {
            questionContainer.innerHTML = `🎉 Scramble Completed!<br>Your Final Score: <strong>${scrambleScore} / ${scrambleQuestions.length * 10}</strong>`;
        }
        if (hintContainer) hintContainer.innerText = '';
        if (progressBadge) progressBadge.innerText = 'Completed!';
        if (inputField) inputField.style.display = 'none';

        if (btnSubmit) {
            btnSubmit.style.display = 'inline-block';
            btnSubmit.disabled = false;
            btnSubmit.innerText = "🔄 Play Again";
            btnSubmit.onclick = initScrambleGame;
        }

        showScrambleReviewButton();
        return;
    }

    scrambleCurrentWord = scrambleQuestions[scrambleCurrentIndex];

    if (inputField) {
        inputField.style.display = 'inline-block';
        inputField.value = '';
        inputField.disabled = false;
        
        inputField.setAttribute('spellcheck', 'false');
        inputField.setAttribute('autocorrect', 'off');
        inputField.setAttribute('autocapitalize', 'off');
        
        inputField.focus();

        inputField.onkeyup = null;
        inputField.onkeyup = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!scrambleAnswered) {
                    checkScrambleAnswer();
                } else {
                    const btnNext = document.getElementById('btnNextScramble');
                    if (btnNext) btnNext.click();
                }
            }
        };
    }

    if (btnSubmit) {
        btnSubmit.style.display = 'inline-block';
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Check Answer ➔";
        btnSubmit.onclick = checkScrambleAnswer;
    }

    if (progressBadge) {
        progressBadge.innerText = `Word ${scrambleCurrentIndex + 1} / ${scrambleQuestions.length}`;
    }

    const scrambled = shuffleText(scrambleCurrentWord.word.toUpperCase());

    if (questionContainer) {
        questionContainer.innerText = scrambled;
    }

    if (hintContainer) {
        hintContainer.innerText = `💡 Meaning: ${scrambleCurrentWord.meaning} (${scrambleCurrentWord.arm})`;
    }
}

function checkScrambleAnswer() {
    if (scrambleAnswered) return;

    const inputField = document.getElementById('scrambleInput');
    const feedbackMsg = document.getElementById('scrambleFeedback');
    const btnSubmit = document.getElementById('btnSubmitScramble');
    const scoreBadge = document.getElementById('scrambleScore');

    if (!inputField || !scrambleCurrentWord) return;

    const userGuess = inputField.value.trim().toLowerCase();
    const correctWord = scrambleCurrentWord.word.trim().toLowerCase();

    if (userGuess === '') {
        if (feedbackMsg) {
            feedbackMsg.style.color = 'var(--accent)';
            feedbackMsg.innerText = '⚠️ Please enter a word before checking!';
        }
        return;
    }

    scrambleAnswered = true;
    inputField.disabled = true;
    if (btnSubmit) btnSubmit.disabled = true;

    if (userGuess === correctWord) {
        scrambleScore += 10;
        addXP(10); // 🏆 Ավելացնում ենք Global XP
        if (scoreBadge) scoreBadge.innerText = `Score: ${scrambleScore}`;
        if (feedbackMsg) {
            feedbackMsg.style.color = 'var(--success)';
            feedbackMsg.innerText = '✅ Correct! Excellent job!';
        }
    } else {
        scrambleErrorsList.push({
            scrambled: document.getElementById('scrambleQuestion').innerText,
            userChoice: userGuess,
            correctWord: scrambleCurrentWord.word,
            meaning: scrambleCurrentWord.meaning
        });

        if (feedbackMsg) {
            feedbackMsg.style.color = 'var(--danger)';
            feedbackMsg.innerText = `❌ Wrong! Correct answer: "${scrambleCurrentWord.word}"`;
        }
    }

    showNextScrambleButton();
}

function showNextScrambleButton() {
    const btnSubmit = document.getElementById('btnSubmitScramble');
    if (!btnSubmit) return;

    let btnNext = document.getElementById('btnNextScramble');
    if (!btnNext) {
        btnNext = document.createElement('button');
        btnNext.id = 'btnNextScramble';
        btnNext.className = 'btn btn-primary';
        btnNext.innerText = 'Next Word ➔';
        btnNext.onclick = () => {
            scrambleCurrentIndex++;
            renderScrambleQuestion();
        };

        btnSubmit.after(btnNext);
    }
}

function showScrambleReviewButton() {
    const gameBox = document.getElementById('gameScramble');
    if (!gameBox) return;

    let btnReview = document.getElementById('btnScrambleReview');
    if (!btnReview) {
        btnReview = document.createElement('button');
        btnReview.id = 'btnScrambleReview';
        btnReview.className = 'btn btn-primary';
        btnReview.style.marginTop = '15px';
        btnReview.innerText = '📋 Review Mistakes';
        btnReview.onclick = toggleScrambleReview;

        const btnSubmit = document.getElementById('btnSubmitScramble');
        if (btnSubmit) btnSubmit.after(btnReview);
    }
    btnReview.style.display = 'inline-block';
}

function toggleScrambleReview() {
    const gameBox = document.getElementById('gameScramble');
    let reviewBox = document.getElementById('scrambleReviewBox');

    if (reviewBox) {
        reviewBox.remove();
        return;
    }

    reviewBox = document.createElement('div');
    reviewBox.id = 'scrambleReviewBox';
    reviewBox.style.marginTop = '20px';
    reviewBox.style.padding = '15px';
    reviewBox.style.background = 'var(--bg-primary)';
    reviewBox.style.borderRadius = '12px';
    reviewBox.style.border = '1px solid var(--border-color)';

    if (scrambleErrorsList.length === 0) {
        reviewBox.innerHTML = `<h4 style="color: var(--success); text-align: center;">🌟 Perfect Game! No mistakes made.</h4>`;
    } else {
        let html = `<h4 style="margin-bottom: 10px; color: var(--accent);">⚠️ Mistakes Analysis:</h4><ul style="list-style: none; padding: 0;">`;

        scrambleErrorsList.forEach(err => {
            html += `
                <li style="margin-bottom: 10px; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
                    <strong>Scrambled: ${err.scrambled}</strong><br>
                    <span style="color: var(--danger); font-size: 0.9rem;">❌ Your input: ${err.userChoice}</span><br>
                    <span style="color: var(--success); font-size: 0.9rem;">✅ Correct phrase: ${err.correctWord}</span><br>
                    <small style="opacity: 0.8;">Meaning: ${err.meaning}</small>
                </li>
            `;
        });
        html += `</ul>`;
        reviewBox.innerHTML = html;
    }

    gameBox.appendChild(reviewBox);
}

// Dynamic Multi-Database Loader
async function loadAllDatabases() {
    const files = [
        'data/a1_a2.json',
        'data/b1_b2.json',
        'data/c1_c2.json',
        'data/slang_gaming.json'
    ];

    try {
        const responses = await Promise.all(files.map(file => fetch(file)));
        const dataArrays = await Promise.all(responses.map(res => res.json()));
        
        // Merge all words into single master database
        const masterDatabase = dataArrays.flat();
        console.log(`Loaded ${masterDatabase.length} entries successfully!`);
        return masterDatabase;
    } catch (error) {
        console.error("Error loading databases:", error);
    }
}

async function loadA1A2Words() {
    try {
        const response = await fetch('data/a1_a2.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`✅ Success! Loaded ${data.length} entries from a1_a2.json:`, data);
        
        // Կանչիր քո ցուցադրման ֆունկցիան
        if (typeof displayWords === 'function') {
            displayWords(data);
        }
    } catch (error) {
        console.error("❌ Error loading A1-A2 database:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadA1A2Words);

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('✅ PWA Service Worker registered:', reg))
      .catch(err => console.error('❌ Service Worker registration failed:', err));
  });
}

async function loadB1B2Words() {
  try {
    const response = await fetch('data/b1_b2.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log(`✅ Success! Loaded ${data.length} entries from b1_b2.json:`, data);
    return data;
  } catch (error) {
    console.error('Error loading B1-B2 database:', error);
  }
}

// Կանչիր ֆունկցիան էջը բացվելիս
loadB1B2Words();