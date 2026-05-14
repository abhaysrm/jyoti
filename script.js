const CONFIG = {
  herName: "Jyoti",
  yourName: "Abhay",
  firstLine: "One last honest try, with hope in my heart.",
};

const byId = (id) => document.getElementById(id);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let selectedAnswer = null;

function applyPersonalDetails() {
  const params = new URLSearchParams(window.location.search);
  const herName = params.get("her") || CONFIG.herName;
  const yourName = params.get("me") || CONFIG.yourName;
  const line = params.get("line") || CONFIG.firstLine;

  document.querySelectorAll("[data-her-name]").forEach((node) => {
    node.textContent = herName;
  });

  document.querySelectorAll("[data-your-name]").forEach((node) => {
    node.textContent = yourName;
  });

  const heroTitle = byId("hero-title");
  if (heroTitle) heroTitle.textContent = line;
}

function setupLoveLetter() {
  const envelope = byId("openLetterBtn");
  const letter = byId("letter");
  const tapHint = byId("tapHint");
  if (!envelope || !letter) return;

  const openLetter = () => {
    envelope.classList.add("is-open");
    envelope.setAttribute("aria-expanded", "true");
    if (tapHint) tapHint.textContent = "Letter opened";
    window.setTimeout(() => {
      letter.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 520);
  };

  envelope.addEventListener("click", openLetter);
  document.querySelectorAll("[data-open-letter]").forEach((button) => {
    button.addEventListener("click", openLetter);
  });
}

function setupInteractiveLetter() {
  const card = byId("letterCard");
  const flipBtn = byId("flipLetterBtn");
  const paper = byId("interactiveLetter");
  const revealBtn = byId("revealLetterBtn");
  if (!paper || !revealBtn) return;

  const parts = [...paper.querySelectorAll(".letter-part")];
  const dots = [...paper.querySelectorAll(".letter-progress span")];
  let index = 0;

  const showPart = (nextIndex) => {
    index = Math.min(nextIndex, parts.length - 1);
    parts.forEach((part, partIndex) => {
      part.classList.toggle("is-visible", partIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });

    const isLast = index === parts.length - 1;
    revealBtn.textContent = isLast ? "Read the question" : "Reveal next feeling";
    paper.classList.toggle("is-complete", isLast);
  };

  revealBtn.addEventListener("click", () => {
    if (index < parts.length - 1) {
      showPart(index + 1);
      return;
    }

    const question = byId("question");
    if (question) question.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  if (card && flipBtn) {
    flipBtn.addEventListener("click", () => {
      card.classList.add("is-flipped");
      card.setAttribute("aria-expanded", "true");
      window.setTimeout(() => revealBtn.focus(), 560);
    });
  }

  showPart(0);
}

function setupMemoryCards() {
  document.querySelectorAll(".flip-memory").forEach((card) => {
    card.addEventListener("click", () => {
      const isFlipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(isFlipped));
    });
  });
}

function setupModal() {
  const modal = byId("answerModal");
  const yesBtn = byId("yesBtn");
  const maybeBtn = byId("maybeBtn");
  const closeBtn = byId("closeModal");
  const modalTitle = byId("modalTitle");
  const modalText = byId("modalText");
  const selectedAnswerText = byId("selectedAnswerText");

  const showSelectedAnswer = (type) => {
    selectedAnswer = type;
    if (!selectedAnswerText) return;
    selectedAnswerText.textContent =
      type === "yes"
        ? "Selected answer: Give us a chance"
        : "Selected answer: I need a little time";
  };

  const savedAnswer = localStorage.getItem("proposalAnswer");
  if (savedAnswer) showSelectedAnswer(savedAnswer);

  const openModal = (type) => {
    showSelectedAnswer(type);
    localStorage.setItem("proposalAnswer", type);
    if (type === "yes") {
      modalTitle.textContent = "You just made my heart smile.";
      modalText.textContent =
        "Thank you for giving us a chance. I promise to value this answer with respect, care, and honest effort.";
      burstConfetti();
    } else {
      modalTitle.textContent = "I respect your heart.";
      modalText.textContent =
        "Take the time you need. A real answer should come with peace, not pressure.";
    }

    modal.setAttribute("aria-hidden", "false");
    closeBtn.focus();
  };

//   const closeModal = () => {
//     modal.setAttribute("aria-hidden", "true");
//   };

//   yesBtn.addEventListener("click", () => openModal("yes"));
//   maybeBtn.addEventListener("click", () => openModal("maybe"));
//   closeBtn.addEventListener("click", closeModal);
//   modal.addEventListener("click", (event) => {
//     if (event.target === modal) closeModal();
//   });
//   window.addEventListener("keydown", (event) => {
//     if (event.key === "Escape") closeModal();
//   });
// }

const closeModal = () => {
  modal.setAttribute("aria-hidden", "true");
};

// ===== FORM SUBMIT FUNCTION =====
async function sendAnswer(answer) {
  try {
    await fetch("https://formspree.io/f/xgodbqke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answer: answer,
        time: new Date().toLocaleString(),
        page: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });

    console.log("Answer sent successfully");
  } catch (error) {
    console.error("Error sending answer:", error);
  }
}

// ===== YES BUTTON =====
yesBtn.addEventListener("click", async () => {
  await sendAnswer("She said YES ❤️");
  openModal("yes");
});

// ===== MAYBE BUTTON =====
maybeBtn.addEventListener("click", async () => {
  await sendAnswer("She needs some time 💭");
  openModal("maybe");
});

// ===== EXISTING MODAL EVENTS =====
closeBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});
}

