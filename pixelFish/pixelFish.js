// Pixel Fish — Neuroevolution Edition
// Simulation lives inside a vintage CRT monitor frame.

// ─── Screen / canvas layout ───────────────────────────────────────────────────
// Dynamic bounds — fill the full window for Pepper's Ghost installation.
let SX, SY, SW, SH, WLINE, SBOT;

function calcBounds() {
  SX    = 0;
  SY    = 0;
  SW    = windowWidth;
  SH    = windowHeight;
  WLINE = SH * 0.12;   // air strip: top 12% of canvas
  SBOT  = SH;
}

// ─── Global state ────────────────────────────────────────────────────────────
let fish = [];
let foodParticles = [];
let fishLeftImg, fishRightImg;
let coloredFishImages = {};
let liquid;

// Rainbow rave rendering
let origPixelIdx = { left: null, right: null };
let rainbowPg    = { left: null, right: null };

// Competition flash rendering
let competePg = { left: null, right: null };
let divertPg  = { left: null, right: null };

// Lo-fi pixelation buffer — tank is rendered to this small buffer then scaled up
const PIX_SCALE = 3; // 3× pixelation — chunky lo-fi look
let smallTankPg;

// Net drop animation
let netY = -1;
const NET_SPEED = 7;

// Glass tap effect
let tapShake  = 0;   // countdown frames
let tapX = 0, tapY = 0;
let ripples = [];    // [{x,y,r,alpha}]

// Evolution
let generation      = 1;

const FOOD_RATE     = 90;
const MUTATION_RATE = 0.1;
const LIFESPAN_MIN  = 700;    // frames a fish can live (min)
const LIFESPAN_MAX  = 1400;   // frames a fish can live (max)
const SPAWN_COUNT   = 7;      // new fish dropped per wave
const MIN_FISH      = 3;      // trigger new wave when live fish fall to this

// Hormone constants
const GHRELIN_RATE  = 0.001;  // hunger builds per frame
const GHRELIN_DECAY = 0.3;    // drops sharply when fish eats
const LEPTIN_RISE   = 0.32;   // leptin spike per food item eaten
const LEPTIN_DECAY  = 0.0002; // metabolizes per frame (slower = easier to overeat)
const LETHAL_LEPTIN = 0.9;    // overeating death threshold (lower = easier to die)
const HUNGER_THRESH = 0.2;    // min ghrelin needed to eat

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

// ─── LO.TONE — Nokia LCD palette + Bayer dither ──────────────────────────────
// Exact palette from the lotone project
const NOKIA_PALETTE = [
  [155, 188,  15],  // #9BBC0F — lightest
  [139, 172,  15],  // #8BAC0F
  [ 45,  74,  46],  // #2d4a2e
  [ 15,  37,   0],  // #0f2500 — darkest
];
const NOKIA_BRIGHT = NOKIA_PALETTE.map(([r,g,b]) => (r*0.299 + g*0.587 + b*0.114) / 255);

// 4×4 Bayer ordered dither matrix — each value normalised to 0–1
const BAYER4 = [
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5,
].map(v => (v + 0.5) / 16);

function applyNokiaDither(img) {
  const w = img.width, h = img.height, px = img.pixels;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = px[i], g = px[i+1], b = px[i+2];

      // Green-biased luminance — keeps Nokia's natural green tint
      const luma = (r * 0.12 + g * 0.76 + b * 0.12) / 255;

      // Warm hues (reds) lift brightness slightly → competing fish = lighter Nokia tone
      // Cool hues (blues) lower brightness slightly → diverting fish = darker Nokia tone
      // This preserves hue intent within the 4-color palette
      const warmth   = (r - b) / 512;
      const brightness = luma + warmth * 0.18;

      const threshold = BAYER4[(y & 3) * 4 + (x & 3)] - 0.5;
      const dithered  = brightness + threshold * 0.28;

      let best = 0, bestDist = Infinity;
      for (let c = 0; c < 4; c++) {
        const d = Math.abs(dithered - NOKIA_BRIGHT[c]);
        if (d < bestDist) { bestDist = d; best = c; }
      }
      px[i] = NOKIA_PALETTE[best][0]; px[i+1] = NOKIA_PALETTE[best][1]; px[i+2] = NOKIA_PALETTE[best][2];
    }
  }
}

// ─── Competition helpers ───────────────────────────────────────────────────────
const COMP_RADIUS = 80; // px — how close a fish must be to a food to be a "competitor"
const COMP_MAX    = 6;  // normalisation ceiling for competitor count input

