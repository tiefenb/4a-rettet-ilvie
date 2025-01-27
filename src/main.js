import kaplay from "kaplay";
import "kaplay/global";

// Überprüfen, ob es sich um ein Mobilgerät handelt
const isMobile = /Mobi|Android|iPhone|iPod/i.test(navigator.userAgent) || (navigator.userAgent.includes("Macintosh") && 'ontouchend' in document);

// Initialisierung von Kaplay mit Hintergrundfarbe
const k = kaplay({
  background: [0, 0, 0], // Hintergrund schwarz
});

// Funktion zum Anpassen der Canvas-Größe
function resizeCanvas() {
  k.canvas.width = window.innerWidth;
  k.canvas.height = window.innerHeight;
}

resizeCanvas();

// Überwachen von Größenänderungen des Fensters
window.addEventListener("resize", () => {
  resizeCanvas();
  k.go("intro"); // Spiel neu starten, um Größen anzupassen
});

// Gerätedrehung überwachen
function checkOrientation() {

  if (isMobile) {
    console.log("hallo", window.innerWidth, window.innerHeight);
    if (window.innerWidth > window.innerHeight) {
      // Landscape mode
      document.getElementById("rotate-message").style.display = "flex";
    } else {
      // Portrait mode
      document.getElementById("rotate-message").style.display = "none";
    }
  } else {
    // Auf dem Desktop sicherstellen, dass die Nachricht ausgeblendet ist
    document.getElementById("rotate-message").style.display = "none";
  }
}

window.addEventListener("orientationchange", () => {
  checkOrientation();
  location.reload(); // Seite neu laden, um Größen anzupassen
});

// Initiale Überprüfung der Orientierung
checkOrientation();

// Laden der benötigten Sprites und Sounds
k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("marie", "sprites/marie.png");
k.loadSprite("lehrerin", "sprites/lehrerin.png");

k.loadSprite("dog", "sprites/dog.png");
k.loadSprite("goal", "sprites/star.png"); // Platzhalter für das Ziel
k.loadSprite("asteroid", "sprites/asteroid.png");
k.loadSprite("direktion", "sprites/direktion.png");
k.loadSound("collisionSound", "sounds/hit.mp3");

const PLAYERS = [
  { name: "Lan", sprite: "bean" },
  { name: "Viktoria", sprite: "bean" },
  { name: "Marie", sprite: "marie" },
  { name: "Nora", sprite: "bean" },
  { name: "Lorenz", sprite: "bean" },
  { name: "Raphael", sprite: "bean" },
  { name: "Kyan", sprite: "bean" },
  { name: "Rene", sprite: "bean" },
  { name: "Florian", sprite: "bean" },
  { name: "Franziska", sprite: "bean" },
  { name: "Emilia", sprite: "bean" },
  { name: "Felicitas", sprite: "bean" },
  { name: "Laura", sprite: "bean" },
  { name: "Nino", sprite: "bean" },
  { name: "Fr. Jurušić", sprite: "lehrerin" },
];

PLAYERS.sort((a, b) => a.name.localeCompare(b.name));

const SPEED = 600;

// Schwierigkeitsstufen definieren
const DIFFICULTIES = [
  { name: "einfach", maxObstacles: 8, obstacleSpawnInterval: 0.8 },
  { name: "mittel", maxObstacles: 12, obstacleSpawnInterval: 0.6 },
  { name: "schwer", maxObstacles: 20, obstacleSpawnInterval: 0.4 },
];

// Fragen definieren
const multiplicationQuestions = [];
const divisionQuestions = [];

// Multiplikationsfragen generieren (1-10)
for (let i = 1; i <= 10; i++) {
  for (let j = 1; j <= 10; j++) {
    const correctAnswer = i * j;
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
      const wrongAnswer = Math.floor(Math.random() * 100) + 1;
      if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
        wrongAnswers.push(wrongAnswer);
      }
    }
    const options = [correctAnswer, ...wrongAnswers]
      .map((num) => num.toString())
      .sort(() => Math.random() - 0.5);
    multiplicationQuestions.push({
      question: `${i} x ${j} = ?`,
      options,
      answer: correctAnswer.toString(),
    });
  }
}

