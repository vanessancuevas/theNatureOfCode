/// <reference types="p5" />
let walker;

function setup() {
    createCanvas(500, 500);
    walker = new Walker();
    background(255);
}

function draw() {
    walker.step();
    walker.show();
}

/* example exercise from intro */
// function draw() {
//     fill(0, 25);
//     stroke(0, 50);
//     circle(random(width), random(height), random(20, 100));

// }

/* Chapter 0 - Random walk */

class Walker {
    constructor() {
        this.x = width / 2;
        this.y = height / 2;
    }

    show () {
        stroke(0);
        point(this.x, this.y);
    }

    step () {
        let xstep = random(-1, 1);
        let ystep = random(-1, 1);

        this.x += xstep;
        this.y += ystep;

    }

}