// Count how many active fish are within COMP_RADIUS of a food particle
function countCompetitors(food) {
  let n = 0;
  for (let f of fish) {
    if (f.isDropping || f.isDying) continue;
    if (p5.Vector.dist(f.position, food.position) < COMP_RADIUS) n++;
  }
  return n;
}

// Build a 4-element input block for one food slot: [sin, cos, dist, competitors]
// Pass null for an empty slot (no food in range → neutral values)
function foodInputBlock(food, fromPos, diag) {
  if (!food) return [0, 0, 1, 0];
  const ang  = Math.atan2(food.position.y - fromPos.y, food.position.x - fromPos.x);
  const d    = p5.Vector.dist(fromPos, food.position);
  const comp = constrain(countCompetitors(food) / COMP_MAX, 0, 1);
  return [Math.sin(ang), Math.cos(ang), constrain(d / diag, 0, 1), comp];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function hsbToRgb(h, s, v) {
  s /= 100; v /= 100;
  let c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r, g, b;
  if      (h < 60)  { r=c; g=x; b=0; }
  else if (h < 120) { r=x; g=c; b=0; }
  else if (h < 180) { r=0; g=c; b=x; }
  else if (h < 240) { r=0; g=x; b=c; }
  else if (h < 300) { r=x; g=0; b=c; }
  else              { r=c; g=0; b=x; }
  return [Math.round((r+m)*255), Math.round((g+m)*255), Math.round((b+m)*255)];
}

// Pulse a fish image between hueMin and hueMax using a sine wave
// hueMin/hueMax in degrees (0–360 HSB)
function updateFlashPg(direction, hueMin, hueMax, pgObj) {
  const SIZE = 60;
  let pg = pgObj[direction];
  pg.loadPixels();
  pg.pixels.fill(0);
  // Smooth pulse: oscillates between hueMin and hueMax
  const t   = Math.sin(frameCount * 0.18) * 0.5 + 0.5; // 0→1→0
  const hue = hueMin + t * (hueMax - hueMin);
  for (let i of origPixelIdx[direction]) {
    // Add small per-pixel hue jitter so the fish shimmers rather than solid-flashing
    const hueJitter = (hue + ((i / 4) % SIZE) * 0.4) % 360;
    const [r, g, b] = hsbToRgb(hueJitter, 100, 100);
    pg.pixels[i] = r; pg.pixels[i+1] = g; pg.pixels[i+2] = b; pg.pixels[i+3] = 255;
  }
  pg.updatePixels();
  return pg;
}

function updateRainbowPg(direction) {
  const SIZE = 60;
  let pg = rainbowPg[direction];
  pg.loadPixels();
  pg.pixels.fill(0);
  let t = frameCount * 6;
  for (let i of origPixelIdx[direction]) {
    let hue = (((i / 4) % SIZE) / SIZE * 360 + t) % 360;
    let [r, g, b] = hsbToRgb(hue, 100, 100);
    pg.pixels[i]=r; pg.pixels[i+1]=g; pg.pixels[i+2]=b; pg.pixels[i+3]=255;
  }
  pg.updatePixels();
  return pg;
}

// ─── NeuralNetwork ────────────────────────────────────────────────────────────
// Inputs (12):
//   [0–3]  nearest food:      sin(angle), cos(angle), distance, competitor count
//   [4–7]  2nd nearest food:  sin(angle), cos(angle), distance, competitor count
//   [8–9]  velocity x, y (normalised)
//   [10]   ghrelin (hunger)
//   [11]   leptin  (fullness)
const NN_INPUTS = 12;

class NeuralNetwork {
  constructor() {
    this.W1 = Array.from({ length: 8 * NN_INPUTS }, () => random(-1, 1));
    this.b1 = Array.from({ length: 8             }, () => random(-1, 1));
    this.W2 = Array.from({ length: 16            }, () => random(-1, 1));
    this.b2 = Array.from({ length: 2             }, () => random(-1, 1));
  }
  forward(inputs) {
    this._x = inputs;
    this._h = Array.from({ length: 8 }, (_, r) => {
      let s = this.b1[r];
      for (let c = 0; c < NN_INPUTS; c++) s += this.W1[r * NN_INPUTS + c] * inputs[c];
      return Math.tanh(s);
    });
    this._y = Array.from({ length: 2 }, (_, r) => {
      let s = this.b2[r];
      for (let c = 0; c < 8; c++) s += this.W2[r * 8 + c] * this._h[c];
      return Math.tanh(s);
    });
    return [this._y[0], this._y[1]];
  }
  // Backpropagation — MSE loss, tanh derivative: d/dx tanh = 1 - tanh²
  backward(targets, lr = 0.01) {
    if (!this._x) return;
    const d2 = this._y.map((y, i) => (y - targets[i]) * (1 - y * y));
    for (let r = 0; r < 2; r++) {
      this.b2[r] -= lr * d2[r];
      for (let c = 0; c < 8; c++)
        this.W2[r * 8 + c] -= lr * d2[r] * this._h[c];
    }
    const dh = Array.from({ length: 8 }, (_, c) => {
      let s = 0;
      for (let r = 0; r < 2; r++) s += d2[r] * this.W2[r * 8 + c];
      return s;
    });
    const d1 = this._h.map((h, i) => dh[i] * (1 - h * h));
    for (let r = 0; r < 8; r++) {
      this.b1[r] -= lr * d1[r];
      for (let c = 0; c < NN_INPUTS; c++)
        this.W1[r * NN_INPUTS + c] -= lr * d1[r] * this._x[c];
    }
  }
  copy() {
    let nn = new NeuralNetwork();
    nn.W1=this.W1.slice(); nn.b1=this.b1.slice();
    nn.W2=this.W2.slice(); nn.b2=this.b2.slice();
    return nn;
  }
  mutate(rate=MUTATION_RATE) {
    const p = a => a.map(w => random(1)<rate ? w+randomGaussian(0,0.2) : w);
    this.W1=p(this.W1); this.b1=p(this.b1); this.W2=p(this.W2); this.b2=p(this.b2);
  }
}

// ─── Fish ─────────────────────────────────────────────────────────────────────
class Fish {
  constructor(colorHex, brain, boldness) {
    this.size       = 35;
    this.colorHex   = colorHex;
    this.brain      = brain || new NeuralNetwork();
    // boldness gene (0–1): inherited + mutated each generation
    // 0 = always divert from contested food
    // 1 = always double-down and charge contested food
    this.boldness     = (boldness !== undefined) ? constrain(boldness, 0, 1) : random(0, 1);
    this.isCompeting  = false; // true when actively charging contested food
    this.isDiverting  = false; // true when actively choosing alternative food
    this.fitness    = 0;
    this.age        = 0;
    this.lifespan   = round(random(LIFESPAN_MIN, LIFESPAN_MAX));
    this.isDead     = false;
    this.isDying    = false;
    this.dyingTimer = 0;
    this.isDropping = true;
    this.ghrelin    = random(0.3, 0.6); // start moderately hungry
    this.leptin     = 0;
    this.facingDir  = 'right';
    this.noiseOffset  = random(10000); // unique noise seed per fish
    this.isPanicked   = false;
    this.panicTimer   = 0;
    // Spawn above the screen — falls through net into water
    this.position     = createVector(
      random(SX + this.size/2, SX + SW - this.size/2),
      random(SY - 180, SY - this.size)
    );
    this.velocity     = createVector(random(-0.2, 0.2), random(0.2, 0.6));
    this.acceleration = createVector(0, 0);
    this.maxSpeed     = 1.2;
    this.maxForce     = 0.06;
  }

  think() {
    // Sort all available food by distance from this fish
    const diag = dist(SX, WLINE, SX + SW, SBOT);
    const sorted = foodParticles
      .filter(f => !f.isEaten)
      .map(f => ({ food: f, d: p5.Vector.dist(this.position, f.position) }))
      .sort((a, b) => a.d - b.d);

    const f1 = sorted[0] ? sorted[0].food : null;
    const f2 = sorted[1] ? sorted[1].food : null;

    // Build 12-element input vector:
    // [food1 block (4)] [food2 block (4)] [vel.x, vel.y, ghrelin, leptin]
    const inputs = [
      ...foodInputBlock(f1, this.position, diag),
      ...foodInputBlock(f2, this.position, diag),
      this.velocity.x / this.maxSpeed,
      this.velocity.y / this.maxSpeed,
      this.ghrelin,
      this.leptin,
    ];

    // Perlin noise wander — baseline graceful movement
    let wanderOffset = map(noise(this.noiseOffset + frameCount * 0.004), 0, 1, -0.6, 0.6);
    let wanderAngle  = this.velocity.heading() + wanderOffset;
    this.acceleration.add(p5.Vector.fromAngle(wanderAngle).mult(this.maxForce * 0.4));

    // NN drives steering — learns via backprop within its lifetime
    let [ax, ay] = this.brain.forward(inputs);
    this.acceleration.add(createVector(ax, ay).mult(this.maxForce * 1.5));

    // Backprop: competition decision driven by boldness gene
    // Bold fish charge contested food; timid fish divert to alternatives
    this.isCompeting = false;
    this.isDiverting = false;
    if (this.ghrelin >= HUNGER_THRESH && f1) {
      const comp1 = countCompetitors(f1);
      // Divert threshold scales with boldness:
      //   boldness=0 → diverts if even 1 competitor present
      //   boldness=1 → never diverts (always fights)
      const divertAt = max(1, round((1 - this.boldness) * COMP_MAX));
      const shouldDivert = comp1 >= divertAt && f2;

      const target = shouldDivert ? f2 : f1;
      this.isCompeting = !shouldDivert && comp1 > 1;
      this.isDiverting = !!shouldDivert;

      const toFood = p5.Vector.sub(target.position, this.position);
      const d      = toFood.mag();
      this.brain.backward([toFood.x / d, toFood.y / d], 0.01);

      // Bold fish charging contested food get a speed boost
      if (this.isCompeting) {
        const chargeForce = p5.Vector.sub(f1.position, this.position).setMag(this.maxForce * this.boldness * 2);
        this.acceleration.add(chargeForce);
      }
    }
    // Teach NN to ease off when dangerously full
    if (this.leptin > 0.7) {
      this.brain.backward([0, 0], 0.005);
    }

    // Boundary avoidance
    const M = 60;
    if (this.position.y < WLINE + M)
      this.acceleration.y += map(this.position.y, WLINE, WLINE+M, this.maxForce*2, 0);
    if (this.position.y > SBOT - this.size/2 - M)
      this.acceleration.y -= map(this.position.y, SBOT-this.size/2-M, SBOT-this.size/2, 0, this.maxForce*2);
    if (this.position.x < SX + this.size/2 + M)
      this.acceleration.x += map(this.position.x, SX+this.size/2, SX+this.size/2+M, this.maxForce*2, 0);
    if (this.position.x > SX + SW - this.size/2 - M)
      this.acceleration.x -= map(this.position.x, SX+SW-this.size/2-M, SX+SW-this.size/2, 0, this.maxForce*2);
  }

  flock(others) {
    const SEP_R = 60, FLOCK_R = 130;
    let sep = createVector(0,0), sepN = 0;
    let ali = createVector(0,0), aliN = 0;
    let coh = createVector(0,0), cohN = 0;

    for (let other of others) {
      if (other === this || other.isDropping || other.isDying) continue;
      let d = p5.Vector.dist(this.position, other.position);
      if (d < SEP_R && d > 0) {
        sep.add(p5.Vector.sub(this.position, other.position).div(d));
        sepN++;
      }
      if (d < FLOCK_R) {
        ali.add(other.velocity); aliN++;
        coh.add(other.position); cohN++;
      }
    }
    if (sepN > 0) {
      sep.div(sepN).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce * 2.0);
      this.acceleration.add(sep);
    }
    if (aliN > 0) {
      ali.div(aliN).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce * 0.6);
      this.acceleration.add(ali);
    }
    if (cohN > 0) {
      let desired = p5.Vector.sub(coh.div(cohN), this.position).setMag(this.maxSpeed).sub(this.velocity).limit(this.maxForce * 0.3);
      this.acceleration.add(desired);
    }
  }

  update() {
    if (this.isDropping) {
      this.velocity.y += 0.12;
      this.velocity.x *= 0.97;
      this.velocity.limit(2.5);
      this.position.add(this.velocity);
      if (this.position.y >= WLINE) {
        this.isDropping = false;
        this.velocity.set(random(-0.3, 0.3), 0);
        this.position.y = WLINE;
      }
      return;
    }
    // Dying — float belly-up to surface then remove
    if (this.isDying) {
      this.dyingTimer++;
      this.velocity.y = max(this.velocity.y - 0.04, -0.7); // gentle buoyancy upward
      this.velocity.x *= 0.97;
      this.position.add(this.velocity);
      if (this.position.y <= WLINE) {
        this.position.y = WLINE;
        this.velocity.set(0, 0);
      }
      if (this.dyingTimer > 240) this.isDead = true;
      return;
    }

    // Panic — erratic Perlin noise walk, ignores NN and flocking
    if (this.isPanicked) {
      this.panicTimer--;
      if (this.panicTimer <= 0) this.isPanicked = false;
      let panicAngle = map(noise(this.noiseOffset + frameCount * 0.025), 0, 1, 0, TWO_PI);
      this.acceleration = p5.Vector.fromAngle(panicAngle).mult(this.maxForce * 3);
      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed * 2.5);
      this.position.add(this.velocity);
      if (this.velocity.x < -0.35)     this.facingDir = 'left';
      else if (this.velocity.x > 0.35) this.facingDir = 'right';
      return;
    }

    this.age++;
    if (this.age >= this.lifespan) { this.isDying = true; return; }

    // Hormone tick
    this.ghrelin = min(this.ghrelin + GHRELIN_RATE, 1.0);
    this.leptin  = max(this.leptin  - LEPTIN_DECAY,  0.0);
    if (this.leptin >= LETHAL_LEPTIN) { this.isDying = true; return; } // overate

    this.think();
    this.flock(fish);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    // Only flip direction when velocity is clearly sustained — avoids jitter
    if (this.velocity.x < -0.35)      this.facingDir = 'left';
    else if (this.velocity.x > 0.35)  this.facingDir = 'right';

    // Eat only when hungry (ghrelin above threshold)
    for (let i = foodParticles.length - 1; i >= 0; i--) {
      let f = foodParticles[i];
      if (f.isEaten) continue;
      if (p5.Vector.dist(this.position, f.position) < this.size/2 + f.radius) {
        if (this.ghrelin >= HUNGER_THRESH) {
          f.isEaten = true;
          this.fitness++;
          this.ghrelin = max(this.ghrelin - GHRELIN_DECAY, 0);
          this.leptin  = min(this.leptin  + LEPTIN_RISE, 1.5); // can exceed 1.0 → lethal
        }
        // If not hungry, fish bumps into food but ignores it (scopes it out)
      }
    }
  }

  checkEdges() {
    if (this.isDropping || this.isDying) {
      this.position.x = constrain(this.position.x, SX + this.size/2, SX + SW - this.size/2);
      return;
    }
    // Bounce left/right within screen
    const lft = SX + this.size/2, rgt = SX + SW - this.size/2;
    if (this.position.x < lft) { this.position.x = lft; if (this.velocity.x < 0) this.velocity.x = abs(this.velocity.x)*0.3; }
    if (this.position.x > rgt) { this.position.x = rgt; if (this.velocity.x > 0) this.velocity.x = -abs(this.velocity.x)*0.3; }
    // Bounce top/bottom
    const top = WLINE, bot = SBOT - this.size/2;
    if (this.position.y < top) { this.position.y = top; if (this.velocity.y < 0) this.velocity.y = abs(this.velocity.y)*0.3; }
    if (this.position.y > bot) { this.position.y = bot; if (this.velocity.y > 0) this.velocity.y = -abs(this.velocity.y)*0.3; }
  }

  display(isLeader) {
    push();
    translate(this.position.x, this.position.y);

    // Belly-up float: upside down, fading out
    if (this.isDying) {
      let alpha = this.dyingTimer > 180 ? map(this.dyingTimer, 180, 240, 180, 0) : 180;
      scale(1, -1); // flip upside down
      tint(160, 160, 160, alpha);
      imageMode(CENTER);
      image(coloredFishImages[this.colorHex][this.facingDir], 0, 0, this.size, this.size);
      noTint();
      pop();
      return;
    }

    // Fade out in the last 400 frames of life
    let alpha = 255;
    if (!this.isDropping && this.age > this.lifespan - 400)
      alpha = map(this.age, this.lifespan - 400, this.lifespan, 255, 0);

    let d = this.facingDir;
    if (isLeader && !this.isDropping) {
      tint(255, alpha);
      imageMode(CENTER);
      image(updateRainbowPg(d), 0, 0, this.size, this.size);
      noTint();
    } else if (this.isCompeting && !this.isDropping) {
      tint(255, alpha);
      imageMode(CENTER);
      image(updateFlashPg(d, 0, 35, competePg), 0, 0, this.size, this.size);
      noTint();
    } else if (this.isDiverting && !this.isDropping) {
      tint(255, alpha);
      imageMode(CENTER);
      image(updateFlashPg(d, 200, 240, divertPg), 0, 0, this.size, this.size);
      noTint();
    } else if (this.isDropping) {
      tint(255, 255, 255, 210);
      imageMode(CENTER);
      image(coloredFishImages[this.colorHex][d], 0, 0, this.size, this.size);
      noTint();
    } else if (this.fitness === 0) {
      tint(180, 180, 180, alpha * 0.67);
      imageMode(CENTER);
      image(coloredFishImages[this.colorHex][d], 0, 0, this.size, this.size);
      noTint();
    } else {
      tint(255, alpha);
      imageMode(CENTER);
      image(coloredFishImages[this.colorHex][d], 0, 0, this.size, this.size);
      noTint();
    }

    // ── Hormone bars (shown on active, non-dropping fish) ──
    // Ghrelin (hunger) : orange bar above fish — rises when starving
    // Leptin  (fullness): teal bar below fish  — rises after eating, lethal at 0.9
    if (!this.isDropping && !this.isDying) {
      const bw = this.size;         // bar width matches fish size
      const bh = 3;
      const bx = -bw / 2;

      noStroke();
      // Ghrelin bar — above fish
      const gy = -this.size / 2 - bh - 2;
      fill(40, 40, 40, 160);
      rect(bx, gy, bw, bh, 1);
      // Color shifts yellow → orange → red as hunger increases
      const [gr, gg, gb] = hsbToRgb(map(this.ghrelin, 0, 1, 55, 0), 100, 90);
      fill(gr, gg, gb, 220);
      rect(bx, gy, bw * this.ghrelin, bh, 1);

      // Leptin bar — below fish
      const ly = this.size / 2 + 2;
      fill(40, 40, 40, 160);
      rect(bx, ly, bw, bh, 1);
      // Color shifts teal → yellow → red as leptin approaches lethal threshold
      const lRatio = this.leptin / LETHAL_LEPTIN;
      const [lr, lg, lb] = hsbToRgb(map(lRatio, 0, 1, 180, 0), 100, 90);
      fill(lr, lg, lb, 220);
      rect(bx, ly, bw * constrain(lRatio, 0, 1), bh, 1);
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
  applyForce(f) { this.acceleration.add(p5.Vector.div(f, this.mass)); }
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }
  checkEdges() {
    if (this.position.y > SBOT - this.radius) {
      this.position.y  = SBOT - this.radius;
      this.velocity.y *= -0.5;
    }
  }
  display() {
    push(); fill(139, 69, 19); noStroke();
    circle(this.position.x, this.position.y, this.radius * 2);
    pop();
  }
}

