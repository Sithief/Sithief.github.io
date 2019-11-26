class Block {
    constructor(pos, rad, hp, type) {
        this.pos = pos;
        this.rad = rad;
        this.hp = hp;
        this.type = type;
    }

    draw() {
        stroke(65);
        if (this.type == 0) {
            fill(255);
        } else if (this.type == 1) {
            fill(200, 0, 0);
        } else {
            fill(65);
        }
        let x = this.pos.x;
        let y = this.pos.y;
        square(x, y, this.rad);
        textAlign(CENTER);
        textSize(this.rad);
        fill(65);
        text(this.hp, x + this.rad / 2, y + this.rad);
    }  

    checkHits(ball) {
        let x = this.pos.x;
        let y = this.pos.y;
        let r = this.rad;
        var hit = 1;
        if (abs(ball.pos.x - (x + r / 2)) > ball.rad + r ||
            abs(ball.pos.y - (y + r / 2)) > ball.rad + r) {
            return;
        }
        if (ball.vel.y > 0 &&
            collideLineCircle(x, y, x + r, y, 
                ball.pos.x, ball.pos.y, ball.rad)){
            // top line
            ball.vel.y *= -1;
        } else if (ball.vel.y < 0 && 
            collideLineCircle(x, y + r, x + r, y + r, 
                ball.pos.x, ball.pos.y, ball.rad)){
            // bottom line
            ball.vel.y *= -1;
        } else if (ball.vel.x > 0 && 
            collideLineCircle(x, y, x, y + r,
                ball.pos.x, ball.pos.y, ball.rad)){
            // left line
            ball.vel.x *= -1;
        } else if (ball.vel.x < 0 && 
            collideLineCircle(x + r, y, x + r, y + r,
                ball.pos.x, ball.pos.y, ball.rad)){
            // right line
            ball.vel.x *= -1;
        } else {
            hit = 0;
        }
        this.hp -= hit;
        score += hit;
        if (this.type == 1 && hit) {
            ball.disable();
        }
    }

}