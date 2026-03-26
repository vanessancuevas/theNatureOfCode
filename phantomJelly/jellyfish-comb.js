// jellyfish-comb.js — Comb Jellyfish (Ctenophore)
// Circular canvas, Pepper's Ghost build.
// Click / tap to startle — speeds up cilia beat and rotation.

// ── Prey draw functions (RGB colorMode, called inside push/pop) ────────────

function drawPreyCopepod(sz, col, alpha) {
  let [r,g,b] = col;
  stroke(r*0.6, g*0.6, b*0.6, alpha); strokeWeight(sz*0.06);
  fill(r, g, b, alpha);
  beginShape();
  vertex(0, -sz);
  bezierVertex(sz*0.5,-sz*0.5, sz*0.6,sz*0.3, 0,sz*0.8);
  bezierVertex(-sz*0.6,sz*0.3, -sz*0.5,-sz*0.5, 0,-sz);
  endShape(CLOSE);
  ellipse(0, -sz*0.8, sz*0.55, sz*0.55);
  stroke(r, g, b, alpha*0.8); strokeWeight(sz*0.05); noFill();
  line(sz*0.15,-sz, sz*0.8,-sz*1.8);
  line(-sz*0.15,-sz, -sz*0.8,-sz*1.8);
  for (let i = 0; i < 5; i++) {
    let ly = -sz*0.2 + i*sz*0.22;
    line(sz*0.55, ly, sz*1.1, ly+sz*0.15);
    line(-sz*0.55, ly, -sz*1.1, ly+sz*0.15);
  }
  line(sz*0.1, sz*0.75, sz*0.3, sz*1.3);
  line(-sz*0.1, sz*0.75, -sz*0.3, sz*1.3);
}

function drawPreyFishEgg(sz, col, alpha) {
  let [r,g,b] = col;
  noStroke();
  fill(r, g, b, alpha*40/255); ellipse(0,0, sz*2.2, sz*2.2);
  fill(r, g, b, alpha*70/255); ellipse(0,0, sz*1.8, sz*1.8);
  fill(r, g, b, alpha*120/255); ellipse(0,0, sz*1.4, sz*1.4);
  fill(255, 220, 80, alpha*200/255); ellipse(sz*0.3,-sz*0.3, sz*0.45,sz*0.45);
  noFill(); stroke(r*0.7,g*0.7,b*0.7, alpha*160/255); strokeWeight(sz*0.08);
  arc(0, sz*0.1, sz*0.9, sz*0.9, PI*0.2, PI*1.1);
  noFill(); stroke(r,g,b, alpha*60/255); strokeWeight(sz*0.04);
  ellipse(0,0, sz*2.1, sz*2.1);
}

function drawPreyDiatom(sz, col, alpha) {
  let [r,g,b] = col;
  fill(r, g, b, alpha*200/255);
  stroke(r*0.5,g*0.5,b*0.5, alpha); strokeWeight(sz*0.05);
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.15) {
    let rx = sz*(1.0 + 0.12*cos(a*8));
    let ry = sz*(0.38 + 0.04*cos(a*8));
    vertex(rx*cos(a), ry*sin(a));
  }
  endShape(CLOSE);
  stroke(r*0.4,g*0.4,b*0.4, alpha*180/255); strokeWeight(sz*0.07);
  line(-sz*0.95, 0, sz*0.95, 0);
  strokeWeight(sz*0.03);
  for (let i = -8; i <= 8; i++) {
    let x = i*sz*0.12;
    let hw = sz*0.32*sqrt(max(0, 1-(x/(sz))**2));
    line(x,-hw, x,hw);
  }
}

function drawPreyAmphipod(sz, col, alpha) {
  let [r,g,b] = col;
  stroke(r*0.55,g*0.55,b*0.55, alpha); strokeWeight(sz*0.06);
  fill(r,g,b, alpha);
  for (let i = 0; i < 7; i++) {
    let t = i/7;
    let bx = sin(t*1.2)*sz*0.5;
    let by = (t-0.4)*sz*2.2;
    let sw = sz*(0.55-t*0.25);
    ellipse(bx, by, sw*2, sz*0.38);
  }
  stroke(r,g,b, alpha); strokeWeight(sz*0.04); noFill();
  line(0,-sz*0.9, sz*0.7,-sz*1.8);
  line(0,-sz*0.9, -sz*0.4,-sz*1.9);
  for (let i = 0; i < 4; i++) {
    let ly = -sz*0.1 + i*sz*0.28;
    let bx = sin((i/4)*1.2)*sz*0.5;
    line(bx+sz*0.45, ly, bx+sz*1.05, ly+sz*0.3);
    line(bx-sz*0.45, ly, bx-sz*1.05, ly+sz*0.3);
  }
  let tx = sin(1.2)*sz*0.5;
  line(tx+sz*0.15, sz*0.9, tx+sz*0.5, sz*1.5);
  line(tx-sz*0.15, sz*0.9, tx-sz*0.5, sz*1.5);
}

