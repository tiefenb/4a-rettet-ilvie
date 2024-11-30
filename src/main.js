import kaplay from "kaplay";
import "kaplay/global";

const k = kaplay({
  background: [0, 0, 0], // Hintergrund schwarz
});

// Laden der benötigten Sprites
//k.loadSprite("marie", "sprites/snowboarder.png");
k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("goal", "sprites/star.png"); // Platzhalter für das Ziel

const PLAYERS = [
  { name: "Viktoria", sprite: "bean" },
  { name: "Marie", sprite: "bean" },
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
  { name: "Lan", sprite: "bean" },
];

PLAYERS.sort((a, b) => a.name.localeCompare(b.name));

const SPEED = 600;

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
      k.move(k.DOWN, SPEED / 6),
      k.offscreen({ destroy: true }),
      "star",
      { z: 0 },
    ]);
  }
}

// Intro-Szene
k.scene("intro", () => {
  // Sterne spawnen
  k.loop(1, () => {
    spawnStars(10);
  });

  k.add([
    k.pos(k.width() / 2, 50),
    k.anchor("center"),
    k.text("Rettet Ilvie", { size: 32, align: "center" }),
    k.color(255, 255, 255),
    { z: 100 },
  ]);

  k.add([
    k.pos(k.width() / 2, 200),
    k.anchor("center"),
    k.text("Ilvie hat sich im Weltall verlaufen und findet eure Direktorin nicht mehr. Rettet sie und bringt sie zurück zu Frau Zdarsky. Aber gebt euch in acht. fiese Multiplikations- und Divisions-Asteroiden fliegen durch das Weltall und machen euch das Leben schwer.", { size: 18, align: "center", width: k.width() / 2 }),
    k.color(255, 255, 255),
    { z: 100 },
  ]);

  // Grid-Konfiguration
  const spriteWidth = 100;
  const spriteHeight = 100;
  const hSpacing = 50; // Horizontaler Abstand
  const vSpacing = 50; // Vertikaler Abstand
  const columns = 3; // Anzahl der Spalten
  const rows = Math.ceil(PLAYERS.length / columns);

  const gridWidth = columns * spriteWidth + (columns - 1) * hSpacing;
  const gridHeight = rows * spriteHeight + (rows - 1) * vSpacing;

  const startX = (k.width() - gridWidth) / 2;
  const startY = 400; // Startposition Y

  PLAYERS.forEach((player, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);

    const x = startX + col * (spriteWidth + hSpacing) + spriteWidth / 2;
    const y = startY + row * (spriteHeight + vSpacing) + spriteHeight / 2;

    const spriteObj = k.add([
      k.pos(x, y),
      k.anchor("center"),
      k.sprite(player.sprite, { width: spriteWidth, height: spriteHeight }),
      k.area(),
      { z: 100 },
    ]);

    spriteObj.onClick(() => k.go("game", player));

    const playerText = k.add([
      k.pos(x, y + spriteHeight / 2 + 20),
      k.anchor("center"),
      k.text(player.name, { size: 24, align: "center" }),
      k.color(255, 255, 255),
      k.area(),
      { z: 100 },
    ]);
    playerText.onClick(() => k.go("game", player));
  });
});

