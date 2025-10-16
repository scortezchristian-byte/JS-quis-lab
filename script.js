// Step 1: Prepare Quiz Data (Arrays & Objects)
const quizData = [
  {
    question: "What does 'let' declare in JavaScript?",
    options: ["A constant value", "A changeable variable", "A function", "An array"],
    answer: 1
  },
  {
    question: "Which is the strict equality operator?",
    options: ["==", "=", "===", "!="],
    answer: 2
  },
  {
    question: "What is the purpose of a for loop?",
    options: ["To declare variables", "To repeat code a set number of times", "To handle events", "To style elements"],
    answer: 1
  },
  {
    question: "How do you select an element by ID in the DOM?",
    options: ["querySelector", "getElementById", "createElement", "appendChild"],
    answer: 1
  },
  {
    question: "What is a closure in JavaScript?",
    options: [
      "A function inside another function with access to its scope",
      "A variable outside any function",
      "A built-in JavaScript object",
      "A way to close the browser tab"
    ],
    answer: 0
  },
  {
    question: "Which keyword is used for asynchronous code?",
    options: ["async", "await", "defer", "promise"],
    answer: 0
  }
];

// Shuffle questions for variety
function shuffleQuestions() {
  quizData.sort(() => Math.random() - 0.5);
}

// Step 2: Load and Display Questions (DOM Manipulation)
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 30;
let highScore = localStorage.getItem("jsQuizHighScore") || 0;

// DOM elements
let questionEl, optionsEl, nextBtn, currentQ, totalQ, progressFill, timerContainer, timerText, timerFill, scoreContainer, scoreCircleText, totalScore, feedback, highScoreEl, highScoreVal;
let startScreen, startBtn;

// Cache DOM elements
function cacheElements() {
  questionEl = document.getElementById("question");
  optionsEl = document.getElementById("options");
  nextBtn = document.getElementById("next-btn");
  currentQ = document.getElementById("current-q");
  totalQ = document.getElementById("total-q");
  progressFill = document.getElementById("progress-fill");
  timerContainer = document.getElementById("timer-container");
  timerText = document.getElementById("timer-text");
  timerFill = document.getElementById("timer-fill");
  scoreContainer = document.getElementById("score-container");
  scoreCircleText = document.getElementById("score-circle-text");
  totalScore = document.getElementById("total-score");
  feedback = document.getElementById("feedback");
  highScoreEl = document.getElementById("high-score");
  highScoreVal = document.getElementById("high-score-val");
  startScreen = document.getElementById("start-screen");
  startBtn = document.getElementById("start-btn");

  // Create missing progress/score elements if not present
  if (!currentQ && document.getElementById("progress-text")) {
    currentQ = document.createElement("span");
    currentQ.id = "current-q";
    document.getElementById("progress-text").appendChild(document.createTextNode("Question "));
    document.getElementById("progress-text").appendChild(currentQ);
    document.getElementById("progress-text").appendChild(document.createTextNode(" of "));
    totalQ = document.createElement("span");
    totalQ.id = "total-q";
    document.getElementById("progress-text").appendChild(totalQ);
  }
  if (!progressFill && document.getElementById("progress-bar")) {
    progressFill = document.createElement("div");
    progressFill.id = "progress-fill";
    document.getElementById("progress-bar").appendChild(progressFill);
  }
  if (!timerText && timerContainer) {
    timerText = document.createElement("span");
    timerText.id = "timer-text";
    timerContainer.appendChild(timerText);
  }
  if (!timerFill && timerContainer) {
    timerFill = document.createElement("div");
    timerFill.id = "timer-fill";
    timerContainer.appendChild(timerFill);
  }
  if (!scoreCircleText && scoreContainer) {
    scoreCircleText = document.createElement("span");
    scoreCircleText.id = "score-circle-text";
    let circle = scoreContainer.querySelector(".score-circle");
    if (circle) circle.appendChild(scoreCircleText);
  }
  if (!totalScore && scoreContainer) {
    totalScore = document.createElement("span");
    totalScore.id = "total-score";
    let circle = scoreContainer.querySelector(".score-circle");
    if (circle) {
      let p = document.createElement("p");
      p.style.fontSize = "1.2rem";
      p.style.fontWeight = "400";
      p.style.margin = "0";
      p.innerHTML = "/ <span id='total-score'></span>";
      circle.appendChild(p);
      totalScore = p.querySelector("#total-score");
    }
  }
  if (!highScoreVal && highScoreEl) {
    highScoreVal = document.createElement("span");
    highScoreVal.id = "high-score-val";
    highScoreEl.appendChild(highScoreVal);
  }
}

