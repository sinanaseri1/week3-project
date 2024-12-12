import { locations } from "./data.js";
import { MAIN_LOCATIONS } from "./constants.js";

const storyText = document.getElementById("story-text");
const interactBtn = document.getElementById("interact-btn");
const availableLocationsList = document.getElementById(
  "available-locations-list"
);
const progressText = document.getElementById("progress-text");
const moralityText = document.getElementById("morality-text");
const challengeSection = document.getElementById("challenge-section");
const challengeText = document.getElementById("challenge-text");
const choicesContainer = document.getElementById("choices");
const locationInputSection = document.getElementById("location-input-section");
const locationInput = document.getElementById("location-input");
const locationError = document.getElementById("location-error");
const submitLocationBtn = document.getElementById("submit-location-btn");

export function displayCurrentLocationInfo(
  location,
  player,
  challengesCompleted
) {
  const loc = locations[location];
  storyText.textContent = `You are at ${loc.name}. ${loc.description}`;

  if (challengesCompleted[location]) {
    interactBtn.classList.add("hidden");
  } else {
    interactBtn.classList.remove("hidden");
  }

  challengeSection.classList.add("hidden");
  updateAvailableLocations(loc);
  showLocationInputIfNeeded(loc);
}

export function updateAvailableLocations(loc) {
  const connections = loc.connections;
  if (connections.length === 0) {
    availableLocationsList.textContent =
      "No further locations available from here.";
  } else {
    const names = connections.map((c) => locations[c].name).join(", ");
    availableLocationsList.textContent = names;
  }
}

export function updateProgress(challengesCompleted) {
  const completedCount = MAIN_LOCATIONS.filter(
    (loc) => challengesCompleted[loc]
  ).length;
  progressText.textContent = `Clues Found: ${completedCount}/${MAIN_LOCATIONS.length}`;
}

export function updateMorality(moralityScore) {
  moralityText.textContent = `Morality: ${moralityScore}`;
}

export function showChallenge(location, handleChoiceFn) {
  const loc = locations[location];
  if (!loc.challenge) return;

  challengeText.textContent = loc.challenge.text;
  choicesContainer.innerHTML = "";

  loc.challenge.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.className =
      "bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2 choice-btn";
    btn.addEventListener("click", () => handleChoiceFn(choice.outcome));
    choicesContainer.appendChild(btn);
  });

  challengeSection.classList.remove("hidden");
}

export function showLocationInputIfNeeded(loc, handleMoveFn) {
  const connections = loc.connections;
  if (connections.length === 0) {
    locationInputSection.classList.add("hidden");
    return;
  }

  locationInputSection.classList.remove("hidden");
  locationError.classList.add("hidden");
  locationInput.value = "";
  locationInput.classList.remove("border-red-500", "border-green-500");

  submitLocationBtn.onclick = () => {
    const userInput = locationInput.value.trim().toLowerCase();
    const validLocation = connections.find(
      (conn) => locations[conn].name.toLowerCase() === userInput
    );

    if (validLocation) {
      locationError.classList.add("hidden");
      locationInput.classList.remove("border-red-500");
      locationInput.classList.add("border-green-500");
      handleMoveFn(validLocation);
      setTimeout(() => {
        locationInput.classList.remove("border-green-500");
      }, 1000);
    } else {
      locationError.classList.remove("hidden");
      locationInput.classList.remove("border-green-500");
      locationInput.classList.add("border-red-500");
      setTimeout(() => {
        locationInput.classList.remove("border-red-500");
      }, 1000);
    }
  };
}

export function hideChallengeSection() {
  challengeSection.classList.add("hidden");
}

export function setStoryText(text) {
  storyText.textContent = text;
}

export function createCelebrationDiv(epilogue) {
  const celebrationDiv = document.createElement("div");
  celebrationDiv.style.position = "fixed";
  celebrationDiv.style.top = "50%";
  celebrationDiv.style.left = "50%";
  celebrationDiv.style.transform = "translate(-50%, -50%)";
  celebrationDiv.style.padding = "20px";
  celebrationDiv.style.backgroundColor = "rgba(0,0,0,0.8)";
  celebrationDiv.style.color = "white";
  celebrationDiv.style.fontSize = "24px";
  celebrationDiv.style.borderRadius = "10px";
  celebrationDiv.style.textAlign = "center";
  celebrationDiv.innerHTML = `
    <p>おめでとうございます！</p>
    <p>${epilogue}</p>
  `;
  document.body.appendChild(celebrationDiv);
  return celebrationDiv;
}
