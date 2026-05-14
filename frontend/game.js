// Game State
let gameState = {
    currentGame: null,
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
const levelLabel = document.getElementById('level-label');
const gameOverlay = document.getElementById('game-overlay');
const levelOverlay = document.getElementById('level-overlay');
const resultOverlay = document.getElementById('result-overlay');
const resultTitle = document.getElementById('result-title');
const resultScore = document.getElementById('result-score');
const levelGameTitle = document.getElementById('level-game-title');
const easyDesc = document.getElementById('easy-desc');
const normalDesc = document.getElementById('normal-desc');
const hardDesc = document.getElementById('hard-desc');
const equationTitle = document.getElementById('equation-title');

const LEVEL_DESCS = {
    deriva: { easy: 'Basic Derivatives', normal: 'Product & Quotient Rules', hard: 'Chain Rule' },
    integra: { easy: 'Basic Antiderivatives', normal: 'u-Substitution', hard: 'Integration by Parts' }
};


// ============================================================
// GAME & LEVEL SELECTION
// ============================================================

function selectGame(game) {
    gameState.currentGame = game;
    document.body.className = 'game-' + game;
    levelGameTitle.textContent = game === 'deriva' ? 'DerivaMatch' : 'IntegraMatch';
    easyDesc.textContent = LEVEL_DESCS[game].easy;
    normalDesc.textContent = LEVEL_DESCS[game].normal;
    hardDesc.textContent = LEVEL_DESCS[game].hard;
    gameOverlay.classList.add('hidden');
    levelOverlay.classList.remove('hidden');
}

function backToGameSelect() {
    levelOverlay.classList.add('hidden');
    gameOverlay.classList.remove('hidden');
}

function selectLevel(mode) {
    gameState.currentMode = mode;
    levelOverlay.classList.add('hidden');
    const g = gameState.currentGame === 'deriva' ? 'Deriva' : 'Integra';
    levelLabel.textContent = g + ' - ' + (mode === 'easy' ? 'Easy' : mode === 'normal' ? 'Normal' : 'Hard');
    equationTitle.textContent = gameState.currentGame === 'deriva' ? 'Active Equation:' : 'Active Integration:';
    startNewGame();
}

function showGameSelect() {
    clearInterval(gameState.timer);
    gameState.isProcessing = false;
    resultOverlay.classList.add('hidden');
    levelOverlay.classList.add('hidden');
    gameOverlay.classList.remove('hidden');
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
    blockContainer.innerHTML = '<div class="loading-msg">Loading…</div>';
    gameState.activeSelection = [];
    gameState.score = 0;
    gameState.timeLeft = 60;
    gameState.isProcessing = true;
    gameState.blockUid = 0;
    updateUI();

    fetch('/api/get_level_data?game=' + gameState.currentGame + '&mode=' + gameState.currentMode)
        .then(function(response) { return response.json(); })
        .then(function(data) {
            gameState.levelData = data;
            gameState.isProcessing = false;
            renderBlocks();
            updateUI();
            startTimer();
        })
        .catch(function(error) {
            console.error('Error fetching level data:', error);
            gameState.isProcessing = false;
            blockContainer.innerHTML = '<div class="loading-msg">Failed to load level — please try again.</div>';
        });
}

function renderBlocks() {
    blockContainer.innerHTML = '';
    gameState.levelData.blocks.forEach(function(block) {
        var uid = gameState.blockUid++;
        var blockDiv = document.createElement('div');
        blockDiv.className = 'block';
        blockDiv.innerHTML = '\\( ' + block.text + ' \\)';
        blockDiv.dataset.uid = uid;
        blockDiv.dataset.blockType = block.type;
        blockDiv.dataset.latex = block.text;
        blockDiv.dataset.expectedParts = block.expected_parts;

        if (block.function_id && block.function_id.length > 0) blockDiv.dataset.functionId = block.function_id.join(',');
        if (block.factor_id && block.factor_id.length > 0) blockDiv.dataset.factorId = block.factor_id.join(',');
        if (block.func_id && block.func_id.length > 0) blockDiv.dataset.funcId = block.func_id.join(',');
        if (block.int_id && block.int_id.length > 0) blockDiv.dataset.intId = block.int_id.join(',');
        if (block.preusub_id && block.preusub_id.length > 0) blockDiv.dataset.preusubId = block.preusub_id.join(',');
        if (block.usub_id && block.usub_id.length > 0) blockDiv.dataset.usubId = block.usub_id.join(',');
        if (block.postusub_id && block.postusub_id.length > 0) blockDiv.dataset.postusubId = block.postusub_id.join(',');
        if (block.uvp_id && block.uvp_id.length > 0) blockDiv.dataset.uvpId = block.uvp_id.join(',');
        if (block.uv_id && block.uv_id.length > 0) blockDiv.dataset.uvId = block.uv_id.join(',');
        if (block.vup_id && block.vup_id.length > 0) blockDiv.dataset.vupId = block.vup_id.join(',');

        var clickHandler;
        if (gameState.currentGame === 'deriva') {
            clickHandler = gameState.currentMode === 'hard' ? handleDerivaHardClick : handleDerivaEasyClick;
        } else {
            clickHandler = gameState.currentMode === 'easy' ? handleIntegraEasyClick : handleIntegraMultiClick;
        }

        blockDiv.addEventListener('click', clickHandler);
        blockDiv.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            handleRightClick(blockDiv);
        });

        blockContainer.appendChild(blockDiv);
    });

    renderMathJax();
}