// ─── Liquid ───────────────────────────────────────────────────────────────────
class Liquid {
  constructor(x, y, w, h, c) { this.x=x; this.y=y; this.w=w; this.h=h; this.c=c; }
  contains(p) {
    return p.position.x>this.x && p.position.x<this.x+this.w &&
           p.position.y>this.y && p.position.y<this.y+this.h;
  }
  drag(p) {
    let s = p.velocity.mag();
    return p.velocity.copy().mult(-1).normalize().mult(this.c * s * s);
  }
  show() {
    const PAD = 50; // overdraw past screen edges to cover max shake offset
    for (let y = this.y; y < this.y + this.h; y++) {
      let t = map(y, this.y, this.y+this.h, 0, 1);
      stroke(lerpColor(color(0,20,60), color(0,5,30), t));
      line(this.x - PAD, y, this.x+this.w + PAD, y);
    }
    // Waterline
    strokeWeight(2); stroke(0, 30, 80);
    line(this.x - PAD, this.y, this.x+this.w + PAD, this.y);
    strokeWeight(1);
    // Air zone (above waterline, inside screen)
    noStroke(); fill(200, 230, 255, 60);
    rect(SX - PAD, SY, SW + PAD * 2, WLINE - SY);
  }
}

// ─── Net animation ────────────────────────────────────────────────────────────
function drawNet() {
  if (netY < 0) return;
  netY = min(netY + NET_SPEED, WLINE);

  push();
  const CELL = 20;
  stroke(160, 120, 50, 200);
  strokeWeight(1.2);
  for (let y = SY; y <= netY; y += CELL) line(SX, y, SX+SW, y);
  for (let x = SX; x <= SX+SW; x += CELL) line(x, SY, x, netY);
  noStroke(); fill(120, 80, 30, 220);
  for (let y = SY; y <= netY; y += CELL)
    for (let x = SX; x <= SX+SW; x += CELL)
      circle(x, y, 4);
  stroke(120, 80, 30); strokeWeight(2.5);
  line(SX, netY, SX+SW, netY);
  pop();

  if (netY >= WLINE) netY = -1;
}

