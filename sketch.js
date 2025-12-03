/// <reference types="p5" />

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
let walker;

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
        let choice = floor(random(4));

        if (choice === 0) {
            this.x++;
        } else if ( choice === 1) {
            this.x--;
        } else if (choice === 2) {
            this.y++;
        } else {
            this.y--;
        }

    }

}