// ============================================================
// SHARED HELPERS
// ============================================================

function handleRightClick(el) {
    if (gameState.isProcessing) return;
    if (gameState.activeSelection.length === 0) return;
    var idx = gameState.activeSelection.findIndex(function(sel) { return sel.element === el; });
    if (idx !== -1) {
        gameState.activeSelection.splice(idx, 1);
        el.classList.remove('is-selected', 'selected-function', 'selected-derivative', 'selected-antiderivative');
        el.style.pointerEvents = 'auto';
        updateEquationBar();
    }
}

function handleMismatch(sels, clearClasses) {
    sels.forEach(function(sel) { if (sel.element) sel.element.classList.add('error'); });
    gameState.timeLeft = Math.max(0, gameState.timeLeft - 5);
    updateUI();
    setTimeout(function() {
        sels.forEach(function(sel) {
            if (sel.element) {
                sel.element.classList.remove.apply(sel.element.classList, ['is-selected'].concat(clearClasses).concat(['error']));
                sel.element.style.pointerEvents = 'auto';
            }
        });
        gameState.activeSelection = [];
        gameState.isProcessing = false;
        updateEquationBar();
    }, 450);
}

function checkWin() {
    if (blockContainer.querySelectorAll('.block:not(.matched)').length === 0) {
        setTimeout(function() { showResult(true); }, 300);
    }
}

function parseIds(el, field) {
    return (el.dataset[field] || '').split(',').map(function(s) { return parseInt(s); }).filter(function(n) { return !isNaN(n); });
}


// ============================================================
// DERIVAMATCH - EASY/NORMAL (function_id <-> factor_id)
// ============================================================

function handleDerivaEasyClick(event) {
    if (gameState.isProcessing) return;
    if (gameState.activeSelection.length >= 2) return;
    var el = event.currentTarget;
    if (el.classList.contains('is-selected')) { handleRightClick(el); return; }

    el.classList.add('is-selected');

    var bt = el.dataset.blockType;
    if (bt === 'function') el.classList.add('selected-function');
    else if (bt === 'derivative') el.classList.add('selected-derivative');

    gameState.activeSelection.push({
        element: el,
        functionId: parseIds(el, 'functionId'),
        factorId: parseIds(el, 'factorId'),
        latex: el.dataset.latex,
        blockType: bt
    });

    updateEquationBar();
    if (gameState.activeSelection.length === 2) { gameState.isProcessing = true; validateDerivaEasy(); }
}

