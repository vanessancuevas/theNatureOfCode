// jellyfish-ghost.js — Pepper's Ghost build
// Square canvas, circular CSS clip, pure black bg, single jellyfish.
// Black pixels = transparent to the cone reflection, so keep bg strict #000.

class NeuralNetwork {
  constructor(inputNodes, hiddenNodes, outputNodes) {
    this.w1 = Array.from({ length: hiddenNodes }, () =>
      Array.from({ length: inputNodes }, () => random(-1, 1))
    );
    this.w2 = Array.from({ length: outputNodes }, () =>
      Array.from({ length: hiddenNodes }, () => random(-1, 1))
    );
    this.hidden = new Array(hiddenNodes).fill(0);
    this.outputs = new Array(outputNodes).fill(0);
  }

  predict(inputs) {
    this.hidden = this.w1.map((w) =>
      Math.tanh(w.reduce((sum, val, i) => sum + val * inputs[i], 0))
    );
    this.outputs = this.w2.map((w) =>
      Math.tanh(w.reduce((sum, val, i) => sum + val * this.hidden[i], 0))
    );
    return this.outputs;
  }
}

function rotateVec(v, k, theta) {
  let cosT = cos(theta);
  let sinT = sin(theta);
  let cross = p5.Vector.cross(k, v);
  let dot = k.dot(v);
  let v1 = p5.Vector.mult(v, cosT);
  let v2 = p5.Vector.mult(cross, sinT);
  let v3 = p5.Vector.mult(k, dot * (1 - cosT));
  return p5.Vector.add(v1, v2).add(v3);
}