function drawPreyMedusaLarva(sz, col, alpha) {
  let [r,g,b] = col;
  noStroke(); fill(r,g,b, alpha*30/255); ellipse(0,0, sz*2.4, sz*2.4);
  fill(r,g,b, alpha*160/255);
  stroke(r*0.6,g*0.6,b*0.6, alpha*120/255); strokeWeight(sz*0.04);
  for (let i = 0; i < 8; i++) {
    let a = (i/8)*TWO_PI;
    push(); rotate(a); ellipse(0,-sz*0.85, sz*0.32,sz*0.7); pop();
  }
  fill(r,g,b, alpha*200/255); noStroke(); ellipse(0,0, sz*0.7, sz*0.7);
  stroke(r,g,b, alpha*100/255); strokeWeight(sz*0.04);
  for (let i = 0; i < 8; i++) {
    let a = (i/8)*TWO_PI; line(0,0, cos(a)*sz*0.85, sin(a)*sz*0.85);
  }
  stroke(r,g,b, alpha*80/255); strokeWeight(sz*0.03); noFill();
  for (let i = 0; i < 8; i++) {
    let a = ((i+0.5)/8)*TWO_PI;
    let tx = cos(a)*sz, ty = sin(a)*sz;
    beginShape();
    vertex(cos(a)*sz*0.35, sin(a)*sz*0.35);
    bezierVertex(tx*0.6,ty*0.6, tx*1.1+cos(a+1)*sz*0.4,ty*1.1+sin(a+1)*sz*0.4, tx*1.3,ty*1.3);
    endShape();
  }
}

class Prey {
  constructor() {
    const TYPES = [
      { name: 'Copepod',      col: [85,  212, 240] },
      { name: 'Fish egg',     col: [245, 220, 80]  },
      { name: 'Diatom',       col: [68,  200, 104] },
      { name: 'Amphipod',     col: [240, 112, 64]  },
      { name: 'Medusa larva', col: [170, 119, 240] },
    ];
    let t = random(TYPES);
    this.type = t.name;
    this.col  = t.col;
    this.sz   = random(4, 7);
    let ang = random(TWO_PI);
    let dist = random(40, min(width, height) * 0.18);
    this.pos = createVector(cos(ang)*dist, random(-50, 50), sin(ang)*dist);
    this.vel = createVector(0, 0, 0);
    this.targetDir = p5.Vector.random3D();
    this.speed = random(0.2, 0.5);
    this.wanderTheta = random(TWO_PI);
    this.rot = random(TWO_PI);
    this.alpha = 0;
    this.captured = false;
    this.captureTimer = 0;
    this.stunned = false;
    this.stunnedTimer = 0;
  }

  update() {
    if (this.captured) {
      this.captureTimer++;
      this.alpha = max(0, map(this.captureTimer, 0, 30, 255, 0));
      return;
    }
    if (this.stunned) {
      this.alpha = min(255, this.alpha + 15);
      this.stunnedTimer++;
      this.pos.add(createVector(random(-0.5,0.5), random(-0.3,0.3), random(-0.5,0.5)));
      return;
    }
    this.alpha = min(255, this.alpha + 10);
    this.wanderTheta += random(-0.15, 0.15);
    let wD = 30, wR = 6;
    let fwd = this.targetDir.copy().normalize();
    let wUp = abs(fwd.y) > 0.99 ? createVector(1,0,0) : createVector(0,1,0);
    let wRt = p5.Vector.cross(fwd, wUp).normalize();
    let wCUp = p5.Vector.cross(wRt, fwd).normalize();
    let wSteer = p5.Vector.add(
      fwd.copy().mult(wD),
      p5.Vector.add(p5.Vector.mult(wRt, wR*cos(this.wanderTheta)),
                    p5.Vector.mult(wCUp, wR*sin(this.wanderTheta)))
    ).normalize();
    this.targetDir.lerp(wSteer, 0.03).normalize();
    this.targetDir.lerp(createVector(0,-1,0), 0.002).normalize();
    // Evade: steer away from comb jelly's predicted future position (NoC Ch. 6)
    if (typeof pos !== 'undefined' && typeof vel !== 'undefined') {
      let dToJelly = this.pos.dist(pos);
      let detectionR = 220;
      if (dToJelly < detectionR) {
        let T = min(dToJelly / max(jellySpeed, 0.5), 40);
        let jellyFuture = p5.Vector.add(pos, p5.Vector.mult(vel, T));
        let evadeDir = p5.Vector.sub(this.pos, jellyFuture).normalize();
        let evadeStr = map(dToJelly, 0, detectionR, 0.15, 0.0, true);
        this.targetDir.lerp(evadeDir, evadeStr).normalize();
      }
    }
    this.vel.lerp(this.targetDir, 0.05).normalize().mult(this.speed);
    this.pos.add(this.vel);
    let lim = min(width, height) * 0.24;
    if (this.pos.mag() > lim) this.pos.normalize().mult(lim * 0.9);
    this.rot += 0.008;
  }

