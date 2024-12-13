document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const storyText = document.getElementById("story-text");
  const interactBtn = document.getElementById("interact-btn");
  const resetBtn = document.getElementById("reset-btn");
  const challengeSection = document.getElementById("challenge-section");
  const challengeText = document.getElementById("challenge-text");
  const choicesContainer = document.getElementById("choices");

  const locationInputSection = document.getElementById("location-input-section");
  const locationInput = document.getElementById("location-input");
  const submitLocationBtn = document.getElementById("submit-location-btn");
  const locationError = document.getElementById("location-error");

  const availableLocationsList = document.getElementById("available-locations-list");
  const progressText = document.getElementById("progress-text");
  const moralityText = document.getElementById("morality-text");

  const mapImage = new Image();
  mapImage.src = "map.png";

  const playerSprite = new Image();

  const bgMusic = document.getElementById("bg-music");
  bgMusic.volume = 0.5;

  // Track morality score
  let moralityScore = 0;

  const locationPositions = {
    castle: { x: 400, y: 300 },
    village: { x: 600, y: 150 },
    shrine: { x: 100, y: 100 },
    harbor: { x: 200, y: 400 },
    forest: { x: 700, y: 450 },
    battlefield: { x: 300, y: 500 },
    finalboss: { x: 400, y: 500 },
  };

  const initialState = {
    x: locationPositions.shrine.x,
    y: locationPositions.shrine.y,
    width: 100,
    height: 100,
    location: "shrine",
    visitedLocations: [],
  };

  let player = { ...initialState };

  let challengesCompleted = {
    castle: false,
    village: false,
    harbor: false,
    forest: false,
    shrine: false,
    battlefield: false,
    finalboss: false,
  };

  let celebrationDiv = null;

  const locations = {
    shrine: {
      name: "Crumbling Shrine",
      description:
        "Long ago, your father’s kingdom touched these sacred grounds...",
      connections: ["harbor"],
      challenge: {
        text: "A trembling monk speaks: 'I saw a hooded figure after your father was murdered...'",
        choices: [
          { text: "Kneel and Pray for Guidance", outcome: "win" },
          { text: "Offer Coin for Information", outcome: "progress" },
          { text: "Threaten the Monk", outcome: "lose" },
        ],
      },
    },
    harbor: {
      name: "Kurokumo Harbor",
      description: "Ships creak under faded sails...",
      connections: ["castle", "shrine"],
      challenge: {
        text: "A weathered merchant eyes you: 'The killer sailed from here...'",
        choices: [
          { text: "Trade Fairly", outcome: "win" },
          { text: "Haggle Hard", outcome: "progress" },
          { text: "Try to Steal It", outcome: "lose" },
        ],
      },
    },
    castle: {
      name: "Ruined Castle",
      description: "Your father’s old keep lies in ruins...",
      connections: ["village", "harbor"],
      challenge: {
        text: "A loyal servant appears: 'The killer cursed your father’s name...'",
        choices: [
          { text: "Honor the Fallen", outcome: "win" },
          { text: "Pay the Servant", outcome: "progress" },
          { text: "Demand the Letter", outcome: "lose" },
        ],
      },
    },
    village: {
      name: "Kiyama Village",
      description: "This quiet place remembers the assassin...",
      connections: ["castle", "forest"],
      challenge: {
        text: "A fearful villager: 'The killer cried by our well...'",
        choices: [
          { text: "Offer Comfort", outcome: "win" },
          { text: "Pay for Silence", outcome: "progress" },
          { text: "Intimidate", outcome: "lose" },
        ],
      },
    },
    forest: {
      name: "Bamboo Forest",
      description: "In the whispering bamboo...",
      connections: ["village", "battlefield"],
      challenge: {
        text: "A spirit’s voice drifts: 'He lost everything...'",
        choices: [
          { text: "Offer a Prayer", outcome: "win" },
          { text: "Leave a Coin", outcome: "progress" },
          { text: "Curse the Forest", outcome: "lose" },
        ],
      },
    },
    battlefield: {
      name: "Crimson Battlefield",
      description: "A scarred field of old wars...",
      connections: ["forest"],
      challenge: {
        text: "A specter hovers: 'He swore your father would know his pain...'",
        choices: [
          { text: "Bow to the Fallen", outcome: "win" },
          { text: "Whisper Vengeance", outcome: "progress" },
          { text: "Scoff at the Dead", outcome: "lose" },
        ],
      },
    },
    finalboss: {
      name: "Old Cliffside Ruin",
      description: "With all clues gathered...",
      connections: [],
      challenge: {
        text: "The assassin speaks: 'Your father’s guards slaughtered my family...'",
        choices: [
          { text: "Fight With Honor", outcome: "win" },
          { text: "Ambush Him", outcome: "progress" },
          { text: "Hesitate", outcome: "lose" },
        ],
      },
    },
  };

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    if (playerSprite.src) {
      ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
    }
  }

  function updateStory(location) {
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

  function updateAvailableLocations(loc) {
    const connections = loc.connections;
    if (connections.length === 0) {
      availableLocationsList.textContent = "No further locations available from here.";
    } else {
      const names = connections.map((c) => locations[c].name).join(", ");
      availableLocationsList.textContent = names;
    }
  }

  function updateProgress() {
    const allMainLocations = ["castle", "village", "harbor", "forest", "shrine", "battlefield"];
    const completedCount = allMainLocations.filter((loc) => challengesCompleted[loc]).length;
    progressText.textContent = `Clues Found: ${completedCount}/${allMainLocations.length}`;
  }

  function updateMorality() {
    moralityText.textContent = `${moralityScore}`;
  }

  function showLocationInputIfNeeded(loc) {
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
        handleMove(validLocation);
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

  function handleMove(newLocation) {
    player.location = newLocation;
    if (!player.visitedLocations.includes(newLocation)) {
      player.visitedLocations.push(newLocation);
    }

    player.x = locationPositions[newLocation].x;
    player.y = locationPositions[newLocation].y;

    // If finalboss location reached, change music
    if (newLocation === "finalboss") {
      bgMusic.src = "intense_boss_track.mp3";
      bgMusic.play().catch(() => {});
    }

    updateStory(newLocation);
    draw();
  }

  function showChallenge(location) {
    const loc = locations[location];
    const challenge = loc.challenge;

    if (!challenge) return;

    challengeText.textContent = challenge.text;
    choicesContainer.innerHTML = "";

    challenge.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.className = "bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2 choice-btn";
      btn.addEventListener("click", () => handleChoice(choice.outcome));
      choicesContainer.appendChild(btn);
    });

    challengeSection.classList.remove("hidden");
  }

  function handleChoice(outcome) {
    if (player.location !== "finalboss") {
      if (outcome === "win") {
        moralityScore += 2; // good deed
        storyText.textContent = "You gain a vital clue, and feel a sense of honor.";
        markChallengeCompleted(player.location);
      } else if (outcome === "progress") {
        moralityScore += 1; // neutral
        storyText.textContent = "You glean partial insight, uncertainty lingers.";
        markChallengeCompleted(player.location);
      } else {
        moralityScore -= 1; // negative action
        storyText.textContent = "You fail to secure the clue, your heart grows heavier.";
      }
      updateMorality();
      challengeSection.classList.add("hidden");
      checkWinCondition();
    } else {
      // Final boss scenario
      if (outcome === "win" || outcome === "progress") {
        if (moralityScore > 5) {
          storyText.textContent =
            "Your compassion shines even now, disarming the assassin with honor. Now choose his fate.";
        } else if (moralityScore < 0) {
          storyText.textContent =
            "Though you disarm him, the darkness in your deeds taints this victory. Choose his fate.";
        } else {
          storyText.textContent = "You disarm the assassin. He kneels. Now choose his fate.";
        }
        markChallengeCompleted("finalboss");
        updateMorality();
        locationInputSection.classList.add("hidden");
        interactBtn.classList.add("hidden");
        showFinalChoice();
      } else {
        storyText.textContent = "Your hesitation proves fatal. The assassin strikes you down.";
        interactBtn.classList.add("hidden");
        challengeSection.classList.add("hidden");
        locationInputSection.classList.add("hidden");
      }
    }
  }

  function markChallengeCompleted(location) {
    challengesCompleted[location] = true;
    interactBtn.classList.add("hidden");
    updateProgress();
  }

  function checkWinCondition() {
    const allMainLocations = ["castle", "village", "harbor", "forest", "shrine", "battlefield"];
    const allMainCompleted = allMainLocations.every((loc) => challengesCompleted[loc]);

    if (allMainCompleted && !challengesCompleted.finalboss) {
      if (!locations.battlefield.connections.includes("finalboss")) {
        locations.battlefield.connections.push("finalboss");
        storyText.textContent = "All clues gathered! Return to the Battlefield to face the assassin.";
        updateAvailableLocations(locations[player.location]);
      }
    }
  }

  function showFinalChoice() {
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
      btn.className = "bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2 choice-btn";
      btn.addEventListener("click", () => handleFinalChoice(choice.outcome));
      choicesContainer.appendChild(btn);
    });
  }

  function handleFinalChoice(outcome) {
    challengeSection.classList.add("hidden");

    let finalMessage = "";
    if (outcome === "kill") {
      finalMessage = "You deliver the final blow. The cycle of violence continues.";
    } else if (outcome === "spare") {
      if (moralityScore > 5) {
        finalMessage = "You spare him, your mercy a beacon of hope.";
      } else {
        finalMessage = "You spare him, uncertain if this will heal old wounds.";
      }
    } else {
      finalMessage = "You bind his hands. Justice, not vengeance, will guide the future.";
    }

    storyText.textContent = finalMessage;
    showCelebration(outcome);
  }

  function showCelebration(outcome) {
    celebrationDiv = document.createElement("div");
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

    let epilogue = "";
    if (outcome === "kill") {
      epilogue = "Your name will be feared, your legacy uncertain.";
    } else if (outcome === "spare") {
      epilogue = "Your mercy may sow seeds of forgiveness in a broken land.";
    } else {
      epilogue = "Your fairness may inspire an era of honest justice.";
    }

    celebrationDiv.innerHTML = `
      <p>おめでとうございます！</p>
      <p>${epilogue}</p>
    `;
    document.body.appendChild(celebrationDiv);
  }

  function showCharacterSelection() {
    interactBtn.classList.add("hidden");
    availableLocationsList.textContent = "";
    locationInputSection.classList.add("hidden");
    progressText.textContent = " 0/6";
    moralityScore = 0;
    updateMorality();

    storyText.innerHTML = `
      <p>You are the heir of a murdered king. Choose your path:</p>
      <button id="samurai-select" class="bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2">Samurai</button>
      <button id="ninja-select" class="bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2">Ninja</button>
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
  }

  function startGame() {
    bgMusic.play().catch(() => {});
    interactBtn.classList.remove("hidden");
    updateStory(player.location);
    draw();
  }

  function resetGame() {
    player = { ...initialState };
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
    updateMorality();

    const fbIndex = locations.battlefield.connections.indexOf("finalboss");
    if (fbIndex !== -1) {
      locations.battlefield.connections.splice(fbIndex, 1);
    }

    if (celebrationDiv) {
      celebrationDiv.remove();
      celebrationDiv = null;
    }

    playerSprite.src = "";
    bgMusic.src = "ambient.mp3";
    bgMusic.currentTime = 0;
    showCharacterSelection();
    draw();
  }

  interactBtn.addEventListener("click", () => showChallenge(player.location));
  resetBtn.addEventListener("click", resetGame);

  mapImage.onload = () => {
    showCharacterSelection();
    draw();
  };
});