function validateDerivaEasy() {
    var a = gameState.activeSelection[0], b = gameState.activeSelection[1];
    var cid = a.functionId.find(function(id) { return b.factorId.includes(id); });
    if (cid === undefined) cid = b.functionId.find(function(id) { return a.factorId.includes(id); });

    if (cid !== undefined) {
        a.element.classList.add('match-success'); b.element.classList.add('match-success');
        gameState.score += gameState.currentMode === 'easy' ? 100 : 200;
        updateUI();
        setTimeout(function() {
            a.element.classList.add('matched'); b.element.classList.add('matched');
            document.querySelectorAll('.block:not(.matched)').forEach(function(bl) {
                var fid = parseIds(bl, 'functionId');
                var frid = parseIds(bl, 'factorId');
                fid = fid.filter(function(id) { return id !== cid; });
                frid = frid.filter(function(id) { return id !== cid; });
                bl.dataset.functionId = fid.join(',');
                bl.dataset.factorId = frid.join(',');
                if (fid.length === 0 && frid.length === 0) bl.classList.add('matched');
            });
            gameState.activeSelection = []; gameState.isProcessing = false; updateEquationBar(); checkWin();
        }, 350);
    } else {
        handleMismatch([a, b], ['selected-function', 'selected-derivative']);
    }
}


// ============================================================
// DERIVAMATCH - HARD (chain rule multi-block)
// ============================================================

function handleDerivaHardClick(event) {
    if (gameState.isProcessing) return;
    var el = event.currentTarget;
    if (el.classList.contains('is-selected')) { handleRightClick(el); return; }

    var eFid = parseIds(el, 'functionId');
    var eFrid = parseIds(el, 'factorId');

    if (gameState.activeSelection.length === 0) { if (eFid.length === 0) return; }
    else { if (!eFrid.includes(gameState.activeSelection[0].functionId)) return; }

    el.classList.add('is-selected');
    var bt = el.dataset.blockType;
    if (bt === 'function') el.classList.add('selected-function');
    else if (bt === 'derivative') el.classList.add('selected-derivative');

    gameState.activeSelection.push({
        element: el,
        functionId: gameState.activeSelection.length === 0 ? eFid[0] : gameState.activeSelection[0].functionId,
        latex: el.dataset.latex, blockType: bt, expected_parts: el.dataset.expectedParts
    });
    updateEquationBar();

    if (gameState.activeSelection.length === parseInt(gameState.activeSelection[0].expected_parts)) {
        gameState.isProcessing = true; validateDerivaHard();
    }
}

function validateDerivaHard() {
    var fid = gameState.activeSelection[0].functionId;
    if (!gameState.activeSelection.every(function(sel) { return sel.functionId === fid; })) {
        handleMismatch(gameState.activeSelection, ['selected-function', 'selected-derivative']); return;
    }
    gameState.activeSelection.forEach(function(sel) { if (sel.element) sel.element.classList.add('match-success'); });
    gameState.score += 200; updateUI();
    setTimeout(function() {
        var mp = gameState.activeSelection[0].functionId;
        gameState.activeSelection.forEach(function(sel) { if (sel.element) sel.element.classList.add('matched'); });
        document.querySelectorAll('.block:not(.matched)').forEach(function(bl) {
            var fi = parseIds(bl, 'functionId');
            var fr = parseIds(bl, 'factorId');
            fi = fi.filter(function(id) { return id !== mp; });
            fr = fr.filter(function(id) { return id !== mp; });
            bl.dataset.functionId = fi.join(',');
            bl.dataset.factorId = fr.join(',');
            if (fi.length === 0 && fr.length === 0) bl.classList.add('matched');
        });
        gameState.activeSelection = []; gameState.isProcessing = false; updateEquationBar(); checkWin();
    }, 350);
}


// ============================================================
// INTEGRAMATCH - EASY (func_id <-> int_id)
// ============================================================

function handleIntegraEasyClick(event) {
    if (gameState.isProcessing) return;
    if (gameState.activeSelection.length >= 2) return;
    var el = event.currentTarget;
    if (el.classList.contains('is-selected')) { handleRightClick(el); return; }

    el.classList.add('is-selected');
    var bt = el.dataset.blockType;
    if (bt === 'function') el.classList.add('selected-function');
    else if (bt === 'antiderivative') el.classList.add('selected-antiderivative');

    gameState.activeSelection.push({
        element: el,
        funcId: parseIds(el, 'funcId'),
        intId: parseIds(el, 'intId'),
        latex: el.dataset.latex, blockType: bt
    });
    updateEquationBar();
    if (gameState.activeSelection.length === 2) { gameState.isProcessing = true; validateIntegraEasy(); }
}