function updateProgress() {
  // Show progress bar and progress text
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  if (progressBar) progressBar.style.display = "block";
  if (progressText) progressText.style.display = "block";

  // Update progress numbers
  if (currentQ && totalQ) {
    currentQ.textContent = currentQuestion + 1;
    totalQ.textContent = quizData.length;
  }

  // Update progress fill
  if (progressFill) {
    // Avoid division by zero
    let percent = quizData.length > 0 ? ((currentQuestion) / quizData.length) * 100 : 0;
    progressFill.style.width = percent + "%";
  }
}

function startTimer() {
  timeLeft = 30;
  if (timerText) timerText.textContent = timeLeft;
  if (timerFill) timerFill.style.width = "100%";
  if (timerContainer) timerContainer.style.display = "block";
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    if (timerText) timerText.textContent = timeLeft;
    if (timerFill) timerFill.style.width = (timeLeft / 30) * 100 + "%";
    if (timeLeft <= 0) {
      clearInterval(timer);
      disableOptions();
      if (nextBtn) nextBtn.style.display = "block";
    }
  }, 1000);
}

function clearTimer() {
  clearInterval(timer);
  if (timerContainer) timerContainer.style.display = "none";
}

function loadQuestion() {
  updateProgress();
  startTimer();
  const q = quizData[currentQuestion];
  if (questionEl) questionEl.textContent = q.question;
  if (optionsEl) optionsEl.innerHTML = "";
  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.setAttribute("aria-label", `Option ${idx + 1}: ${opt}`);
    btn.onclick = function () { ensureAudioCtx(); SOUNDS.click(); selectOption(idx, btn); };
    btn.onkeyup = function (e) { if (e.key === "Enter") btn.click(); };
    if (optionsEl) optionsEl.appendChild(btn);
  });
  if (nextBtn) nextBtn.style.display = "none";
  if (optionsEl && optionsEl.children.length > 0) optionsEl.children[0].focus();
}

function selectOption(index, btn) {
  clearTimer();
  disableOptions();
  btn.classList.add("selected", "flip");
  const q = quizData[currentQuestion];
  if (index === q.answer) {
    btn.classList.add("correct");
    SOUNDS.correct();
    score++;
  } else {
    btn.classList.add("incorrect");
    SOUNDS.incorrect();
    if (optionsEl && optionsEl.children[q.answer]) {
      optionsEl.children[q.answer].classList.add("correct");
    }
  }
  if (nextBtn) nextBtn.style.display = "block";
}

function disableOptions() {
  if (optionsEl) {
    Array.from(optionsEl.children).forEach(btn => btn.disabled = true);
  }
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    loadQuestion();
    if (optionsEl) {
      Array.from(optionsEl.children).forEach(btn => btn.className = "option-btn");
    }
  } else {
    showScore();
  }
}

function showScore() {
  clearTimer();
  if (scoreContainer) scoreContainer.style.display = "block";
  const questionContainer = document.getElementById("question-container");
  if (questionContainer) questionContainer.style.display = "none";
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  if (progressBar) progressBar.style.display = "none";
  if (progressText) progressText.style.display = "none";
  if (scoreCircleText) scoreCircleText.textContent = score;
  if (totalScore) totalScore.textContent = quizData.length;
  let percent = Math.round((score / quizData.length) * 100);
  if (feedback) {
    feedback.textContent =
      percent === 100
        ? "Perfect! You mastered this quiz! 🎉"
        : percent >= 75
        ? "Great job! Review weak spots in the notes."
        : "Keep practicing! Review your mistakes.";
  }
  const scoreCircle = scoreContainer ? scoreContainer.querySelector(".score-circle") : null;
  if (scoreCircle) scoreCircle.style.animation = "pop 0.7s";
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("jsQuizHighScore", highScore);
    if (highScoreEl) highScoreEl.style.display = "block";
    if (highScoreVal) highScoreVal.textContent = highScore;
  } else if (highScore > 0) {
    if (highScoreEl) highScoreEl.style.display = "block";
    if (highScoreVal) highScoreVal.textContent = highScore;
  }
  if (percent === 100) confetti();
  // Ensure Play Again button exists and works
  let playAgainBtn = scoreContainer ? scoreContainer.querySelector("button") : null;
  if (!playAgainBtn) {
    playAgainBtn = document.createElement("button");
    playAgainBtn.textContent = "Play Again";
    playAgainBtn.onclick = function () { ensureAudioCtx(); SOUNDS.click(); restartQuiz(); };
    if (scoreContainer) scoreContainer.appendChild(playAgainBtn);
  } else {
    playAgainBtn.onclick = function () { ensureAudioCtx(); SOUNDS.click(); restartQuiz(); };
  }
}