class Jellyfish {
  constructor() {
    this.nn = new NeuralNetwork(6, 10, 3);
    this.pos = createVector(0, 0, 0);
    this.vel = createVector(0, -1, 0);
    this.targetDir = createVector(0, -1, 0);
    this.speed = 0;
    this.cycle = random(TWO_PI);
    this.baseR = 48;
    this.startleFrames = 0;
    this.colorBlend = 0; // 1 = full pink, 0 = light blue; fades slowly after startle

    this.nodes = [];
    this.edges = [];
    this.adjList = [];

    let rings = 14;
    for (let r = 0; r <= rings; r++) {
      let v = r / rings;
      let phi = v * PI * 0.6;
      let numPoints = max(1, floor(sin(phi) * 28));
      if (r === 0) numPoints = 1;
      for (let i = 0; i < numPoints; i++) {
        let u = i / numPoints;
        let theta = u * TWO_PI;
        this.nodes.push({ u, v, phi, theta, x: 0, y: 0, z: 0 });
      }
    }

    this.adjList = Array.from({ length: this.nodes.length }, () => []);

    let tempPositions = this.nodes.map((n) =>
      createVector(
        this.baseR * sin(n.phi) * cos(n.theta),
        -this.baseR * cos(n.phi),
        this.baseR * sin(n.phi) * sin(n.theta)
      )
    );

    for (let i = 0; i < tempPositions.length; i++) {
      for (let j = i + 1; j < tempPositions.length; j++) {
        if (tempPositions[i].dist(tempPositions[j]) < 28) {
          this.edges.push([i, j]);
          this.adjList[i].push(j);
          this.adjList[j].push(i);
        }
      }
    }

    this.signals = [];
    this.hiddenGanglia = [];
    let step = floor(this.nodes.length / 10);
    for (let i = 0; i < 10; i++) {
      this.hiddenGanglia.push((i * step + 5) % this.nodes.length);
    }

    this.outputGanglia = [];
    let rimNodes = [];
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].phi > PI * 0.55) rimNodes.push(i);
    }
    for (let i = 0; i < 3; i++) {
      if (rimNodes.length > 0) {
        let idx = floor((i / 3) * rimNodes.length);
        this.outputGanglia.push(rimNodes[idx]);
      } else {
        this.outputGanglia.push(this.nodes.length - 1 - i);
      }
    }

    this.tentacles = [];
    let numTentacles = 16;
    for (let i = 0; i < numTentacles; i++) {
      let theta = (i / numTentacles) * TWO_PI;
      let tNodes = [];
      let len = floor(random(20, 35));
      for (let j = 0; j < len; j++) {
        tNodes.push(createVector(0, 0, 0));
      }
      this.tentacles.push({ theta, nodes: tNodes });
    }
  }

  update() {
    let startled = this.startleFrames > 0;
    if (startled) this.startleFrames--;
    this.colorBlend = startled ? 1.0 : lerp(this.colorBlend, 0, 0.008);

    // Idle: slow, lazy pulse (~1 per 5s). Startled: rapid bursts.
    this.cycle += startled ? 0.09 : 0.018;
    let phase = (this.cycle % TWO_PI) / TWO_PI;
    let pulse = 0;
    if (phase < 0.35) {
      pulse = sin((phase * PI) / 0.35);
    }

    let targetSpeed = startled
      ? map(pulse, 0, 1, 1.0, 8.0)
      : map(pulse, 0, 1, 0.1, 1.8);
    this.speed = lerp(this.speed, targetSpeed, 0.08);

    let inputs = [
      this.pos.x / width,
      this.pos.y / height,
      this.pos.z / width,
      noise(frameCount * 0.005) * 2 - 1,
      sin(frameCount * 0.005),
      cos(frameCount * 0.005)
    ];

    let out = this.nn.predict(inputs);
    // Dampen NN steering in idle so drift is gentle
    let steerStrength = startled ? 0.02 : 0.006;
    let steer = createVector(out[0], out[1], out[2]).mult(steerStrength);
    this.targetDir.add(steer).normalize();

    // Soft steering back toward centre when approaching circle edge
    let d = this.pos.mag();
    let bounds    = min(width, height) * 0.22;
    let maxBounds = min(width, height) * 0.28;

    if (d > bounds) {
      let toCenter = this.pos.copy().mult(-1).normalize();
      let factor = map(d, bounds, maxBounds, 0.0, 0.4, true);
      this.targetDir.lerp(toCenter, factor).normalize();
    }

    let downLimit = map(d, bounds, maxBounds, 0.1, 1.0, true);
    this.targetDir.y = min(this.targetDir.y, downLimit);
    this.targetDir.normalize();

    this.vel.lerp(this.targetDir, 0.02).normalize();
    this.vel.y = min(this.vel.y, downLimit);
    this.vel.normalize().mult(this.speed);

    this.pos.add(this.vel);

    // Hard clamp — position can never leave the safe circle regardless of speed/momentum
    let hardLimit = min(width, height) * 0.30;
    if (this.pos.mag() > hardLimit) {
      this.pos.normalize().mult(hardLimit);
    }

    let up = createVector(0, -1, 0);
    let vNorm = this.vel.copy().normalize();
    let axis = p5.Vector.cross(up, vNorm);
    let angle = acos(up.dot(vNorm));
    let axisMag = axis.mag();

    if (axisMag < 0.001) {
      axis = createVector(1, 0, 0);
    } else {
      axis.div(axisMag);
    }

    this.nodes.forEach((n) => {
      let nval = noise(n.u * 4, n.v * 4, frameCount * 0.015) * 11;
      let r = this.baseR * (1 - 0.4 * pulse * sin(n.phi)) + nval;
      let yStretch = 1 + 0.3 * pulse;

      n.x = r * sin(n.phi) * cos(n.theta);
      n.y = -this.baseR * cos(n.phi) * yStretch;
      n.z = r * sin(n.phi) * sin(n.theta);
    });

    let rRim = this.baseR * (1 - 0.4 * pulse * sin(PI * 0.6));
    let yRim = -this.baseR * cos(PI * 0.6) * (1 + 0.3 * pulse);

    for (let i = 0; i < this.tentacles.length; i++) {
      let t = this.tentacles[i];
      let localPt = createVector(rRim * cos(t.theta), yRim, rRim * sin(t.theta));
      let globalPt = rotateVec(localPt, axis, angle);
      globalPt.add(this.pos);

      t.nodes[0] = globalPt;
      for (let j = 1; j < t.nodes.length; j++) {
        let curr = t.nodes[j];
        let prev = t.nodes[j - 1];
        let dir = p5.Vector.sub(curr, prev);
        let dist = dir.mag();
        let restingDist = 6;

        dir.normalize();
        let force = dir.mult(dist - restingDist);
        curr.sub(force.mult(0.6));

        curr.x += map(noise(curr.x * 0.02, curr.y * 0.02, frameCount * 0.01), 0, 1, -0.6, 0.6);
        curr.z += map(noise(curr.z * 0.02, curr.y * 0.02, frameCount * 0.01 + 100), 0, 1, -0.6, 0.6);
      }
    }

    for (let i = 0; i < this.nn.hidden.length; i++) {
      let act = this.nn.hidden[i];
      if (random() < abs(act) * 0.15) {
        let startNode = this.hiddenGanglia[i];
        let neighbors = this.adjList[startNode];
        if (neighbors && neighbors.length > 0) {
          this.signals.push({
            a: startNode,
            b: random(neighbors),
            p: 0,
            speed: random(0.04, 0.1),
            life: floor(random(3, 8)),
            intensity: abs(act)
          });
        }
      }
    }

    for (let i = 0; i < this.nn.outputs.length; i++) {
      let act = this.nn.outputs[i];
      if (random() < abs(act) * 0.2) {
        let startNode = this.outputGanglia[i];
        let neighbors = this.adjList[startNode];
        if (neighbors && neighbors.length > 0) {
          this.signals.push({
            a: startNode,
            b: random(neighbors),
            p: 0,
            speed: random(0.05, 0.15),
            life: floor(random(4, 10)),
            intensity: abs(act)
          });
        }
      }
    }

    for (let i = this.signals.length - 1; i >= 0; i--) {
      let s = this.signals[i];
      s.p += s.speed;
      if (s.p >= 1) {
        s.a = s.b;
        s.life--;
        if (s.life <= 0) {
          this.signals.splice(i, 1);
          continue;
        }
        let neighbors = this.adjList[s.a];
        if (neighbors && neighbors.length > 0) {
          s.b = random(neighbors);
        }
        s.p = 0;
      }
    }

    if (this.signals.length > 300) {
      this.signals.splice(0, this.signals.length - 300);
    }

    this.renderState = { axis, angle };
  }

  render() {
    noStroke();
    fill(258, 100, 70, 50);   // deep indigo tentacle fill
    for (let t of this.tentacles) {
      beginShape(TRIANGLE_STRIP);
      for (let j = 0; j < t.nodes.length; j++) {
        let curr = t.nodes[j];
        let prev = j > 0 ? t.nodes[j - 1] : curr;
        let next = j < t.nodes.length - 1 ? t.nodes[j + 1] : curr;

        let tangent = p5.Vector.sub(next, prev);
        if (tangent.magSq() < 0.0001) tangent = createVector(0, -1, 0);
        tangent.normalize();

        let toCenter = p5.Vector.sub(curr, this.pos);
        if (toCenter.magSq() < 0.0001) toCenter = createVector(1, 0, 0);
        toCenter.normalize();

        let widthDir = tangent.cross(toCenter);
        if (widthDir.magSq() < 0.0001) widthDir = createVector(1, 0, 0);
        widthDir.normalize();

        let taper = map(j, 0, t.nodes.length - 1, 14, 1);
        let ruffle = sin(j * 0.6 - frameCount * 0.15) * 5;
        let finalWidth = taper + ruffle;

        widthDir.mult(finalWidth);
        vertex(curr.x + widthDir.x, curr.y + widthDir.y, curr.z + widthDir.z);
        vertex(curr.x - widthDir.x, curr.y - widthDir.y, curr.z - widthDir.z);
      }
      endShape();
    }

    noFill();
    stroke(272, 100, 100, 120);  // vivid violet tentacle stroke
    strokeWeight(1.5);
    for (let t of this.tentacles) {
      beginShape();
      for (let n of t.nodes) {
        vertex(n.x, n.y, n.z);
      }
      endShape();
    }

    let signalPhase = (frameCount * 0.15) % 40;
    strokeWeight(3.5);
    for (let t of this.tentacles) {
      for (let j = 0; j < t.nodes.length; j++) {
        if (abs(j - signalPhase) < 1.5) {
          stroke(295, 60, 100, 255);  // hot pink-white travel pulse
          point(t.nodes[j].x, t.nodes[j].y, t.nodes[j].z);
        }
      }
    }

    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    if (this.renderState.axis.magSq() > 0) {
      rotate(this.renderState.angle, this.renderState.axis);
    }

    stroke(248, 100, 100, 28);  // electric blue bell mesh
    strokeWeight(1);
    beginShape(LINES);
    for (let e of this.edges) {
      let n1 = this.nodes[e[0]];
      let n2 = this.nodes[e[1]];
      vertex(n1.x, n1.y, n1.z);
      vertex(n2.x, n2.y, n2.z);
    }
    endShape();

    strokeWeight(2);
    beginShape(LINES);
    for (let s of this.signals) {
      let nA = this.nodes[s.a];
      let nB = this.nodes[s.b];
      if (!nA || !nB) continue;

      let x = lerp(nA.x, nB.x, s.p);
      let y = lerp(nA.y, nB.y, s.p);
      let z = lerp(nA.z, nB.z, s.p);

      let tailP = max(0, s.p - 0.5);
      let tx = lerp(nA.x, nB.x, tailP);
      let ty = lerp(nA.y, nB.y, tailP);
      let tz = lerp(nA.z, nB.z, tailP);

      stroke(lerp(205, 295, this.colorBlend), lerp(65, 60, this.colorBlend), 100, s.intensity * 200);
      vertex(tx, ty, tz);
      vertex(x, y, z);
    }
    endShape();

    strokeWeight(4);
    beginShape(POINTS);
    for (let s of this.signals) {
      let nA = this.nodes[s.a];
      let nB = this.nodes[s.b];
      if (!nA || !nB) continue;
      let x = lerp(nA.x, nB.x, s.p);
      let y = lerp(nA.y, nB.y, s.p);
      let z = lerp(nA.z, nB.z, s.p);
      stroke(lerp(205, 295, this.colorBlend), lerp(40, 60, this.colorBlend), 100, s.intensity * 255);
      vertex(x, y, z);
    }
    endShape();

    strokeWeight(8);
    beginShape(POINTS);
    for (let i = 0; i < this.hiddenGanglia.length; i++) {
      let gIdx = this.hiddenGanglia[i];
      let n = this.nodes[gIdx];
      let act = abs(this.nn.hidden[i]);
      stroke(250, 100, 100, 50 + act * 205);  // indigo hidden ganglia
      vertex(n.x, n.y, n.z);
    }
    endShape();

    strokeWeight(10);
    beginShape(POINTS);
    for (let i = 0; i < this.outputGanglia.length; i++) {
      let gIdx = this.outputGanglia[i];
      let n = this.nodes[gIdx];
      let act = abs(this.nn.outputs[i]);
      stroke(290, 100, 100, 50 + act * 205);  // magenta output ganglia
      vertex(n.x, n.y, n.z);
    }
    endShape();

    strokeWeight(3);
    beginShape(POINTS);
    for (let i = 0; i < this.nodes.length; i++) {
      let n = this.nodes[i];
      if (random() > 0.98) {
        stroke(195, 20, 100, 255);   // icy white-cyan sparkle
      } else {
        stroke(248, 100, 100, 75);   // electric blue nodes
      }
      vertex(n.x, n.y, n.z);
    }
    endShape();

    pop();
  }
}

