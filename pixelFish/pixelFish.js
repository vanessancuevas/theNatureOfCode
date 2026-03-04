// Pixel Fish — Neuroevolution Edition
// Fish navigate to food using a small neural network brain.
// After each generation, fitness-weighted selection + mutation
// evolves smarter hunting behaviour over time.

// ─── Global state ────────────────────────────────────────────────────────────
let fish = [];
let foodParticles = [];
let fishLeftImg, fishRightImg;
let coloredFishImages = {};
let liquid;

// Evolution
let generation      = 1;
let genTimer        = 0;
let newGenFlash     = 0;   // frames remaining for "NEW GENERATION" banner
let lastBestFitness = 0;
let lastAvgFitness  = 0;

const GEN_DURATION  = 1200;  // frames per generation (~20 s at 60 fps)
const FOOD_RATE     = 90;    // auto-spawn 1 food pellet every N frames
const MUTATION_RATE = 0.1;
const ELITISM       = 2;     // top N fish carry brains unchanged
const STARVATION    = 500;   // frames without eating → isDead

// ─── Fish SVG assets (embedded base64) ───────────────────────────────────────
const fishLeftSVG = `data:image/svg+xml;base64,${btoa(`<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 309.84382 309.84375">
  <path d="M61.96873,123.9375c.02522-10.31219-.01862-20.67218,0-30.98438h30.98438V30.98438h30.98438V0h61.96878v30.98438h-30.98438v30.98438h-30.98438v30.98438h30.98438c.03745,10.31195-.05077,20.67255,0,30.98438,10.31247-.00812,20.67194.01263,30.98438,0,.05078-10.31183-.03745-20.67249,0-30.98438h92.95316v30.98438c-30.96741.02826-61.98575-.0379-92.95316,0-.05078,10.31183.03745,20.67249,0,30.98438h-30.98438c-.03745-10.31195.05077-20.67255,0-30.98438-30.96553.02429-61.98862-.16144-92.95316,0-.02522,10.31177-.02522,20.67261,0,30.98438,10.31219.02521,20.6722-.01862,30.98438,0v30.98438h-30.98438c-.01862-10.31219.02522-20.67218,0-30.98438-10.31177-.02521-20.67262-.02521-30.98438,0-.10756,20.63269-.1081,41.33612,0,61.96875,41.29321.21637,82.64371-.16156,123.93754,0v-30.98438c20.63959-.0202,41.32919.02716,61.96878,0,.02524-10.31219-.01862-20.67218,0-30.98438h61.96878v30.98438c-20.63959.0202-41.32919-.02716-61.96878,0-.02524,10.31177-.02524,20.67261,0,30.98438,30.96579-.16223,61.98688.12097,92.95316,0v30.98438h-92.95316c-.01862-10.31219.02524-20.67218,0-30.98438-10.31177.05402-20.67252-.03986-30.98438,0v30.98438h-61.96877v30.98438c20.63852.10815,41.32994-.08038,61.96877,0v30.98438h-61.96877v-30.98438c-10.31175-.05402-20.6725.03986-30.98438,0v-30.98438H30.98438c-.03984-10.31189.05403-20.67261,0-30.98438-10.31176-.05402-20.6725.03986-30.98438,0v-61.96875c10.31219-.01862,20.67219.02521,30.98438,0,.05377-10.31348-.03591-20.67584-.00518-30.98956,10.31371-.03076,20.67608.05896,30.98956.00519h-.00003Z"/>
</svg>`)}`;

const fishRightSVG = `data:image/svg+xml;base64,${btoa(`<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_3" data-name="Layer 3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 309.84378 309.84375">
  <path d="M154.92191,123.9375c.05078-10.31183-.03741-20.67249,0-30.98438h30.98438v-30.98438h-30.98438v-30.98438h-30.98438V0h61.96875v30.98438h30.98438v61.96875h30.98438c.01862,10.31219-.02521,20.67218,0,30.98438,10.31348.05377,20.67584-.03589,30.98956-.00519.03076,10.31372-.05896,20.67609-.00519,30.98956,10.31219.02521,20.67218-.01862,30.98438,0v61.96875c-10.31189.03986-20.67261-.05402-30.98438,0-.05402,10.31177.03986,20.67249,0,30.98438h-61.96875v30.98438c-10.31189.03986-20.67261-.05402-30.98438,0v30.98438h-61.96875v-30.98438c20.63879-.08038,41.33026.10815,61.96875,0v-30.98438h-61.96875v-30.98438c-10.31189-.03986-20.67261.05402-30.98438,0-.02521,10.31219.01862,20.67218,0,30.98438H0v-30.98438c30.96625.12097,61.98734-.16223,92.95316,0,.02521-10.31177.02521-20.67261,0-30.98438-20.63959-.02716-41.32916.0202-61.96878,0v-30.98438h61.96878c.01862,10.31219-.02521,20.67218,0,30.98438,20.63959.02716,41.32916-.0202,61.96875,0v30.98438c41.29382-.16156,82.64435.21637,123.93756,0,.10809-20.63263.10754-41.33612,0-61.96875-10.31177-.02521-20.67261-.02521-30.98438,0-.02521,10.31219.01862,20.67218,0,30.98438h-30.98438v-30.98438c10.31219-.01862,20.67218.02521,30.98438,0,.02521-10.31177.02521-20.67261,0-30.98438-30.96454-.16144-61.98761.02429-92.95312,0-.05078,10.31183.03741,20.67249,0,30.98438h-30.98438c-.03741-10.31195.05078-20.67255,0-30.98438-30.96741-.0379-61.98572.02826-92.95316,0v-30.98438h92.95316c.03741,10.31195-.05078,20.67255,0,30.98438,10.31244.01263,20.67194-.00812,30.98438,0h-.00006Z"/>
