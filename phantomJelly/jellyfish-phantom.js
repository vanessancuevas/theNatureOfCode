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
  constructor(x, y, z) {
    this.nn = new NeuralNetwork(6, 10, 3);
    this.pos = createVector(x, y, z);
    this.vel = createVector(0, -1, 0);
    this.targetDir = createVector(0, -1, 0);
    this.speed = 0;
    this.cycle = random(TWO_PI);
    this.baseR = random(18, 24);
    this.startleFrames = 0;
    this.colorBlend = 0;
    this.wanderTheta = random(TWO_PI);

    this.nodes = [];
    this.edges = [];
    this.adjList = [];
    
    this.rings = 22;
    this.pts = 30;
    
    for (let r = 0; r <= this.rings; r++) {
      let v = r / this.rings;
      for (let i = 0; i < this.pts; i++) {
        let u = i / this.pts;
        let theta = u * TWO_PI;
        this.nodes.push({ u, v, theta, x: 0, y: 0, z: 0 });
      }
    }

    this.adjList = Array.from({ length: this.nodes.length }, () => []);

    let tempPositions = this.nodes.map((n) => {
      let rProfile = max(0.001, n.v * 1.25 + 0.5 * sin(n.v * PI) - 0.15 * sin(n.v * TWO_PI));
      let r = this.baseR * 2.2 * rProfile;
      let yProfile = 1 - pow(n.v, 2.0) + 0.2 * sin(n.v * PI * 2.5);
      let y = -this.baseR * 1.5 * yProfile;
      return createVector(r * cos(n.theta), y, r * sin(n.theta));
    });

    let edgeSet = new Set();
    for (let i = 0; i < tempPositions.length; i++) {
      let dists = [];
      for (let j = 0; j < tempPositions.length; j++) {
        if (i !== j) {
          dists.push({ id: j, d: tempPositions[i].dist(tempPositions[j]) });
        }
      }
      dists.sort((a, b) => a.d - b.d);
      for (let k = 0; k < min(6, dists.length); k++) {
        let j = dists[k].id;
        let a = min(i, j);
        let b = max(i, j);
        let key = a + "-" + b;
        if (!edgeSet.has(key)) {
          if (this.nodes[a].v === 0 && this.nodes[b].v === 0) continue;
          edgeSet.add(key);
          this.edges.push([a, b]);
          this.adjList[a].push(b);
          this.adjList[b].push(a);
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
      if (this.nodes[i].v > 0.8) rimNodes.push(i);
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
    let numTentacles = 4;
    for (let i = 0; i < numTentacles; i++) {
      let theta = (i / numTentacles) * TWO_PI + PI / 4;
      let tNodes = [];
      let len = floor(random(15, 25));
      for (let j = 0; j < len; j++) {
        tNodes.push(createVector(x, y, z));
      }
      this.tentacles.push({ theta, nodes: tNodes });
    }
  }

  update() {
    let startled = this.startleFrames > 0;
    if (startled) this.startleFrames--;
    this.colorBlend = startled ? 1.0 : lerp(this.colorBlend, 0, 0.008);

    this.cycle += startled ? 0.09 : 0.018;
    let phase = (this.cycle % TWO_PI) / TWO_PI;
    let pulse = 0;
    if (phase < 0.35) {
      pulse = sin((phase * PI) / 0.35);
    }

    let targetSpeed = startled
      ? map(pulse, 0, 1, 1.0, 7.0)
      : map(pulse, 0, 1, 0.1, 1.8);
    this.speed = lerp(this.speed, targetSpeed, 0.08);

    let inputs = [
      this.pos.x / width,
      this.pos.y / height,
      this.pos.z / width,
      noise(frameCount * 0.005 + this.cycle) * 2 - 1,
      sin(frameCount * 0.005 + this.cycle),
      cos(frameCount * 0.005 + this.cycle)
    ];

    // NN runs for signal-dot visuals only
    this.nn.predict(inputs);

    // ── 3D Wander (Nature of Code) ─────────────────────────────────────────
    let wanderChange = startled ? 0.45 : 0.15;
    this.wanderTheta += random(-wanderChange, wanderChange);

    let wD = 60, wR = startled ? 26 : 10;
    let forward  = this.targetDir.copy().normalize();
    let worldUp  = abs(forward.y) > 0.99 ? createVector(1, 0, 0) : createVector(0, 1, 0);
    let right    = p5.Vector.cross(forward, worldUp).normalize();
    let circleUp = p5.Vector.cross(right, forward).normalize();
    let ahead    = forward.copy().mult(wD);
    let wOff     = p5.Vector.add(
      p5.Vector.mult(right,    wR * cos(this.wanderTheta)),
      p5.Vector.mult(circleUp, wR * sin(this.wanderTheta))
    );
    let wSteer = p5.Vector.add(ahead, wOff).normalize();
    this.targetDir.lerp(wSteer, startled ? 0.04 : 0.012).normalize();

    // ── Buoyancy: jellyfish naturally swim upward ──────────────────────────
    this.targetDir.lerp(createVector(0, -1, 0), 0.006).normalize();

    // ── Flow field: Perlin-noise ocean current ─────────────────────────────
    let fx = noise(this.pos.x * 0.004, this.pos.z * 0.004, frameCount * 0.002) * 2 - 1;
    let fy = noise(this.pos.y * 0.004 + 200, frameCount * 0.002 + 50) * 2 - 1;
    let fz = noise(this.pos.x * 0.004 + 100, this.pos.z * 0.004 + 100, frameCount * 0.002) * 2 - 1;
    this.targetDir.lerp(createVector(fx, fy * 0.4, fz).normalize(), 0.012).normalize();

    // ── Phototaxis: drift toward cursor / touch (ocelli response) ─────────
    if (mouseHasMoved || touches.length > 0) {
      let lx = (touches.length > 0 ? touches[0].x : mouseX) - width / 2;
      let ly = (touches.length > 0 ? touches[0].y : mouseY) - height / 2;
      let toLight = p5.Vector.sub(createVector(lx, ly, 0), this.pos);
      if (toLight.mag() > 20) {
        this.targetDir.lerp(toLight.normalize(), 0.008).normalize();
      }
    }

    // ── Lookahead wall avoidance ────────────────────────────────────────────
    let safeR    = min(width, height) * 0.26;
    let future   = p5.Vector.add(this.pos, this.vel.copy().normalize().mult(startled ? 55 : 35));
    if (future.mag() > safeR) {
      let radial  = future.copy().normalize();
      let tangent = createVector(-radial.z, 0, radial.x);
      if (tangent.dot(this.targetDir) < 0) tangent.mult(-1);
      let proximity = map(future.mag(), safeR * 0.85, safeR, 0, 1, true);
      this.targetDir.lerp(tangent, proximity * 0.7).normalize();
    }

    this.vel.lerp(this.targetDir, 0.02).normalize().mult(this.speed);

    this.pos.add(this.vel);

    // Hard clamp — cannot leave the circle regardless of speed
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
      // Organic noise matching moon jelly approach
      let nval = map(noise(cos(n.theta) * 0.5, sin(n.theta) * 0.5, this.cycle * 0.5 + n.v), 0, 1, -3, 3);

      // Same contraction strength as moon jelly (0.4) — clear inward squeeze on pulse
      let rProfile = n.v * 1.25 + 0.5 * sin(n.v * PI) - 0.15 * sin(n.v * TWO_PI);
      let r = this.baseR * 2.2 * rProfile * (1 - 0.4 * pulse * n.v) + nval;

      // Same yStretch as moon jelly (0.3) — elongates upward on contraction
      let yProfile = 1 - pow(n.v, 2.0) + 0.2 * sin(n.v * PI * 2.5);
      let yStretch = 1 + 0.3 * pulse;

      n.x = r * cos(n.theta);
      n.y = -this.baseR * 1.5 * yProfile * yStretch;
      n.z = r * sin(n.theta);
    });

    let rAttach = this.baseR * 0.4;
    let yAttach = -this.baseR * 1.0 * (1 + 0.2 * pulse);

    for (let i = 0; i < this.tentacles.length; i++) {
      let t = this.tentacles[i];
      let localPt = createVector(rAttach * cos(t.theta), yAttach, rAttach * sin(t.theta));
      let globalPt = rotateVec(localPt, axis, angle);
      globalPt.add(this.pos);

      t.nodes[0] = globalPt;
      for (let j = 1; j < t.nodes.length; j++) {
        let curr = t.nodes[j];
        let prev = t.nodes[j - 1];
        let dir = p5.Vector.sub(curr, prev);
        let dist = dir.mag();
        let restingDist = 3;

        dir.normalize();
        let force = dir.mult(dist - restingDist);
        curr.sub(force.mult(0.7));

        curr.x += map(noise(curr.x * 0.005, curr.y * 0.005, frameCount * 0.01 + this.cycle), 0, 1, -0.6, 0.6);
        curr.z += map(noise(curr.z * 0.005, curr.y * 0.005, frameCount * 0.01 + 100 + this.cycle), 0, 1, -0.6, 0.6);
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
            speed: random(0.03, 0.08),
            life: floor(random(4, 12)),
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
            speed: random(0.04, 0.1),
            life: floor(random(5, 14)),
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

    if (this.signals.length > 350) {
      this.signals.splice(0, this.signals.length - 350);
    }

    this.renderState = { axis, angle };
  }

  render() {
    blendMode(BLEND);
    noStroke();
    fill(350, 100, 50, 220);  // vivid deep red tentacle fill
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
        
        let taper = map(j, 0, t.nodes.length - 1, 10, 1);
        let ruffle = sin(j * 0.5 - frameCount * 0.1 + this.cycle) * 3;
        let finalWidth = taper + ruffle;
        
        widthDir.mult(finalWidth);
        vertex(curr.x + widthDir.x, curr.y + widthDir.y, curr.z + widthDir.z);
        vertex(curr.x - widthDir.x, curr.y - widthDir.y, curr.z - widthDir.z);
      }
      endShape();
    }

    noFill();
    stroke(350, 100, 75, 180);  // vivid red tentacle stroke
    strokeWeight(1);
    for (let t of this.tentacles) {
      beginShape();
      for (let n of t.nodes) {
        vertex(n.x, n.y, n.z);
      }
      endShape();
    }

    blendMode(ADD);
    let signalPhase = (frameCount * 0.1 + this.cycle * 10) % 60;
    strokeWeight(1.5);
    for (let t of this.tentacles) {
      for (let j = 0; j < t.nodes.length; j++) {
        if (abs(j - signalPhase) < 2.0) {
          stroke(350, 100, 100, 255);  // vivid red travel pulse
          point(t.nodes[j].x, t.nodes[j].y, t.nodes[j].z);
        }
      }
    }

    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    if (this.renderState.axis.magSq() > 0) {
      rotate(this.renderState.angle, this.renderState.axis);
    }

    stroke(0, 0, 60, 30);  // gray mesh — unchanged
    strokeWeight(0.5);
    beginShape(LINES);
    for (let e of this.edges) {
      let n1 = this.nodes[e[0]];
      let n2 = this.nodes[e[1]];
      vertex(n1.x, n1.y, n1.z);
      vertex(n2.x, n2.y, n2.z);
    }
    endShape();

    strokeWeight(1);
    beginShape(LINES);
    for (let s of this.signals) {
      let nA = this.nodes[s.a];
      let nB = this.nodes[s.b];
      if (!nA || !nB) continue;
      
      let x = lerp(nA.x, nB.x, s.p);
      let y = lerp(nA.y, nB.y, s.p);
      let z = lerp(nA.z, nB.z, s.p);
      
      let tailP = max(0, s.p - 0.4);
      let tx = lerp(nA.x, nB.x, tailP);
      let ty = lerp(nA.y, nB.y, tailP);
      let tz = lerp(nA.z, nB.z, tailP);
      
      stroke(0, lerp(0, 100, this.colorBlend), lerp(65, 100, this.colorBlend), s.intensity * 200);
      vertex(tx, ty, tz);
      vertex(x, y, z);
    }
    endShape();

    strokeWeight(1.5);
    beginShape(POINTS);
    for (let s of this.signals) {
      let nA = this.nodes[s.a];
      let nB = this.nodes[s.b];
      if (!nA || !nB) continue;
      let x = lerp(nA.x, nB.x, s.p);
      let y = lerp(nA.y, nB.y, s.p);
      let z = lerp(nA.z, nB.z, s.p);
      stroke(0, lerp(0, 100, this.colorBlend), lerp(65, 100, this.colorBlend), s.intensity * 255);
      vertex(x, y, z);
    }
    endShape();

    strokeWeight(2);
    beginShape(POINTS);
    for (let i = 0; i < this.hiddenGanglia.length; i++) {
      let gIdx = this.hiddenGanglia[i];
      let n = this.nodes[gIdx];
      let act = abs(this.nn.hidden[i]);
      stroke(0, lerp(0, 100, this.colorBlend), lerp(60, 100, this.colorBlend), 50 + act * 205);
      vertex(n.x, n.y, n.z);
    }
    endShape();

    strokeWeight(3);
    beginShape(POINTS);
    for (let i = 0; i < this.outputGanglia.length; i++) {
      let gIdx = this.outputGanglia[i];
      let n = this.nodes[gIdx];
      let act = abs(this.nn.outputs[i]);
      stroke(0, lerp(0, 100, this.colorBlend), lerp(60, 100, this.colorBlend), 50 + act * 205);
      vertex(n.x, n.y, n.z);
    }
    endShape();

    strokeWeight(1);
    beginShape(POINTS);
    for (let i = 0; i < this.nodes.length; i++) {
      let n = this.nodes[i];
      if (i % 37 === 0) {
        stroke(0, 0, 85, 255);
      } else {
        stroke(0, 0, 60, 80 + 40 * sin(frameCount * 0.05 + i));
      }
      vertex(n.x, n.y, n.z);
    }
    endShape();

    blendMode(BLEND);
    fill(220, 20, 25, 100);
    stroke(0, 0, 60, 30);
    strokeWeight(0.5);
    
    for (let r = 0; r < this.rings; r++) {
      beginShape(TRIANGLE_STRIP);
      for (let i = 0; i <= this.pts; i++) {
        let iMod = i % this.pts;
        let n1 = this.nodes[r * this.pts + iMod];
        let n2 = this.nodes[(r + 1) * this.pts + iMod];
        vertex(n1.x, n1.y, n1.z);
        vertex(n2.x, n2.y, n2.z);
      }
      endShape();
    }

    pop();
    blendMode(BLEND);
  }
}

let jellies = [];
let particles = [];

function setup() {
  let S = min(windowWidth, windowHeight);
  if (S < 50) S = min(screen.width, screen.height) * 0.8;
  createCanvas(S, S, WEBGL);
  colorMode(HSB, 360, 100, 100, 255);
  jellies.push(new Jellyfish(0, 0, 0));
}

function draw() {
  background(0);
  blendMode(ADD);
  camera(0, -40, (height / 2.0) / tan((PI * 30.0) / 180.0), 0, 0, 0, 0, 1, 0);

  for (let j of jellies) {
    j.update();
    j.render();
  }
}

let mouseHasMoved = false;
function mouseMoved() { mouseHasMoved = true; }

function mousePressed() {
  for (let j of jellies) j.startleFrames = 180;
}

function touchStarted() {
  for (let j of jellies) j.startleFrames = 180;
  return false;
}

function windowResized() {
  let S = min(windowWidth, windowHeight);
  resizeCanvas(S, S);
}