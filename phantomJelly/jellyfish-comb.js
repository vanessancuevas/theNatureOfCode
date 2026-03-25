// jellyfish-comb.js — Comb Jellyfish (Ctenophore)
// Circular canvas, Pepper's Ghost build.
// Click / tap to startle — speeds up cilia beat and rotation.

const NUM_ROWS     = 8;
const CILIA_PER_ROW = 60;
const BODY_ROWS    = 80;
const BODY_COLS    = 60;

let t = 0;
let rotX = 0, rotY = 0;
let targetRotX = 0.3, targetRotY = 0;

let startleFrames = 0;
let colorBlend    = 0; // 1 = startled, 0 = calm; fades slowly

function setup() {
  let S = min(windowWidth, windowHeight);
  createCanvas(S, S, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
}

// Body shape: elongated ovoid (Beroe-like)
function bodyRadius(theta, phi) {
  let r = 1.0;
  r *= (1 + 0.08 * Math.cos(2 * phi));
  let taper = Math.pow(Math.sin(theta), 0.6);
  return taper * r;
}

function jellySurface(theta, phi) {
  let r = bodyRadius(theta, phi);
  let R = 110;
  let H = 175;
  return createVector(
    R * r * Math.cos(phi),
    H * (Math.cos(theta) * 0.85),
    R * r * Math.sin(phi)
  );
}

function draw() {
  let startled = startleFrames > 0;
  if (startled) startleFrames--;
  colorBlend = startled ? 1.0 : lerp(colorBlend, 0, 0.008);

  let rate = startled ? 0.045 : 0.012;
  t += rate;

  // Auto-rotate; speed up on startle
  let rotSpeed = startled ? 0.018 : 0.005;
  targetRotY += rotSpeed;
  targetRotX = 0.3 + 0.1 * Math.sin(t * 0.3);

  rotX += (targetRotX - rotX) * 0.05;
  rotY += (targetRotY - rotY) * 0.05;

  background(0);
  blendMode(ADD);

  camera(0, -40, (height / 2.0) / tan((PI * 30.0) / 180.0), 0, 0, 0, 0, 1, 0);

  ambientLight(200, 40, 8);
  pointLight(color(180, 60, 90, 100), 0, -300, 200);
  pointLight(color(0, 80, 70, 80), 0, 100, -150);

  rotateX(rotX);
  rotateY(rotY);

  drawBody();
  drawCiliaRows();
  drawInternalOrgan();
}

function drawBody() {
  let dTheta = Math.PI / BODY_ROWS;
  let dPhi   = TWO_PI / BODY_COLS;

  for (let i = 0; i < BODY_ROWS; i++) {
    let theta0 = i * dTheta;
    let theta1 = (i + 1) * dTheta;

    beginShape(TRIANGLE_STRIP);
    for (let j = 0; j <= BODY_COLS; j++) {
      let phi = j * dPhi;

      let v0 = jellySurface(theta0, phi);
      let hue0   = 200 + 20 * Math.sin(phi * 3 + t);
      let depth0 = map(Math.cos(theta0), -1, 1, 0, 1);
      fill(hue0, 15, 55 + 20 * depth0, 18);
      vertex(v0.x, v0.y, v0.z);

      let v1 = jellySurface(theta1, phi);
      let hue1   = 200 + 20 * Math.sin(phi * 3 + t);
      let depth1 = map(Math.cos(theta1), -1, 1, 0, 1);
      fill(hue1, 15, 55 + 20 * depth1, 18);
      vertex(v1.x, v1.y, v1.z);
    }
    endShape();
  }
}

function drawInternalOrgan() {
  push();
  let dTheta = Math.PI / 50;
  let dPhi   = TWO_PI / 40;
  let scale  = 0.55;
  let pulse  = 1 + 0.04 * Math.sin(t * 2);

  for (let i = 0; i < 50; i++) {
    let theta0 = i * dTheta;
    let theta1 = (i + 1) * dTheta;

    beginShape(TRIANGLE_STRIP);
    for (let j = 0; j <= 40; j++) {
      let phi = j * dPhi;

      let v0 = jellySurface(theta0, phi);
      v0.mult(scale * pulse);
      v0.y *= 1.3;
      let h0 = 10 + 15 * Math.sin(theta0 * 2 + t * 0.5);
      let s0 = 85 + 10 * Math.sin(t);
      let b0 = 70 + 20 * Math.sin(theta0 + t);
      fill(h0, s0, b0, 75);
      vertex(v0.x, v0.y, v0.z);

      let v1 = jellySurface(theta1, phi);
      v1.mult(scale * pulse);
      v1.y *= 1.3;
      let h1 = 10 + 15 * Math.sin(theta1 * 2 + t * 0.5);
      let b1 = 70 + 20 * Math.sin(theta1 + t);
      fill(h1, s0, b1, 75);
      vertex(v1.x, v1.y, v1.z);
    }
    endShape();
  }

  strokeWeight(2);
  stroke(15, 70, 100, 60);
  noFill();
  beginShape();
  for (let i = 0; i <= 40; i++) {
    let theta   = map(i, 0, 40, 0.1, Math.PI - 0.1);
    let y       = 210 * 0.85 * Math.cos(theta) * 1.3 * scale;
    let flicker = 2 * Math.sin(theta * 8 + t * 3);
    vertex(flicker, y, 0);
  }
  endShape();
  noStroke();
  pop();
}

function drawCiliaRows() {
  let startled = startleFrames > 0 || colorBlend > 0.05;

  for (let row = 0; row < NUM_ROWS; row++) {
    let phi = (row / NUM_ROWS) * TWO_PI;

    for (let k = 0; k < CILIA_PER_ROW; k++) {
      let theta = map(k, 0, CILIA_PER_ROW - 1, 0.15, Math.PI - 0.15);
      let base  = jellySurface(theta, phi);

      let wavePhase = theta * 4 - t * 4 + row * 0.8;
      let beat      = Math.sin(wavePhase) * 0.5 + 0.5;
      let cilLen    = 12 + 8 * beat;

      let norm    = p5.Vector.normalize(createVector(base.x, 0, base.z));
      let beatDir = p5.Vector.normalize(createVector(
        Math.cos(phi + Math.PI / 2),
        0.3 * Math.sin(wavePhase),
        Math.sin(phi + Math.PI / 2)
      ));

      let tip = p5.Vector.add(base, p5.Vector.mult(norm, cilLen * 0.6));
      tip.add(p5.Vector.mult(beatDir, cilLen * 0.6));

      // Startle: cilia flash toward pink/white
      let hue   = lerp((row * 45 + k * 2 + t * 20) % 360, 320, colorBlend);
      let sat   = lerp(70 + 25 * beat, 50, colorBlend);
      let bri   = lerp(75 + 25 * beat, 100, colorBlend);
      let alpha = 55 + 40 * beat;

      stroke(hue, sat, bri, alpha);
      strokeWeight(1.5);
      line(base.x, base.y, base.z, tip.x, tip.y, tip.z);

      noStroke();
      fill(hue, sat - 10, 100, alpha * 0.7);
      push();
      translate(tip.x, tip.y, tip.z);
      sphere(1.2);
      pop();
    }
  }
  noStroke();
}

function mousePressed() {
  startleFrames = 180;
}

function touchStarted() {
  startleFrames = 180;
  return false;
}

function windowResized() {
  let S = min(windowWidth, windowHeight);
  resizeCanvas(S, S);
}