function validateIntegraEasy() {
    var a = gameState.activeSelection[0], b = gameState.activeSelection[1];
    var cid = a.funcId.find(function(id) { return b.intId.includes(id); });
    if (cid === undefined) cid = b.funcId.find(function(id) { return a.intId.includes(id); });

    if (cid !== undefined) {
        a.element.classList.add('match-success'); b.element.classList.add('match-success');
        gameState.score += 100; updateUI();
        setTimeout(function() {
            a.element.classList.add('matched'); b.element.classList.add('matched');
            document.querySelectorAll('.block:not(.matched)').forEach(function(bl) {
                var fi = parseIds(bl, 'funcId');
                var ii = parseIds(bl, 'intId');
                fi = fi.filter(function(id) { return id !== cid; });
                ii = ii.filter(function(id) { return id !== cid; });
                bl.dataset.funcId = fi.join(',');
                bl.dataset.intId = ii.join(',');
                if (fi.length === 0 && ii.length === 0) bl.classList.add('matched');
            });
            gameState.activeSelection = []; gameState.isProcessing = false; updateEquationBar(); checkWin();
        }, 350);
    } else {
        handleMismatch([a, b], ['selected-function', 'selected-antiderivative']);
    }
}


// ============================================================
// INTEGRAMATCH - NORMAL/HARD (multi-block matching)
// ============================================================

function handleIntegraMultiClick(event) {
    if (gameState.isProcessing) return;
    var el = event.currentTarget;
    if (el.classList.contains('is-selected')) { handleRightClick(el); return; }

    var ids = {
        preusubId: parseIds(el, 'preusubId'),
        usubId: parseIds(el, 'usubId'),
        postusubId: parseIds(el, 'postusubId'),
        uvpId: parseIds(el, 'uvpId'),
        uvId: parseIds(el, 'uvId'),
        vupId: parseIds(el, 'vupId')
    };

    if (gameState.activeSelection.length === 0) {
        if (gameState.currentMode === 'normal' && ids.preusubId.length === 0) return;
        if (gameState.currentMode === 'hard' && ids.uvpId.length === 0) return;
    } else if (gameState.currentMode === 'normal') {
        var fids = gameState.activeSelection[0].ids;
        var hasCommon = ids.preusubId.concat(ids.usubId).concat(ids.postusubId).some(function(id) {
            return fids.preusubId.concat(fids.usubId).concat(fids.postusubId).includes(id);
        });
        if (!hasCommon) return;
        var pid = gameState.activeSelection[0].pairId;
        if (gameState.activeSelection.length === 1) {
            if (ids.usubId.length === 0) return;
            if (!ids.usubId.includes(pid)) return;
        } else if (gameState.activeSelection.length === 2) {
            if (ids.postusubId.length === 0) return;
            if (!ids.postusubId.includes(pid)) return;
        }
    } else {
        fids = gameState.activeSelection[0].ids;
        hasCommon = ids.uvpId.concat(ids.uvId).concat(ids.vupId).some(function(id) {
            return fids.uvpId.concat(fids.uvId).concat(fids.vupId).includes(id);
        });
        if (!hasCommon) return;
        pid = gameState.activeSelection[0].pairId;
        if (ids.uvpId.includes(pid) && gameState.activeSelection.some(function(s) { return s.ids.uvpId.includes(pid); })) return;
        if (ids.uvId.includes(pid) && gameState.activeSelection.some(function(s) { return s.ids.uvId.includes(pid); })) return;
        if (ids.vupId.includes(pid) && gameState.activeSelection.some(function(s) { return s.ids.vupId.includes(pid); })) return;
    }

    el.classList.add('is-selected');
    var bt = el.dataset.blockType;
    if (bt === 'function') el.classList.add('selected-function');
    else if (bt === 'antiderivative') el.classList.add('selected-antiderivative');

    var pairId;
    if (gameState.activeSelection.length === 0) {
        pairId = gameState.currentMode === 'normal' ? ids.preusubId[0] : ids.uvpId[0];
    } else {
        pairId = gameState.activeSelection[0].pairId;
    }

    gameState.activeSelection.push({
        element: el,
        pairId: pairId,
        ids: ids,
        latex: el.dataset.latex,
        blockType: bt,
        expected_parts: el.dataset.expectedParts
    });

    updateEquationBar();

    var expectedParts = parseInt(gameState.activeSelection[0].expected_parts);
    if (gameState.activeSelection.length === expectedParts) {
        gameState.isProcessing = true;
        validateIntegraMulti();
    }
}

