// Firefly Attraction — Nature of Code Example 2.6
// Gravitational attraction: F = G * mA * mB / d²
// Firefly orbits a glowing orb in full 3D space.

const G        = 1.0;
const MASS_ORB = 4000;

const bgFireflies = [];
let firefly;
let att;

// ─── Attractor ────────────────────────────────────────────────────────────────
class Attractor {
  constructor() {
    this.pos  = createVector(0, 0, 0);
    this.mass = MASS_ORB;
  }

  attract(mover) {
    let force    = p5.Vector.sub(this.pos, mover.pos);
    let d        = constrain(force.mag(), 100, 800);
    let strength = (G * this.mass * mover.mass) / (d * d);
    force.setMag(strength);
    mover.applyForce(force);
  }

  drawCore() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    noStroke();

    let t    = frameCount * 0.018;
    let glow = map(sin(t), -1, 1, 55, 100);
    let hue  = map(sin(t * 0.4), -1, 1, 45, 72);

    pointLight(hue, 60, 100,  80, -80,  80);
    pointLight(hue, 40,  60, -80,  80, -80);

    fill(hue, 70, 100);
    emissiveMaterial(hue, 80, glow * 0.35);
    specularMaterial(0, 0, 100);
    shininess(300);
    sphere(20);

    noLights();
    fill(0, 0, 100);
    emissiveMaterial(0, 0, 100);
    sphere(5);

    pop();
  }
}

// ─── Firefly ──────────────────────────────────────────────────────────────────
class Firefly {
  constructor() {
    this.pos  = createVector(300, 0, 0);
    this.vel  = createVector(0, 2.8, 2.4);
    this.acc  = createVector(0, 0, 0);
    this.mass = 1.0;
  }

  applyForce(f) {
    this.acc.add(p5.Vector.div(f, this.mass));
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);

    let vx = this.vel.x, vy = this.vel.y, vz = this.vel.z;
    rotateY(atan2(vx, vz));
    rotateX(atan2(-vy, sqrt(vx * vx + vz * vz)));
    rotateZ(-sin(atan2(vx, vz)) * 0.3);

    let glowIntensity = map(sin(frameCount * 0.06), -1, 1, 20, 100);
    let lanternHue    = 70;

    pointLight(lanternHue, 100, glowIntensity, 0, 5, -25);
    ambientLight(230, 40, 25);
    directionalLight(220, 30, 40, 0, 1, -1);

    // Pronotum
    push();
    translate(0, -6, 12); rotateX(0.2);
    fill(15, 60, 15); specularMaterial(15, 60, 20); shininess(30);
    ellipsoid(14, 4, 12);
    pop();

    // Head
    push();
    translate(0, -1, 14);
    fill(10, 80, 10); sphere(5);
    fill(0, 100, 0);
    push(); translate( 3, -1, 3); sphere(2.5); pop();
    push(); translate(-3, -1, 3); sphere(2.5); pop();
    fill(10, 80, 10);
    push(); translate( 4, -3, 5); rotateX(-0.5); rotateZ( 0.3); cylinder(0.5, 10); pop();
    push(); translate(-4, -3, 5); rotateX(-0.5); rotateZ(-0.3); cylinder(0.5, 10); pop();
    pop();

    // Thorax
    push();
    translate(0, 0, 2);
    fill(20, 70, 15); specularMaterial(20, 70, 20); shininess(40);
    ellipsoid(12, 10, 14);
    pop();

    // Lantern
    push();
    translate(0, 2, -16); rotateX(-0.1);
    fill(lanternHue, 80, glowIntensity);
    emissiveMaterial(lanternHue, 80, glowIntensity);
    ellipsoid(10, 8, 10);
    translate(0, 1, -10);
    fill(lanternHue, 90, glowIntensity);
    emissiveMaterial(lanternHue, 90, glowIntensity);
    ellipsoid(7, 5, 6);
    noLights();
    fill(lanternHue, 100, 100, glowIntensity * 0.15); sphere(18);
    fill(lanternHue, 100, 100, glowIntensity * 0.05); sphere(35);
    pop();

    ambientLight(230, 40, 25);
    directionalLight(220, 30, 40, 0, 1, -1);
    pointLight(lanternHue, 100, glowIntensity, 0, 5, -25);

    // Elytra
    push();
    fill(15, 70, 15); specularMaterial(15, 70, 30); shininess(80);
    push(); translate( 6, -8, 0); rotateZ( 0.6); rotateX(-0.4); rotateY( 0.2); translate(0, 0, -12); ellipsoid(7, 1.5, 18); pop();
    push(); translate(-6, -8, 0); rotateZ(-0.6); rotateX(-0.4); rotateY(-0.2); translate(0, 0, -12); ellipsoid(7, 1.5, 18); pop();
    pop();

    // Wings
    let wingBuzz = sin(frameCount * 3.5) * 0.8;
    push();
    fill(200, 10, 90, 60); specularMaterial(200, 10, 100); shininess(100);
    push(); translate( 5, -6, 0); rotateZ( wingBuzz + 0.2); rotateX(-0.2); translate( 18, 0, -8); ellipsoid(20, 0.2, 10); pop();
    push(); translate(-5, -6, 0); rotateZ(-(wingBuzz + 0.2)); rotateX(-0.2); translate(-18, 0, -8); ellipsoid(20, 0.2, 10); pop();
    pop();

    // Legs
    push();
    fill(10, 80, 10);
    for (let i = -1; i <= 1; i += 2) {
      push(); translate(i*6,  8,  8); rotateZ(i*0.4); rotateX( 0.5); cylinder(0.5, 12); pop();
      push(); translate(i*7, 10,  2); rotateZ(i*0.5); rotateX( 0.2); cylinder(0.5, 14); pop();
      push(); translate(i*6,  9, -6); rotateZ(i*0.4); rotateX(-0.3); cylinder(0.5, 16); pop();
    }
    pop();

    pop();
  }
}

// ─── Setup ────────────────────────────────────────────────────────────────────
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  att     = new Attractor();
  firefly = new Firefly();

  for (let i = 0; i < 250; i++) {
    bgFireflies.push({
      x:      random(-1000, 1000),
      y:      random(-600,   600),
      z:      random(-1000, 1000),
      offset: random(1000),
      speed:  random(0.01, 0.03),
      size:   random(1.5, 4),
    });
  }
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
function draw() {
  background(230, 80, 8);
  orbitControl();

  ambientLight(230, 50, 20);
  directionalLight(220, 30, 40, 0, 1, -1);

  let glow = map(sin(frameCount * 0.018), -1, 1, 55, 100);
  let hue  = map(sin(frameCount * 0.007), -1, 1, 45, 72);
  pointLight(hue, 100, glow, 0, 0, 0);

  att.attract(firefly);
  firefly.update();

  att.drawCore();
  ambientLight(230, 50, 20);
  directionalLight(220, 30, 40, 0, 1, -1);
  firefly.draw();

  // Stars
  for (let f of bgFireflies) {
    push();
    translate(
      f.x + cos(frameCount * f.speed * 0.8 + f.offset) * 40,
      f.y + sin(frameCount * f.speed + f.offset) * 50,
      f.z
    );
    let twinkle = map(sin(frameCount * f.speed * 2 + f.offset), -1, 1, 50, 100);
    emissiveMaterial(0, 0, twinkle);
    fill(0, 0, twinkle);
    sphere(f.size);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