</svg>`)}`;

const rainbowColors = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF',
  '#4B0082', '#9400D3', '#FF1493', '#00CED1', '#FF69B4',
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function createColoredFish(img, colorHex, size) {
  let pg = createGraphics(size, size);
  pg.image(img, 0, 0, size, size);
  pg.loadPixels();
  let c = color(colorHex);
  for (let i = 0; i < pg.pixels.length; i += 4) {
    if (pg.pixels[i + 3] > 0) {
      pg.pixels[i]     = red(c);
      pg.pixels[i + 1] = green(c);
      pg.pixels[i + 2] = blue(c);
    }
  }
  pg.updatePixels();
  return pg;
}

// ─── NeuralNetwork ────────────────────────────────────────────────────────────
// 5 inputs → 8 hidden (tanh) → 2 outputs (tanh)
class NeuralNetwork {
  constructor() {
    // Weight matrices stored as flat arrays, row-major
    // W1: 8×5  (hidden × inputs)
    // b1: 8
    // W2: 2×8  (outputs × hidden)
    // b2: 2
    this.W1 = Array.from({ length: 8 * 5 }, () => random(-1, 1));
    this.b1 = Array.from({ length: 8 },     () => random(-1, 1));
    this.W2 = Array.from({ length: 2 * 8 }, () => random(-1, 1));
    this.b2 = Array.from({ length: 2 },     () => random(-1, 1));
  }

  // tanh activation
  _tanh(x) {
    return Math.tanh(x);
  }

  // Matrix-vector multiply + bias, then apply tanh
  // W: flat row-major [rows×cols], x: [cols], b: [rows] → [rows]
  _layer(W, b, x, rows, cols) {
    let out = new Array(rows);
    for (let r = 0; r < rows; r++) {
      let sum = b[r];
      for (let c = 0; c < cols; c++) {
        sum += W[r * cols + c] * x[c];
      }
      out[r] = this._tanh(sum);
    }
    return out;
  }

  // Returns [ax, ay] in range [-1, 1]
  forward(inputs) {
    let hidden  = this._layer(this.W1, this.b1, inputs, 8, 5);
    let outputs = this._layer(this.W2, this.b2, hidden,  2, 8);
    return outputs;
  }

  copy() {
    let nn = new NeuralNetwork();
    nn.W1 = this.W1.slice();
    nn.b1 = this.b1.slice();
    nn.W2 = this.W2.slice();
    nn.b2 = this.b2.slice();
    return nn;
  }

  mutate(rate = MUTATION_RATE) {
    const perturb = arr => arr.map(w =>
      random(1) < rate ? w + randomGaussian(0, 0.2) : w
    );
    this.W1 = perturb(this.W1);
    this.b1 = perturb(this.b1);
    this.W2 = perturb(this.W2);
    this.b2 = perturb(this.b2);
  }
}

// ─── Fish ─────────────────────────────────────────────────────────────────────
class Fish {
  constructor(colorHex, brain) {
    this.size        = 60;
    // Spawn fully inside the tank (clear of waterline and bottom edge)
    this.position    = createVector(
      random(width),
      random(height / 4 + this.size / 2, height - this.size / 2)
    );
    this.velocity    = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.maxSpeed    = 3;
    this.maxForce    = 0.4;
    this.colorHex    = colorHex;

    // Neuroevolution
    this.brain       = brain || new NeuralNetwork();
    this.fitness     = 0;       // food eaten this generation
    this.isDead      = false;
    this.noFoodTimer = 0;       // frames since last meal
  }