// Divisionsfragen generieren (1-10)
for (let i = 1; i <= 10; i++) {
  for (let j = 1; j <= 10; j++) {
    const dividend = i * j;
    const divisor = i;
    const correctAnswer = j;
    const wrongAnswers = [];
    while (wrongAnswers.length < 2) {
      const wrongAnswer = Math.floor(Math.random() * 10) + 1;
      if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
        wrongAnswers.push(wrongAnswer);
      }
    }
    const options = [correctAnswer, ...wrongAnswers]
      .map((num) => num.toString())
      .sort(() => Math.random() - 0.5);
    divisionQuestions.push({
      question: `${dividend} ÷ ${divisor} = ?`,
      options,
      answer: correctAnswer.toString(),
    });
  }
}

// Funktion zum Spawnen von Sternen
function spawnStars(count) {
  for (let i = 0; i < count; i++) {
    k.add([
      k.pos(k.rand(0, k.width()), k.rand(0, k.height())),
      k.rect(3, 3),
      k.color(255, 255, 255),
      k.opacity(0.8),
      "star",
      { z: 0 },
      {
        update() {
          this.move(k.vec2(0, SPEED / 6));
          if (this.pos.y > k.height()) {
            this.destroy();
          }
        },
      },
    ]);
  }
}

// Intro-Szene
k.scene("intro", () => {
  // Variablen für ausgewählten Spieler und Schwierigkeit
  let selectedPlayerIndex = 0;
  let selectedPlayer = PLAYERS[selectedPlayerIndex];
  let selectedDifficultyIndex = 1; // Mittel
  let selectedDifficulty = DIFFICULTIES[selectedDifficultyIndex];

  const playerSprites = [];
  const difficultyButtons = [];
  const difficultyTexts = [];

  // Sterne spawnen
  spawnStars(50); // Anfangssterne

  const starsLoop = k.loop(1, () => {
    spawnStars(10);
  });

  k.add([
    k.pos(k.width() / 2, k.height() / 15),
    k.anchor("center"),
    k.text("Rettet Ilvie", { size: isMobile ? 64 : 72, align: "center" }),
    k.color(255, 255, 255),
    { z: 100 },
  ]);

  k.add([
    k.pos(k.width() / 2, k.height() / 5),
    k.anchor("center"),
    k.text(
      "Ilvie hat sich im Weltall verlaufen und findet eure Direktorin nicht mehr. Rettet sie und bringt sie zurück zu Frau Zdarsky. Aber gebt euch in Acht: Fiese Multiplikations- und Divisions-Asteroiden fliegen durch das Weltall und machen euch das Leben schwer.",
      { size: isMobile ? 28 : 32, align: "center", width: k.width() / 1.2 }
    ),
    k.color(255, 255, 255),
    { z: 100 },
  ]);

  // Hund spawnen
  function spawnDog() {
    k.add([
      k.sprite("dog", { width: 100, height: 100 }),
      k.pos(k.rand(0, k.width()), k.rand(0, k.height() / 2)),
      k.rotate(0),
      "introDog",
      { z: 1 },
      {
        dir: k.vec2(k.rand(-1, 1), k.rand(-1, 1)).unit(),
        speed: SPEED / 6,
        rotationSpeed: k.rand(-2, 2),
        update() {
            this.move(this.dir.scale(this.speed));
            this.angle += this.rotationSpeed;

            // Kollision mit Bildschirmrand
            if (this.pos.x <= 0 || this.pos.x >= k.width()) {
              this.dir.x = -this.dir.x;
              this.rotationSpeed = -this.rotationSpeed; // Drehrichtung umkehren
            }
            if (this.pos.y <= 0 || this.pos.y >= k.height()) {
              this.dir.y = -this.dir.y;
              this.rotationSpeed = -this.rotationSpeed; // Drehrichtung umkehren
            }
        },
      },
    ]);
  }

  spawnDog(); // Hund initial spawnen im intro

  // spawn owner fr intro
  k.add([
    k.sprite("direktion", { width: 200, height: 200 }),
    k.pos(k.rand(0, k.width()), -100), // Startet oberhalb des Bildschirms
    k.anchor("center"),
    k.area({ width: 100, height: 100 }), // Fläche für Kollisionen
    "ownerIntro",
    { z: 1 },
    {
      update() {
          // Besitzerin bewegt sich langsam nach unten
          this.move(k.vec2(0, SPEED / 6));

          // Begrenzung innerhalb des Bildschirms
          if (this.pos.y > k.height() + 100) {
            this.pos.y = -100; // Wieder nach oben setzen
          }
      },
    },
  ]);
  
  // Grid-Konfiguration
  const spriteWidth = 100;
  const spriteHeight = 100;
  const hSpacing = 50; // Horizontaler Abstand
  const vSpacing = 50; // Vertikaler Abstand
  const columns = 5; // Anzahl der Spalten
  const rows = Math.ceil(PLAYERS.length / columns);

  const gridWidth = columns * spriteWidth + (columns - 1) * hSpacing;
  const gridHeight = rows * spriteHeight + (rows - 1) * vSpacing;

  const startX = (k.width() - gridWidth) / 2;
  const startY = (k.height() - gridHeight) / 2;

  PLAYERS.forEach((player, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);

    const x = startX + col * (spriteWidth + hSpacing) + spriteWidth / 2;
    const y = startY + row * (spriteHeight + vSpacing) + spriteHeight / 2;

    const isSelected = index === selectedPlayerIndex;

    // Container für Sprite und Hintergrund
    const spriteContainer = k.add([
      k.pos(x, y),
      k.anchor("center"),
      { z: 100 },
      { playerIndex: index },
    ]);

    // Hintergrund für Auswahl
    const background = spriteContainer.add([
      k.rect(spriteWidth, spriteHeight),
      k.anchor("center"),
      k.color(isSelected ? k.rgb(255, 255, 0) : k.rgb(0, 0, 0, 0)),
      { z: -1 },
      k.area({ width: spriteWidth, height: spriteHeight }), // Fläche für Klicks
    ]);

    // Hintergrund als Eigenschaft speichern
    spriteContainer.background = background;

    // Sprite des Spielers
    const spriteObj = spriteContainer.add([
      k.sprite(player.sprite, { width: spriteWidth, height: spriteHeight }),
      k.anchor("center"),
      { z: 0 },
    ]);

    let preselectPlayer = localStorage.getItem("selectedPlayer");
    if(preselectPlayer && preselectPlayer.length > 0) {
      preselectPlayer = parseInt(preselectPlayer);
      selectedPlayerIndex = preselectPlayer;
      selectedPlayer = PLAYERS[selectedPlayerIndex];
      playerSprites.forEach((container, i) => {
        const bg = container.background;
        if (i === preselectPlayer) {
          bg.color = k.rgb(255, 255, 0);
        } else {
          bg.color = k.rgb(0, 0, 0, 0);
        }
      });
    }
    
    // Klickereignis auf den Hintergrund
    background.onClick(() => {
      selectedPlayerIndex = index;
      selectedPlayer = PLAYERS[selectedPlayerIndex];
      localStorage.setItem("selectedPlayer", selectedPlayerIndex);

      // Auswahl visuell aktualisieren
      playerSprites.forEach((container, i) => {
        const bg = container.background;
        if (i === selectedPlayerIndex) {
          bg.color = k.rgb(255, 255, 0);
        } else {
          bg.color = k.rgb(0, 0, 0, 0);
        }
      });
    });

    // Textfeld mit Hintergrund für Klickbereich
    const textContainer = k.add([
      k.pos(x, y + spriteHeight / 2 + 20),
      k.anchor("center"),
      { z: 100 },
    ]);

    // Hintergrundrechteck für den Text
    const textBackground = textContainer.add([
      k.rect(spriteWidth, 30),
      k.anchor("center"),
      k.color(0, 0, 0, 0), // Transparent
      k.area({ width: spriteWidth, height: 30 }), // Fläche für Klicks
    ]);

    // Text des Spielers
    const playerText = textContainer.add([
      k.text(player.name, { size: 24, align: "center" }),
      k.anchor("center"),
      k.color(255, 255, 255),
      { z: 0 },
    ]);

    // Klickereignis auf den Texthintergrund
    textBackground.onClick(() => {
      selectedPlayerIndex = index;
      selectedPlayer = PLAYERS[selectedPlayerIndex];

      // Auswahl visuell aktualisieren
      playerSprites.forEach((container, i) => {
        const bg = container.background;
        if (i === selectedPlayerIndex) {
          bg.color = k.rgb(255, 255, 0);
        } else {
          bg.color = k.rgb(0, 0, 0, 0);
        }
      });
    });

    playerSprites.push(spriteContainer);
  });

  // Schwierigkeitsauswahl
  const buttonWidth = 200;
  const buttonHeight = 50;
  const buttonSpacing = 50;

  const totalButtonWidth =
    DIFFICULTIES.length * buttonWidth + (DIFFICULTIES.length - 1) * buttonSpacing;
  const startXButtons = (k.width() - totalButtonWidth) / 2;
  const buttonsY = startY + rows * (spriteHeight + vSpacing) + 100; // Anpassen nach Bedarf

  DIFFICULTIES.forEach((difficulty, index) => {
    const x = startXButtons + index * (buttonWidth + buttonSpacing) + buttonWidth / 2;
    const y = buttonsY;

    const isSelected = index === selectedDifficultyIndex;

    const button = k.add([
      k.rect(buttonWidth, buttonHeight),
      k.pos(x, y),
      k.anchor("center"),
      k.color(isSelected ? k.rgb(255, 255, 0) : k.rgb(100, 100, 100)),
      k.area({ width: buttonWidth, height: buttonHeight }), // Fläche für Klicks
      { z: 100 },
      { difficultyIndex: index },
    ]);

    const buttonText = k.add([
      k.pos(x, y),
      k.anchor("center"),
      k.text(difficulty.name, { size: 24 }),
      k.color(isSelected ? k.rgb(0, 0, 0) : k.rgb(255, 255, 255)), // Textfarbe ändern
      { z: 100 },
    ]);

    button.onClick(() => {
      selectedDifficultyIndex = index;
      selectedDifficulty = DIFFICULTIES[selectedDifficultyIndex];

      // Auswahl visuell aktualisieren
      difficultyButtons.forEach((btn, i) => {
        const text = difficultyTexts[i];
        if (i === selectedDifficultyIndex) {
          btn.color = k.rgb(255, 255, 0);
          text.color = k.rgb(0, 0, 0); // Textfarbe auf Schwarz setzen
        } else {
          btn.color = k.rgb(100, 100, 100);
          text.color = k.rgb(255, 255, 255); // Textfarbe auf Weiß setzen
        }
      });
    });

    difficultyButtons.push(button);
    difficultyTexts.push(buttonText); // Füge das Textobjekt zur Liste hinzu
  });

  // "Spiel starten"-Button
  const startButtonY = buttonsY + buttonHeight + 50;

  const startButton = k.add([
    k.rect(400, 50),
    k.pos(k.width() / 2, startButtonY),
    k.anchor("center"),
    k.color(100, 100, 100),
    k.area({ width: 400, height: 50 }), // Fläche für Klicks
    { z: 100 },
  ]);

  k.add([
    k.text("Spiel starten", { size: 24 }),
    k.pos(k.width() / 2, startButtonY),
    k.anchor("center"),
    k.color(255, 255, 255),
    { z: 100 },
  ]);

  startButton.onClick(() => {
    // Stoppe den Sterne-Loop in der Intro-Szene
    starsLoop.cancel();
    // Spiel mit ausgewähltem Spieler und Schwierigkeit starten
    k.go("game", selectedPlayer, selectedDifficulty);
  });
});

