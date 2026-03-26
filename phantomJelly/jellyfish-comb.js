// jellyfish-comb.js — Comb Jellyfish (Ctenophore)
// Circular canvas, Pepper's Ghost build.
// Click / tap to startle — speeds up cilia beat and rotation.

class NeuralNetwork {
  constructor(inputNodes, hiddenNodes, outputNodes) {
    this.w1 = Array.from({ length: hiddenNodes }, () =>
      Array.from({ length: inputNodes }, () => random(-1, 1))
    );
    this.w2 = Array.from({ length: outputNodes }, () =>
      Array.from({ length: hiddenNodes }, () => random(-1, 1))
    );
    this.hidden  = new Array(hiddenNodes).fill(0);
    this.outputs = new Array(outputNodes).fill(0);
  }
  predict(inputs) {
    this.hidden = this.w1.map(w =>
      Math.tanh(w.reduce((s, v, i) => s + v * inputs[i], 0))
    );
    this.outputs = this.w2.map(w =>
      Math.tanh(w.reduce((s, v, i) => s + v * this.hidden[i], 0))
    );
    return this.outputs;
  }
}

const NUM_ROWS     = 8;
const CILIA_PER_ROW = 60;
const BODY_ROWS    = 80;
const BODY_COLS    = 60;

let t = 0;
let rotX = 0, rotY = 0;
let targetRotX = 0.3, targetRotY = 0;

let startleFrames = 0;
let colorBlend    = 0;

let pos, vel, targetDir, jellySpeed;
let wanderTheta = 0;

// Neural network
let nn;
let nnNodes = [], nnEdges = [], nnAdjList = [];
let nnSignals = [];
let nnHiddenGanglia = [], nnOutputGanglia = [];