  // Gather sensory inputs and let the brain decide steering
  think() {
    // Find nearest food
    let nearest  = null;
    let minDist  = Infinity;
    for (let f of foodParticles) {
      if (f.isEaten) continue;
      let d = p5.Vector.dist(this.position, f.position);
      if (d < minDist) { minDist = d; nearest = f; }
    }

    let diagonal = dist(0, 0, width, height); // canvas diagonal

    let inputs;
    if (nearest) {
      let dx   = nearest.position.x - this.position.x;
      let dy   = nearest.position.y - this.position.y;
      let ang  = Math.atan2(dy, dx);
      inputs = [
        Math.sin(ang),                          // 0: sin(angle to food)
        Math.cos(ang),                          // 1: cos(angle to food)
        constrain(minDist / diagonal, 0, 1),    // 2: normalised distance
        this.velocity.x / this.maxSpeed,        // 3: own vx
        this.velocity.y / this.maxSpeed,        // 4: own vy
      ];
    } else {
      inputs = [
        0, 0, 1,                                // no food: distance = max
        this.velocity.x / this.maxSpeed,
        this.velocity.y / this.maxSpeed,
      ];
    }

    let [ax, ay] = this.brain.forward(inputs);
    this.acceleration = createVector(ax * this.maxForce, ay * this.maxForce);
  }

  update() {
    if (this.isDead) return;

    this.noFoodTimer++;
    if (this.noFoodTimer > STARVATION) {
      this.isDead = true;
      return;
    }

    this.think();

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    // Check eating
    for (let i = foodParticles.length - 1; i >= 0; i--) {
      let f = foodParticles[i];
      if (f.isEaten) continue;
      let d = p5.Vector.dist(this.position, f.position);
      if (d < this.size / 2 + f.radius) {
        f.isEaten     = true;
        this.fitness++;
        this.noFoodTimer = 0;
      }
    }
  }

  checkEdges() {
    if (this.isDead) return;

    if (this.position.x > width)  this.position.x = 0;
    if (this.position.x < 0)      this.position.x = width;

    // Keep fish below waterline
    let waterline = height / 4 + this.size / 2;
    if (this.position.y < waterline) {
      this.position.y = waterline;
      this.velocity.y *= -0.5;
    }
    if (this.position.y > height) this.position.y = height - this.size / 2;
  }

  display(isLeader) {
    push();
    translate(this.position.x, this.position.y);

    if (this.isDead) {
      // Faded grey tint
      tint(180, 180, 180, 100);
    }

    // Gold ring around current leader
    if (isLeader && !this.isDead) {
      noFill();
      stroke(255, 215, 0);
      strokeWeight(3);
      circle(0, 0, this.size + 14);
    }

    let direction    = this.velocity.x < -0.5 ? 'left' : 'right';
    let currentFish  = coloredFishImages[this.colorHex][direction];
    if (currentFish) {
      imageMode(CENTER);
      image(currentFish, 0, 0);
    }

    noTint();
    pop();
  }
}

// ─── FoodParticle ─────────────────────────────────────────────────────────────
class FoodParticle {
  constructor(x, y) {
    this.position     = createVector(x, y);
    this.velocity     = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.mass         = random(0.5, 2);
    this.radius       = this.mass * 4;
    this.isEaten      = false;
  }

  applyForce(force) {
    let f = p5.Vector.div(force, this.mass);
    this.acceleration.add(f);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  checkEdges() {
    if (this.position.y > height - this.radius) {
      this.position.y  = height - this.radius;
      this.velocity.y *= -0.5;
    }
  }

  display() {
    push();
    fill(139, 69, 19);
    noStroke();
    circle(this.position.x, this.position.y, this.radius * 2);
    pop();
  }
}

// ─── Liquid ───────────────────────────────────────────────────────────────────
class Liquid {
  constructor(x, y, w, h, c) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.c = c;
  }

  contains(particle) {
    let pos = particle.position;
    return (pos.x > this.x && pos.x < this.x + this.w &&
            pos.y > this.y && pos.y < this.y + this.h);
  }

  drag(particle) {
    let speed         = particle.velocity.mag();
    let dragMagnitude = this.c * speed * speed;
    let drag          = particle.velocity.copy();
    drag.mult(-1);
    drag.normalize();
    drag.mult(dragMagnitude);
    return drag;
  }

  show() {
    for (let y = this.y; y < this.y + this.h; y++) {
      let inter = map(y, this.y, this.y + this.h, 0, 1);
      let c     = lerpColor(color(135, 206, 250), color(0, 105, 148), inter);
      stroke(c);
      line(this.x, y, this.x + this.w, y);
    }
    strokeWeight(3);
    stroke(0, 105, 148);
    line(this.x, this.y, this.x + this.w, this.y);
    strokeWeight(1);
  }
}