function validateIntegraMulti() {
    var pairId = gameState.activeSelection[0].pairId;
    var allMatch = gameState.activeSelection.every(function(sel) {
        return sel.ids.preusubId.concat(sel.ids.usubId).concat(sel.ids.postusubId)
            .concat(sel.ids.uvpId).concat(sel.ids.uvId).concat(sel.ids.vupId)
            .includes(pairId);
    });

    if (!allMatch) {
        gameState.activeSelection.forEach(function(sel) { if (sel.element) sel.element.classList.add('error'); });
        gameState.timeLeft = Math.max(0, gameState.timeLeft - 5);
        updateUI();
        setTimeout(function() {
            gameState.activeSelection.forEach(function(sel) {
                if (sel.element) {
                    sel.element.classList.remove('is-selected', 'selected-function', 'selected-antiderivative', 'error');
                    sel.element.style.pointerEvents = 'auto';
                }
            });
            gameState.activeSelection = [];
            gameState.isProcessing = false;
            updateEquationBar();
        }, 450);
        return;
    }

    gameState.activeSelection.forEach(function(sel) { if (sel.element) sel.element.classList.add('match-success'); });
    gameState.score += 200;
    updateUI();

    setTimeout(function() {
        var matchedPairId = gameState.activeSelection[0].pairId;
        gameState.activeSelection.forEach(function(sel) { if (sel.element) sel.element.classList.add('matched'); });

        document.querySelectorAll('.block:not(.matched)').forEach(function(bl) {
            var preusubId = parseIds(bl, 'preusubId');
            var usubId = parseIds(bl, 'usubId');
            var postusubId = parseIds(bl, 'postusubId');
            var uvpId = parseIds(bl, 'uvpId');
            var uvId = parseIds(bl, 'uvId');
            var vupId = parseIds(bl, 'vupId');

            preusubId = preusubId.filter(function(id) { return id !== matchedPairId; });
            usubId = usubId.filter(function(id) { return id !== matchedPairId; });
            postusubId = postusubId.filter(function(id) { return id !== matchedPairId; });
            uvpId = uvpId.filter(function(id) { return id !== matchedPairId; });
            uvId = uvId.filter(function(id) { return id !== matchedPairId; });
            vupId = vupId.filter(function(id) { return id !== matchedPairId; });

            bl.dataset.preusubId = preusubId.join(',');
            bl.dataset.usubId = usubId.join(',');
            bl.dataset.postusubId = postusubId.join(',');
            bl.dataset.uvpId = uvpId.join(',');
            bl.dataset.uvId = uvId.join(',');
            bl.dataset.vupId = vupId.join(',');

            if (preusubId.length === 0 && usubId.length === 0 && postusubId.length === 0 &&
                uvpId.length === 0 && uvId.length === 0 && vupId.length === 0) {
                bl.classList.add('matched');
            }
        });

        gameState.activeSelection = [];
        gameState.isProcessing = false;
        updateEquationBar();
        checkWin();
    }, 350);
}


// ============================================================
// EQUATION BAR
// ============================================================

