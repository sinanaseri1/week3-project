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
    width: 64,
    height: 64,
    location: "shrine",
    visitedLocations: [],
    status: "neutral",
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
        "Long ago, your father’s kingdom touched these sacred grounds. Now the shrine stands in quiet disrepair. A monk here claims to have seen the assassin fleeing the night your father fell.",
      connections: ["harbor"],
      challenge: {
        text: "A trembling monk speaks: 'I saw a hooded figure after your father was murdered. He left a strange talisman behind. Show humility, and I’ll share what I know.'",
        choices: [
          { text: "Kneel and Pray for Guidance (win)", outcome: "win" },
          {
            text: "Offer Coin for Information (progress)",
            outcome: "progress",
          },
          { text: "Threaten the Monk (lose)", outcome: "lose" },
        ],
      },
    },
    harbor: {
      name: "Kurokumo Harbor",
      description:
        "Ships creak under faded sails. Rumor has it the assassin fled by sea. A merchant might hold a bloodstained scrap the killer left behind.",
      connections: ["castle", "shrine"],
      challenge: {
        text: "A weathered merchant eyes you: 'The killer sailed from here. He left a scrap of royal cloth. Earn my trust, and it’s yours.'",
        choices: [
          { text: "Trade Fairly (win)", outcome: "win" },
          { text: "Haggle Hard (progress)", outcome: "progress" },
          { text: "Try to Steal It (lose)", outcome: "lose" },
        ],
      },
    },
    castle: {
      name: "Ruined Castle",
      description:
        "Your father’s old keep lies in ruins. An old servant might recall the assassin’s words. Perhaps a letter or clue remains in the shattered halls.",
      connections: ["village", "harbor"],
      challenge: {
        text: "A loyal servant appears: 'The killer cursed your father’s name and spoke of revenge. Help me bury the guards, and I’ll give you a letter he dropped.'",
        choices: [
          { text: "Honor the Fallen (win)", outcome: "win" },
          {
            text: "Pay the Servant for the Letter (progress)",
            outcome: "progress",
          },
          { text: "Demand the Letter (lose)", outcome: "lose" },
        ],
      },
    },
    village: {
      name: "Kiyama Village",
      description:
        "This quiet place remembers the assassin. He once lived here, grieving losses blamed on the king’s guards. A villager might share what they overheard.",
      connections: ["castle", "forest"],
      challenge: {
        text: "A fearful villager clutches a pendant: 'The killer cried by our well, mourning murdered kin. Show kindness, and I’ll tell you what he said that night.'",
        choices: [
          { text: "Offer Comfort (win)", outcome: "win" },
          { text: "Pay for Their Silence (progress)", outcome: "progress" },
          { text: "Intimidate the Villager (lose)", outcome: "lose" },
        ],
      },
    },
    forest: {
      name: "Bamboo Forest",
      description:
        "In the whispering bamboo, the assassin hid his sorrows. A spirit here might reveal a doll’s fragment he left behind, symbolizing lost innocence.",
      connections: ["village", "battlefield"],
      challenge: {
        text: "A spirit’s voice drifts in the bamboo: 'He lost everything and carried a child’s doll fragment. Show reverence, and I shall guide you to it.'",
        choices: [
          { text: "Offer a Prayer (win)", outcome: "win" },
          { text: "Leave a Coin as Tribute (progress)", outcome: "progress" },
          { text: "Curse the Forest (lose)", outcome: "lose" },
        ],
      },
    },
    battlefield: {
      name: "Crimson Battlefield",
      description:
        "A scarred field of old wars. The killer vowed vengeance here. A ghost may reveal his true face, if you earn its trust.",
      connections: ["forest"],
      challenge: {
        text: "A specter hovers: 'He swore your father would know his pain. Show respect for the dead, and I’ll name the killer you seek.'",
        choices: [
          { text: "Bow to the Fallen (win)", outcome: "win" },
          { text: "Whisper Vengeance (progress)", outcome: "progress" },
          { text: "Scoff at the Dead (lose)", outcome: "lose" },
        ],
      },
    },
    finalboss: {
      name: "Old Cliffside Ruin",
      description:
        "With all clues gathered, you track the assassin to a hidden ruin. He stands before you, blade trembling. He knows who you are, and you know why he killed your father.",
      connections: [],
      challenge: {
        text: "The assassin speaks: 'Your father’s guards slaughtered my family. I killed him so he’d taste my pain. Fight me if you must, but know the truth before drawing blood.'",
        choices: [
          { text: "Fight With Honor (win)", outcome: "win" },
          { text: "Ambush Him (progress)", outcome: "progress" },
          { text: "Hesitate and Let Him Strike (lose)", outcome: "lose" },
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

    if (connections.length === 0 && player.location === "finalboss") {
      storyText.textContent =
        "There’s nowhere left to go. Face your destiny here.";
      return;
    }

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
    if (player.location !== "finalboss") {
      // Main locations
      if (outcome === "win") {
        storyText.textContent =
          "You gain a vital clue. The picture grows clearer.";
        markChallengeCompleted(player.location);
      } else if (outcome === "progress") {
        storyText.textContent =
          "You glean partial insight. Another step closer to the truth.";
        markChallengeCompleted(player.location);
      } else {
        storyText.textContent =
          "You fail to secure the clue this time. You can try again later.";
      }
      // Hide challenge section after normal locations
      challengeSection.classList.add("hidden");
      checkWinCondition();
    } else {
      // Final boss scenario
      if (outcome === "win" || outcome === "progress") {
        storyText.textContent =
          "You disarm the assassin. He kneels, grief in his eyes. Now choose his fate.";
        markChallengeCompleted("finalboss");

        // CHANGES HERE: Do NOT hide the challenge section. Directly call showFinalChoice()
        // Also, hide move and interact buttons to focus player on final choice
        moveBtn.classList.add("hidden");
        interactBtn.classList.add("hidden");

        // Now show the final moral choices
        showFinalChoice();
      } else {
        storyText.textContent =
          "Your hesitation proves fatal. The assassin deals a deadly blow.";
        moveBtn.classList.add("hidden");
        interactBtn.classList.add("hidden");
        challengeSection.classList.add("hidden");
      }
    }
  }

  function markChallengeCompleted(location) {
    challengesCompleted[location] = true;
    interactBtn.classList.add("hidden");
  }

  function checkWinCondition() {
    const allMainLocations = [
      "castle",
      "village",
      "harbor",
      "forest",
      "shrine",
      "battlefield",
    ];
    const allMainCompleted = allMainLocations.every(
      (loc) => challengesCompleted[loc]
    );

    // Once all main clues are gathered, unlock the final boss if not already done
    if (allMainCompleted && !challengesCompleted.finalboss) {
      // Add finalboss to battlefield if not already present
      if (!locations.battlefield.connections.includes("finalboss")) {
        locations.battlefield.connections.push("finalboss");
        storyText.textContent =
          "All clues are gathered! Return to the Battlefield and follow the hidden path to face the assassin.";
      }
    }
  }

  function showFinalChoice() {
    storyText.textContent =
      "The assassin reveals your father’s guards killed his family. He sought revenge. Will you kill, spare, or imprison him?";
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
      btn.addEventListener("click", () => handleFinalChoice(choice.outcome));
      choicesContainer.appendChild(btn);
    });

    // Ensure the challenge section is now visible
    challengeSection.classList.remove("hidden");
  }

  function handleFinalChoice(outcome) {
    challengeSection.classList.add("hidden");
    moveBtn.classList.add("hidden");
    interactBtn.classList.add("hidden");

    let finalMessage = "";
    if (outcome === "kill") {
      finalMessage =
        "You deliver the final blow. The assassin’s blood stains your blade, and the cycle of violence continues.";
    } else if (outcome === "spare") {
      finalMessage =
        "You lower your weapon. The assassin collapses in sobs, released from hatred, and perhaps so are you.";
    } else {
      finalMessage =
        "You bind his hands. Justice, not vengeance, will shape the kingdom’s future.";
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
    moveBtn.classList.add("hidden");
    interactBtn.classList.add("hidden");

    storyText.innerHTML = `
      <p>You are the heir of a murdered king. Choose your path:</p>
      <button id="samurai-select" class="bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2">Samurai (Noble Blade)</button>
      <button id="ninja-select" class="bg-green-600 hover:bg-green-700 p-2 rounded-lg mx-2">Ninja (Silent Vengeance)</button>
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
      finalboss: false,
    };

    // Remove finalboss from battlefield if previously added
    const fbIndex = locations.battlefield.connections.indexOf("finalboss");
    if (fbIndex !== -1) {
      locations.battlefield.connections.splice(fbIndex, 1);
    }

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
