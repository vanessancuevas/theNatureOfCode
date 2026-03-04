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

// Rainbow rave rendering
let origPixelIdx = { left: null, right: null }; // pre-computed opaque pixel indices
let rainbowPg    = { left: null,  right: null  }; // reusable graphics (updated each frame)

// Net drop animation
let netY = -1;  // < 0 = inactive; >= 0 = current bottom-edge of net
const NET_SPEED = 7;

// Evolution
let generation      = 1;
let genTimer        = 0;
let newGenFlash     = 0;
let lastBestFitness = 0;
let lastAvgFitness  = 0;

const GEN_DURATION  = 1200;
const FOOD_RATE     = 90;
const MUTATION_RATE = 0.1;
const ELITISM       = 2;

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

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// HSB → RGB (h: 0–360, s/v: 0–100) → [r, g, b] 0–255
function hsbToRgb(h, s, v) {
  s /= 100; v /= 100;
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r, g, b;
  if      (h < 60)  { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

// Rebuild the rainbow fish graphics for this frame (scrolling hue sweep)
function updateRainbowPg(direction) {
  const SIZE = 60;
  let pg = rainbowPg[direction];
  pg.loadPixels();
  pg.pixels.fill(0);
  let t = frameCount * 6;  // 360° per second at 60 fps
  for (let i of origPixelIdx[direction]) {
    let px  = (i / 4) % SIZE;
    let hue = ((px / SIZE) * 360 + t) % 360;
    let [r, g, b] = hsbToRgb(hue, 100, 100);
    pg.pixels[i]     = r;
    pg.pixels[i + 1] = g;
    pg.pixels[i + 2] = b;
    pg.pixels[i + 3] = 255;
  }
  pg.updatePixels();
  return pg;
}

// ─── NeuralNetwork ────────────────────────────────────────────────────────────
// 5 inputs → 8 hidden (tanh) → 2 outputs (tanh)
class NeuralNetwork {
  constructor() {
    this.W1 = Array.from({ length: 8 * 5 }, () => random(-1, 1));
    this.b1 = Array.from({ length: 8 },     () => random(-1, 1));
    this.W2 = Array.from({ length: 2 * 8 }, () => random(-1, 1));
    this.b2 = Array.from({ length: 2 },     () => random(-1, 1));
  }

  _layer(W, b, x, rows, cols) {
    let out = new Array(rows);
    for (let r = 0; r < rows; r++) {
      let sum = b[r];
      for (let c = 0; c < cols; c++) sum += W[r * cols + c] * x[c];
      out[r] = Math.tanh(sum);
    }
    return out;
  }

  forward(inputs) {
    return this._layer(this.W2, this.b2, this._layer(this.W1, this.b1, inputs, 8, 5), 2, 8);
  }

  copy() {
    let nn = new NeuralNetwork();
    nn.W1 = this.W1.slice(); nn.b1 = this.b1.slice();
    nn.W2 = this.W2.slice(); nn.b2 = this.b2.slice();
    return nn;
  }

  mutate(rate = MUTATION_RATE) {
    const p = arr => arr.map(w => random(1) < rate ? w + randomGaussian(0, 0.2) : w);
    this.W1 = p(this.W1); this.b1 = p(this.b1);
    this.W2 = p(this.W2); this.b2 = p(this.b2);
  }
}

// ─── Fish ─────────────────────────────────────────────────────────────────────
class Fish {
  constructor(colorHex, brain) {
    this.size       = 60;
    this.colorHex   = colorHex;
    this.brain      = brain || new NeuralNetwork();
    this.fitness    = 0;
    this.isDropping = true;

    // Spawn above canvas so fish fall through the net into the water
    this.position     = createVector(
      random(this.size / 2, width - this.size / 2),
      random(-180, -this.size)
    );
    this.velocity     = createVector(random(-0.5, 0.5), random(0.5, 2));
    this.acceleration = createVector(0, 0);
    this.maxSpeed     = 3;
    this.maxForce     = 0.4;
  }

  think() {
    let nearest = null;
    let minDist = Infinity;
    for (let f of foodParticles) {
      if (f.isEaten) continue;
      let d = p5.Vector.dist(this.position, f.position);
      if (d < minDist) { minDist = d; nearest = f; }
    }

    const diagonal = dist(0, 0, width, height);
    let inputs;
    if (nearest) {
      let dx  = nearest.position.x - this.position.x;
      let dy  = nearest.position.y - this.position.y;
      let ang = Math.atan2(dy, dx);
      inputs = [
        Math.sin(ang),
        Math.cos(ang),
        constrain(minDist / diagonal, 0, 1),
        this.velocity.x / this.maxSpeed,
        this.velocity.y / this.maxSpeed,
      ];
    } else {
      inputs = [0, 0, 1, this.velocity.x / this.maxSpeed, this.velocity.y / this.maxSpeed];
    }

    let [ax, ay] = this.brain.forward(inputs);
    this.acceleration = createVector(ax * this.maxForce, ay * this.maxForce);

    // Boundary avoidance — push fish away from walls before hard clamp kicks in
    const MARGIN     = 70;
    const waterline  = height / 4 + this.size / 2;
    const bottomEdge = height - this.size / 2;

    if (this.position.y < waterline + MARGIN) {
      this.acceleration.y += map(this.position.y, waterline, waterline + MARGIN, this.maxForce * 2, 0);
    }
    if (this.position.y > bottomEdge - MARGIN) {
      this.acceleration.y -= map(this.position.y, bottomEdge - MARGIN, bottomEdge, 0, this.maxForce * 2);
    }
  }

  // Boids flocking: separation + alignment + cohesion
  // Adds directly onto this.acceleration (call after think())
  flock(others) {
    const SEP_R   = 65;   // hard personal space — stronger than fish radius
    const FLOCK_R = 140;  // neighbourhood for alignment / cohesion

    let sep = createVector(0, 0), sepN = 0;
    let ali = createVector(0, 0), aliN = 0;
    let coh = createVector(0, 0), cohN = 0;

    for (let other of others) {
      if (other === this || other.isDropping) continue;
      let d = p5.Vector.dist(this.position, other.position);

      // Separation — steer away, weighted by proximity
      if (d < SEP_R && d > 0) {
        let away = p5.Vector.sub(this.position, other.position);
        away.div(d);        // closer = stronger
        sep.add(away);
        sepN++;
      }

      // Alignment + cohesion within neighbourhood
      if (d < FLOCK_R) {
        ali.add(other.velocity);
        coh.add(other.position);
        aliN++;
        cohN++;
      }
    }

    // Separation — strongest: fish must not overlap
    if (sepN > 0) {
      sep.div(sepN);
      sep.setMag(this.maxSpeed);
      sep.sub(this.velocity);
      sep.limit(this.maxForce * 2.0);
      this.acceleration.add(sep);
    }

    // Alignment — match heading of neighbours
    if (aliN > 0) {
      ali.div(aliN);
      ali.setMag(this.maxSpeed);
      ali.sub(this.velocity);
      ali.limit(this.maxForce * 0.6);
      this.acceleration.add(ali);
    }

    // Cohesion — drift gently toward centre of mass
    if (cohN > 0) {
      coh.div(cohN);
      let desired = p5.Vector.sub(coh, this.position);
      desired.setMag(this.maxSpeed);
      desired.sub(this.velocity);
      desired.limit(this.maxForce * 0.3);
      this.acceleration.add(desired);
    }
  }

  update() {
    if (this.isDropping) {
      // Gravity-only fall — neural net stays dormant until fish hits water
      this.velocity.y += 0.35;
      this.velocity.x *= 0.97;
      this.velocity.limit(6);
      this.position.add(this.velocity);

      const waterline = height / 4 + this.size / 2;
      if (this.position.y >= waterline) {
        this.isDropping = false;
        this.velocity.set(random(-1, 1), 0);
        this.position.y = waterline;
      }
      return;
    }

    this.think();         // neural net + boundary avoidance → sets acceleration
    this.flock(fish);     // separation / alignment / cohesion → adds to acceleration
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    // Eat food
    for (let i = foodParticles.length - 1; i >= 0; i--) {
      let f = foodParticles[i];
      if (f.isEaten) continue;
      if (p5.Vector.dist(this.position, f.position) < this.size / 2 + f.radius) {
        f.isEaten = true;
        this.fitness++;
      }
    }
  }

  checkEdges() {
    if (this.isDropping) {
      // Keep x inside canvas while falling
      this.position.x = constrain(this.position.x, this.size / 2, width - this.size / 2);
      return;
    }

    // Left / right wrap
    if (this.position.x > width + this.size / 2) this.position.x = -this.size / 2;
    if (this.position.x < -this.size / 2)         this.position.x = width + this.size / 2;

    // Hard clamp top (waterline) and bottom — zero out the offending velocity component
    const waterline  = height / 4 + this.size / 2;
    const bottomEdge = height - this.size / 2;

    if (this.position.y < waterline) {
      this.position.y = waterline;
      if (this.velocity.y < 0) this.velocity.y = abs(this.velocity.y) * 0.3;
    }
    if (this.position.y > bottomEdge) {
      this.position.y = bottomEdge;
      if (this.velocity.y > 0) this.velocity.y = -abs(this.velocity.y) * 0.3;
    }
  }

  display(isLeader) {
    push();
    translate(this.position.x, this.position.y);

    let dir = this.velocity.x < -0.5 ? 'left' : 'right';

    if (isLeader && !this.isDropping) {
      // ★ Rainbow rave — scrolling HSB gradient across the fish body
      imageMode(CENTER);
      image(updateRainbowPg(dir), 0, 0);

    } else if (this.isDropping) {
      // Bright white splash as fish enters from above
      tint(255, 255, 255, 210);
      imageMode(CENTER);
      image(coloredFishImages[this.colorHex][dir], 0, 0);
      noTint();

    } else if (this.fitness === 0) {
      // Never eaten yet — desaturated / ghostly
      tint(180, 180, 180, 170);
      imageMode(CENTER);
      image(coloredFishImages[this.colorHex][dir], 0, 0);
      noTint();

    } else {
      // Normal — own colour
      imageMode(CENTER);
      image(coloredFishImages[this.colorHex][dir], 0, 0);
    }

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
    this.acceleration.add(p5.Vector.div(force, this.mass));
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
    this.x = x; this.y = y; this.w = w; this.h = h; this.c = c;
  }

  contains(p) {
    return p.position.x > this.x && p.position.x < this.x + this.w &&
           p.position.y > this.y && p.position.y < this.y + this.h;
  }

  drag(p) {
    let speed = p.velocity.mag();
    let drag  = p.velocity.copy().mult(-1).normalize().mult(this.c * speed * speed);
    return drag;
  }

  show() {
    for (let y = this.y; y < this.y + this.h; y++) {
      let inter = map(y, this.y, this.y + this.h, 0, 1);
      stroke(lerpColor(color(135, 206, 250), color(0, 105, 148), inter));
      line(this.x, y, this.x + this.w, y);
    }
    strokeWeight(3);
    stroke(0, 105, 148);
    line(this.x, this.y, this.x + this.w, this.y);
    strokeWeight(1);
  }
}

// ─── Net animation ────────────────────────────────────────────────────────────
function drawNet() {
  if (netY < 0) return;

  netY = min(netY + NET_SPEED, height / 4);

  push();
  const CELL = 22;

  // Net mesh
  stroke(160, 120, 50, 210);
  strokeWeight(1.2);
  for (let y = 0; y <= netY; y += CELL) {
    line(0, y, width, y);
  }
  for (let x = 0; x <= width; x += CELL) {
    line(x, 0, x, netY);
  }

  // Knots at intersections
  noStroke();
  fill(120, 80, 30, 220);
  for (let y = 0; y <= netY; y += CELL) {
    for (let x = 0; x <= width; x += CELL) {
      circle(x, y, 4);
    }
  }

  // Leading-edge rope (slightly heavier)
  stroke(120, 80, 30, 255);
  strokeWeight(2.5);
  line(0, netY, width, netY);

  pop();

  if (netY >= height / 4) netY = -1; // animation done
}

// ─── Evolution ────────────────────────────────────────────────────────────────
function nextGeneration() {
  fish.sort((a, b) => b.fitness - a.fitness);

  lastBestFitness = fish[0].fitness;
  lastAvgFitness  = fish.reduce((s, f) => s + f.fitness, 0) / fish.length;

  let pool = [];
  for (let f of fish) {
    for (let t = 0; t < f.fitness + 1; t++) pool.push(f);
  }

  let newFish = [];
  for (let i = 0; i < ELITISM; i++) {
    newFish.push(new Fish(rainbowColors[i % rainbowColors.length], fish[i].brain.copy()));
  }
  for (let i = ELITISM; i < fish.length; i++) {
    let childNN = random(pool).brain.copy();
    childNN.mutate();
    newFish.push(new Fish(rainbowColors[i % rainbowColors.length], childNN));
  }

  fish        = newFish;
  generation++;
  genTimer    = 0;
  newGenFlash = 120;
  netY        = 0;   // drop the net
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function drawHUD() {
  push();
  noStroke();
  fill(0, 0, 0, 120);
  rect(8, 8, 220, 80, 6);

  fill(255);
  textSize(14);
  textFont('monospace');
  textAlign(LEFT, TOP);
  text(`GEN ${generation}`,                        18, 16);
  text(`BEST: ${lastBestFitness} eaten`,            18, 34);
  text(`AVG:  ${lastAvgFitness.toFixed(1)} eaten`,  18, 52);

  let progress = genTimer / GEN_DURATION;
  fill(50, 50, 50, 180);
  rect(18, 72, 200, 10, 3);
  fill(80, 200, 120);
  rect(18, 72, 200 * progress, 10, 3);
  pop();

  if (newGenFlash > 0) {
    let alpha = map(newGenFlash, 120, 0, 255, 0);
    push();
    textAlign(CENTER, CENTER);
    textSize(36);
    textFont('monospace');
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

  // Solid-colour fish images
  for (let colorHex of rainbowColors) {
    coloredFishImages[colorHex] = {
      left:  createColoredFish(fishLeftImg,  colorHex, 60),
      right: createColoredFish(fishRightImg, colorHex, 60),
    };
  }

  // Pre-compute opaque pixel indices from the original (black) SVG sprites
  // and allocate reusable rainbow graphics objects
  for (let [dir, img] of [['left', fishLeftImg], ['right', fishRightImg]]) {
    let pg = createGraphics(60, 60);
    pg.image(img, 0, 0, 60, 60);
    pg.loadPixels();
    let idx = [];
    for (let i = 0; i < pg.pixels.length; i += 4) {
      if (pg.pixels[i + 3] > 0) idx.push(i);
    }
    origPixelIdx[dir] = idx;
    pg.remove();
    rainbowPg[dir] = createGraphics(60, 60);
  }

  // Spawn fish above water — they fall through the net on load
  for (let i = 0; i < 10; i++) {
    fish.push(new Fish(rainbowColors[i % rainbowColors.length]));
  }

  liquid = new Liquid(0, height / 4, width, height * 3 / 4, 0.1);
  netY   = 0;  // fire the net drop right away
}

function draw() {
  background(255);
  liquid.show();

  genTimer++;

  if (genTimer % FOOD_RATE === 0) {
    foodParticles.push(new FoodParticle(random(width), height / 4));
  }

  if (genTimer >= GEN_DURATION) nextGeneration();

  // Leader = non-dropping fish with highest fitness
  let leaderIdx = -1, leaderFitness = -1;
  for (let i = 0; i < fish.length; i++) {
    if (!fish[i].isDropping && fish[i].fitness > leaderFitness) {
      leaderFitness = fish[i].fitness;
      leaderIdx     = i;
    }
  }

  for (let i = 0; i < fish.length; i++) {
    fish[i].update();
    fish[i].checkEdges();
    fish[i].display(i === leaderIdx);
  }

  // Net draws on top of fish so they appear to pass through it
  drawNet();

  for (let i = foodParticles.length - 1; i >= 0; i--) {
    let food = foodParticles[i];
    if (food.isEaten) { foodParticles.splice(i, 1); continue; }
    food.applyForce(createVector(0, 0.1 * food.mass));
    if (liquid.contains(food)) food.applyForce(liquid.drag(food));
    food.update();
    food.checkEdges();
    food.display();
  }

  drawHUD();
}

function mouseClicked() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    foodParticles.push(new FoodParticle(mouseX, mouseY));
  }
}
