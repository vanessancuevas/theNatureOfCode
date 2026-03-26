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
    // Evade: steer away from nearest jelly's predicted future position (NoC Ch. 6)
    if (typeof jellies !== 'undefined' && jellies.length > 0) {
      let nearestJ = null, nearestJDist = Infinity;
      for (let j of jellies) {
        let d = this.pos.dist(j.pos);
        if (d < nearestJDist) { nearestJDist = d; nearestJ = j; }
      }
      let detectionR = 180;
      if (nearestJDist < detectionR) {
        let T = min(nearestJDist / max(nearestJ.speed, 0.5), 40);
        let jellyFuture = p5.Vector.add(nearestJ.pos, p5.Vector.mult(nearestJ.vel, T));
        let evadeDir = p5.Vector.sub(this.pos, jellyFuture).normalize();
        let evadeStr = map(nearestJDist, 0, detectionR, 0.15, 0.0, true);
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
    colorMode(HSB, 360, 100, 100, 255);
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
    this.stingPrey = null;
    this.stingFrames = 0;

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

    // ── Prey seek ──────────────────────────────────────────────────────────
    if (preyList.length > 0) {
      let nearest = null, nearestDist = Infinity;
      for (let pr of preyList) {
        if (!pr.captured) {
          let d = this.pos.dist(pr.pos);
          if (d < nearestDist) { nearestDist = d; nearest = pr; }
        }
      }
      if (nearest) {
        // Pursue: predict prey's future position (NoC Ch. 6)
        let pursueT = min(nearestDist / max(this.speed, 0.5), 60);
        let futurePreyPos = p5.Vector.add(nearest.pos, p5.Vector.mult(nearest.vel, pursueT));
        this.targetDir.lerp(p5.Vector.sub(futurePreyPos, this.pos).normalize(), 0.05).normalize();
        // Sting: fire nematocysts when prey enters range
        if (nearestDist < this.baseR * 4 && !nearest.stunned) {
          nearest.stunned = true;
          this.stingPrey = nearest;
          this.stingFrames = 30;
          let zapDir = p5.Vector.sub(nearest.pos, this.pos).normalize();
          for (let sn = 0; sn < this.nodes.length; sn++) {
            let n = this.nodes[sn];
            let nDir = createVector(n.x - this.pos.x, n.y - this.pos.y, n.z - this.pos.z).normalize();
            if (nDir.dot(zapDir) > 0.4) {
              let nb = this.adjList[sn];
              if (nb && nb.length > 0) {
                this.signals.push({ a: sn, b: random(nb), p: 0,
                  speed: random(0.15, 0.4), life: floor(random(2, 5)),
                  intensity: 1.0, zap: true });
              }
            }
          }
        }
        // Eat: absorb stunned prey when close
        if (nearestDist < this.baseR * 2.5 && nearest.stunned) {
          nearest.captured = true;
          this.colorBlend = 1.0;
          this.stingPrey = null;
          this.stingFrames = 0;
          for (let sn = 0; sn < this.nodes.length; sn++) {
            let nb = this.adjList[sn];
            if (nb && nb.length > 0) {
              this.signals.push({ a: sn, b: random(nb), p: random(1),
                speed: random(0.08, 0.22), life: floor(random(3, 6)),
                intensity: 1.0, capture: true });
            }
          }
        }
      }
      if (this.stingFrames > 0) this.stingFrames--;
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

    if (this.signals.length > 600) {
      this.signals.splice(0, this.signals.length - 600);
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
      
      if (s.zap) { stroke(200, 50, 100, s.intensity * 255); }
      else if (s.capture) { stroke(320, 100, 100, s.intensity * 200); }
      else { stroke(0, lerp(0, 100, this.colorBlend), lerp(65, 100, this.colorBlend), s.intensity * 200); }
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
      if (s.zap) { stroke(200, 50, 100, s.intensity * 255); }
      else if (s.capture) { stroke(320, 100, 100, s.intensity * 255); }
      else { stroke(0, lerp(0, 100, this.colorBlend), lerp(65, 100, this.colorBlend), s.intensity * 255); }
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

    // ── Sting arc (drawn in world space, after pop) ────────────────────────
    if (this.stingPrey && this.stingFrames > 0) {
      let arcEnd = this.stingPrey.pos;
      let toPreyDir = p5.Vector.sub(arcEnd, this.pos).normalize();
      let arcStart = p5.Vector.add(this.pos, toPreyDir.copy().mult(this.baseR));
      let arcAlpha = map(this.stingFrames, 0, 30, 0, 220);
      colorMode(RGB, 255);
      noFill(); stroke(160, 220, 255, arcAlpha); strokeWeight(2);
      beginShape();
      for (let i = 0; i <= 12; i++) {
        let t = i / 12;
        let jit = sin(t * PI) * 4;
        vertex(
          lerp(arcStart.x, arcEnd.x, t) + random(-jit, jit),
          lerp(arcStart.y, arcEnd.y, t) + random(-jit, jit),
          lerp(arcStart.z, arcEnd.z, t) + random(-jit, jit)
        );
      }
      endShape();
      colorMode(HSB, 360, 100, 100, 255);
    }
    blendMode(BLEND);
  }
}

let jellies = [];
let particles = [];
let preyList = [];
let clickTimes = [];

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

  for (let pr of preyList) pr.update();
  for (let j of jellies) j.update();
  for (let i = preyList.length - 1; i >= 0; i--) {
    preyList[i].draw();
    if (preyList[i].isDone()) preyList.splice(i, 1);
  }
  for (let j of jellies) j.render();
}

let mouseHasMoved = false;
function mouseMoved() { mouseHasMoved = true; }

function mousePressed() {
  for (let j of jellies) j.startleFrames = 180;
  let now = millis();
  clickTimes.push(now);
  clickTimes = clickTimes.filter(t => now - t < 600);
  if (clickTimes.length >= 3) {
    preyList.push(new Prey());
    clickTimes = [];
  }
}

function touchStarted() {
  for (let j of jellies) j.startleFrames = 180;
  return false;
}

function windowResized() {
  let S = min(windowWidth, windowHeight);
  resizeCanvas(S, S);
}