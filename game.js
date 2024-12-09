document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const gameContainer = document.getElementById("game-container");
  const instructions = document.getElementById("instructions");
  const characterSelection = document.getElementById("character-selection");

  // Map and Player State
  const mapImage = new Image();
  mapImage.src = "map.png"; // A map image file

  let player = {
    x: 100,
    y: 100,
    width: 32,
    height: 32,
    speed: 5,
    sprite: new Image(),
  };

  // Game Initialization
  function startGame(character) {
    // Set character sprite
    player.sprite.src = character === "samurai" ? "samurai.png" : "ninja.png";

    // Hide character selection and show game
    characterSelection.style.display = "none";
    gameContainer.style.display = "block";
    instructions.classList.remove("hidden");

    // Start game loop
    gameLoop();
  }

  // Handle Character Selection
  document.querySelectorAll(".character-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const character = e.target.dataset.character;
      startGame(character);
    });
  });

  // Draw Map and Player
  function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.drawImage(player.sprite, player.x, player.y, player.width, player.height);
  }

  // Handle Player Movement
  const keys = {};
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  function update() {
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    if (keys["ArrowLeft"]) player.x -= player.speed;
    if (keys["ArrowRight"]) player.x += player.speed;

    // Prevent player from leaving canvas bounds
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));
  }

  // Main Game Loop
  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
});