// ─── Evolution ────────────────────────────────────────────────────────────────
function addGeneration() {
  // Build mating pool from active survivors (exclude dying fish)
  let pool = [];
  for (let f of fish) {
    if (f.isDying) continue;
    for (let t = 0; t < f.fitness + 1; t++) pool.push(f);
  }

  for (let i = 0; i < SPAWN_COUNT; i++) {
    let brain, boldness;
    if (pool.length > 0) {
      const parent = pool[floor(random(pool.length))];
      brain    = parent.brain.copy();
      brain.mutate();
      // Inherit boldness with small Gaussian mutation — strategy evolves over generations
      boldness = parent.boldness + randomGaussian(0, 0.08);
    }
    fish.push(new Fish(rainbowColors[(fish.length + i) % rainbowColors.length], brain, boldness));
  }

  generation++;
  netY = SY;
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function drawLegend() {
  const items = [
    { label: 'Leader',     draw: (x, y, s) => {
        for (let i = 0; i < s; i++) {
          const [r, g, b] = hsbToRgb((i / s) * 360, 100, 100);
          fill(r, g, b); noStroke(); rect(x + i, y, 1, s);
        }
      }
    },
    { label: 'Competing',  draw: (x, y, s) => { fill(255, 80,  80);  noStroke(); rect(x, y, s, s); } },
    { label: 'Diverting',  draw: (x, y, s) => { fill(80,  160, 255); noStroke(); rect(x, y, s, s); } },
    { label: 'Active',     draw: (x, y, s) => { fill(255, 220, 100); noStroke(); rect(x, y, s, s); } },
    { label: 'No kills',   draw: (x, y, s) => { fill(160, 160, 160); noStroke(); rect(x, y, s, s); } },
  ];

  const sw = 10, sh = 10, rowH = 14;
  const lx = SX + 6;
  const ly = SY + 6;

  push();
  // Background panel
  noStroke();
  fill(0, 0, 0, 120);
  rect(lx - 3, ly - 3, 90, items.length * rowH + 6, 3);

  textSize(8);
  textFont('monospace');
  textAlign(LEFT, TOP);

  for (let i = 0; i < items.length; i++) {
    const y = ly + i * rowH;
    items[i].draw(lx, y, sw);
    fill(210, 230, 210);
    text(items[i].label, lx + sw + 4, y + 1);
  }
  pop();
}

// ─── p5 lifecycle ─────────────────────────────────────────────────────────────
function preload() {
  fishLeftImg  = loadImage(fishLeftSVG);
  fishRightImg = loadImage(fishRightSVG);
}

function setup() {
  calcBounds();
  createCanvas(windowWidth, windowHeight);

  for (let colorHex of rainbowColors) {
    coloredFishImages[colorHex] = {
      left:  createColoredFish(fishLeftImg,  colorHex, 60),
      right: createColoredFish(fishRightImg, colorHex, 60),
    };
  }

  // Pre-compute opaque pixel indices for rainbow rendering
  for (let [dir, img] of [['left', fishLeftImg], ['right', fishRightImg]]) {
    let pg = createGraphics(60, 60);
    pg.image(img, 0, 0, 60, 60);
    pg.loadPixels();
    origPixelIdx[dir] = [];
    for (let i = 0; i < pg.pixels.length; i += 4)
      if (pg.pixels[i+3] > 0) origPixelIdx[dir].push(i);
    pg.remove();
    rainbowPg[dir]  = createGraphics(60, 60);
    competePg[dir]  = createGraphics(60, 60);
    divertPg[dir]   = createGraphics(60, 60);
  }

  // Lo-fi pixelation buffer
  smallTankPg = createGraphics(floor(SW / PIX_SCALE), floor(SH / PIX_SCALE));
  smallTankPg.noSmooth();
  noSmooth();

  for (let i = 0; i < 10; i++)
    fish.push(new Fish(rainbowColors[i % rainbowColors.length]));

  liquid = new Liquid(SX, WLINE, SW, SBOT - WLINE, 0.1);
  netY   = SY;  // fire net on load
}

function draw() {
  background(0);


  // Update all fish
  for (let f of fish) { f.update(); f.checkEdges(); }

  // Remove fish that have reached end of lifespan
  fish = fish.filter(f => !f.isDead);

  // Breed new fish when live population is low and none are currently dropping
  let dropping  = fish.some(f => f.isDropping);
  let liveCount = fish.filter(f => !f.isDropping && !f.isDying).length;
  if (!dropping && liveCount <= MIN_FISH) addGeneration();

  // Update food
  for (let i = foodParticles.length - 1; i >= 0; i--) {
    let fd = foodParticles[i];
    if (fd.isEaten) { foodParticles.splice(i, 1); continue; }
    fd.applyForce(createVector(0, 0.1 * fd.mass));
    if (liquid.contains(fd)) fd.applyForce(liquid.drag(fd));
    fd.update(); fd.checkEdges();
  }

  // Leader = non-dropping, non-dying fish with highest fitness
  let leaderIdx = -1, leaderFit = -1;
  for (let i = 0; i < fish.length; i++)
    if (!fish[i].isDropping && !fish[i].isDying && fish[i].fitness > leaderFit)
      { leaderFit = fish[i].fitness; leaderIdx = i; }

  // Glass tap shake — jitter translation
  let shakeX = 0, shakeY = 0;
  if (tapShake > 0) {
    let mag = map(tapShake, 0, 18, 0, 12);
    shakeX = random(-mag, mag);
    shakeY = random(-mag, mag);
    tapShake--;
    translate(shakeX, shakeY);
  }

  liquid.show();
  for (let i = 0; i < fish.length; i++) fish[i].display(i === leaderIdx);
  drawNet();
  for (let fd of foodParticles) fd.display();

  // Ripple rings from tap
  for (let i = ripples.length - 1; i >= 0; i--) {
    let rp = ripples[i];
    rp.r     += 3.5;
    rp.alpha -= 6;
    if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }
    push();
    noFill(); stroke(255, 255, 255, rp.alpha); strokeWeight(1.5);
    circle(rp.x, rp.y, rp.r * 2);
    pop();
  }

  // ── Lo-fi post-process: pixelate + green tint ────────────────────────────
  const snap = get(SX, SY, SW, SH);
  // Scale down into small buffer (creates chunky pixels)
  smallTankPg.image(snap, 0, 0, smallTankPg.width, smallTankPg.height);
  // Apply green tint to small buffer pixels
  smallTankPg.loadPixels();
  const sp = smallTankPg.pixels;
  for (let i = 0; i < sp.length; i += 4) {
    sp[i]   = sp[i]   * 0.80;  // reduce red
    sp[i+1] = sp[i+1] * 1.00;  // keep green
    sp[i+2] = sp[i+2] * 0.72;  // reduce blue
  }
  smallTankPg.updatePixels();
  // Draw back scaled up — noSmooth() makes it chunky pixel art
  drawingContext.imageSmoothingEnabled = false;
  image(smallTankPg, SX, SY, SW, SH);

  // Scanlines
  noStroke(); fill(0, 0, 0, 16);
  for (let sy = SY; sy < SBOT; sy += 3) rect(SX, sy, SW, 1);

  // Pixel grid
  stroke(0, 0, 0, 8); strokeWeight(0.5);
  for (let gx = SX; gx < SX + SW; gx += PIX_SCALE) line(gx, SY, gx, SBOT);
  for (let gy = SY; gy < SBOT; gy += PIX_SCALE) line(SX, gy, SX + SW, gy);
  noStroke();
}

