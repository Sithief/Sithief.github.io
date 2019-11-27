var balls = [];
var inactive_balls = [];
var blocks = [];
var is_started = false;
var force;
var ball_size = 20;
var max_hit = 2000; // update ball without hit block
var block_size = 100;
var block_hp = 1;
var score = 0;
var defeat = false;
var text_output;
var speed_button;
var draw_speed = 2;
var collisions_button;
var collisions = true;
var end_button;

function readCookie() {
    var cookieName = "game_data=";
    var docCookie = document.cookie;
    if (docCookie.length > 0) {
      var cookieStart = docCookie.indexOf(cookieName);
      if (cookieStart != -1) {
         cookieStart = cookieStart + cookieName.length;
         var end = docCookie.indexOf(";",cookieStart);
         if (end == -1) {
            end = docCookie.length;
         }
         let cookie = docCookie.substring(cookieStart,end);
         let json_data = decodeURIComponent(cookie);
         let data = JSON.parse(json_data);
         print('cookie = ' + data);
         block_hp = data.block_hp;
         score = data.score;
         addNewBalls(block_hp);
         for (let i = 0; i < data.blocks.length; i++) {
            let x = data.blocks[i].pos[0];
            let y = data.blocks[i].pos[1];
            let block_pos = createVector(x, y);
            let hp = data.blocks[i].hp;
            let type = data.blocks[i].type;
            blocks.push(new Block(block_pos, block_size, hp, type));
         }
         return true;
      }
   }
   return false;
}

function updateCookie() {
    let blocks_data = [];
    for (let i = 0; i < blocks.length; i++) {
        blocks_data.push({
            'pos': [blocks[i].pos.x, blocks[i].pos.y],
            'hp': blocks[i].hp,
            'type': blocks[i].type
        });
    }  
    let data = {
        'block_hp': block_hp,
        'blocks': blocks_data,
        'score': score
    };
    if (defeat) {
        data = {
            'block_hp': 1,
            'blocks': [],
            'score': 0
        };
    }
    let JSONdata = JSON.stringify(data);
    let URIdata = encodeURIComponent(JSONdata);
    document.cookie = "game_data=" + URIdata + "; max-age=" + 365*24*60*60;
}

function setup() {
    createCanvas(600, 800);
    text_output = createDiv('this is some text');
    speed_button = createButton('speed: ' + draw_speed);
    collisions_button = createButton('collisions: ' + collisions);
    end_button = createButton('end try');
    force = createVector(0, 0);
    if (!readCookie()) {
        addNewBalls(1);
        addBlockLine();
    }
    createDiv('version: 1.0');
}

function draw() {
    speed_button.mousePressed(changeSpeed);
    collisions_button.mousePressed(chengeCollisions);
    end_button.mousePressed(endTry);
    if (!defeat) { 
        if (frameCount % (ball_size / draw_speed) == 0){
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
        if (blocks.length == 0){
            textAlign(CENTER, CENTER);
            textSize(width/10);
            fill(255);
            text('Level clear!', width/2, height/2);
        }
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
        stroke(255, 127);
        strokeWeight(ball_size / 2);
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
    if (!on_screen && is_started && inactive_balls.length == 0){
        print('finish step');
        let tmp = inactive_balls;
        inactive_balls = balls;
        balls = tmp;
        is_started = false;
        
        addNewBalls(1);
        block_hp += 1;
        addBlockLine();
        updateCookie();
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
        balls[i].speedControl();
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
        ball.enable();
        ball.addForce(force.x, force.y);
        balls.push(ball);
    }
}

function mouseReleased(){
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
            end_button.html('restart game');
            updateCookie();
        }
    }
    let max_bcount = (width / block_size) * (height / block_size) / 2;
    for (let i = 0; i < width / block_size; i++) {
        let x = block_size * i;
        let y = block_size;
        let block_pos = createVector(x, y);
        let chanse = 1 - blocks.length / max_bcount;
        if (random() < 0.01 * chanse) {
            blocks.push(new Block(block_pos, block_size, block_hp*2, 1));
        } else if (random() < 0.7 * chanse) {
            blocks.push(new Block(block_pos, block_size, block_hp, 0));
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
    if (is_started) {
        for (let i = 0; i < balls.length; i++){
            let ball = balls.pop();
            ball.disable();
            inactive_balls.push(ball);
        }
        balls = inactive_balls;
        inactive_balls = [];
    }
    if (defeat) {
        block_hp = 1;
        score = 0;  
        defeat = false;
        inactive_balls = [];
        balls = [];
        blocks = [];
        addNewBalls(1);
        addBlockLine();
        end_button.html('end try');
    }
}