function updateEquationBar() {
    activeEquation.innerHTML = '';

    if (gameState.activeSelection.length === 0) {
        renderMathJax();
        return;
    }

    if (gameState.currentGame === 'deriva') {
        var funcSel = null;
        for (var si = 0; si < gameState.activeSelection.length; si++) {
            var s = gameState.activeSelection[si];
            if (s.functionId !== undefined && (typeof s.functionId === 'number' || s.functionId.length > 0)) {
                funcSel = s;
                break;
            }
        }
        if (funcSel) {
            var funcSpan = document.createElement('span');
            funcSpan.innerHTML = '\\( \\left( ' + funcSel.latex + " \\right)' = \\)";
            funcSpan.className = 'equation-item function';
            activeEquation.appendChild(funcSpan);

            gameState.activeSelection.filter(function(sel) { return sel !== funcSel; }).forEach(function(sel, idx) {
                if (idx > 0) {
                    var dot = document.createElement('span');
                    dot.innerHTML = '\\( \\cdot \\)';
                    dot.className = 'equation-item operator';
                    activeEquation.appendChild(dot);
                }
                var span = document.createElement('span');
                span.innerHTML = '\\( ' + sel.latex + ' \\)';
                span.className = 'equation-item derivative';
                activeEquation.appendChild(span);
            });
        } else {
            gameState.activeSelection.forEach(function(sel) {
                var span = document.createElement('span');
                span.innerHTML = '\\( ' + sel.latex + ' \\)';
                span.className = 'equation-item ' + sel.blockType;
                activeEquation.appendChild(span);
            });
        }
    } else if (gameState.currentGame === 'integra') {
        if (gameState.currentMode === 'easy') {
            gameState.activeSelection.forEach(function(sel) {
                var span = document.createElement('span');
                span.innerHTML = '\\( ' + sel.latex + ' \\)';
                span.className = 'equation-item ' + sel.blockType;
                activeEquation.appendChild(span);
            });
        } else if (gameState.currentMode === 'normal') {
            var funcSel = null;
            for (var si = 0; si < gameState.activeSelection.length; si++) {
                if (gameState.activeSelection[si].ids.preusubId.length > 0) {
                    funcSel = gameState.activeSelection[si];
                    break;
                }
            }
            if (funcSel) {
                var funcSpan = document.createElement('span');
                funcSpan.innerHTML = '\\( ' + funcSel.latex + ' \\)';
                funcSpan.className = 'equation-item function';
                activeEquation.appendChild(funcSpan);

                var others = gameState.activeSelection.filter(function(sel) { return sel !== funcSel; });
                if (others.length > 0) {
                    var eq = document.createElement('span');
                    eq.innerHTML = '\\( = \\)';
                    eq.className = 'equation-item operator';
                    activeEquation.appendChild(eq);
                }
                others.forEach(function(sel, idx) {
                    if (idx > 0) {
                        var sep = document.createElement('span');
                        sep.innerHTML = '\\( = \\)';
                        sep.className = 'equation-item operator';
                        activeEquation.appendChild(sep);
                    }
                    var span = document.createElement('span');
                    span.innerHTML = '\\( ' + sel.latex + ' \\)';
                    span.className = 'equation-item antiderivative';
                    activeEquation.appendChild(span);
                });
            }
        } else if (gameState.currentMode === 'hard') {
            var funcSel = null, uvSel = null, vupSel = null;
            for (var si = 0; si < gameState.activeSelection.length; si++) {
                var s = gameState.activeSelection[si];
                if (s.ids.uvpId.length > 0) funcSel = s;
                if (s.ids.uvId.length > 0) uvSel = s;
                if (s.ids.vupId.length > 0) vupSel = s;
            }

            if (funcSel) {
                var funcSpan = document.createElement('span');
                funcSpan.innerHTML = '\\( ' + funcSel.latex + ' \\)';
                funcSpan.className = 'equation-item function';
                activeEquation.appendChild(funcSpan);

                var eq = document.createElement('span');
                eq.innerHTML = '\\( = \\)';
                eq.className = 'equation-item operator';
                activeEquation.appendChild(eq);
            }

            if (uvSel) {
                var uvSpan = document.createElement('span');
                uvSpan.innerHTML = '\\( ' + uvSel.latex + ' \\)';
                uvSpan.className = 'equation-item antiderivative';
                activeEquation.appendChild(uvSpan);
            }

            if (vupSel) {
                var minus = document.createElement('span');
                minus.innerHTML = '\\( - \\)';
                minus.className = 'equation-item operator';
                activeEquation.appendChild(minus);

                var vupSpan = document.createElement('span');
                vupSpan.innerHTML = '\\( ' + vupSel.latex + ' \\)';
                vupSpan.className = 'equation-item antiderivative';
                activeEquation.appendChild(vupSpan);
            }
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
    gameState.activeSelection.forEach(function(sel) {
        if (sel.element) {
            sel.element.classList.remove('is-selected', 'selected-function', 'selected-derivative', 'selected-antiderivative', 'error', 'match-success');
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
    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.body, {
            delimiters: [{left: '\\(', right: '\\)', display: false}],
            throwOnError: false
        });
    }
}

// ============================================================
// TIMER & UI
// ============================================================

function startTimer() {
    if (gameState.timer) clearInterval(gameState.timer);
    gameState.timer = setInterval(function() {
        gameState.timeLeft = Math.max(0, gameState.timeLeft - 1);
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
