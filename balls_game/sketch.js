var balls = [];
var inactive_balls = [];
var blocks = [];
var is_started = false;
var force;
var ball_size = 10;
var block_size = 50;
var block_hp = 1;
var score = 0;
var defeat = false;
var text_output;
var speed_button;
var draw_speed = 2;
var collisions_button;
var collisions = true;
var end_button;

function setup() {
    createCanvas(400, 600);
    text_output = createDiv('this is some text');
    speed_button = createButton('speed: ' + draw_speed);
    collisions_button = createButton('collisions: ' + collisions);
    end_button = createButton('end try');
    force = createVector(0, 0);
    addNewBalls(1);
    addBlockLine();
}

function draw() {
    speed_button.mousePressed(changeSpeed);
    collisions_button.mousePressed(chengeCollisions);
    end_button.mousePressed(endTry);
    if (!defeat) { 
        if (frameCount % (60 / draw_speed) == 0){
            start();
        }
        for (let f = 0; f < draw_speed; f ++) {
            isStepFinish();
            checkActive();
            update();
        }
        background(0);
        draw_aim(); 
        for(let i = 0; i < balls.length; i++){
            balls[i].draw();
        }
        for(let i = 0; i < blocks.length; i++){
            blocks[i].draw();
        }
        text_output.html('Score: ' + score);
    } else {
        text_output.html('Game over. Score: ' + score);
    }
}

function draw_aim() {
    if (mouseY > 0 && mouseY < height && mouseX > 0 && mouseX < width) {
        let px = width / 2;
        let py = height;
        let k = (py - mouseY) / (px - mouseX);
        let b = py - k * px;
        let y = 0;
        let x = (y - b) / k;
        if (x < 0) {
            x = 0;
        } else if (x > width) {
            x = width;
        }
        y = k * x + b;

        let xd = px - x;
        let yd = py - y;
        stroke(255, 65);
        strokeWeight(ball_size * 2);
        line(px, py, x, y);
        while (y > 0) {
            px = x;
            py = y;
            if (x){
                x = 0;
            } else {
                x = width;
            }
            y -= 2 * yd;
            line(px, py, x, y);
        } 
        strokeWeight(1);
    }
}

function isStepFinish() {
    let on_screen = false;
    for (let i = 0; i < balls.length; i++){
        if (balls[i].on_screen) {
           on_screen = true;
           break;
        }
    }
    if (!on_screen && is_started && balls.length > 0){
        let tmp = inactive_balls;
        inactive_balls = balls;
        balls = tmp;
        is_started = false;
        
        addNewBalls(1);
        block_hp += 1;
        addBlockLine();
    }
}

function update() {
    if (collisions) {
        for (let i = 0; i < balls.length; i++){
            for (let j = 0; j < balls.length; j++){
                if (i != j){
                    balls[i].checkCollisions(balls[j]);
                }
            }
        } 
    }
    for (let i = 0; i < blocks.length; i++){
        for (let j = 0; j < balls.length; j++){
            blocks[i].checkHits(balls[j]);
        }
    } 
    for (let i = 0; i < balls.length; i++){
        balls[i].checkBorders();
        balls[i].update();
    }
}

function checkActive() {
    for (let i = 0; i < blocks.length; i++){
        if (blocks[i].hp <= 0){
            blocks.splice(i, 1);
        }
    }
}

function start() {
    if (is_started && inactive_balls.length > 0) {
        let ball = inactive_balls.pop();
        ball.on_screen = true;
        ball.addForce(force.x, force.y);
        balls.push(ball);
    }
}

function mouseClicked(){
    // print('is_started '+ is_started);
    print('balls.length '+ balls.length);
    print('inactive_balls.length '+ inactive_balls.length);
    if (!is_started && balls.length == 0 && inactive_balls.length > 0 &&
        mouseX < width && mouseY < height) {
        is_started = true;
        force.x = mouseX - inactive_balls[0].pos.x;
        force.y = mouseY - inactive_balls[0].pos.y;
    }
}

function addNewBalls(count){
    for(let i = 0; i < count; i++){
        new_ball = new Ball(ball_size);
        inactive_balls.push(new_ball);
    }
}

function addBlockLine(){
    for (let i = 0; i < blocks.length; i++) {
        blocks[i].pos.y += block_size;
        if (blocks[i].pos.y + block_size >= height) {
            defeat = true;
        }
    }
    for (let i = 0; i < width / block_size; i++) {
        if (random() < 0.5) {
            let x = block_size * i;
            let y = block_size;
            let block_pos = createVector(x, y);
            blocks.push(new Block(block_pos, block_size, block_hp));
        }
    }
}

function changeSpeed() {
    if (draw_speed < 32) {
        draw_speed *= 2;
    } else {
        draw_speed = 2;
    }
    speed_button.html('speed: ' + draw_speed);
}

function chengeCollisions() {
    collisions = !collisions;
    collisions_button.html('collisions: ' + collisions);
}

function endTry() {
    for (let i = 0; i < balls.length; i++){
        balls[i].disable();
    }
}