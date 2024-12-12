import { locations } from "./data.js";
import { MAIN_LOCATIONS } from "./constants.js";
import {
  displayCurrentLocationInfo,
  updateMorality,
  showChallenge,
  showLocationInputIfNeeded,
  setStoryText,
} from "./ui.js";
import {
  handleChoice,
  handleFinalChoice,
  markChallengeCompleted,
  handleMove,
} from "./gameLogic.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const interactBtn = document.getElementById("interact-btn");
const resetBtn = document.getElementById("reset-btn");
const locationInputSection = document.getElementById("location-input-section");
const bgMusic = document.getElementById("bg-music");

let player = {
  x: 100,
  y: 100,
  width: 64,
  height: 64,
  location: "shrine",
  visitedLocations: [],
  status: "neutral",
};

let challengesCompleted = {
  castle: false,
  village: false,
  harbor: false,
  forest: false,
  shrine: false,
  battlefield: false,
  finalboss: false,
};

let moralityScore = 0;
updateMorality(moralityScore);

const playerSprite = new Image();

const mapImage = new Image();
mapImage.src = "map.png";

mapImage.onload = () => {
  showCharacterSelection();
  draw();
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
  if (playerSprite.src) {
    ctx.drawImage(
      playerSprite,
      player.x,
      player.y,
      player.width,
      player.height
    );
  }
}

function showCharacterSelection() {
  interactBtn.classList.add("hidden");
  setStoryText("You are the heir of a murdered king. Choose your path:");
  document.getElementById("actions").innerHTML = `
    <button id="samurai-select" class="bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2">Samurai</button>
    <button id="ninja-select" class="bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2">Ninja</button>
    <button class="action-btn bg-red-600 hover:bg-red-700 p-2 rounded-lg" id="reset-btn">Reset</button>
  `;

  document.getElementById("samurai-select").addEventListener("click", () => {
    playerSprite.src = "samurai.png";
    playerSprite.onload = () => {
      startGame();
    };
  });

  document.getElementById("ninja-select").addEventListener("click", () => {
    playerSprite.src = "ninja.png";
    playerSprite.onload = () => {
      startGame();
    };
  });

  document.getElementById("reset-btn").addEventListener("click", resetGame);
}

function startGame() {
  bgMusic.play().catch(() => {});
  interactBtn.classList.remove("hidden");
  displayCurrentLocationInfo(player.location, player, challengesCompleted);
  draw();
}

interactBtn.addEventListener("click", () => {
  showChallenge(player.location, (outcome) => {
    moralityScore = handleChoice(
      outcome,
      player,
      challengesCompleted,
      moralityScore,
      interactBtn,
      locationInputSection,
      showFinalChoice,
      (loc) => markChallengeCompleted(loc, challengesCompleted, interactBtn)
    );
  });
});

resetBtn.addEventListener("click", resetGame);

function resetGame() {
  player = {
    x: 100,
    y: 100,
    width: 64,
    height: 64,
    location: "shrine",
    visitedLocations: [],
    status: "neutral",
  };

  challengesCompleted = {
    castle: false,
    village: false,
    harbor: false,
    forest: false,
    shrine: false,
    battlefield: false,
    finalboss: false,
  };

  moralityScore = 0;
  updateMorality(moralityScore);

  // Remove finalboss if added
  const fbIndex = locations.battlefield.connections.indexOf("finalboss");
  if (fbIndex !== -1) {
    locations.battlefield.connections.splice(fbIndex, 1);
  }

  // Remove celebration div if any
  const cDiv = document.querySelector('div[style*="position: fixed"]');
  if (cDiv) cDiv.remove();

  playerSprite.src = "";
  bgMusic.src = "ambient.mp3";
  bgMusic.currentTime = 0;
  showCharacterSelection();
  draw();
}

export function showFinalChoice(moralityScore) {
  // Showing final moral choice
  const challengeSection = document.getElementById("challenge-section");
  const challengeText = document.getElementById("challenge-text");
  const choicesContainer = document.getElementById("choices");

  challengeSection.classList.remove("hidden");
  challengeText.textContent = "Your final decision:";
  choicesContainer.innerHTML = "";

  const finalChoices = [
    { text: "Kill the Assassin", outcome: "kill" },
    { text: "Spare His Life", outcome: "spare" },
    { text: "Imprison Him", outcome: "imprison" },
  ];

  finalChoices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.className =
      "bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2 choice-btn";
    btn.addEventListener("click", () => {
      challengeSection.classList.add("hidden");
      const celebrationDiv = handleFinalChoice(choice.outcome, moralityScore);
    });
    choicesContainer.appendChild(btn);
  });
}

export function onMove(newLocation) {
  handleMove(
    newLocation,
    player,
    bgMusic,
    draw,
    displayCurrentLocationInfo,
    challengesCompleted
  );
}
