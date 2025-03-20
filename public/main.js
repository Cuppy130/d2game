
import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
    getDatabase, ref, set, update, onValue, get,
    push, remove, onChildAdded, onChildRemoved,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
//authorize
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
initializeApp({
    apiKey: "AIzaSyAxlgX5TN5paM0OH5hgEQJCCK61SP5h1DU",
    authDomain: "dgame-ffae1.firebaseapp.com",
    databaseURL: "https://dgame-ffae1-default-rtdb.firebaseio.com",
    projectId: "dgame-ffae1",
    storageBucket: "dgame-ffae1.firebasestorage.app",
    messagingSenderId: "791685733526",
    appId: "1:791685733526:web:9de1dc3a837d2ba5a8b6b7"
});
const db = getDatabase();
let UID;
let userRef;
let userData;

const ping = new Audio("ping.mp3");


onAuthStateChanged(getAuth(), (user) => {
    if (user) {
        UID = user.uid;
        userRef = ref(db, `chatters/${UID}`);
        get(userRef).then((snapshot) => {
            const sts = serverTimestamp();
            if (snapshot.exists()) {
                userData = snapshot.val();
                update(userRef, {
                    lastSeen: sts
                });
            } else {
                userData = {
                    name: "No Name",
                    color: "hsl(0, 100%, 50%)",
                    lastSeen: sts,
                    createdAt: sts
                };
                set(userRef, userData);
            }
            
            updateCanvas();
        });
    } else {
        signInAnonymously(getAuth()).catch((error) => {
            console.error("Failed to sign in", error);
        });
    }
});

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.style.textRendering = "pixelated";
canvas.style.imageRendering = "pixelated";
canvas.style.imageRendering = "crisp-edges";
const WIDTH = canvas.width = 256;
const HEIGHT = canvas.height = 256;
document.body.appendChild(canvas);
let scrolled = 0;

function drawText(text, x, y, size = 12) {
    ctx.font = `${size}px monospace`;
    ctx.fillText(text, x, y);
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}
function onScroll(event) {
    event.preventDefault();
    if (event.deltaY > 0) {
        scrolled++;
    } else {
        scrolled--;
    }
    return false;
}

canvas.addEventListener("wheel", onScroll, { passive: false });

onChildAdded(ref(db, "messages"), (snapshot) => {
    onMessage(snapshot.val());
});

const messages = [];

function onMessage(msg) {
    messages.push(msg);
    scrolled+=getMessageHeight(msg);
    if(scrolled > messages.length){
        scrolled = messages.length - 1
    }
    if(msg.uid !== UID){
        ping.play();
    }
}

let colorChangerEnabled = false;

let texters = [];

const mouse = {
    x: 0,
    y: 0,
    down: false,
    onColor: false
}

canvas.addEventListener("mousemove", (event) => {
    mouse.x = (event.offsetX) / 2;
    mouse.y = (event.offsetY) / 2;
});

canvas.addEventListener("mousedown", (event) => {
    if(event.button === 0){
        mouse.down = true;
    }
});

canvas.addEventListener("mouseup", (event) => {
    if(event.button === 0){
        mouse.down = false;
    }
});

onValue(ref(db, "chatters"), (snapshot) => {
    if(snapshot.exists()){
        texters = snapshot.val();
    }
});

function sendMessage(text) {
    if(text.startsWith("/")){
        let parts = text.split(" ");
        if(parts[0] === "/name"){
            update(userRef, {
                name: parts[1]
            });
            userData.name = parts[1];
            return;
        }
        if(parts[0] === "/color"){
            update(userRef, {
                color: "hsl(" + parts[1] + ", 100%, 50%)"
            });
            userData.color = "hsl(" + parts[1] + ", 100%, 50%)";
            return;
        }
        if(parts[0] === "/scolor"){
            update(userRef, {
                color: parts[1]
            });
            userData.color = parts[1];
            return;
        }
        if(parts[0] === "/online"){
            onValue(ref(db, "chatters"), (snapshot) => {
                const chatters = snapshot.val();
                for(let chatter in chatters){
                    if(chatters[chatter].lastSeen > Date.now() - 1000 * 60 * 5){
                        messages.push({
                            message: `${chatters[chatter].name} is online`,
                            name: "System",
                            color: "white",
                            timestamp: serverTimestamp()
                        });
                    }
                }
            });
            return;
        }
        if(parts[0] === "/offline"){
            onValue(ref(db, "chatters"), (snapshot) => {
                const chatters = snapshot.val();
                for(let chatter in chatters){
                    if(chatters[chatter].lastSeen < Date.now() - 1000 * 60 * 5){
                        messages.push({
                            message: `${chatters[chatter].name} is offline`,
                            name: "System",
                            color: "white",
                            timestamp: serverTimestamp()
                        });
                    }
                }
            });
            return;
        }
        // if(parts[0] === "/colorChanger"){
        //     colorChangerEnabled = true;
        //     return;
        // }
        if(parts[0] === "/help"){
            messages.push({
                message: "/name [name] - change your name",
                name: "System",
                color: "white",
                timestamp: serverTimestamp()
            });
            messages.push({
                message: "/color [hue] - change your color by hue",
                name: "System",
                color: "white",
                timestamp: serverTimestamp()
            });
            messages.push({
                message: "/scolor [color] - change your color by hex or rgb",
                name: "System",
                color: "white",
                timestamp: serverTimestamp()
            });
            messages.push({
                message: "/online - list online users",
                name: "System",
                color: "white",
                timestamp: serverTimestamp()
            });
            messages.push({
                message: "/offline - list offline users",
                name: "System",
                color: "white",
                timestamp: serverTimestamp()
            });
            // messages.push({
            //     message: "/colorChanger - enable color changer",
            //     name: "System",
            //     color: "white",
            //     timestamp: serverTimestamp()
            // });
            return;
        }
    }




    if(text.length < 1){
        return;
    }

    push(ref(db, "messages"), {
        message: text,
        uid: UID,
        name: userData.name,
        color: userData.color,
        timestamp: serverTimestamp()
    });

    update(userRef, {
        lastSeen: serverTimestamp()
    });
    message = "";
    input.value = "";
}