// ─── Evolution ────────────────────────────────────────────────────────────────
function nextGeneration() {
  // Sort descending by fitness
  fish.sort((a, b) => b.fitness - a.fitness);

  // Record stats
  lastBestFitness = fish[0].fitness;
  let total       = fish.reduce((s, f) => s + f.fitness, 0);
  lastAvgFitness  = total / fish.length;

  // Build fitness-proportional mating pool
  let pool = [];
  for (let f of fish) {
    let times = f.fitness + 1; // +1 so even 0-fitness fish can reproduce
    for (let t = 0; t < times; t++) pool.push(f);
  }

  let newFish = [];

  // Elites carry over unchanged
  for (let i = 0; i < ELITISM; i++) {
    let colorHex = rainbowColors[i % rainbowColors.length];
    let elite    = new Fish(colorHex, fish[i].brain.copy());
    newFish.push(elite);
  }

  // Fill remaining slots with mutated offspring
  for (let i = ELITISM; i < fish.length; i++) {
    let parent   = random(pool);
    let childNN  = parent.brain.copy();
    childNN.mutate();
    let colorHex = rainbowColors[i % rainbowColors.length];
    newFish.push(new Fish(colorHex, childNN));
  }

  fish = newFish;
  foodParticles = [];
  generation++;
  genTimer  = 0;
  newGenFlash = 120; // show banner for 2 seconds
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function drawHUD() {
  // Panel background
  push();
  noStroke();
  fill(0, 0, 0, 120);
  rect(8, 8, 220, 80, 6);

  fill(255);
  textSize(14);
  textFont('monospace');
  textAlign(LEFT, TOP);
  text(`GEN ${generation}`,                              18, 16);
  text(`BEST: ${lastBestFitness} eaten`,                 18, 34);
  text(`AVG:  ${lastAvgFitness.toFixed(1)} eaten`,       18, 52);

  // Progress bar
  let progress = genTimer / GEN_DURATION;
  fill(50, 50, 50, 180);
  rect(18, 72, 200, 10, 3);
  fill(80, 200, 120);
  rect(18, 72, 200 * progress, 10, 3);
  pop();

  // "NEW GENERATION" flash
  if (newGenFlash > 0) {
    let alpha = map(newGenFlash, 120, 0, 255, 0);
    push();
    textAlign(CENTER, CENTER);
    textSize(36);
    textFont('monospace');

    // Shadow
    fill(0, 0, 0, alpha * 0.6);
    text('NEW GENERATION', width / 2 + 2, height / 2 + 2);

    fill(255, 230, 0, alpha);
    text('NEW GENERATION', width / 2, height / 2);
    pop();
    newGenFlash--;
  }
}

// ─── p5 lifecycle ─────────────────────────────────────────────────────────────
function preload() {
  fishLeftImg  = loadImage(fishLeftSVG);
  fishRightImg = loadImage(fishRightSVG);
}

function setup() {
  createCanvas(800, 600);

  for (let colorHex of rainbowColors) {
    coloredFishImages[colorHex] = {
      left:  createColoredFish(fishLeftImg,  colorHex, 60),
      right: createColoredFish(fishRightImg, colorHex, 60),
    };
  }

  for (let i = 0; i < 10; i++) {
    let colorHex = rainbowColors[i % rainbowColors.length];
    fish.push(new Fish(colorHex));
  }

  liquid = new Liquid(0, height / 4, width, height * 3 / 4, 0.1);
}

function draw() {
  background(255);
  liquid.show();

  genTimer++;

  // Auto-spawn food at the waterline
  if (genTimer % FOOD_RATE === 0) {
    let x = random(width);
    foodParticles.push(new FoodParticle(x, height / 4));
  }

  // Advance to next generation
  if (genTimer >= GEN_DURATION) {
    nextGeneration();
  }

  // Find current leader (most food, still alive)
  let leaderIdx = -1;
  let leaderFitness = -1;
  for (let i = 0; i < fish.length; i++) {
    if (!fish[i].isDead && fish[i].fitness > leaderFitness) {
      leaderFitness = fish[i].fitness;
      leaderIdx     = i;
    }
  }

  // Update + display fish
  for (let i = 0; i < fish.length; i++) {
    fish[i].update();
    fish[i].checkEdges();
    fish[i].display(i === leaderIdx);
  }

  // Update + display food
  for (let i = foodParticles.length - 1; i >= 0; i--) {
    let food = foodParticles[i];
    if (food.isEaten) { foodParticles.splice(i, 1); continue; }

    let gravity = createVector(0, 0.1 * food.mass);
    food.applyForce(gravity);
    if (liquid.contains(food)) {
      food.applyForce(liquid.drag(food));
    }
    food.update();
    food.checkEdges();
    food.display();
  }

  drawHUD();
}

// Click to drop extra food (fun interaction)
function mouseClicked() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    foodParticles.push(new FoodParticle(mouseX, mouseY));
  }
}