// ─── Kelp (WEBGL-adapted from 2D fractal plant) ───────────────────────────────
class Kelp {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;       // world y — positive = below centre in WEBGL
    this.z = z;       // 3D depth offset
    // d: 0 = front (thick, bright), 1 = back (thin, dark)
    this.d = map(abs(z), 0, 150, 0, 1);
    this.noiseSeed = random(1000);
    this.segments  = floor(map(this.d, 0, 1, 22, 10));

    let R = min(width, height) * 0.5;

    // How far the stalk can grow upward before hitting the circle top at this x
    // Circle eq: x²+y²=R² → topY = -sqrt(R²-x²)  (negative = above centre)
    let availH = y + sqrt(max(0, R * R - x * x));

    // Fit baseLen so the total stalk (geometric series) fills 90% of availH
    // sum = baseLen * (1 - 0.95^n) / 0.05
    let geoSum = (1 - Math.pow(0.95, this.segments)) / 0.05;
    this.baseLen = constrain((availH * 0.90) / geoSum, 8, 42);

    // Max frond reach before hitting the circle wall sideways
    this.maxFrondLen = max(15, R - abs(x));

    // HSB greens matching the original's vibe
    this.baseH = random(125, 145);
    this.tipH  = random(90, 112);
    this.baseS = map(this.d, 0, 1, 88, 55);
    this.tipS  = map(this.d, 0, 1, 72, 45);
    this.baseB = map(this.d, 0, 1, 50, 22);
    this.tipB  = map(this.d, 0, 1, 72, 38);
  }

  show() {
    push();
    translate(this.x, this.y, this.z);
    noFill();
    this.branch(this.baseLen, this.segments, this.noiseSeed);
    pop();
  }

  branch(len, depth, nSeed) {
    // Thick base (up to 14px front), tapers to thin tip — matches original
    let maxThick = map(this.d, 0, 1, 14, 4);
    let sw = map(depth, 0, this.segments, 0.5, maxThick);
    strokeWeight(sw);

    let t = depth / this.segments;
    let h = lerp(this.tipH, this.baseH, t);
    let s = lerp(this.tipS, this.baseS, t);
    let b = lerp(this.tipB, this.baseB, t);
    let a = map(this.d, 0, 1, 230, 110);
    stroke(h, s, b, a);

    let noiseAngle = map(noise(nSeed, frameCount * 0.003), 0, 1, -0.15, 0.15);
    let waveAngle  = sin(frameCount * 0.015 + this.x * 0.01 + depth * 0.1) * 0.08;
    rotate(noiseAngle + waveAngle);

    line(0, 0, 0, 0, -len, 0);
    translate(0, -len, 0);

    if (depth > 0) {
      push();
      this.branch(len * 0.95, depth - 1, nSeed + 0.1);
      pop();

      // Fronds on every segment (matches original — no modulo filter)
      if (depth < this.segments - 1) {
        push();
        let leafAngle = map(noise(nSeed + 50, frameCount * 0.005), 0, 1, PI / 8, PI / 2.5);
        let side = (depth % 2 === 0) ? 1 : -1;
        rotate(leafAngle * side);

        strokeWeight(map(this.d, 0, 1, 3, 1));
        let lh = lerp(this.tipH, 105, 0.4);
        stroke(lh, lerp(s, 65, 0.4), lerp(b, 75, 0.4), a);
        noFill();

        // Cap frond length so it can't punch through the circle wall
        let leafLen = min(len * map(this.d, 0, 1, 4.5, 2), this.maxFrondLen);
        // cp1y/endY use `side` so frond alternates up/down, matching 2D original
        let cp1x = leafLen * 0.4;
        let cp1y = side * leafLen * 0.3;
        let cp2x = leafLen * 0.7;
        let cp2y = side * leafLen * 0.1;
        let endX = leafLen;
        let endY = side * leafLen * 0.4;
        bezier(
          0,    0,    0,
          cp1x, cp1y, 0,
          cp2x, cp2y, 0,
          endX, endY, 0
        );
        pop();
      }
    }
  }
}