function setupTone() {
  const audioContextClass = window.AudioContext || window.webkitAudioContext;
  const musicToggle = byId("musicToggle");
  let context;
  let muted = true;
  let timer;

  document.body.classList.add("muted");

  const playNote = (frequency, start, duration) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.045, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  };

  const playLoop = () => {
    if (muted || !context) return;
    const now = context.currentTime;
    [392, 493.88, 587.33, 783.99].forEach((note, index) => {
      playNote(note, now + index * 0.32, 0.42);
    });
    timer = window.setTimeout(playLoop, 1900);
  };

  musicToggle.addEventListener("click", async () => {
    if (!audioContextClass) return;
    context ||= new audioContextClass();
    if (context.state === "suspended") await context.resume();

    muted = !muted;
    document.body.classList.toggle("muted", muted);
    window.clearTimeout(timer);
    if (!muted) playLoop();
  });
}

function setupStars() {
  const canvas = byId("stars");
  const context = canvas.getContext("2d");
  let width;
  let height;
  let stars;

  const reset = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = Math.floor(window.innerWidth * ratio);
    height = canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    stars = Array.from({ length: Math.min(150, Math.floor(window.innerWidth / 7)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.3,
      speed: Math.random() * 0.25 + 0.05,
      alpha: Math.random() * 0.72 + 0.25,
    }));
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    stars.forEach((star) => {
      star.y += star.speed;
      if (star.y > height + 6) {
        star.y = -6;
        star.x = Math.random() * width;
      }

      context.beginPath();
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 248, 237, ${star.alpha})`;
      context.fill();
    });

    if (!prefersReducedMotion) window.requestAnimationFrame(draw);
  };

  reset();
  draw();
  window.addEventListener("resize", reset);
}

function setupFlyingHearts() {
  const field = byId("heartField");
  if (!field || prefersReducedMotion) return;

  const colors = ["#ef7f8f", "#ffb3bd", "#f3c76b", "#f45d82", "#fff0f2"];
  const total = Math.min(34, Math.max(18, Math.floor(window.innerWidth / 42)));

  field.replaceChildren(
    ...Array.from({ length: total }, (_, index) => {
      const heart = document.createElement("span");
      heart.className = "flying-heart";
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.setProperty("--heart-size", `${Math.random() * 18 + 12}px`);
      heart.style.setProperty("--heart-speed", `${Math.random() * 8 + 9}s`);
      heart.style.setProperty("--heart-drift", `${Math.random() * 120 - 60}px`);
      heart.style.setProperty("--heart-opacity", `${Math.random() * 0.42 + 0.22}`);
      heart.style.setProperty("--heart-color", colors[index % colors.length]);
      heart.style.animationDelay = `${Math.random() * -14}s`;
      return heart;
    })
  );
}

function setupPointerGlow() {
  if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

  window.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--spotlight-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--spotlight-y", `${event.clientY}px`);
  });
}

function setupScrollReveal() {
  const revealItems = document.querySelectorAll(
    ".hero-copy, .orbit-scene, .letter-section, .memory-card, .promise-visual, .promise-copy, .question-card"
  );

  if (!revealItems.length || prefersReducedMotion || !("IntersectionObserver" in window)) return;

  document.body.classList.add("effects-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index * 70, 360)}ms`);
    observer.observe(item);
  });
}


function burstConfetti() {
  if (prefersReducedMotion) return;

  const colors = ["#f3c76b", "#ef7f8f", "#6bd3d2", "#58b79d", "#fff8ed"];
  const pieces = Array.from({ length: 80 }, () => {
    const node = document.createElement("span");
    node.className = "confetti";
    node.style.left = `${Math.random() * 100}vw`;
    node.style.background = colors[Math.floor(Math.random() * colors.length)];
    node.style.transform = `rotate(${Math.random() * 360}deg)`;
    node.style.animationDuration = `${Math.random() * 1.4 + 2.2}s`;
    document.body.appendChild(node);
    return node;
  });

  window.setTimeout(() => {
    pieces.forEach((piece) => piece.remove());
  }, 4200);
}

applyPersonalDetails();
setupLoveLetter();
setupInteractiveLetter();
setupMemoryCards();
setupModal();
setupTone();
setupStars();
setupFlyingHearts();
setupPointerGlow();
setupScrollReveal();

