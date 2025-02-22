/** @type {import("../Typings/phaser*/

window.onload = function () {
    var context = new AudioContext();
    context.resume()

}
//The required config for the Phaser canvas
var config = {
    type: Phaser.AUTO,
    width: 1420,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {

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
//Creates the Phaser game canvas based on the configs
var game = new Phaser.Game(config);
//All of the variables used throughout the game
let player
let rocketPad
let bigAsteroids
let smallAsteroids
let fuel = 1500
let totalSaved = 0
let onPlatform = false
let gameOver = false
let fuelText;
let savedText;
let healthText;
let gameOverText;
let astronaut
let fuelCans
var emmiter
let astroPosition = 0
let music
let refuel
let crash1
let femaleThanks
let maleThanks
let maleThanks2
let healthSound
var randomNum
var damageCounter = 0;
let healthPacks
let gameOverSound
let winSound
let dramaticSound
let lowHealthSound

let four = false
let lowHealth = false


//Preloads all of the assets such as sprites and music
function preload() {
    this.load.image('rocket', "./images/RocketSprite2.png")
    this.load.image('rocketD1', './images/RocketSpriteD1.png')
    this.load.image('rocketD2', './images/RocketSpriteD2.png')
    this.load.image('rocketD3', './images/RocketSpriteD3.png')
    this.load.image('rocketD4', './images/RocketSpriteD4.png')
    this.load.image('platform', "./images/landingPad.png")
    this.load.image('asteroid', './images/asteroid.png')
    this.load.image('smoke', './images/smoke.png')
    this.load.image('astronaut', './images/astronaut.png')
    this.load.image('fuelCan', './images/fuel.png')
    this.load.image('healthPack', './images/healthPack.png')
    this.load.audio("ambient", "./Music/Ambient Space Music - Exoplanet.mp3")
    this.load.audio("refuel", "./Music/Refuel.wav")
    this.load.audio("rocketSound", "./Music/RTrim2.wav")
    this.load.audio("femaleThanks", './Music/FemaleThanks.mp3')
    this.load.audio("maleThanks", './Music/MaleThanks.wav')
    this.load.audio("maleThanks2", './Music/MaleThanks2.wav')
    this.load.audio("crash1", './Music/Crash1.wav')
    this.load.audio("healthSound", './Music/Pickup.wav')
    this.load.audio("winSound", './Music/WinSound.wav')
    this.load.audio('gameOverSound', './Music/GameOverSound.wav')
    this.load.audio('dramaticSound', './Music/DramaticSound2.wav')
    this.load.audio('lowHealthSound', './Music/LowHealth.ogg')

    this.load.multiatlas('rocket2', './images/RocketSheet.json', 'images')

}

function create() {
    //Music
    music = this.sound.add("ambient")
    refuel = this.sound.add("refuel")
    rocketSound = this.sound.add("rocketSound")
    femaleThanks = this.sound.add('femaleThanks')
    maleThanks = this.sound.add('maleThanks')
    maleThanks2 = this.sound.add('maleThanks2')
    crash1 = this.sound.add("crash1")
    healthSound = this.sound.add('healthSound')
    winSound = this.sound.add("winSound")
    gameOverSound = this.sound.add("gameOverSound")
    dramaticSound = this.sound.add("dramaticSound")
    lowHealthSound = this.sound.add('lowHealthSound')
    var musicConfig = {
        mute: false,
        volume: 1,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: true,
        delay: 0
    }
    music.play(musicConfig)

    //Player(Rocket)
    player = this.physics.add.sprite(35, 250, 'rocket')

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setSize(24, 25)
    player.setScale(1.3)
    player.setDrag(1000);
    player.setAngularDrag(900);
    player.setMaxVelocity(600);

    //Astronaut
    astronaut = this.physics.add.group()
    //Health Packs
    healthPacks = this.physics.add.group()
    //Asteroids
    bigAsteroids = this.physics.add.group()
    smallAsteroids = this.physics.add.group()
    //Fuel Cans
    fuelCans = this.physics.add.group()
    //Collision Physics
    this.physics.add.collider(player, rocketPad)
    //Cursors
    cursors = this.input.keyboard.createCursorKeys();
    //Functions
    createAsteroid()
    createFuel()
    createAstronauts()
    createHealthPack()
    //Adding Text
    fuelText = this.add.text(16, 15, '', {
        fontSize: '22px',
        fill: '#FFFFFF'
    });
    healthText = this.add.text(16, 55, '', {
        fontSize: '22px',
        fill: '#FFFFFF'
    })
    savedText = this.add.text(16, 95, '', {
        fontSize: '22px',
        fill: '#FFFFFF'
    })
    gameOverText = this.add.text(520, 300, '', {
        fontSize: '90px',
        fill : '#FFFFFF'
    })
}

function update() {
    //Adds physics to the player and items found in the game, as well as what sound effect plays when they collide
    this.physics.add.overlap(player, fuelCans, collectFuel, null, this);
    this.physics.add.overlap(player, astronaut, rescue, null, this);
    this.physics.add.overlap(player, bigAsteroids, crashBig, null, this);
    this.physics.add.overlap(player, smallAsteroids, crashSmall, null, this);
    this.physics.add.overlap(player, healthPacks, collectHealthPack, null, this);

    //Player movement based on arrow keys. Checks to see that player has fuel
    if (cursors.left.isDown && fuel > 0) {

        player.setAngularVelocity(-200);
        
    } else if (cursors.right.isDown && fuel > 0) {

        player.setAngularVelocity(200);
        
    } else {
        player.setAngularVelocity(0);
    }

    if (cursors.up.isDown && fuel > 0) {

        this.physics.velocityFromRotation(player.rotation, 300, player.body.acceleration);
        fuel--

    } else {
        player.setAcceleration(0)
    }

    //Changing Text
    fuelText.text = 'Fuel: ' + fuel + ' units'
    savedText.text = 'Astronauts Rescued: ' + totalSaved

    //Random number generating for what sound effect will play when the player picks up an astronaut
    randomNum = Phaser.Math.Between(0, 2)
    //This series of if statements checks to see what the players damage count is and sets their sprite and health text accordingly
    if (damageCounter == 0){
        lowHealthSound.stop()
        lowHealth = false
        player.setTexture('rocket')
        healthText.text = 'Health: 100%'
    }else if (damageCounter == 1){
        lowHealthSound.stop()
        lowHealth = false
        player.setTexture('rocketD1')
        healthText.text = 'Health: 75%'
    }else if (damageCounter == 2){
        lowHealthSound.stop()
        lowHealth = false
        player.setTexture('rocketD2')
        healthText.text = 'Health: 50%'
    }else if (damageCounter == 3){
        lowHealthSound.stop()
        lowHealth = false
        player.setTexture('rocketD3')
        healthText.text = 'Health: 25%'
    }
    else if (damageCounter == 4 && lowHealth == false){
        lowHealth = true
        lowHealthSound.play()
        lowHealthSound.volume = .2
        lowHealthSound.loop = true

        player.setTexture('rocketD4')
        healthText.text = 'Health: 1%'

    }//Checks if the player received too much damage and loses the game
    else if (damageCounter > 4){
        lowHealthSound.stop()
        music.stop()
        dramaticSound.stop()
        gameOverSound.play()
        gameOverText.text = "Game Over"
        bigAsteroids.destroy()
        smallAsteroids.destroy()
        healthPacks.destroy()
        fuelCans.destroy()
        player.destroy()
    }
    //This if statement check to see if the player is one astronaut away from winning and plays dramatic music
    if(totalSaved == 4 && four == false){
        four = true
        music.stop()
        dramaticSound.play()
        dramaticSound.loop = true
    }//This checks to see if the player won by rescuing all 5 astronauts
    if(totalSaved == 5){
        lowHealthSound.stop()
        music.stop()
        dramaticSound.stop()
        winSound.play()
        gameOverText.text = "You Won!"
        player.destroy()
    }

}
/** 
 * This function runs every 2.5 seconds and is used to spawn an astronaut outside the right of the canvas
 * It creates them randomly along the y-axis between 0 and 700
 * Their scalve and velocity are also set
 */
function createAstronauts() {
    setInterval(function () {
        var strandedAstronaut = astronaut.create(1490, Phaser.Math.Between(0, 700), 'astronaut')
        strandedAstronaut.body.allowGravity = false
        strandedAstronaut.setScale(.4)
        strandedAstronaut.setVelocity(-300, 0)
    }, 2500)
}
/** 
 * This function runs whenever the player collides with an astronaut
 * It checks to see what randomNum is and plays an astronaut thank you sound effect based on it
 * That astronaut is then 'destroyed'/despawned
 * The user's totalSaved count increases by 1
 */
function rescue(player, strandedAstronaut) {
    var ladyConfig = {
        mute: false,
        volume: 9,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: false,
        delay: 0
    }
    if (randomNum == 0) {
        femaleThanks.play(ladyConfig)
    } else if (randomNum == 1) {
        maleThanks.play()
    } else if (randomNum == 2) {
        maleThanks2.play()
    }
    strandedAstronaut.destroy(strandedAstronaut.x, strandedAstronaut.y)
    totalSaved += 1
}
/**
 * Function used to randomly generate astroids outside of the visible canvas
 * rocks are large asteroids and tinyRocks are smaller ones, each call their respective create functions
 * Their velocities and scales are set, and to make them appear more natural, they spawn at a random angle
 * The function runs every 1.9 seconds
 */
function createAsteroid() {
    setInterval(function () {
        var rock = bigAsteroids.create(1490, Phaser.Math.Between(0, 700), 'asteroid')
        rock.body.immovable = true
        rock.body.allowGravity = false
        rock.setVelocity(-240, 0)
        rock.angle = Phaser.Math.Between(-180, 180)
        rock.setScale(1)

        var tinyRock = smallAsteroids.create(1490, Phaser.Math.Between(0, 700), 'asteroid')
        tinyRock.body.immovable = true
        tinyRock.body.allowGravity = false
        tinyRock.setVelocity(-100, 0)
        tinyRock.angle = Phaser.Math.Between(-180, 180)
        tinyRock.setScale(.5)
    }, 1900)
}
/**
 * Function for when the player crashes with a smaller asteroid
 * A unique sound effect is played and the asteroid is 'destroyed'/despawned
 * The player then receives +1 damage
 */
function crashSmall(player, rock) {
    crash1.play()
    rock.destroy(rock.x, rock.y)
    damageCounter += 1
}
/**
 * Function for when the player crashes with a larger asteroid
 * A unique sound effect is played and the asteroid is 'destroyed'/despawned
 * The player then receives +2 damage
 */
function crashBig(player, rock) {
    crash1.play()
    rock.destroy(rock.x, rock.y)
    damageCounter += 2
}
//This function randomly generates a fuel can ever 2 seconds
function createFuel() {
    setInterval(function () {
        var can = fuelCans.create(1490, Phaser.Math.Between(0, 700), 'fuelCan')
        can.body.allowGravity = false
        can.setVelocity(-200, 0)
        can.setScale(.9)
    }, 2000)
}
/** 
* Function for when the player collects a fuel can
* A unique sound effect is played and the fuel can is 'destroyed'/despawned
* Text indicating that the user received +500 units of fuel appears on the screen for 0.5 seconds
*/
function collectFuel(player, can) {
    refuel.play()
    var text = this.add.text(can.x - 5, can.y - 5, '+500')
    can.destroy(can.x, can.y)
    fuel += 500

    setTimeout(function () {
        text.destroy()
    }, 500)
}
/**
 * Function for randomly generating health packs outside of the canvas
 * A pack is generated every 2 seconds
 */
function createHealthPack(){
    setInterval(function(){
        var pack = healthPacks.create(1490, Phaser.Math.Between(0,700), 'healthPack')
        pack.body.allowGravity = false
        pack.setVelocity(-250, 0)
        pack.setScale(.7)

    },2000)
}
/** 
* Function for when the player collects a health pack
* A unique sound effect is played and the health pack is 'destroyed'/despawned
* If the user's damage counter is greater than 0, then it is decreased by 1, simulating a gain in health
*/
function collectHealthPack(player, pack){
    healthSound.play()
    pack.destroy(pack.x, pack.y)
    if(damageCounter>0){
        damageCounter -= 1
    }
}