function windowResized() {
  calcBounds();
  resizeCanvas(windowWidth, windowHeight);
  if (smallTankPg) smallTankPg.remove();
  smallTankPg = createGraphics(floor(SW / PIX_SCALE), floor(SH / PIX_SCALE));
  smallTankPg.noSmooth();
  liquid = new Liquid(SX, WLINE, SW, SBOT - WLINE, 0.1);
}

function mouseClicked() {
  if (mouseX < SX || mouseX > SX+SW || mouseY < SY || mouseY > SBOT) return;

  if (mouseY < WLINE) {
    // Above waterline — food falls in from click position with gravity
    foodParticles.push(new FoodParticle(mouseX, mouseY));
  } else {
    // In the water — tap the glass
    tapShake = 18;

    // Ripple rings at tap point
    for (let i = 0; i < 4; i++)
      ripples.push({ x: mouseX, y: mouseY, r: i * 14, alpha: 200 - i * 40 });

    // Scatter + panic all active fish
    for (let f of fish) {
      if (f.isDropping || f.isDying) continue;
      let d = dist(f.position.x, f.position.y, mouseX, mouseY);
      let force = p5.Vector.sub(f.position, createVector(mouseX, mouseY))
                            .setMag(map(d, 0, SW, 4.5, 0.8));
      f.velocity.add(force);
      f.velocity.limit(f.maxSpeed * 3);
      f.isPanicked  = true;
      f.panicTimer  = round(random(80, 180)); // 1.5–3s of panic
    }
  }
}
