// Ensure DOM is fully loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const descriptionEl = document.getElementById("description");
    const interactionEl = document.getElementById("interaction");
    const actionsEl = document.getElementById("actions");
    const statusEl = document.getElementById("game-status");
    const roomsEl = document.getElementById("rooms");
  
    // Game Data
    const rooms = {
      castle: {
        description: "You stand in the grand Shogun's Castle. The air is tense with politics.",
        objects: "A ceremonial katana rests on a stand.",
        characters: "Takeshi the Loyal stands guard.",
        actions: ["explore", "collect"],
        loseCondition: false,
        winCondition: false,
      },
      shrine: {
        description: "You climb the sacred Mount Hikari Shrine. A monk prays silently.",
        objects: "A sacred scroll lies on the altar.",
        characters: null,
        actions: ["explore"],
        loseCondition: false,
        winCondition: false,
      },
      harbor: {
        description: "The bustling Kurokumo Harbor smells of salt and opportunity.",
        objects: null,
        characters: "A merchant offers a mysterious map.",
        actions: ["explore", "collect"],
        loseCondition: false,
        winCondition: true,
      },
      village: {
        description: "Kiyama Village is peaceful, but villagers whisper of trouble.",
        objects: "A well-crafted armor is displayed.",
        characters: "Lady Hana gathers intel.",
        actions: ["explore", "collect"],
        loseCondition: false,
        winCondition: false,
      },
      forest: {
        description: "The Bamboo Forest of Shadows feels alive with unseen eyes watching.",
        objects: "A hidden trap awaits the unwary.",
        characters: "Kazemaru the Stormblade challenges you to a duel.",
        actions: ["fight"],
        loseCondition: true,
        winCondition: false,
      },
      battlefield: {
        description: "The Crimson Battlefield is haunted by ghostly apparitions.",
        objects: null,
        characters: "Yurei the Phantom Fang silently watches.",
        actions: ["fight", "explore"],
        loseCondition: true,
        winCondition: false,
      },
    };
  
    // Game State
    let currentRoom = null;
    let gameStatus = "Neutral";
  
    // Update UI for a specific room
    function updateRoom(room) {
      currentRoom = room;
      const roomData = rooms[room];
  
      // Update Description
      descriptionEl.innerHTML = `
        <p>${roomData.description}</p>
        <p><strong>Objects:</strong> ${roomData.objects || "None"}</p>
        <p><strong>Characters:</strong> ${roomData.characters || "None"}</p>
      `;
  
      // Show Actions
      actionsEl.classList.remove("hidden");
      actionsEl.querySelectorAll("button").forEach((btn) => {
        btn.classList.add("hidden");
        if (roomData.actions.includes(btn.dataset.action)) {
          btn.classList.remove("hidden");
        }
      });
  
      // Update Game Status
      statusEl.innerText = gameStatus;
    }
  
    // Handle Room Selection
    roomsEl.addEventListener("click", (e) => {
      if (e.target.matches(".room-btn")) {
        const room = e.target.dataset.room;
        updateRoom(room);
      }
    });
  
    // Handle Actions
    actionsEl.addEventListener("click", (e) => {
      if (e.target.matches(".action-btn")) {
        const action = e.target.dataset.action;
        const roomData = rooms[currentRoom];
  
        if (action === "fight" && roomData.loseCondition) {
          gameStatus = "Lost - You were defeated!";
        } else if (action === "collect" && roomData.winCondition) {
          gameStatus = "Won - You found the secret map!";
        } else {
          gameStatus = "Neutral - Keep exploring!";
        }
  
        statusEl.innerText = gameStatus;
      }
    });
  });
  