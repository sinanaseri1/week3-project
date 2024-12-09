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
  playerSprite.src = "samurai.png";

  // Predefined positions for each location
  const locationPositions = {
    castle: { x: 100, y: 100 },
    village: { x: 200, y: 200 },
    harbor: { x: 300, y: 150 },
    forest: { x: 400, y: 250 },
    shrine: { x: 500, y: 100 },
    battlefield: { x: 600, y: 300 },
  };

  const initialState = {
    x: locationPositions.castle.x,
    y: locationPositions.castle.y,
    width: 64,
    height: 64,
    location: "castle",
    visitedLocations: [],
    status: "neutral",
  };

  let player = { ...initialState };

  const locations = {
    castle: {
      name: "Shogun's Castle",
      description: "The seat of power, bustling with political intrigue.",
      connections: ["village", "harbor"],
      challenge: {
        text: "A rival samurai challenges you to a duel. What will you do?",
        choices: [
          { text: "Kill", outcome: "lose" },
          { text: "Spare", outcome: "progress" },
          { text: "Befriend", outcome: "win" },
        ],
      },
    },
    village: {
      name: "Kiyama Village",
      description: "A peaceful village with hidden secrets.",
      connections: ["castle", "forest"],
      challenge: {
        text: "A villager accuses you of theft. How will you respond?",
        choices: [
          { text: "Apologize", outcome: "progress" },
          { text: "Ignore", outcome: "lose" },
          { text: "Defend Yourself", outcome: "win" },
        ],
      },
    },
    harbor: {
      name: "Kurokumo Harbor",
      description: "A bustling harbor filled with merchants and intrigue.",
      connections: ["castle", "shrine"],
      challenge: {
        text: "A merchant offers a mysterious map for a high price. What will you do?",
        choices: [
          { text: "Buy the Map", outcome: "progress" },
          { text: "Steal the Map", outcome: "lose" },
          { text: "Negotiate", outcome: "win" },
        ],
      },
    },
    forest: {
      name: "Bamboo Forest",
      description: "A mysterious forest rumored to be haunted.",
      connections: ["village", "battlefield"],
      challenge: {
        text: "A wandering spirit asks for your help. How will you respond?",
        choices: [
          { text: "Fight", outcome: "lose" },
          { text: "Ignore", outcome: "lose" },
          { text: "Help", outcome: "win" },
        ],
      },
    },
    shrine: {
      name: "Mount Hikari Shrine",
      description: "A serene mountaintop shrine. Pilgrims seek enlightenment here.",
      connections: ["harbor"],
      challenge: {
        text: "A monk offers you wisdom but asks for a favor in return. How will you respond?",
        choices: [
          { text: "Accept the Favor", outcome: "progress" },
          { text: "Refuse", outcome: "lose" },
          { text: "Seek Wisdom Without Favor", outcome: "win" },
        ],
      },
    },
    battlefield: {
      name: "Crimson Battlefield",
      description: "A desolate field haunted by the ghosts of war.",
      connections: ["forest"],
      challenge: {
        text: "A ghostly warrior demands to know your purpose. How will you respond?",
        choices: [
          { text: "Fight", outcome: "lose" },
          { text: "Explain Yourself", outcome: "win" },
          { text: "Run Away", outcome: "lose" },
        ],
      },
    },
  };

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
  }

  function updateStory(location) {
    const loc = locations[location];
    storyText.textContent = `You are at ${loc.name}. ${loc.description}`;
    moveBtn.classList.remove("hidden");
    // Always allow interacting for now
    interactBtn.classList.remove("hidden");
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

        // Check win condition
        if (player.visitedLocations.length === Object.keys(locations).length) {
          storyText.textContent =
            "Congratulations! You have visited all locations and won the game!";
          moveBtn.classList.add("hidden");
          interactBtn.classList.add("hidden");
          return;
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
      storyText.textContent = "You made the right choice and advanced in your journey!";
    } else if (outcome === "progress") {
      storyText.textContent = "You navigated the challenge successfully but more lies ahead.";
    } else {
      // Instead of blocking the player from continuing, just show a message but keep buttons visible
      storyText.textContent = "You made a poor choice this time. You may continue traveling and try again elsewhere.";
      
      // Do NOT hide the move or interact buttons here.
      // moveBtn.classList.add("hidden");
      // interactBtn.classList.add("hidden");
    }
  
    challengeSection.classList.add("hidden");
  }
  

  function resetGame() {
    // CHANGES MADE HERE: Fully restore the initial state and show the story again.
    player = { ...initialState };
    // Update the story and show the initial location's details again
    updateStory(player.location);
    moveBtn.classList.remove("hidden");
    interactBtn.classList.remove("hidden");
    challengeSection.classList.add("hidden");
    draw();
  }

  moveBtn.addEventListener("click", movePlayer);
  interactBtn.addEventListener("click", () => showChallenge(player.location));
  resetBtn.addEventListener("click", resetGame);

  // CHANGES MADE HERE: Wait for images to load before drawing the initial scene
  mapImage.onload = () => {
    playerSprite.onload = () => {
      updateStory(player.location);
      draw();
    };
  };
});
