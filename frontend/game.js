// Game State
let gameState = {
    currentMode: null,
    levelData: null,
    activeSelection: [],
    score: 0,
    timeLeft: 60,
    timer: null,
    isProcessing: false,
    blockUid: 0
};

// DOM Elements
const blockContainer = document.getElementById('block-container');
const activeEquation = document.getElementById('active-equation');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const submitBtn = document.getElementById('submit');
const levelLabel = document.getElementById('level-label');
const levelOverlay = document.getElementById('level-overlay');
const resultOverlay = document.getElementById('result-overlay');
const resultTitle = document.getElementById('result-title');
const resultScore = document.getElementById('result-score');

// ============================================================
// LEVEL SELECTION & GAME FLOW
// ============================================================

function selectLevel(mode) {
    gameState.currentMode = mode;
    levelOverlay.classList.add('hidden');
    levelLabel.textContent = mode === 'easy' ? 'Easy' : mode === 'normal' ? 'Normal' : 'Hard';
    startNewGame();
}

function showLevelSelect() {
    clearInterval(gameState.timer);
    gameState.isProcessing = false;
    resultOverlay.classList.add('hidden');
    levelOverlay.classList.remove('hidden');
}

function replayLevel() {
    resultOverlay.classList.add('hidden');
    startNewGame();
}

function showResult(passed) {
    clearInterval(gameState.timer);
    gameState.isProcessing = true;
    resultTitle.textContent = passed ? 'Level Complete!' : 'Time Up!';
    resultTitle.className = passed ? 'pass' : 'fail';
    resultScore.textContent = 'Score: ' + gameState.score;
    resultOverlay.classList.remove('hidden');
}

// ============================================================
// GAME INIT & RENDER
// ============================================================

function startNewGame() {
    clearEquationForce();
    blockContainer.innerHTML = '';
    gameState.activeSelection = [];
    gameState.score = 0;
    gameState.timeLeft = 60;
    gameState.isProcessing = false;
    gameState.blockUid = 0;
    updateUI();

    fetch(`/api/get_level_data?mode=${gameState.currentMode}`)
        .then(response => response.json())
        .then(data => {
            gameState.levelData = data;
            renderBlocks();
            updateUI();
            startTimer();
        })
        .catch(error => console.error('Error fetching level data:', error));
}

function renderBlocks() {
    blockContainer.innerHTML = '';
    gameState.levelData.blocks.forEach(block => {
        const uid = gameState.blockUid++;
        const blockDiv = document.createElement('div');
        blockDiv.className = 'block';
        blockDiv.innerHTML = `\\( ${block.text} \\)`;
        blockDiv.dataset.uid = uid;
        blockDiv.dataset.blockType = block.type;
        blockDiv.dataset.latex = block.text;
        blockDiv.dataset.expectedParts = block.expected_parts;

        if (block.pair_ids) {
            blockDiv.dataset.pairIds = block.pair_ids.join(',');
        }
        if (block.can_be_function) {
            blockDiv.dataset.canBeFunction = 'true';
        }

        if (gameState.currentMode === 'hard') {
            blockDiv.addEventListener('click', handleNormalBlockClick);
            blockDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleNormalRightClick(blockDiv);
            });
        } else {
            blockDiv.addEventListener('click', handleEasyBlockClick);
        }

        blockContainer.appendChild(blockDiv);
    });

    renderMathJax();
}

// ============================================================
// EASY/NORMAL MODE (one-to-one matching)
// ============================================================

function handleEasyBlockClick(event) {
    if (gameState.isProcessing) return;
    if (gameState.activeSelection.length >= 2) return;

    const el = event.currentTarget;
    if (el.classList.contains('is-selected')) return;

    el.classList.add('is-selected');
    el.style.pointerEvents = 'none';

    const blockType = el.dataset.blockType;
    if (blockType === 'function') {
        el.classList.add('selected-function');
    } else if (blockType === 'derivative') {
        el.classList.add('selected-derivative');
    }

    gameState.activeSelection.push({
        element: el,
        pairIds: el.dataset.pairIds.split(',').map(Number),
        latex: el.dataset.latex,
        blockType: blockType
    });

    updateEquationBar();

    if (gameState.activeSelection.length === 2) {
        gameState.isProcessing = true;
        validateEasyMatch();
    }
}

function validateEasyMatch() {
    const first = gameState.activeSelection[0];
    const second = gameState.activeSelection[1];
    const commonPairId = first.pairIds.find(id => second.pairIds.includes(id));

    if (commonPairId !== undefined) {
        first.element.classList.add('match-success');
        second.element.classList.add('match-success');

        gameState.score += gameState.currentMode === 'easy' ? 100 : 200;
        updateUI();

        setTimeout(() => {
            first.element.classList.add('matched');
            second.element.classList.add('matched');
            gameState.activeSelection = [];
            gameState.isProcessing = false;
            updateEquationBar();

            if (blockContainer.querySelectorAll('.block:not(.matched)').length === 0) {
                setTimeout(() => showResult(true), 300);
            }
        }, 350);
    } else {
        first.element.classList.add('error');
        second.element.classList.add('error');

        gameState.timeLeft = Math.max(0, gameState.timeLeft - 5);
        updateUI();

        setTimeout(() => {
            [first, second].forEach(sel => {
                sel.element.classList.remove('is-selected', 'selected-function', 'selected-derivative', 'error');
                sel.element.style.pointerEvents = 'auto';
            });
            gameState.activeSelection = [];
            gameState.isProcessing = false;
            updateEquationBar();
        }, 450);
    }
}

