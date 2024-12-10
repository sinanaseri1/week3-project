document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const storyText = document.getElementById("story-text");
  const moveBtn = document.getElementById("move-btn");
  const interactBtn = document.getElementById("interact-btn");
  const resetBtn = document.getElementById("reset-btn");
  const challengeSection = document.getElementById("challenge-section");
  const challengeText = document.getElementById("challenge-text");
  const choicesContainer = document.getElementById("choices");

  const mapImage = new Image();
  mapImage.src = "map.png";

  const playerSprite = new Image();

  // Positions updated as requested and mentioned previously
  const locationPositions = {
    // Castle at center of the map
    castle: { x: 400, y: 300 },
    // Village halfway between top-right corner and castle
    village: { x: 600, y: 150 },
    // Shrine at the original starting position
    shrine: { x: 100, y: 100 },
    // Harbor on the bottom-left of castle
    harbor: { x: 200, y: 400 },
    // Forest near the bottom-right corner, a bit higher
    forest: { x: 700, y: 450 },
    // Battlefield to the left and up from bottom center
    battlefield: { x: 300, y: 500 },
  };

  const initialState = {
    x: locationPositions.shrine.x,
    y: locationPositions.shrine.y,
    width: 64,
    height: 64,
    location: "shrine",
    visitedLocations: [],
    status: "neutral",
  };

  let player = { ...initialState };

  // Challenges completion tracking
  let challengesCompleted = {
    castle: false,
    village: false,
    harbor: false,
    forest: false,
    shrine: false,
    battlefield: false,
  };

  let celebrationDiv = null;

  // Updated storyline and dialogues
  const locations = {
    castle: {
      name: "Shogun’s Keep",
      description:
        "At the heart of the land stands the Shogun’s Keep. Its wooden halls and whispered counsel hide the fragility of the peace you have known. The Shogun, aging and troubled, awaits your audience.",
      connections: ["village", "harbor"],
      challenge: {
        text: "The Shogun paces before you, his gaze heavy with concern. 'A shadow looms,' he says. 'Rumors tell of the Blossom Blade, an artifact of unity. Prove your worth: will you pledge to restore harmony, or seek your own gains?'",
        choices: [
          {
            text: "Pledge Unwavering Loyalty (progress)",
            outcome: "progress",
          },
          {
            text: "Demand Favors and Riches (lose)",
            outcome: "lose",
          },
          {
            text: "Ask for Guidance, Not Glory (win)",
            outcome: "win",
          },
        ],
      },
    },
    village: {
      name: "Kiyama Village",
      description:
        "Kiyama Village rests on terraced hills, its lantern-lit eaves sheltering wary folk. Bandit troubles and mistrust weigh heavily on its people.",
      connections: ["castle", "forest"],
      challenge: {
        text: "A villager rushes to you, tears in her eyes. 'My family's heirloom is stolen! Some say you took it. Can you restore our faith?' The crowd watches, uncertain, fearful.",
        choices: [
          {
            text: "Reveal the True Culprit With Diplomacy (win)",
            outcome: "win",
          },
          {
            text: "Offer Compensation From Your Own Pouch (progress)",
            outcome: "progress",
          },
          {
            text: "Dismiss Their Accusation Abruptly (lose)",
            outcome: "lose",
          },
        ],
      },
    },
    harbor: {
      name: "Kurokumo Harbor",
      description:
        "Kurokumo Harbor bustles with fishers and traders. Rumors flow here like tides, each whisper a chance to gain or lose trust.",
      connections: ["castle", "shrine"],
      challenge: {
        text: "A merchant leans in, voice low: 'I have a scrap of the Blossom Blade’s scabbard. For a price.' Others watch. Will you trade fairly or stoop to deceit?",
        choices: [
          {
            text: "Negotiate Fairly and Secure the Scrap (win)",
            outcome: "win",
          },
          {
            text: "Barter Shrewdly, Saving Some Coin (progress)",
            outcome: "progress",
          },
          {
            text: "Attempt to Steal It (lose)",
            outcome: "lose",
          },
        ],
      },
    },
    forest: {
      name: "Bamboo Forest",
      description:
        "The Bamboo Forest whispers with ancient spirits. Moonlight reveals carvings on aged stalks. Many who enter never return.",
      connections: ["village", "battlefield"],
      challenge: {
        text: "A ghostly spirit drifts near, hollow voice echoing: 'Will you help our restless souls, or is your heart closed to our plight?'",
        choices: [
          {
            text: "Offer Your Blade in Protection of the Spirits (win)",
            outcome: "win",
          },
          {
            text: "Acknowledge Their Pain But Remain Neutral (progress)",
            outcome: "progress",
          },
          {
            text: "Ignore Their Plea and Press On (lose)",
            outcome: "lose",
          },
        ],
      },
    },
    shrine: {
      name: "Mount Hikari Shrine",
      description:
        "High on Mount Hikari, monks guard ancient wisdom. Wind chimes sing into the mist. Here, secrets of the Blossom Blade linger, waiting for a worthy soul.",
      connections: ["harbor"],
      challenge: {
        text: "A serene monk greets you: 'We know of the Blossom Blade. Prove your worth. Will you help with our rituals, seek immediate knowledge, or show patience through silent meditation?'",
        choices: [
          {
            text: "Offer Help With the Shrine’s Ritual (progress)",
            outcome: "progress",
          },
          {
            text: "Plead For Hidden Knowledge Immediately (lose)",
            outcome: "lose",
          },
          {
            text: "Meditate in Silence, Showing Patience (win)",
            outcome: "win",
          },
        ],
      },
    },
    battlefield: {
      name: "Crimson Battlefield",
      description:
        "A scarred land strewn with rusted arms and lost honor. The ghosts of old warriors whisper laments into the wind.",
      connections: ["forest"],
      challenge: {
        text: "A ghostly warrior bars your path. 'For whom do you fight?' it demands. 'For peace, for power, or the souls who cannot rest?'",
        choices: [
          {
            text: "Explain Your Quest for Unity and Peace (win)",
            outcome: "win",
          },
          {
            text: "Boast of Your Strength and Skill (progress)",
            outcome: "progress",
          },
          {
            text: "Attempt to Flee Without Answering (lose)",
            outcome: "lose",
          },
        ],
      },
    },
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

  function updateStory(location) {
    const loc = locations[location];
    storyText.textContent = `You are at ${loc.name}. ${loc.description}`;
    moveBtn.classList.remove("hidden");

    if (challengesCompleted[location]) {
      interactBtn.classList.add("hidden");
    } else {
      interactBtn.classList.remove("hidden");
    }

    challengeSection.classList.add("hidden");
  }

  function movePlayer() {
    const loc = locations[player.location];
    const connections = loc.connections;

    let options = connections
      .map(
        (connection) =>
          `<button class="move-option-btn bg-blue-600 hover:bg-blue-700 p-2 rounded-lg mx-2" data-location="${connection}">${locations[connection].name}</button>`
      )
      .join("");
    storyText.innerHTML = `Where do you want to go? ${options}`;

    document.querySelectorAll(".move-option-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const newLocation = e.target.dataset.location;
        player.location = newLocation;

        if (!player.visitedLocations.includes(newLocation)) {
          player.visitedLocations.push(newLocation);
        }

        player.x = locationPositions[newLocation].x;
        player.y = locationPositions[newLocation].y;

        updateStory(newLocation);
        draw();
      });
    });
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
      btn.className =
        "bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2 choice-btn";
      btn.addEventListener("click", () => handleChoice(choice.outcome));
      choicesContainer.appendChild(btn);
    });

    challengeSection.classList.remove("hidden");
  }

  function handleChoice(outcome) {
    if (outcome === "win") {
      storyText.textContent =
        "Your choice reflects true merit. The path to the Blossom Blade grows clearer.";
      markChallengeCompleted(player.location);
    } else if (outcome === "progress") {
      storyText.textContent =
        "You move forward, though not flawlessly. Still, the journey continues.";
      markChallengeCompleted(player.location);
    } else {
      storyText.textContent =
        "A poor choice. The path darkens, but you may yet redeem yourself elsewhere.";
      // Not completed, interact button remains for retries
    }

    challengeSection.classList.add("hidden");

    checkWinCondition();
  }

  function markChallengeCompleted(location) {
    challengesCompleted[location] = true;
    interactBtn.classList.add("hidden");
  }

  function checkWinCondition() {
    const allLocations = Object.keys(locations);
    const allCompleted = allLocations.every((loc) => challengesCompleted[loc]);

    if (allCompleted) {
      showCelebration();
    }
  }

  function showCelebration() {
    storyText.textContent =
      "Congratulations! You have proven your worth and united the lands under your wisdom and honor.";
    moveBtn.classList.add("hidden");
    interactBtn.classList.add("hidden");

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
    celebrationDiv.innerHTML = `
      <p>おめでとうございます！</p>
      <p>You have brought great honor to your clan and restored harmony to the realm. The Blossom Blade is now yours, shining as a beacon of peace.</p>
    `;
    document.body.appendChild(celebrationDiv);
  }

  function showCharacterSelection() {
    moveBtn.classList.add("hidden");
    interactBtn.classList.add("hidden");

    storyText.innerHTML = `
      <p>Choose your character:</p>
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
    updateStory(player.location);
    moveBtn.classList.remove("hidden");
    interactBtn.classList.remove("hidden");
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
    };

    if (celebrationDiv) {
      celebrationDiv.remove();
      celebrationDiv = null;
    }

    playerSprite.src = "";
    showCharacterSelection();
    draw();
  }

  moveBtn.addEventListener("click", movePlayer);
  interactBtn.addEventListener("click", () => showChallenge(player.location));
  resetBtn.addEventListener("click", resetGame);

  mapImage.onload = () => {
    showCharacterSelection();
    draw();
  };
});
