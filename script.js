const CONFIG = {
  herName: "Jyoti",
  yourName: "Abhay",
  jyotiEmail: "jyotikumariexpert@gmail.com",
  notificationEndpoint: "/api/notify-visit",
};

const byId = (id) => document.getElementById(id);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function applyPersonalDetails() {
  const params = new URLSearchParams(window.location.search);
  const herName = params.get("her") || CONFIG.herName;
  const yourName = params.get("me") || CONFIG.yourName;

  document.querySelectorAll("[data-her-name]").forEach((node) => {
    node.textContent = herName;
  });

  document.querySelectorAll("[data-your-name]").forEach((node) => {
    node.textContent = yourName;
  });
}

async function sendFormEvent(payload) {
  try {
    await fetch(CONFIG.notificationEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        page: window.location.href,
        time: new Date().toLocaleString(),
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error("Notification failed:", error);
  }
}

function notifyIfJyotiVisited() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email") || params.get("visitorEmail") || "";
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== CONFIG.jyotiEmail) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `jyotiVisitNotified:${todayKey}`;
  if (sessionStorage.getItem(storageKey)) return;
  sessionStorage.setItem(storageKey, "true");

  sendFormEvent({
    event: "jyoti_page_visit",
    visitorEmail: normalizedEmail,
    message: "Jyoti opened Abhay's page.",
  });
}

function setupSky() {
  const canvas = byId("sky");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let lights = [];

  const reset = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = Math.floor(window.innerWidth * ratio);
    height = canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    lights = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 12)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.5,
      speed: Math.random() * 0.22 + 0.04,
      alpha: Math.random() * 0.44 + 0.18,
    }));
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    lights.forEach((light) => {
      light.y += light.speed;
      if (light.y > height + 8) {
        light.y = -8;
        light.x = Math.random() * width;
      }

      context.beginPath();
      context.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 250, 240, ${light.alpha})`;
      context.fill();
    });

    if (!prefersReducedMotion) window.requestAnimationFrame(draw);
  };

  reset();
  draw();
  window.addEventListener("resize", reset);
}

function setupReveal() {
  const items = document.querySelectorAll(
    ".hero-copy, .feeling-scene, .letter-card, .value-deck, .promise-mark, .promise-copy"
  );

  if (!items.length || prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  items.forEach((item) => item.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 55, 280)}ms`;
    observer.observe(item);
  });
}

function setupValueDeck() {
  const deck = byId("valueDeck");
  if (!deck) return;

  const cards = [...deck.querySelectorAll(".value-card")];
  if (cards.length < 2) return;

  let activeIndex = 0;

  const render = () => {
    cards.forEach((card, index) => {
      const offset = (index - activeIndex + cards.length) % cards.length;
      card.classList.toggle("is-active", offset === 0);
      card.classList.toggle("is-next", offset === 1);
      card.classList.toggle("is-last", offset === 2);
    });
  };

  render();

  if (!prefersReducedMotion) {
    window.setInterval(() => {
      activeIndex = (activeIndex + 1) % cards.length;
      render();
    }, 10000);
  }
}

function setupFloatingHearts() {
  const field = byId("heartField");
  if (!field || prefersReducedMotion) return;

  const colors = ["#ff5f7e", "#ff9db0", "#ffd166", "#fff8fb", "#e6133e"];
  const total = Math.min(42, Math.max(22, Math.floor(window.innerWidth / 34)));

  field.replaceChildren(
    ...Array.from({ length: total }, (_, index) => {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      const drift = Math.random() * 150 - 75;
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.setProperty("--size", `${Math.random() * 22 + 14}px`);
      heart.style.setProperty("--speed", `${Math.random() * 9 + 10}s`);
      heart.style.setProperty("--drift", `${drift}px`);
      heart.style.setProperty("--drift-end", `${drift * -0.45}px`);
      heart.style.setProperty("--opacity", `${Math.random() * 0.36 + 0.2}`);
      heart.style.setProperty("--color", colors[index % colors.length]);
      heart.style.animationDelay = `${Math.random() * -16}s`;
      return heart;
    })
  );
}

function setupSound() {
  const button = byId("soundToggle");
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!button || !AudioContextClass) return;

  let audioContext;
  let isPlaying = false;
  let loopTimer;
  let activeNodes = [];

  document.body.classList.add("is-muted");

  const stopActiveNodes = () => {
    activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch (error) {
        // Already stopped.
      }
    });
    activeNodes = [];
  };

  const playTone = (frequency, start, duration, volume = 0.035, type = "sine") => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
    activeNodes.push(oscillator);
  };

  const playMelody = () => {
    if (!isPlaying || !audioContext) return;

    const now = audioContext.currentTime;
    const melody = [392, 440, 493.88, 659.25, 587.33, 493.88, 440, 392];
    const bass = [196, 246.94, 220, 261.63];

    bass.forEach((note, index) => {
      playTone(note, now + index * 1.6, 1.55, 0.018, "sine");
      playTone(note * 1.5, now + index * 1.6, 1.4, 0.008, "triangle");
    });

    melody.forEach((note, index) => {
      playTone(note, now + index * 0.4, 0.62, 0.032, "triangle");
    });

    loopTimer = window.setTimeout(playMelody, 6400);
  };

  const startMusic = () => {
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();

    isPlaying = true;
    document.body.classList.toggle("is-playing", isPlaying);
    document.body.classList.toggle("is-muted", !isPlaying);
    window.clearTimeout(loopTimer);
    playMelody();
  };

  const stopMusic = () => {
    isPlaying = false;
    window.clearTimeout(loopTimer);
    stopActiveNodes();
    document.body.classList.remove("is-playing");
    document.body.classList.add("is-muted");
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    if (isPlaying) {
      stopMusic();
      return;
    }

    startMusic();
  });
}

applyPersonalDetails();
notifyIfJyotiVisited();
setupSky();
setupReveal();
setupValueDeck();
setupFloatingHearts();
setupSound();