function restartQuiz() {
  shuffleQuestions();
  currentQuestion = 0;
  score = 0;
  // Hide score container
  if (scoreContainer) scoreContainer.style.display = "none";
  // Show question container
  const questionContainer = document.getElementById("question-container");
  if (questionContainer) questionContainer.style.display = "block";
  // Show progress bar and text
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  if (progressBar) progressBar.style.display = "block";
  if (progressText) progressText.style.display = "block";
  // Reset progress fill
  if (progressFill) progressFill.style.width = "0%";
  // Hide high score display
  if (highScoreEl) highScoreEl.style.display = "none";
  // Load first question
  loadQuestion();
}

function confetti() {
  for (let i = 0; i < 30; i++) {
    const c = document.createElement("div");
    c.style.position = "fixed";
    c.style.left = Math.random() * 100 + "vw";
    c.style.top = "-20px";
    c.style.width = "8px";
    c.style.height = "8px";
    c.style.background = `hsl(${Math.random()*360},70%,60%)`;
    c.style.borderRadius = "50%";
    c.style.zIndex = 9999;
    c.style.transition = "top 1.2s";
    document.body.appendChild(c);
    setTimeout(() => { c.style.top = "100vh"; }, 10);
    setTimeout(() => { c.remove(); }, 1300);
  }
}

function setupKeyboardNav() {
  if (optionsEl) {
    optionsEl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        let btns = Array.from(optionsEl.children);
        let idx = btns.findIndex(b => b === document.activeElement);
        if (e.key === "ArrowDown") idx = (idx + 1) % btns.length;
        if (e.key === "ArrowUp") idx = (idx - 1 + btns.length) % btns.length;
        btns[idx].focus();
      }
    });
  }
}

// --- ADDED: Audio (WebAudio) helpers ---
let audioCtx;
function ensureAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}
function playTone(freq, duration = 0.12, type = 'sine', gain = 0.12) {
  ensureAudioCtx();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  o.start(now);
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  setTimeout(() => {
    try { o.stop(); } catch (e) { /* ignore */ }
  }, duration * 1000 + 50);
}
const SOUNDS = {
  click: () => playTone(880, 0.06, 'sine', 0.08),
  correct: () => { playTone(1200, 0.12, 'sine', 0.14); playTone(1600, 0.06, 'sine', 0.06); },
  incorrect: () => playTone(240, 0.14, 'sawtooth', 0.14),
  start: () => playTone(660, 0.12, 'sine', 0.12),
  end: () => playTone(520, 0.14, 'sine', 0.12)
};

// Initial load
document.addEventListener("DOMContentLoaded", function () {
  cacheElements();
  if (totalQ) totalQ.textContent = quizData.length;
  shuffleQuestions();
  // Show start screen, hide question and score containers
  if (startScreen) startScreen.style.display = "block";
  const questionContainer = document.getElementById("question-container");
  if (questionContainer) questionContainer.style.display = "none";
  if (scoreContainer) scoreContainer.style.display = "none";
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  if (progressBar) progressBar.style.display = "none";
  if (progressText) progressText.style.display = "none";
  setupKeyboardNav();
  if (nextBtn) nextBtn.onclick = function () { ensureAudioCtx(); SOUNDS.click(); nextQuestion(); };
  if (startBtn) {
    startBtn.onclick = function () {
      ensureAudioCtx();
      SOUNDS.start();
       shuffleQuestions();
       currentQuestion = 0;
       score = 0;
       if (startScreen) startScreen.style.display = "none";
       const questionContainer = document.getElementById("question-container");
       if (questionContainer) questionContainer.style.display = "block";
       const progressBar = document.getElementById("progress-bar");
       const progressText = document.getElementById("progress-text");
       if (progressBar) progressBar.style.display = "block";
       if (progressText) progressText.style.display = "block";
       loadQuestion();
     };
   }
});