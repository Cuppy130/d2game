const canvas = document.createElement('canvas');
canvas.style.imageRendering = 'pixelated';
canvas.width = 640;
canvas.height = 480;

const ctx = canvas.getContext('2d');

document.body.appendChild(canvas);

