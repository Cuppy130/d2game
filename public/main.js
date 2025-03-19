
// console.log = function(...params) {
//     document.body.innerHTML += params.join(' ') + '<br>';
// }
// console.error = console.log;
// console.warn = console.log;
// console.info = console.log;
// console.debug = console.log;
// console.table = console.log;
// console.clear = function() {
//     document.body.innerHTML = '';
// }

let isHoldingF = false;
const HoldF = new Image();
HoldF.src = './assets/key_F.png';

const canvas = document.createElement('canvas');
canvas.style.imageRendering = 'pixelated';
const width = canvas.width = 128;
const height = canvas.height = 128;
canvas.style.width = `${width * 4}px`;
canvas.style.height = `${height * 4}px`;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
document.body.appendChild(canvas);
const renderer = document.createElement('canvas');
renderer.width = width;
renderer.height = height;
const rctx = renderer.getContext('2d');
rctx.textRendering = 'optimizeSpeed';

rctx.imageSmoothingEnabled = false;

// make a 2d array of pixels
const pixels = new Uint8ClampedArray(width * height * 4);
for (let i = 0; i < pixels.length; i += 4) {
  pixels[i] = 0; // red
  pixels[i + 1] = 0; // green
  pixels[i + 2] = 0; // blue
  pixels[i + 3] = 100; // alpha
}
const imageData = new ImageData(pixels, width, height);

const player = {
    x: 0,
    y: 0,
    r: 0
}



function update() {
    const rData = rctx.getImageData(0, 0, width, height, {
        "colorSpace": "srgb",
        willReadFrequently: true
    });
    //add some static
    for (let i = 0; i < pixels.length; i += 4) {
        if (Math.random() < 0.05) {
            let r = Math.round(Math.random()) * 10;
            pixels[i] = rData.data[i] + r;
            pixels[i + 1] = rData.data[i + 1] + r;
            pixels[i + 2] = rData.data[i + 2] + r;
            pixels[i + 3] = rData.data[i + 3];
        }
    }
}

const keys = [];



function render() {
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    rctx.fillStyle = 'black';
    rctx.fillRect(0, 0, width, height);

    // draw the player
    rctx.save();
    rctx.translate(player.x, player.y);
    rctx.rotate(player.r);
    rctx.fillStyle = 'white';
    rctx.fillRect(-2 + width / 2, -2 + height / 2, 4, 4);
    rctx.restore();
}

function keyDown(e) {
    if(!keys.includes(e.key)) {
        keys.push(e.key);
    }
}


function keyUp(e) {
    if(keys.includes(e.key)) {
        keys.splice(keys.indexOf(e.key), 1);
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);


function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}
loop();