  isDone() { return this.captured && this.captureTimer > 35; }

  draw() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    rotate(this.rot);
    colorMode(RGB, 255);
    blendMode(BLEND);
    if (this.stunned) {
      let pulse = 128 + 127 * sin(this.stunnedTimer * 0.5);
      noStroke(); fill(180, 220, 255, pulse * this.alpha / 255);
      ellipse(0, 0, this.sz * 5, this.sz * 5);
      fill(220, 240, 255, pulse * 0.6 * this.alpha / 255);
      ellipse(0, 0, this.sz * 3, this.sz * 3);
    }
    if      (this.type === 'Copepod')      drawPreyCopepod(this.sz, this.col, this.alpha);
    else if (this.type === 'Fish egg')     drawPreyFishEgg(this.sz, this.col, this.alpha);
    else if (this.type === 'Diatom')       drawPreyDiatom(this.sz, this.col, this.alpha);
    else if (this.type === 'Amphipod')     drawPreyAmphipod(this.sz, this.col, this.alpha);
    else                                   drawPreyMedusaLarva(this.sz, this.col, this.alpha);
    colorMode(HSB, 360, 100, 100, 100);
    blendMode(ADD);
    pop();
  }
}

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
let stingPrey     = null;
let stingFrames   = 0;

let pos, vel, targetDir, jellySpeed;
let wanderTheta = 0;
let preyList = [];
let clickTimes = [];

// Neural network
let nn;
let nnNodes = [], nnEdges = [], nnAdjList = [];
let nnSignals = [];
let nnHiddenGanglia = [], nnOutputGanglia = [];

