import { locations } from "./data.js";
import { MAIN_LOCATIONS } from "./constants.js";
import {
  updateProgress,
  updateMorality,
  setStoryText,
  hideChallengeSection,
  createCelebrationDiv,
} from "./ui.js";

export function handleChoice(
  outcome,
  player,
  challengesCompleted,
  moralityScore,
  interactBtn,
  locationInputSection,
  showFinalChoiceFn,
  markChallengeCompletedFn
) {
  const location = player.location;

  if (location !== "finalboss") {
    if (outcome === "win") {
      moralityScore += 2;
      setStoryText("You gain a vital clue, and feel a sense of honor.");
      markChallengeCompletedFn(location);
    } else if (outcome === "progress") {
      moralityScore += 1;
      setStoryText("You glean partial insight, uncertainty lingers.");
      markChallengeCompletedFn(location);
    } else {
      moralityScore -= 1;
      setStoryText("You fail to secure the clue, your heart grows heavier.");
    }
    updateMorality(moralityScore);
    hideChallengeSection();
    checkIfAllCluesFound(challengesCompleted, location, player, setStoryText);
    return moralityScore;
  } else {
    // Final boss scenario
    if (outcome === "win" || outcome === "progress") {
      if (moralityScore > 5) {
        setStoryText(
          "Your compassion shines even now, disarming the assassin with honor. Now choose his fate."
        );
      } else if (moralityScore < 0) {
        setStoryText(
          "Though you disarm him, darkness taints this victory. Choose his fate."
        );
      } else {
        setStoryText(
          "You disarm the assassin. He kneels. Now choose his fate."
        );
      }
      markChallengeCompletedFn("finalboss");
      updateMorality(moralityScore);
      locationInputSection.classList.add("hidden");
      interactBtn.classList.add("hidden");
      showFinalChoiceFn(moralityScore);
    } else {
      setStoryText(
        "Your hesitation proves fatal. The assassin strikes you down."
      );
      interactBtn.classList.add("hidden");
      hideChallengeSection();
      locationInputSection.classList.add("hidden");
    }
    return moralityScore;
  }
}

export function handleFinalChoice(outcome, moralityScore) {
  let finalMessage = "";
  if (outcome === "kill") {
    finalMessage =
      "You deliver the final blow. The cycle of violence continues.";
  } else if (outcome === "spare") {
    if (moralityScore > 5) {
      finalMessage = "You spare him, your mercy a beacon of hope.";
    } else {
      finalMessage = "You spare him, uncertain if this will heal old wounds.";
    }
  } else {
    finalMessage =
      "You bind his hands. Justice, not vengeance, will guide the future.";
  }

  setStoryText(finalMessage);
  let epilogue = "";
  if (outcome === "kill")
    epilogue = "Your name will be feared, your legacy uncertain.";
  else if (outcome === "spare")
    epilogue = "Your mercy may sow seeds of forgiveness in a broken land.";
  else epilogue = "Your fairness may inspire an era of honest justice.";

  return createCelebrationDiv(epilogue);
}

export function checkIfAllCluesFound(
  challengesCompleted,
  location,
  player,
  setStoryText
) {
  const allCompleted = MAIN_LOCATIONS.every((loc) => challengesCompleted[loc]);
  if (allCompleted && !challengesCompleted.finalboss) {
    // Unlock finalboss
    if (!locations.battlefield.connections.includes("finalboss")) {
      locations.battlefield.connections.push("finalboss");
      setStoryText(
        "All clues gathered! Return to the Battlefield to face the assassin."
      );
    }
  }
}

export function markChallengeCompleted(
  location,
  challengesCompleted,
  interactBtn
) {
  challengesCompleted[location] = true;
  interactBtn.classList.add("hidden");
  updateProgress(challengesCompleted);
}

export function handleMove(
  newLocation,
  player,
  bgMusic,
  drawFn,
  displayCurrentLocationInfoFn,
  challengesCompleted
) {
  player.location = newLocation;
  if (!player.visitedLocations.includes(newLocation)) {
    player.visitedLocations.push(newLocation);
  }

  const locationPositions = {
    castle: { x: 400, y: 300 },
    village: { x: 600, y: 150 },
    shrine: { x: 100, y: 100 },
    harbor: { x: 200, y: 400 },
    forest: { x: 700, y: 450 },
    battlefield: { x: 300, y: 500 },
    finalboss: { x: 400, y: 500 },
  };

  player.x = locationPositions[newLocation].x;
  player.y = locationPositions[newLocation].y;

  if (newLocation === "finalboss") {
    bgMusic.src = "intense_boss_track.mp3";
    bgMusic.play().catch(() => {});
  }

  displayCurrentLocationInfoFn(newLocation, player, challengesCompleted);
  drawFn();
}