// ─── Scene setup ──────────────────────────────────────────────────────────────
let jelly;
let kelps = [];

function setup() {
  let S = min(windowWidth, windowHeight);
  createCanvas(S, S, WEBGL);
  colorMode(HSB, 360, 100, 100, 255);
  jelly = new Jellyfish();
  spawnKelp();
}

function spawnKelp() {
  kelps = [];
  let R = min(width, height) * 0.5;
  let numKelp = floor(min(width, height) / 35);
  for (let i = 0; i < numKelp; i++) {
    // Keep x within 88% of radius so fronds always have room
    let x = random(-R * 0.88, R * 0.88);
    // Root sits on (or just inside) the circle bottom for this x
    let circleBot = sqrt(max(0, R * R - x * x));
    let y = random(circleBot * 0.80, circleBot * 0.98);
    let z = random(-150, 150);
    kelps.push(new Kelp(x, y, z));
  }
  // Sort back-to-front so foreground plants overdraw background ones
  kelps.sort((a, b) => a.z - b.z);
}

function draw() {
  background(0);
  blendMode(ADD);
  camera(0, -80, (height / 2.0) / tan((PI * 30.0) / 180.0), 0, 0, 0, 0, 1, 0);

  // Kelp first — jelly swims in front
  for (let k of kelps) k.show();

  jelly.update();
  jelly.render();
}

function mousePressed() {
  jelly.startleFrames = 180; // ~3s of rapid swimming
}

function windowResized() {
  let S = min(windowWidth, windowHeight);
  resizeCanvas(S, S);
  spawnKelp();
}