// ============================================================
// HARD MODE (multi-block chain rule matching)
// ============================================================

function handleNormalBlockClick(event) {
    if (gameState.isProcessing) return;

    const el = event.currentTarget;
    if (el.classList.contains('is-selected')) return;

    const blockType = el.dataset.blockType;
    const elPairIds = el.dataset.pairIds.split(',').map(Number);
    const canBeFunction = el.dataset.canBeFunction === 'true';

    if (gameState.activeSelection.length === 0) {
        if (blockType !== 'function' && !canBeFunction) return;
    } else {
        const firstPairId = gameState.activeSelection[0].pairId;
        if (!elPairIds.includes(firstPairId)) return;
        // Hard mode: no duplicate derivative block texts
        if (gameState.currentMode === 'hard' && blockType === 'derivative') {
            const alreadySelected = gameState.activeSelection.some(sel =>
                sel.blockType === 'derivative' && sel.latex === el.dataset.latex
            );
            if (alreadySelected) return;
        }
        if (gameState.currentMode !== 'hard' && blockType !== 'derivative') return;
    }

    el.classList.add('is-selected');
    el.style.pointerEvents = 'none';

    if (blockType === 'function') {
        el.classList.add('selected-function');
    } else if (blockType === 'derivative') {
        el.classList.add('selected-derivative');
    }

    gameState.activeSelection.push({
        element: el,
        pairId: gameState.activeSelection.length === 0 ? elPairIds[0] : gameState.activeSelection[0].pairId,
        latex: el.dataset.latex,
        blockType: blockType,
        expected_parts: el.dataset.expectedParts
    });

    updateEquationBar();

    const expectedParts = parseInt(gameState.activeSelection[0].expected_parts);
    if (gameState.activeSelection.length === expectedParts) {
        gameState.isProcessing = true;
        validateHardMatch();
    }
}

function handleNormalRightClick(el) {
    if (gameState.isProcessing) return;
    if (gameState.activeSelection.length === 0) return;

    const lastSelection = gameState.activeSelection[gameState.activeSelection.length - 1];
    if (lastSelection.element === el) {
        el.classList.remove('is-selected', 'selected-function', 'selected-derivative');
        el.style.pointerEvents = 'auto';
        gameState.activeSelection.pop();
        updateEquationBar();
    }
}

function validateHardMatch() {
    gameState.activeSelection.forEach(sel => {
        if (sel.element) sel.element.classList.add('match-success');
    });

    gameState.score += 200;
    updateUI();

    setTimeout(() => {
        gameState.activeSelection.forEach(sel => {
            if (sel.element) sel.element.classList.add('matched');
        });
        gameState.activeSelection = [];
        gameState.isProcessing = false;
        updateEquationBar();

        if (blockContainer.querySelectorAll('.block:not(.matched)').length === 0) {
            setTimeout(() => showResult(true), 300);
        }
    }, 350);
}

// ============================================================
// EQUATION BAR
// ============================================================

function updateEquationBar() {
    activeEquation.innerHTML = '';
    const hasFunction = gameState.activeSelection.some(sel => sel.blockType === 'function');

    if (hasFunction && gameState.currentMode === 'hard') {
        const funcSel = gameState.activeSelection.find(sel => sel.blockType === 'function');
        const funcSpan = document.createElement('span');
        funcSpan.innerHTML = `\\( \\left( ${funcSel.latex} \\right)' = \\)`;
        funcSpan.className = 'equation-item function';
        activeEquation.appendChild(funcSpan);

        const factors = gameState.activeSelection.filter(sel => sel.blockType === 'derivative');
        factors.forEach((sel, idx) => {
            if (idx > 0) {
                const dot = document.createElement('span');
                dot.innerHTML = `\\( \\cdot \\)`;
                dot.className = 'equation-item operator';
                activeEquation.appendChild(dot);
            }
            const span = document.createElement('span');
            span.innerHTML = `\\( ${sel.latex} \\)`;
            span.className = 'equation-item derivative';
            activeEquation.appendChild(span);
        });
    } else {
        gameState.activeSelection.forEach(sel => {
            const span = document.createElement('span');
            span.innerHTML = `\\( ${sel.latex} \\)`;
            span.className = `equation-item ${sel.blockType}`;
            activeEquation.appendChild(span);
        });
    }
    renderMathJax();
}

// ============================================================
// CLEAR
// ============================================================

function clearEquation() {
    if (gameState.isProcessing) return;
    clearEquationForce();
}

function clearEquationForce() {
    gameState.activeSelection.forEach(sel => {
        if (sel.element) {
            sel.element.classList.remove('is-selected', 'selected-function', 'selected-derivative', 'error', 'match-success');
            sel.element.style.pointerEvents = 'auto';
        }
    });
    gameState.activeSelection = [];
    activeEquation.innerHTML = '';
    submitBtn.style.display = 'none';
    renderMathJax();
}

// ============================================================
// MATHJAX
// ============================================================

function renderMathJax() {
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().catch(err => console.error('MathJax rendering failed:', err));
    }
}

// ============================================================
// TIMER & UI
// ============================================================

function startTimer() {
    if (gameState.timer) clearInterval(gameState.timer);
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateUI();
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            showResult(false);
        }
    }, 1000);
}

function updateUI() {
    timerElement.textContent = gameState.timeLeft;
    scoreElement.textContent = gameState.score;
}