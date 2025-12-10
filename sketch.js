// Problem & Solution Journey
// Initial Problem: I had a p5.js sketch with a "Loading..." error because it was trying to load a local font file that didn't exist in the web environment.
// My Core Challenge: I wanted to create a Gaussian blur effect that follows my cursor horizontally (x-axis only) to reveal hidden white text on a white background.
// Key Solutions We Built:

// Font Loading: We switched from my local font path to web-safe Arial Bold to fix the loading issue
// Cursor Following Blur:

// We made the blur follow mouseX with Gaussian distribution for horizontal spread
// Used mouseY directly (no Gaussian) so my blur line follows the cursor vertically but only spreads horizontally


// Text Reveal Effect:

// We created a textLayer graphics buffer to store my white text separately
// Drew black blur circles first, then white text on top each frame
// Removed background() from draw() so my blur accumulates over time instead of clearing


// Color Evolution:

// I started with black circles → tried red → burgundy → random colors
// We settled on smooth rainbow spectrum cycling using HSB color mode with hueValue = (hueValue + 0.5) % 360


// Text Movement:

// We added a timer to reposition my text every 15 seconds
// Changed from separate words to one complete sentence: "can you find me?"
// Clears canvas when text moves so I can reveal it again


// My Git Workflow Issues: We dealt with nested git repos, merge conflicts, and remote configuration to get my code committed and pushed to GitHub.

// The final effect: rainbow-colored Gaussian blur follows my cursor horizontally, accumulating to reveal white text that repositions every 15 seconds!



/// <reference types="p5" />

// Define global variables: font and fontSize.
let font;
let fontsize = 40;
let textLayer; // Graphics buffer to store white text so we can redraw it on top each frame
let hueValue = 0; // Track the hue value for cycling
let lastTextMove = 0; // Track when text last moved

function preload() {
  // Preload the font's file in the canvas's assets directory.
  // loadFont() accepts .ttf or .otf files.
  // COMMENTED OUT: font = loadFont('/theNatureOfCode/earwig factory rg.ttf');
  // CHANGE: Using web-safe Arial Bold instead of local font
}

function setup() {
    createCanvas(500, 500);
    background(255); // White background set once
    colorMode(HSB, 360, 100, 100, 100); // Set color mode to HSB

    // Creates a screen reader-accessible description of the canvas.
    describe('Gaussian distribution blur that follows the mouse cursor to uncover secret text');
    
    // Create the text layer
    createTextLayer();
    lastTextMove = millis(); // Initialize timer
 }

 function createTextLayer() {
    // ADDED: Create graphics buffer to store white text
    textLayer = createGraphics(500, 500);
    textLayer.clear(); // Transparent background
    textLayer.textFont('Arial'); // CHANGE: Using Arial instead of custom font
    textLayer.textStyle(BOLD); // ADDED: Make text bold
    textLayer.textSize(fontsize);

    // Measure text width to keep it fully within canvas
    let txt = 'can you find me?';
    let txtWidth = textLayer.textWidth(txt);

   // Random position that keeps text fully visible
    let startX = random(10, 500 - txtWidth - 10);  // Account for text width
    let startY = random(50, 470);  // Account for text height
    
   // Draw white text as an ordered sentence
    textLayer.fill(255, 255, 255);
    textLayer.text(txt, startX, startY);
}


function draw() {
    // Check if 15 seconds have passed
    if (millis() - lastTextMove > 15000) {
        background(255); // Clear everything
        createTextLayer(); // Recreate text at new position
        lastTextMove = millis(); // Reset timer
    }
    // Gaussian spread only on x-axis
    let x = randomGaussian(mouseX, 60);
    // Y follows cursor position exactly (no Gaussian spread)
    let y = mouseY;

    // Cycle through entire color spectrum (0-360)
    hueValue = (hueValue + 0.5) % 360; // Smoothly cycles through all hues


    // Draw colored blur circles with cycling red to burgundy hues
    noStroke();
    fill(hueValue, 80, 80, 10); // Hue cycles through full spectrum, saturation 80%, brightness 80%, alpha 10%
    circle(x, y, 16);
    
    // ADDED: Draw white text on top every frame so it's always visible
    image(textLayer, 0, 0);
}