function setup() {
  let S = min(windowWidth, windowHeight);
  if (S < 50) S = min(screen.width, screen.height) * 0.8;
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
  let R = 58;
  let H = 92;
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

  // ── Buoyancy: jellyfish naturally swim upward ──────────────────────────
  targetDir.lerp(createVector(0, -1, 0), 0.006).normalize();

  // ── Flow field: Perlin-noise ocean current ─────────────────────────────
  let fx = noise(pos.x * 0.004, pos.z * 0.004, frameCount * 0.002) * 2 - 1;
  let fy = noise(pos.y * 0.004 + 200, frameCount * 0.002 + 50) * 2 - 1;
  let fz = noise(pos.x * 0.004 + 100, pos.z * 0.004 + 100, frameCount * 0.002) * 2 - 1;
  targetDir.lerp(createVector(fx, fy * 0.4, fz).normalize(), 0.012).normalize();

  // ── Phototaxis: drift toward cursor / touch (ocelli response) ──────────
  if (mouseHasMoved || touches.length > 0) {
    let lx = (touches.length > 0 ? touches[0].x : mouseX) - width / 2;
    let ly = (touches.length > 0 ? touches[0].y : mouseY) - height / 2;
    let toLight = p5.Vector.sub(createVector(lx, ly, 0), pos);
    if (toLight.mag() > 20) {
      targetDir.lerp(toLight.normalize(), 0.008).normalize();
    }
  }

  // ── Prey seek ──────────────────────────────────────────────────────────
  if (preyList.length > 0) {
    let nearest = null, nearestDist = Infinity;
    for (let pr of preyList) {
      if (!pr.captured) {
        let d = pos.dist(pr.pos);
        if (d < nearestDist) { nearestDist = d; nearest = pr; }
      }
    }
    if (nearest) {
      // Pursue: predict prey's future position (NoC Ch. 6)
      let pursueT = min(nearestDist / max(jellySpeed, 0.5), 60);
      let futurePreyPos = p5.Vector.add(nearest.pos, p5.Vector.mult(nearest.vel, pursueT));
      targetDir.lerp(p5.Vector.sub(futurePreyPos, pos).normalize(), 0.05).normalize();
      // Sting: fire nematocysts when prey enters range
      if (nearestDist < 130 && !nearest.stunned) {
        nearest.stunned = true;
        stingPrey = nearest;
        stingFrames = 30;
        let zapDir = p5.Vector.sub(nearest.pos, pos).normalize();
        for (let sn = 0; sn < nnNodes.length; sn++) {
          let n = nnNodes[sn];
          let nDir = createVector(n.x - pos.x, n.y - pos.y, n.z - pos.z).normalize();
          if (nDir.dot(zapDir) > 0.4) {
            let nb = nnAdjList[sn];
            if (nb && nb.length > 0) {
              nnSignals.push({ a: sn, b: random(nb), p: 0,
                speed: random(0.15, 0.4), life: floor(random(2, 5)),
                intensity: 1.0, zap: true });
            }
          }
        }
      }
      // Eat: absorb stunned prey when close
      if (nearestDist < 65 && nearest.stunned) {
        nearest.captured = true;
        colorBlend = 1.0;
        startleFrames = max(startleFrames, 60);
        stingPrey = null;
        stingFrames = 0;
        for (let sn = 0; sn < nnNodes.length; sn++) {
          let nb = nnAdjList[sn];
          if (nb && nb.length > 0) {
            nnSignals.push({ a: sn, b: random(nb), p: random(1),
              speed: random(0.08, 0.22), life: floor(random(3, 6)),
              intensity: 1.0, capture: true });
          }
        }
      }
    }
    if (stingFrames > 0) stingFrames--;
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
  if (nnSignals.length > 600) nnSignals.splice(0, nnSignals.length - 600);

  for (let pr of preyList) pr.update();

  background(0);
  blendMode(ADD);

  camera(0, -40, (height / 2.0) / tan((PI * 30.0) / 180.0), 0, 0, 0, 0, 1, 0);

  ambientLight(200, 40, 8);
  pointLight(color(180, 60, 90, 100), 0, -300, 200);
  pointLight(color(0, 80, 70, 80), 0, 100, -150);

  for (let i = preyList.length - 1; i >= 0; i--) {
    preyList[i].draw();
    if (preyList[i].isDone()) preyList.splice(i, 1);
  }

  // ── Sting arc ─────────────────────────────────────────────────────────
  if (stingPrey && stingFrames > 0) {
    let arcEnd = stingPrey.pos;
    let toPreyDir = p5.Vector.sub(arcEnd, pos).normalize();
    let arcStart = p5.Vector.add(pos, toPreyDir.copy().mult(60));
    let arcAlpha = map(stingFrames, 0, 30, 0, 200);
    colorMode(RGB, 255);
    noFill(); stroke(160, 220, 255, arcAlpha); strokeWeight(1.5);
    beginShape();
    for (let ti = 0; ti <= 12; ti++) {
      let tp = ti / 12;
      let jit = sin(tp * PI) * 8;
      vertex(
        lerp(arcStart.x, arcEnd.x, tp) + random(-jit, jit),
        lerp(arcStart.y, arcEnd.y, tp) + random(-jit, jit),
        lerp(arcStart.z, arcEnd.z, tp) + random(-jit, jit)
      );
    }
    endShape();
    colorMode(HSB, 360, 100, 100, 100);
  }

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
    if (s.zap) { stroke(200, 50, 100, s.intensity * 120); }
    else if (s.capture) { stroke(320, 100, 100, s.intensity * 80); }
    else { stroke(hue, lerp(55, 100, colorBlend), 100, s.intensity * 80); }
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
    if (s.zap) { stroke(200, 50, 100, s.intensity * 140); }
    else if (s.capture) { stroke(320, 100, 100, s.intensity * 100); }
    else { stroke(hue, lerp(50, 100, colorBlend), 100, s.intensity * 100); }
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

let mouseHasMoved = false;
function mouseMoved() { mouseHasMoved = true; }

function mousePressed() {
  startleFrames = 180;
  let now = millis();
  clickTimes.push(now);
  clickTimes = clickTimes.filter(t => now - t < 600);
  if (clickTimes.length >= 3) {
    preyList.push(new Prey());
    clickTimes = [];
  }
}

function touchStarted() {
  startleFrames = 180;
  return false;
}

function windowResized() {
  let S = min(windowWidth, windowHeight);
  resizeCanvas(S, S);
}