function setup() {
  let S = min(windowWidth, windowHeight);
  createCanvas(S, S, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  pos        = createVector(0, 0, 0);
  vel        = createVector(0, 0, 0);
  targetDir  = createVector(1, 0, 0);
  jellySpeed = 0;
  wanderTheta = random(TWO_PI);

  // ── Build NN mesh from body surface ──────────────────────────────────────
  nn = new NeuralNetwork(6, 10, 3);

  const MESH_T = 12, MESH_P = 8;
  for (let i = 0; i < MESH_T; i++) {
    for (let j = 0; j < MESH_P; j++) {
      let theta = map(i, 0, MESH_T - 1, 0.18, Math.PI - 0.18);
      let phi   = (j / MESH_P) * TWO_PI;
      let pt    = jellySurface(theta, phi);
      nnNodes.push({ x: pt.x, y: pt.y, z: pt.z });
    }
  }

  nnAdjList = Array.from({ length: nnNodes.length }, () => []);
  for (let i = 0; i < nnNodes.length; i++) {
    for (let j = i + 1; j < nnNodes.length; j++) {
      let a = nnNodes[i], b = nnNodes[j];
      let d = Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
      if (d < 58) {
        nnEdges.push([i, j]);
        nnAdjList[i].push(j);
        nnAdjList[j].push(i);
      }
    }
  }

  // Hidden ganglia spread evenly through mesh
  let step = floor(nnNodes.length / 10);
  for (let i = 0; i < 10; i++) nnHiddenGanglia.push((i * step + 3) % nnNodes.length);

  // Output ganglia near the equator (mid-latitude rows)
  let midNodes = nnNodes.map((_, i) => i).filter(i => {
    let row = floor(i / MESH_P);
    return row >= 4 && row <= 7;
  });
  for (let i = 0; i < 3; i++) {
    nnOutputGanglia.push(midNodes[floor(i * midNodes.length / 3)]);
  }
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
  let R = 72;
  let H = 115;
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

  // ── 3D Wander (Nature of Code) ──────────────────────────────────────────
  let wanderChange = startled ? 0.45 : 0.15;
  wanderTheta += random(-wanderChange, wanderChange);

  let wD = 50, wR = startled ? 20 : 8;
  let forward  = targetDir.copy().normalize();
  let worldUp  = abs(forward.y) > 0.99 ? createVector(1, 0, 0) : createVector(0, 1, 0);
  let right    = p5.Vector.cross(forward, worldUp).normalize();
  let circleUp = p5.Vector.cross(right, forward).normalize();
  let ahead    = forward.copy().mult(wD);
  // Suppress vertical wander — comb body is tall (H=115) and clips at top/bottom
  let wOff = p5.Vector.add(
    p5.Vector.mult(right,    wR * cos(wanderTheta)),
    p5.Vector.mult(circleUp, wR * 0.15 * sin(wanderTheta))
  );
  let wSteer = p5.Vector.add(ahead, wOff).normalize();
  targetDir.lerp(wSteer, startled ? 0.04 : 0.012).normalize();

  // ── Flow field: Perlin-noise ocean current ─────────────────────────────
  let fx = noise(pos.x * 0.004, pos.z * 0.004, frameCount * 0.002) * 2 - 1;
  let fz = noise(pos.x * 0.004 + 100, pos.z * 0.004 + 100, frameCount * 0.002) * 2 - 1;
  targetDir.lerp(createVector(fx, 0, fz).normalize(), 0.018).normalize();

  // ── Phototaxis: drift toward cursor / touch (ocelli response) ──────────
  let lx = (touches.length > 0 ? touches[0].x : mouseX) - width / 2;
  let ly = (touches.length > 0 ? touches[0].y : mouseY) - height / 2;
  let toLight = p5.Vector.sub(createVector(lx, ly, 0), pos);
  if (toLight.mag() > 20) {
    targetDir.lerp(toLight.normalize(), 0.008).normalize();
  }

  // ── Lookahead wall avoidance ─────────────────────────────────────────────
  // Tighter safeR to keep tall body inside circle
  let safeR   = min(width, height) * 0.12;
  let future  = p5.Vector.add(pos, vel.copy().normalize().mult(startled ? 40 : 25));
  if (future.mag() > safeR) {
    let radial  = future.copy().normalize();
    let tangent = createVector(-radial.z, 0, radial.x);
    if (tangent.dot(targetDir) < 0) tangent.mult(-1);
    let proximity = map(future.mag(), safeR * 0.85, safeR, 0, 1, true);
    targetDir.lerp(tangent, proximity * 0.7).normalize();
  }

  let targetSpeed = startled ? 2.5 : 0.6;
  jellySpeed = lerp(jellySpeed, targetSpeed, 0.05);

  vel.lerp(targetDir, 0.03).normalize().mult(jellySpeed);
  pos.add(vel);

  let hardLimit = min(width, height) * 0.16;
  if (pos.mag() > hardLimit) pos.normalize().mult(hardLimit);

  // ── NN: predict + update signals ─────────────────────────────────────────
  let inputs = [
    pos.x / width, pos.y / height, pos.z / width,
    noise(frameCount * 0.005) * 2 - 1,
    sin(frameCount * 0.005), cos(frameCount * 0.005)
  ];
  nn.predict(inputs);

  for (let i = 0; i < nn.hidden.length; i++) {
    let act = nn.hidden[i];
    if (random() < abs(act) * 0.15) {
      let start = nnHiddenGanglia[i];
      let neighbors = nnAdjList[start];
      if (neighbors && neighbors.length > 0) {
        nnSignals.push({ a: start, b: random(neighbors), p: 0,
          speed: random(0.04, 0.10), life: floor(random(3, 8)), intensity: abs(act) });
      }
    }
  }
  for (let i = 0; i < nn.outputs.length; i++) {
    let act = nn.outputs[i];
    if (random() < abs(act) * 0.2) {
      let start = nnOutputGanglia[i];
      let neighbors = nnAdjList[start];
      if (neighbors && neighbors.length > 0) {
        nnSignals.push({ a: start, b: random(neighbors), p: 0,
          speed: random(0.05, 0.15), life: floor(random(4, 10)), intensity: abs(act) });
      }
    }
  }
  for (let i = nnSignals.length - 1; i >= 0; i--) {
    let s = nnSignals[i];
    s.p += s.speed;
    if (s.p >= 1) {
      s.a = s.b; s.life--;
      if (s.life <= 0) { nnSignals.splice(i, 1); continue; }
      let nb = nnAdjList[s.a];
      if (nb && nb.length > 0) s.b = random(nb);
      s.p = 0;
    }
  }
  if (nnSignals.length > 300) nnSignals.splice(0, nnSignals.length - 300);

  background(0);
  blendMode(ADD);

  camera(0, -40, (height / 2.0) / tan((PI * 30.0) / 180.0), 0, 0, 0, 0, 1, 0);

  ambientLight(200, 40, 8);
  pointLight(color(180, 60, 90, 100), 0, -300, 200);
  pointLight(color(0, 80, 70, 80), 0, 100, -150);

  translate(pos.x, pos.y, pos.z);
  rotateX(rotX);
  rotateY(rotY);

  drawBody();
  drawCiliaRows();
  drawInternalOrgan();
  drawNNSignals();
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
      let hueSpeed = lerp(20, 400, colorBlend); // idle: slow drift, startled: full-spectrum spin
      let hue   = (row * 45 + k * 2 + t * hueSpeed) % 360;
      let sat   = lerp(70 + 25 * beat, 100, colorBlend);
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

function drawNNSignals() {
  let startled = startleFrames > 0 || colorBlend > 0.05;
  let hueSpeed = lerp(20, 400, colorBlend);

  // Dim mesh edges
  stroke(185, 40, 45, 18);
  strokeWeight(0.6);
  beginShape(LINES);
  for (let e of nnEdges) {
    let a = nnNodes[e[0]], b = nnNodes[e[1]];
    vertex(a.x, a.y, a.z);
    vertex(b.x, b.y, b.z);
  }
  endShape();

  // Travelling signals — hue spins with cilia on startle
  strokeWeight(2.5);
  beginShape(LINES);
  for (let s of nnSignals) {
    let nA = nnNodes[s.a], nB = nnNodes[s.b];
    if (!nA || !nB) continue;
    let x  = lerp(nA.x, nB.x, s.p),  y  = lerp(nA.y, nB.y, s.p),  z  = lerp(nA.z, nB.z, s.p);
    let tx = lerp(nA.x, nB.x, max(0, s.p - 0.5));
    let ty = lerp(nA.y, nB.y, max(0, s.p - 0.5));
    let tz = lerp(nA.z, nB.z, max(0, s.p - 0.5));
    let hue = (185 + t * hueSpeed) % 360;
    stroke(hue, lerp(55, 100, colorBlend), 100, s.intensity * 80);
    vertex(tx, ty, tz);
    vertex(x,  y,  z);
  }
  endShape();

  // Signal dots
  strokeWeight(4);
  beginShape(POINTS);
  for (let s of nnSignals) {
    let nA = nnNodes[s.a], nB = nnNodes[s.b];
    if (!nA || !nB) continue;
    let hue = (185 + t * hueSpeed) % 360;
    stroke(hue, lerp(50, 100, colorBlend), 100, s.intensity * 100);
    vertex(lerp(nA.x, nB.x, s.p), lerp(nA.y, nB.y, s.p), lerp(nA.z, nB.z, s.p));
  }
  endShape();

  // Hidden ganglia
  strokeWeight(7);
  beginShape(POINTS);
  for (let i = 0; i < nnHiddenGanglia.length; i++) {
    let n = nnNodes[nnHiddenGanglia[i]];
    let act = abs(nn.hidden[i]);
    let hue = (185 + t * hueSpeed) % 360;
    stroke(hue, 60, 80, 40 + act * 55);
    vertex(n.x, n.y, n.z);
  }
  endShape();

  // Output ganglia
  strokeWeight(9);
  beginShape(POINTS);
  for (let i = 0; i < nnOutputGanglia.length; i++) {
    let n = nnNodes[nnOutputGanglia[i]];
    let act = abs(nn.outputs[i]);
    let hue = (185 + t * hueSpeed) % 360;
    stroke(hue, 80, 100, 40 + act * 60);
    vertex(n.x, n.y, n.z);
  }
  endShape();

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