const input = document.createElement("input");
input.style.position = "fixed";
input.style.bottom = "0";
input.style.width = "100%";
input.style.height = "10px";
input.style.fontSize = "10px";
input.style.border = "none";
input.style.outline = "none";
input.style.backgroundColor = "black";
input.style.color = "white";
input.style.fontFamily = "monospace";
input.style.textAlign = "left";
input.style.padding = "0";
input.style.margin = "0";
document.body.appendChild(input);

//detect touchscreen and change the input method
if ("ontouchstart" in document.documentElement) {
    document.addEventListener("touchstart", (event) => {
        const touch = event.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        if (y > HEIGHT - 10) {
            sendMessage(message);
            message = "";
        }

        //show the keyboard
        input.focus();

    });
}


function getMessageHeight(message) {
    const complete = `${message.name}: ${message.message}`;
    const width = ctx.measureText(complete).width;
    if(width > WIDTH){
        const words = complete.split(" ");
        let line = "";
        let lines = [];
        for(let word of words){
            if(ctx.measureText(line + word).width > WIDTH){
                lines.push(line);
                line = word;
            } else {
                line += " " + word;
            }
        }
        lines.push(line);
        return lines.length * 10;
    } else {
        return 10;
    }
}

function updateCanvas() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);



    let yOffset = 0;
    for (let i = 0; i < messages.length; i++) {
        let message = messages[i];
        const complete = `${message.name}: ${message.message}`;
        // ctx.fillStyle = message.color;
        // drawText(complete, 0, (i + -scrolled * 10) + 10 * i + 40, 10);
        ctx.fillStyle = message.color;
        const width = ctx.measureText(complete).width;
        if(width > WIDTH){
            const words = complete.split(" ");
            let line = "";
            let lines = [];
            for(let word of words){
                if(ctx.measureText(line + word).width > WIDTH){
                    lines.push(line);
                    line = word;
                } else {
                    line += " " + word;
                }
            }
            lines.push(line);
            for(let j = 0; j < lines.length; j++){
                drawText(lines[j], 0, (i + -scrolled * 10) + 10 * i + 40 + j * 5 + yOffset, 10);
                yOffset += 10;
            }
        } else {
            drawText(complete, 0, (i + -scrolled * 10) + 10 * i + 40 + yOffset, 10);
            yOffset += 5;
        }

        //draw a line seperating messages
        drawRect(0, (i + -scrolled * 10) + 10 * i + 40 + yOffset, WIDTH, 1, "rgba(255, 255, 255, 0.5)");
    }

    let xOffset = 0

    //█ - the block character for the cursor
    if(userData){
        ctx.fillStyle = userData.color || "white";
        // drawText(userData.name + ": " + message + "█", 0, HEIGHT - 10, 10);

        const complete = `${userData.name}: ${message}`;
        const width = ctx.measureText(complete).width;
        if(width > WIDTH){
            while(width - xOffset > WIDTH){
                xOffset++;
            }
        } else {
            xOffset = -10;
        }
        drawText(complete, -xOffset - 10, HEIGHT - 10, 10);
        if(xOffset % 2 === 0){
            if(performance.now() % 1000 > 500){
                drawText("█", -xOffset - 10 + width, HEIGHT - 10, 10);
            }
        }
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, WIDTH, 20);
    ctx.fillStyle = "lime";
    drawText("OPEN", 0, 20, 20);

    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 21, WIDTH, 1);

    if(colorChangerEnabled){
        for(let i = 0; i < 256; i++){
            ctx.fillStyle = `hsl(${i}, 100%, 50%)`;
            ctx.fillRect(i, 22, 1, 4);
        }
        if(mouse.down){
            if(mouse.x >= 0 && mouse.x < 256 && mouse.y >= 22 && mouse.y < 26){
                let angle = mouse.x / 256 * 360;
                userData.color = `hsl(${angle}, 100%, 50%)`;
                update(userRef, {
                    color: userData.color
                });
            }
        }
    }

    ctx.fillRect(mouse.x-2, mouse.y-2, 4, 4)


    setTimeout(updateCanvas, 1000 / 10);
}

// this is for input
let message = "";

if ("ontouchstart" in document.documentElement) {
    input.addEventListener("input", (event) => {
        message = input.value;
    });
}

document.addEventListener("keydown", (event) => {

    //check if the key was on a physical keyboard

    switch (event.key) {
        case "Enter":
            sendMessage(message);
            message = "";
            break;
        case "Backspace":
            message = message.slice(0, message.length - 1);
            break;
        case "Shift":
        case "Control":
        case "Alt":
        case "CapsLock":
        case "Tab":
            return;
        default:
            message += event.key;
            break;
    }
});