// Spielszene
k.scene("game", (playerData) => {
  let gamePaused = false;
  let hasDog = false; // Ob der Spieler den Hund hat
  let ownerAppeared = false; // Ob die Besitzerin erschienen ist

  // Hilfsfunktion zum Begrenzen von Werten
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Steuerungsgeschwindigkeit erhöhen
  const playerSpeedMultiplier = 3; // Faktor erhöht, um den Spieler schneller zu machen

  // Event handler functions
  function leftHandler() {
    if (!gamePaused) {
      ufo.move(k.LEFT.scale(SPEED * playerSpeedMultiplier));
      ufo.angle = -15;
    }
  }

  function rightHandler() {
    if (!gamePaused) {
      ufo.move(k.RIGHT.scale(SPEED * playerSpeedMultiplier));
      ufo.angle = 15;
    }
  }

  function upHandler() {
    if (!gamePaused) {
      ufo.move(k.UP.scale(SPEED * playerSpeedMultiplier));
    }
  }

  function downHandler() {
    if (!gamePaused) {
      ufo.move(k.DOWN.scale(SPEED * playerSpeedMultiplier));
    }
  }

  function releaseHandler() {
    if (!gamePaused) {
      ufo.angle = 0;
    }
  }

  function pausedMove(dir, speed) {
    return {
      id: "pausedMove",
      require: ["pos"],
      update() {
        if (!gamePaused) {
          this.move(dir.scale(speed));
        }
      },
    };
  }

  // Funktion zum Spawnen von Hindernissen
  let obstaclesOnScreen = 0;
  const maxObstacles = 5; // Maximale Anzahl von Hindernissen gleichzeitig

  function spawnObstacle() {
    if (obstaclesOnScreen >= maxObstacles) return;

    // Startposition oben im Bildschirm
    const startX = k.rand(0, k.width());
    const startY = -50; // Startet oberhalb des Bildschirms

    // Richtung nach unten mit leichtem seitlichen Versatz
    const dirX = k.rand(-0.5, 0.5);
    const dir = k.vec2(dirX, 1).unit();

    const speed = k.rand(SPEED / 4, SPEED / 2); // Zufällige Geschwindigkeit
    const rotationSpeed = k.rand(-30, 30); // Zufällige Drehgeschwindigkeit

    obstaclesOnScreen++;

    k.add([
      k.pos(startX, startY),
      k.rect(50, 50), // Größere Hindernisse
      k.color(0, 127, 255),
      k.area(),
      k.rotate(0),
      "obstacle",
      { z: 0 },
      {
        dir: dir,
        speed: speed,
        rotationSpeed: rotationSpeed,
        update() {
          if (!gamePaused) {
            this.move(this.dir.scale(this.speed));
            this.angle += this.rotationSpeed;

            // Zerstören, wenn außerhalb des Bildschirms
            if (this.pos.y > k.height() + 50) {
              obstaclesOnScreen--;
              this.destroy();
            }
          }
        },
      },
    ]);
  }

  // Sterne spawnen
  spawnStars(50); // Anfangssterne

  // Spieler
  const ufo = k.add([
    k.pos(k.width() / 2, k.height() - 200),
    k.anchor("center"),
    k.sprite(playerData.sprite, { width: 200, height: 200 }),
    k.area(),
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

  // Steuerung
  k.onKeyDown("left", leftHandler);
  k.onKeyDown("right", rightHandler);
  k.onKeyDown("up", upHandler);
  k.onKeyDown("down", downHandler);
  k.onKeyRelease(releaseHandler);

  // Kollisionen
  ufo.onCollide("obstacle", (obstacle) => {
    // Spiel pausieren und Frage anzeigen
    if (!gamePaused) {
      gamePaused = true;
      obstacle.destroy();
      obstaclesOnScreen--;
      showQuestion();
    }
  });

  // Hindernisse spawnen
  const obstacleSpawnInterval = 1; // Intervall zum Überprüfen des Spawns

  const obstacleLoop = k.loop(obstacleSpawnInterval, () => {
    if (!gamePaused) {
      spawnObstacle();
    }
  });

  // Sterne spawnen
  const starsLoop = k.loop(1, () => {
    spawnStars(10);
  });

  // Hund spawnen
  let dog;
  function spawnDog() {
    dog = k.add([
      k.rect(50, 50),
      k.color(139, 69, 19), // Braune Farbe für den Hund
      k.pos(k.rand(0, k.width()), k.rand(0, k.height() / 2)),
      k.area(),
      k.rotate(0),
      "dog",
      { z: 0 },
      {
        dir: k.vec2(k.rand(-1, 1), k.rand(-1, 1)).unit(),
        speed: SPEED / 8,
        rotationSpeed: k.rand(-30, 30),
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
          k.rect(50, 50),
          k.color(139, 69, 19),
          k.pos(-50, 0),
          k.anchor("center"),
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
      k.rect(100, 100),
      k.color(255, 0, 0), // Rote Farbe für die Besitzerin
      k.pos(k.rand(0, k.width()), -100), // Startet oberhalb des Bildschirms
      k.anchor("center"),
      k.area(),
      "owner",
      { z: 0 },
      {
        update() {
          if (!gamePaused) {
            // Besitzerin bewegt sich langsam nach unten
            this.move(k.DOWN.scale(SPEED / 4));

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
        divisionQuestions[
          Math.floor(Math.random() * divisionQuestions.length)
        ];
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
      k.text(question.question, { size: 24, width: k.width() - 40 }),
      k.pos(k.width() - 100, k.height() / 2 - 100),
      k.anchor("center"),
      k.color(255, 255, 255),
      { z: 200 },
    ]);

    // Optionen anzeigen
    const optionButtons = [];
    const optionTexts = [];
    const optionCount = question.options.length;
    const buttonWidth = 200;
    const buttonHeight = 50;
    const spacing = 20;
    const totalHeight =
      optionCount * buttonHeight + (optionCount - 1) * spacing;
    const startY = k.height() / 2 - totalHeight / 2 + 50;

    question.options.forEach((option, index) => {
      const button = k.add([
        k.rect(buttonWidth, buttonHeight),
        k.pos(k.width() / 2, startY + index * (buttonHeight + spacing)),
        k.anchor("center"),
        k.color(100, 100, 100),
        k.area(),
        "optionButton",
        { option },
        { z: 200 },
      ]);

      const buttonText = k.add([
        k.text(option.toString(), { size: 24 }),
        k.pos(k.width() / 2, startY + index * (buttonHeight + spacing)),
        k.anchor("center"),
        k.color(255, 255, 255),
        { z: 200 },
      ]);

      button.onClick(() => {
        if (option === question.answer) {
          // Richtige Antwort
          k.destroy(questionText); // Frage entfernen
          optionButtons.forEach((btn) => {
            k.destroy(btn);
          });
          optionTexts.forEach((txt) => {
            k.destroy(txt);
          });
          gamePaused = false;
        } else {
          // Falsche Antwort
          k.debug.log("Falsche Antwort. Versuche es erneut.");
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

    // Zielgrafik anzeigen
    /*k.add([
      k.sprite("goal"),
      k.pos(k.width() / 2, k.height() / 2 - 100),
      k.anchor("center"),
      { z: 200 },
    ]);*/

    // Nachricht anzeigen
    k.add([
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
      k.area(),
      { z: 200 },
    ]);

    k.add([
      k.text("Spiel neu starten", { size: 24 }),
      k.pos(k.width() / 2, k.height() / 2 + 100),
      k.anchor("center"),
      k.color(255, 255, 255),
      { z: 200 },
    ]);

    restartButton.onClick(() => {
      // Stoppe alle Loops
      obstacleLoop.cancel();
      starsLoop.cancel();

      k.go("intro");
    });
  }
});

// Spiel starten
k.go("intro");
