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
const levelOverlay = document.getElementById('level-overlay');
const resultScore = document.getElementById('result-score');
const resultOverlay = document.getElementById('result-overlay');
const resultTitle = document.getElementById('result-title');
const levelLabel = document.getElementById('level-label');

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

        if (block.function_id && block.function_id.length > 0) {
            blockDiv.dataset.functionId = block.function_id.join(',');
        }
        if (block.factor_id && block.factor_id.length > 0) {
            blockDiv.dataset.factorId = block.factor_id.join(',');
        }

        if (gameState.currentMode === 'hard') {
            blockDiv.addEventListener('click', handleHardBlockClick);
            blockDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleNormalRightClick(blockDiv);
            });
        } else {
            blockDiv.addEventListener('click', handleEasyBlockClick);
            blockDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleNormalRightClick(blockDiv);
            });
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

    const elFunctionId = (el.dataset.functionId || '').split(',').map(s => parseInt(s)).filter(n => !isNaN(n));
    const elFactorId = (el.dataset.factorId || '').split(',').map(s => parseInt(s)).filter(n => !isNaN(n));

    gameState.activeSelection.push({
        element: el,
        functionId: elFunctionId,
        factorId: elFactorId,
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
    const commonPairId = first.functionId.find(id => second.factorId.includes(id))
        ?? second.functionId.find(id => first.factorId.includes(id));

    if (commonPairId !== undefined) {
        first.element.classList.add('match-success');
        second.element.classList.add('match-success');

        gameState.score += gameState.currentMode === 'easy' ? 100 : 200;
        updateUI();

        setTimeout(() => {
            first.element.classList.add('matched');
            second.element.classList.add('matched');

            document.querySelectorAll('.block:not(.matched)').forEach(block => {
                let fid = (block.dataset.functionId || '').split(',').map(s => parseInt(s)).filter(n => !isNaN(n));
                let frid = (block.dataset.factorId || '').split(',').map(s => parseInt(s)).filter(n => !isNaN(n));
                fid = fid.filter(id => id !== commonPairId);
                frid = frid.filter(id => id !== commonPairId);
                block.dataset.functionId = fid.join(',');
                block.dataset.factorId = frid.join(',');
                if (fid.length === 0 && frid.length === 0) {
                    block.classList.add('matched');
                }
            });

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

function handleHardBlockClick(event) {
    if (gameState.isProcessing) return;

    const el = event.currentTarget;
    if (el.classList.contains('is-selected')) return;

    const blockType = el.dataset.blockType;
    const elFunctionId = (el.dataset.functionId || '').split(',').map(s => parseInt(s)).filter(n => !isNaN(n));
    const elFactorId = (el.dataset.factorId || '').split(',').map(s => parseInt(s)).filter(n => !isNaN(n));

    if (gameState.activeSelection.length === 0) {
        if (elFunctionId.length === 0) return;
    } else {
        const firstFunctionId = gameState.activeSelection[0].functionId;
        if (!elFactorId.includes(firstFunctionId)) return;
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
        functionId: gameState.activeSelection.length === 0 ? elFunctionId[0] : gameState.activeSelection[0].functionId,
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

    const idx = gameState.activeSelection.findIndex(sel => sel.element === el);
    if (idx !== -1) {
        gameState.activeSelection.splice(idx, 1);
        el.classList.remove('is-selected', 'selected-function', 'selected-derivative');
        el.style.pointerEvents = 'auto';
        updateEquationBar();
    }
}

function validateHardMatch() {
    const functionId = gameState.activeSelection[0].functionId;
    const allMatch = gameState.activeSelection.every(sel => sel.functionId === functionId);
    if (!allMatch) {
        // Defensive guard: should never trigger with pre-filters, but catch bugs
        gameState.activeSelection.forEach(sel => {
            if (sel.element) sel.element.classList.add('error');
        });
        gameState.timeLeft = Math.max(0, gameState.timeLeft - 5);
        updateUI();
        setTimeout(() => {
            gameState.activeSelection.forEach(sel => {
                sel.element.classList.remove('is-selected', 'selected-function', 'selected-derivative', 'error');
                sel.element.style.pointerEvents = 'auto';
            });
            gameState.activeSelection = [];
            gameState.isProcessing = false;
            updateEquationBar();
        }, 450);
        return;
    }

    gameState.activeSelection.forEach(sel => {
        if (sel.element) sel.element.classList.add('match-success');
    });

    gameState.score += 200;
    updateUI();

    setTimeout(() => {
        const matchedPairId = gameState.activeSelection[0].functionId;

        gameState.activeSelection.forEach(sel => {
            if (sel.element) sel.element.classList.add('matched');
        });

        document.querySelectorAll('.block:not(.matched)').forEach(block => {
            let fid = (block.dataset.functionId || '').split(',').map(s => parseInt(s)).filter(n => !isNaN(n));
            let frid = (block.dataset.factorId || '').split(',').map(s => parseInt(s)).filter(n => !isNaN(n));
            fid = fid.filter(id => id !== matchedPairId);
            frid = frid.filter(id => id !== matchedPairId);
            block.dataset.functionId = fid.join(',');
            block.dataset.factorId = frid.join(',');
            if (fid.length === 0 && frid.length === 0) {
                block.classList.add('matched');
            }
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

    if (gameState.activeSelection.length > 0) {
        const funcSel = gameState.activeSelection.find(sel =>
            sel.functionId !== undefined &&
            (typeof sel.functionId === 'number' || sel.functionId.length > 0)
        );
        if (funcSel) {
            const funcSpan = document.createElement('span');
            funcSpan.innerHTML = `\\( \\left( ${funcSel.latex} \\right)' = \\)`;
            funcSpan.className = 'equation-item function';
            activeEquation.appendChild(funcSpan);

            gameState.activeSelection.filter(sel => sel !== funcSel).forEach((sel, idx) => {
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
    renderMathJax();
}

// ============================================================
// MATHJAX
// ============================================================

function renderMathJax() {
    if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().catch(err => console.error('MathJax rendering failed:', err));
    } else {
        console.warn('MathJax not loaded — LaTeX may display as raw text');
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