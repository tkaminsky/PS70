/**
 * 
 * Game configurations.
 * @name configurations
 */

// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase, ref, child, get } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

var theremin_data = 0.0;
var data_med = 400.0;
var data_range = 800.0;
const max_velocity = 800.0;
var vel = 0.0;

var ip = "192.168.0.174"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDj0LYrOzL3A_ndM9VDvh1I6FfFOkun600",
  authDomain: "ther-e-man.firebaseapp.com",
//   databaseURL: "https://ther-e-man-default-rtdb.firebaseio.com",
  databaseURL: "https://ther-e-man-default-rtdb.firebaseio.com/",
  projectId: "ther-e-man",
  storageBucket: "ther-e-man.appspot.com",
  messagingSenderId: "184198395672",
  appId: "1:184198395672:web:a686ee96d0c253f31c906d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const dbRef = ref(getDatabase());

// IP address and port of the server
const ipAddress = "192.168.0.174"; // Change to the IP address of your Arduino
// Replace 'http://arduino_ip_address' with the IP address of your Arduino
const url = 'http://192.168.0.174';





async function updateDataAsync() {
    fetch(url)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(html => {
        // console.log('response ok')
        console.log(html); // Print the HTML content of the Arduino website
        // You can parse/process the HTML content here as needed
        theremin_data = parseFloat(html);
        // return html;
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function updateThereminData() {
    get(child(dbRef, `signal`)).then((snapshot) => {
        if (snapshot.exists()) {
          theremin_data = snapshot.val();
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
}

const configurations = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

/**
 *  Game assets.
 *  @name assets
 */
const assets = {
    bird: {
        red: 'bird-red',
        yellow: 'bird-yellow',
        blue: 'bird-blue'
    },
    obstacle: {
        pipe: {
            green: {
                top: 'pipe-green-top',
                bottom: 'pipe-green-bottom'
            },
            red: {
                top: 'pipe-red-top',
                bottom: 'pipe-red-bo'
            }
        }
    },
    scene: {
        width: 400,
        background: {
            day: 'background-day',
            night: 'background-night'
        },
        ground: 'ground',
        gameOver: 'game-over',
        restart: 'restart-button',
        messageInitial: 'message-initial'
    },
    scoreboard: {
        width: 25,
        base: 'number',
        number0: 'number0',
        number1: 'number1',
        number2: 'number2',
        number3: 'number3',
        number4: 'number4',
        number5: 'number5',
        number6: 'number6',
        number7: 'number7',
        number8: 'number8',
        number9: 'number9'
    },
    animation: {
        bird: {
            red: {
                clapWings: 'red-clap-wings',
                stop: 'red-stop'
            },
            blue: {
                clapWings: 'blue-clap-wings',
                stop: 'blue-stop'
            },
            yellow: {
                clapWings: 'yellow-clap-wings',
                stop: 'yellow-stop'
            }
        },
        ground: {
            moving: 'moving-ground',
            stop: 'stop-ground'
        }
    }
}

// Game
/**
 * The main controller for the entire Phaser game.
 * @name game
 * @type {object}
 */
const game = new Phaser.Game(configurations)
/**
 * If it had happened a game over.
 * @type {boolean}
 */
let gameOver
/**
 * If the game has been started.
 * @type {boolean}
 */
let gameStarted
/**
 * Up button component.
 * @type {object}
 */
let upButton
/**
 * Down button component.
 * @type {object}
 */
let downButton
/**
 * Restart button component.
 * @type {object}
 */
let restartButton
/**
 * Game over banner component.
 * @type {object}
 */
let gameOverBanner
/**
 * Message initial component.
 * @type {object}
 */
let messageInitial
// Bird
/**
 * Player component.
 * @type {object}
 */
let player
/**
 * Bird name asset.
 * @type {string}
 */
let birdName
/**
 * Quantity frames to move up.
 * @type {number}
 */
let framesMoveUp
// Background
/**
 * Day background component.
 * @type {object}
 */
let backgroundDay
/**
 * Night background component.
 * @type {object}
 */
let backgroundNight
/**
 * Ground component.
 * @type {object}
 */
let ground
// pipes
/**
 * Pipes group component.
 * @type {object}
 */
let pipesGroup
/**
 * Gaps group component.
 * @type {object}
 */
let gapsGroup
/**
 * Counter till next pipes to be created.
 * @type {number}
 */
let nextPipes
/**
 * Current pipe asset.
 * @type {object}
 */
let currentPipe
// score variables
/**
 * Scoreboard group component.
 * @type {object}
 */
let scoreboardGroup
/**
 * Score counter.
 * @type {number}
 */
let score

/**
 *   Load the game assets.
 */
function preload() {
    // Backgrounds and ground
    this.load.image(assets.scene.background.day, 'assets_new/background.png')
    this.load.image(assets.scene.background.night, 'assets_new/nebula.jpeg')
    // this.load.spritesheet(assets.scene.ground, 'assets/ground-sprite.png', {
    //     frameWidth: 336,
    //     frameHeight: 112
    // })

    // Pipes
    this.load.image(assets.obstacle.pipe.green.top, 'assets_new/explosion_top.png')
    this.load.image(assets.obstacle.pipe.green.bottom, 'assets_new/explosion_bottom.png')
    this.load.image(assets.obstacle.pipe.red.top, 'assets_new/explosion_top.png')
    this.load.image(assets.obstacle.pipe.red.bottom, 'assets_new/explosion_bottom.png')

    // Start game
    this.load.image(assets.scene.messageInitial, 'assets/message-initial.png')

    // End game
    this.load.image(assets.scene.gameOver, 'assets/gameover.png')
    this.load.image(assets.scene.restart, 'assets/restart-button.png')

    // Birds
    this.load.spritesheet(assets.bird.red, 'assets_new/ship.png', {
        frameWidth: 94,
        frameHeight: 64
    })
    this.load.spritesheet(assets.bird.blue, 'assets_new/spaceship/Fighter/Turn_1.png', {
        frameWidth: 34,
        frameHeight: 24
    })
    this.load.spritesheet(assets.bird.yellow, 'assets_new/spaceship/Fighter/Turn_1.png', {
        frameWidth: 34,
        frameHeight: 24
    })

    // Numbers
    this.load.image(assets.scoreboard.number0, 'assets/number0.png')
    this.load.image(assets.scoreboard.number1, 'assets/number1.png')
    this.load.image(assets.scoreboard.number2, 'assets/number2.png')
    this.load.image(assets.scoreboard.number3, 'assets/number3.png')
    this.load.image(assets.scoreboard.number4, 'assets/number4.png')
    this.load.image(assets.scoreboard.number5, 'assets/number5.png')
    this.load.image(assets.scoreboard.number6, 'assets/number6.png')
    this.load.image(assets.scoreboard.number7, 'assets/number7.png')
    this.load.image(assets.scoreboard.number8, 'assets/number8.png')
    this.load.image(assets.scoreboard.number9, 'assets/number9.png')
}

/**
 *   Create the game objects (images, groups, sprites and animations).
 */
function create() {
    backgroundDay = this.add.image(assets.scene.width, 300, assets.scene.background.day).setInteractive()
    backgroundDay.setScale(2.5)
    backgroundDay.on('pointerdown', moveBirdUp)
    backgroundNight = this.add.image(assets.scene.width, 300, assets.scene.background.night).setInteractive()
    backgroundNight.setScale(.7)
    backgroundNight.visible = false
    backgroundNight.on('pointerdown', moveBirdUp)

    gapsGroup = this.physics.add.group()
    pipesGroup = this.physics.add.group()
    scoreboardGroup = this.physics.add.staticGroup()

    // ground = this.physics.add.sprite(assets.scene.width, 458, assets.scene.ground)
    // ground.setCollideWorldBounds(true)
    // ground.setDepth(10)

    messageInitial = this.add.image(assets.scene.width, 300, assets.scene.messageInitial)
    messageInitial.setDepth(30)
    messageInitial.setScale(1.5)
    messageInitial.visible = false

    upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
    downButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)

    // Red Bird Animations

    this.anims.create({
        key: assets.animation.bird.red.clapWings,
        frames: this.anims.generateFrameNumbers(assets.bird.red, {
            start: 0,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.bird.red.stop,
        frames: [{
            key: assets.bird.red,
            frame: 0
        }],
        frameRate: 20
    })

    // Blue Bird animations
    this.anims.create({
        key: assets.animation.bird.blue.clapWings,
        frames: this.anims.generateFrameNumbers(assets.bird.blue, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.bird.blue.stop,
        frames: [{
            key: assets.bird.blue,
            frame: 1
        }],
        frameRate: 20
    })

    // Yellow Bird animations
    this.anims.create({
        key: assets.animation.bird.yellow.clapWings,
        frames: this.anims.generateFrameNumbers(assets.bird.yellow, {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    })
    this.anims.create({
        key: assets.animation.bird.yellow.stop,
        frames: [{
            key: assets.bird.yellow,
            frame: 1
        }],
        frameRate: 20
    })

    prepareGame(this)

    gameOverBanner = this.add.image(assets.scene.width, 206, assets.scene.gameOver)
    gameOverBanner.setDepth(20)
    gameOverBanner.visible = false

    restartButton = this.add.image(assets.scene.width, 300, assets.scene.restart).setInteractive()
    restartButton.on('pointerdown', restartGame)
    restartButton.setDepth(20)
    restartButton.visible = false
}

/**
 *  Update the scene frame by frame, responsible for move and rotate the bird and to create and move the pipes.
 */
function update() {
    if (gameOver || !gameStarted)
        return

    // updateThereminData();
    updateDataAsync();
    // console.log(theremin_data);

    if (framesMoveUp > 0)
        framesMoveUp--
    else if (framesMoveUp < 0)
        framesMoveUp++
    else
        updateVel();
    // else if (theremin_data > data_med)
    //     moveBirdUp()
    // else if (theremin_data < data_med)
    //     moveBirdDown()
    // else if (Phaser.Input.Keyboard.JustDown(upButton))
    //     moveBirdUp()
    // else if (Phaser.Input.Keyboard.JustDown(downButton))
    //     moveBirdDown()


        // if (player.angle < 90)
        //     player.angle += 1

    pipesGroup.children.iterate(function (child) {
        if (child == undefined)
            return

        if (child.x < -50)
            child.destroy()
        else
            child.setVelocityX(-200)
    })

    gapsGroup.children.iterate(function (child) {
        child.body.setVelocityX(-200)
    })

    nextPipes++
    if (nextPipes === 100) {
        makePipes(game.scene.scenes[0])
        nextPipes = 0
    }
}

/**
 *  Bird collision event.
 *  @param {object} player - Game object that collided, in this case the bird. 
 */
function hitBird(player) {
    this.physics.pause()

    gameOver = true
    gameStarted = false

    player.anims.play(getAnimationBird(birdName).stop)
    // ground.anims.play(assets.animation.ground.stop)

    gameOverBanner.visible = true
    restartButton.visible = true
}

/**
 *   Update the scoreboard.
 *   @param {object} _ - Game object that overlapped, in this case the bird (ignored).
 *   @param {object} gap - Game object that was overlapped, in this case the gap.
 */
function updateScore(_, gap) {
    score++
    gap.destroy()

    if (score % 10 == 0) {
        backgroundDay.visible = !backgroundDay.visible
        backgroundNight.visible = !backgroundNight.visible

        if (currentPipe === assets.obstacle.pipe.green)
            currentPipe = assets.obstacle.pipe.red
        else
            currentPipe = assets.obstacle.pipe.green
    }

    updateScoreboard()
}

/**
 * Create pipes and gap in the game.
 * @param {object} scene - Game scene.
 */
function makePipes(scene) {
    if (!gameStarted || gameOver) return

    const pipeTopY = Phaser.Math.Between(-150, 120)

    const gap = scene.add.line(800, pipeTopY + 210, 0, 0, 0, 1600)
    gapsGroup.add(gap)
    gap.body.allowGravity = false
    gap.visible = false

    const pipeTop = pipesGroup.create(800, pipeTopY, currentPipe.top)
    pipeTop.setScale(.75)
    pipeTop.body.allowGravity = false

    const pipeBottom = pipesGroup.create(800, pipeTopY + 700, currentPipe.bottom)
    pipeBottom.setScale(.75)
    pipeBottom.body.allowGravity = false
}

/**
 * Move the bird in the screen.
 */
function moveBirdUp() {
    if (gameOver)
        return

    if (!gameStarted)
        startGame(game.scene.scenes[0])

    player.setVelocityY(-50)
    player.angle = 0
    framesMoveUp = 5
}

function moveBirdDown() {
    if (gameOver)
        return

    if (!gameStarted)
        startGame(game.scene.scenes[0])

    player.setVelocityY(50)
    player.angle = 0
    framesMoveUp = -5
}

function updateVel() {
    vel = theremin_data - data_med;
    vel = vel / data_range;
    vel = vel * max_velocity;
    player.setVelocityY(-vel);
    if (vel < 0) {
        framesMoveUp = 5;
    }
    else if (vel > 0) {
        framesMoveUp = -5;
    }
}

/**
 * Get a random bird color.
 * @return {string} Bird color asset.
 */
function getRandomBird() {
    switch (Phaser.Math.Between(0, 2)) {
        case 0:
            return assets.bird.red
        case 1:
            return assets.bird.blue
        case 2:
        default:
            return assets.bird.yellow
    }
}

/**
 * Get the animation name from the bird.
 * @param {string} birdColor - Game bird color asset.
 * @return {object} - Bird animation asset.
 */
function getAnimationBird(birdColor) {
    switch (birdColor) {
        case assets.bird.red:
            return assets.animation.bird.red
        case assets.bird.blue:
            return assets.animation.bird.blue
        case assets.bird.yellow:
        default:
            return assets.animation.bird.yellow
    }
}

/**
 * Update the game scoreboard.
 */
function updateScoreboard() {
    scoreboardGroup.clear(true, true)

    const scoreAsString = score.toString()
    if (scoreAsString.length == 1)
        scoreboardGroup.create(assets.scene.width, 30, assets.scoreboard.base + score).setDepth(10)
    else {
        let initialPosition = assets.scene.width - ((score.toString().length * assets.scoreboard.width) / 2)

        for (let i = 0; i < scoreAsString.length; i++) {
            scoreboardGroup.create(initialPosition, 30, assets.scoreboard.base + scoreAsString[i]).setDepth(10)
            initialPosition += assets.scoreboard.width
        }
    }
}

/**
 * Restart the game. 
 * Clean all groups, hide game over objects and stop game physics.
 */
function restartGame() {
    pipesGroup.clear(true, true)
    pipesGroup.clear(true, true)
    gapsGroup.clear(true, true)
    scoreboardGroup.clear(true, true)
    player.destroy()
    gameOverBanner.visible = false
    restartButton.visible = false

    const gameScene = game.scene.scenes[0]
    prepareGame(gameScene)

    gameScene.physics.resume()
}

/**
 * Restart all variable and configurations, show main and recreate the bird.
 * @param {object} scene - Game scene.
 */
function prepareGame(scene) {
    framesMoveUp = 0
    nextPipes = 0
    currentPipe = assets.obstacle.pipe.green
    score = 0
    gameOver = false
    backgroundDay.visible = true
    backgroundNight.visible = false
    messageInitial.visible = true

    // birdName = getRandomBird()
    birdName = assets.bird.red
    player = scene.physics.add.sprite(60, 265, birdName)
    player.setScale(.5)
    player.setCollideWorldBounds(true)
    player.anims.play(getAnimationBird(birdName).clapWings, true)
    player.body.allowGravity = false

    // scene.physics.add.collider(player, ground, hitBird, null, scene)
    scene.physics.add.collider(player, pipesGroup, hitBird, null, scene)

    scene.physics.add.overlap(player, gapsGroup, updateScore, null, scene)

    // ground.anims.play(assets.animation.ground.moving, true)
}

/**
 * Start the game, create pipes and hide the main menu.
 * @param {object} scene - Game scene.
 */
function startGame(scene) {
    gameStarted = true
    messageInitial.visible = false

    const score0 = scoreboardGroup.create(assets.scene.width, 30, assets.scoreboard.number0)
    score0.setDepth(20)

    makePipes(scene)
}