// Spielszene
k.scene("game", (playerData, difficultyData) => {
  let gamePaused = false;
  let hasDog = false; // Ob der Spieler den Hund hat
  let ownerAppeared = false; // Ob die Besitzerin erschienen ist

  // Schwierigkeitsparameter
  const maxObstacles = difficultyData.maxObstacles;
  const obstacleSpawnInterval = difficultyData.obstacleSpawnInterval;

  // Hilfsfunktion zum Begrenzen von Werten
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Steuerungsgeschwindigkeit erhöhen
  const playerSpeedMultiplier = 3; // Faktor erhöht, um den Spieler schneller zu machen

  // Bewegungseingaben
  let moveLeft = false;
  let moveRight = false;
  let moveUp = false;
  let moveDown = false;

  // Spieler
  const ufo = k.add([
    k.pos(k.width() / 2, k.height() - 200),
    k.anchor("center"),
    k.sprite(playerData.sprite, { width: 200, height: 200 }),
    k.area({ width: 150, height: 150 }), // Fläche für Kollisionen
    k.rotate(0),
    "player",
    { z: 100 },
    {
      // Begrenzung innerhalb des Bildschirms
      update() {
        this.pos.x = clamp(this.pos.x, 0, k.width());
        this.pos.y = clamp(this.pos.y, 0, k.height());
      },
    },
  ]);

  // Tastatursteuerung
  k.onKeyDown("left", () => {
    moveLeft = true;
  });
  k.onKeyRelease("left", () => {
    moveLeft = false;
  });

  k.onKeyDown("right", () => {
    moveRight = true;
  });
  k.onKeyRelease("right", () => {
    moveRight = false;
  });

  k.onKeyDown("up", () => {
    moveUp = true;
  });
  k.onKeyRelease("up", () => {
    moveUp = false;
  });

  k.onKeyDown("down", () => {
    moveDown = true;
  });
  k.onKeyRelease("down", () => {
    moveDown = false;
  });

  // Spielerbewegung in jedem Frame aktualisieren
  k.onUpdate(() => {
    if (!gamePaused) {
      let dir = k.vec2(0, 0);
      if (moveLeft) dir.x -= 1;
      if (moveRight) dir.x += 1;
      if (moveUp) dir.y -= 1;
      if (moveDown) dir.y += 1;

      if (dir.len() > 0) {
        dir = dir.unit();
        ufo.move(dir.scale(SPEED * playerSpeedMultiplier));

        // Spielerrotation basierend auf horizontaler Bewegung
        ufo.angle = dir.x * -15;
      } else {
        ufo.angle = 0;
      }
    }
  });

  // Touch-Steuerung
  k.onUpdate(() => {
    if (!gamePaused) {
      if (k.isMouseDown()) {
        ufo.pos = k.mousePos();
      }
    }
  });

  // Funktion zum Spawnen von Hindernissen
  let obstaclesOnScreen = 0;

  function spawnObstacle() {
    if (obstaclesOnScreen >= maxObstacles) return;

    // Startposition oben im Bildschirm
    const startX = k.rand(0, k.width());
    const startY = -50; // Startet oberhalb des Bildschirms

    // Richtung nach unten mit leichtem seitlichen Versatz
    const dirX = k.rand(-0.5, 0.5);
    const dir = k.vec2(dirX, 1).unit();

    const speed = k.rand(SPEED / 10, SPEED); // Zufällige Geschwindigkeit
    const rotationSpeed = k.rand(-6, 6); // Zufällige Drehgeschwindigkeit

    obstaclesOnScreen++;

    k.add([
      k.pos(startX, startY),
      k.sprite("asteroid", { width: 70, height: 70 }),
      k.area({ width: 50, height: 50 }), // Fläche für Kollisionen
      k.rotate(0),
      "obstacle",
      { z: 1 },
      {
        dir: dir,
        speed: speed,
        rotationSpeed: rotationSpeed,
        update() {
            this.move(this.dir.scale(this.speed));
            this.angle += this.rotationSpeed;

            // Zerstören, wenn außerhalb des Bildschirms
            if (
              this.pos.y > k.height() + 50 ||
              this.pos.x < -50 ||
              this.pos.x > k.width() + 50
            ) {
              obstaclesOnScreen--;
              this.destroy();
            }
        },
      },
    ]);
  }

  // Hindernisse spawnen
  const obstacleLoop = k.loop(obstacleSpawnInterval, () => {
      spawnObstacle();
  });

  // Sterne spawnen
  spawnStars(50); // Anfangssterne

  // Sterne-Loop
  const starsLoop = k.loop(1, () => {
    spawnStars(10);
  });

  // Kollisionen
  let freeTime = false;
  ufo.onCollide("obstacle", (obstacle) => {
    // Spiel pausieren und Frage anzeigen
    if (!gamePaused && !freeTime) {
      gamePaused = true;
      freeTime = true;
      obstacle.destroy();
      obstaclesOnScreen--;

      k.play("collisionSound");

      showQuestion();
    }
  });

  // Hund spawnen
  let dog;
  function spawnDog() {
    dog = k.add([
      k.sprite("dog", { width: 70, height: 70 }),
      k.pos(k.rand(0, k.width()), k.rand(0, k.height() / 2)),
      k.area({ width: 50, height: 50 }), // Fläche für Kollisionen
      k.rotate(0),
      "dog",
      { z: 1 },
      {
        dir: k.vec2(k.rand(-1, 1), k.rand(-1, 1)).unit(),
        speed: SPEED / 6,
        rotationSpeed: k.rand(-2, 2),
        update() {
          if (!gamePaused) {
            this.move(this.dir.scale(this.speed));
            this.angle += this.rotationSpeed;

            // Kollision mit Bildschirmrand
            if (this.pos.x <= 0 || this.pos.x >= k.width()) {
              this.dir.x = -this.dir.x;
              this.rotationSpeed = -this.rotationSpeed; // Drehrichtung umkehren
            }
            if (this.pos.y <= 0 || this.pos.y >= k.height()) {
              this.dir.y = -this.dir.y;
              this.rotationSpeed = -this.rotationSpeed; // Drehrichtung umkehren
            }
          }
        },
      },
    ]);

    dog.onCollide("player", () => {
      if (!hasDog) {
        hasDog = true;
        dog.destroy();

        // Hund an den Spieler anhängen
        ufo.add([
          k.sprite("dog", { width: 70, height: 70 }),
          k.pos(110, 0),
          k.anchor("center"),
          k.area({ width: 30, height: 30 }), // Fläche für Kollisionen
          "dogAttached",
        ]);

        // Besitzerin spawnen
        if (!ownerAppeared) {
          spawnOwner();
          ownerAppeared = true;
        }
      }
    });
  }

  spawnDog(); // Hund initial spawnen

  // Besitzerin spawnen
  let owner;
  function spawnOwner() {
    owner = k.add([
      k.sprite("direktion", { width: 200, height: 200 }),
      k.pos(k.rand(0, k.width()), -100), // Startet oberhalb des Bildschirms
      k.anchor("center"),
      k.area({ width: 100, height: 100 }), // Fläche für Kollisionen
      "owner",
      { z: 1 },
      {
        update() {
          if (!gamePaused) {
            // Besitzerin bewegt sich langsam nach unten
            this.move(k.vec2(0, SPEED / 6));

            // Begrenzung innerhalb des Bildschirms
            if (this.pos.y > k.height() + 100) {
              this.pos.y = -100; // Wieder nach oben setzen
            }
          }
        },
      },
    ]);

    // Kollision mit der Besitzerin
    ufo.onCollide("owner", () => {
      if (hasDog) {
        endGame();
      }
    });
  }

  // Funktion zum Anzeigen einer Frage
  function showQuestion() {

    // Überprüfen, ob Fragen verfügbar sind
    if (multiplicationQuestions.length === 0 && divisionQuestions.length === 0) {
      console.error("Es sind keine Fragen verfügbar.");
      gamePaused = false;
      return;
    }

    // Zufällig auswählen, ob Multiplikations- oder Divisionsfrage
    let question;
    const questionType = Math.random() < 0.5 ? "multiplication" : "division";

    if (questionType === "multiplication" && multiplicationQuestions.length > 0) {
      question =
        multiplicationQuestions[
          Math.floor(Math.random() * multiplicationQuestions.length)
        ];
    } else if (divisionQuestions.length > 0) {
      question =
        divisionQuestions[Math.floor(Math.random() * divisionQuestions.length)];
    } else if (multiplicationQuestions.length > 0) {
      question =
        multiplicationQuestions[
          Math.floor(Math.random() * multiplicationQuestions.length)
        ];
    } else {
      console.error("Es sind keine Fragen verfügbar.");
      gamePaused = false;
      return;
    }

    // Frage anzeigen
    const questionText = k.add([
      k.text(question.question, { size: 48, width: k.width() }),
      k.pos(k.width() - 150, k.height() / 2 - 250),
      k.anchor("center"),
      k.color(255, 255, 255),
      { z: 200 },
    ]);

    // Optionen anzeigen
    const optionButtons = [];
    const optionTexts = [];
    const optionCount = question.options.length;
    const buttonWidth = 400;
    const buttonHeight = 100;
    const spacing = 50;
    const totalHeight =
      optionCount * buttonHeight + (optionCount - 1) * spacing;
    const startY = k.height() / 2 - totalHeight / 2 + 50;

    question.options.forEach((option, index) => {
      const button = k.add([
        k.rect(buttonWidth, buttonHeight),
        k.pos(k.width() / 2, startY + index * (buttonHeight + spacing)),
        k.anchor("center"),
        k.color(100, 100, 100),
        k.area({ width: buttonWidth, height: buttonHeight }), // Fläche für Klicks
        "optionButton",
        { option },
        { z: 200 },
      ]);

      const buttonText = k.add([
        k.text(option.toString(), { size: 42 }),
        k.pos(k.width() / 2, startY + index * (buttonHeight + spacing)),
        k.anchor("center"),
        k.color(255, 255, 255),
        { z: 200 },
      ]);

      button.onClick(() => {
        if (option === question.answer) {
          // Richtige Antwort
          optionTexts.forEach((txt) => {
            k.destroy(txt);
          });
          optionButtons.forEach((btn) => {
            k.destroy(btn);
          });
          k.destroy(questionText); // Frage entfernen
          gamePaused = false;
          window.setTimeout(() => {
            freeTime = false;
          }, 2000);
        } else {
          gamePaused = true;
          // Falsche Antwort
          // console.log("Falsche Antwort. Versuche es erneut.");
        }
      });

      optionButtons.push(button);
      optionTexts.push(buttonText);
    });
  }

  // Spiel beenden
  function endGame() {
    gamePaused = true;

    // Alle Hindernisse, Sterne und Hund entfernen
    k.get("obstacle").forEach((obj) => k.destroy(obj));
    k.get("star").forEach((obj) => k.destroy(obj));
    k.get("dogAttached").forEach((obj) => k.destroy(obj));
    if (owner) k.destroy(owner);

    // Nachricht anzeigen
    const goalText = k.add([
      k.text(`Du hast das Ziel erreicht!`, { size: 32 }),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor("center"),
      k.color(255, 255, 255),
      { z: 200 },
    ]);

    // Neustart-Button
    const restartButton = k.add([
      k.rect(400, 50),
      k.pos(k.width() / 2, k.height() / 2 + 100),
      k.anchor("center"),
      k.color(100, 100, 100),
      k.area({ width: 400, height: 50 }), // Fläche für Klicks
      { z: 200 },
    ]);

    const restartButtonText = k.add([
      k.text("Spiel neu starten", { size: 24 }),
      k.pos(k.width() / 2, k.height() / 2 + 100),
      k.anchor("center"),
      k.color(255, 255, 255),
      { z: 200 },
    ]);

    restartButton.onClick(() => {
      k.destroy(goalText);
      k.destroy(restartButtonText);
      k.destroy(restartButton);

      // Stoppe alle Loops
      obstacleLoop.cancel();
      starsLoop.cancel();

      k.go("intro");
    });
  }
});

// Spiel starten
k.go("intro");
