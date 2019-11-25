class Ball {
  constructor(rad) {
    this.pos = createVector(width/2, height);
    this.rad = rad;
    this.vel = createVector(0, 0);
    this.on_screen = false;
  }

  draw() {
    noStroke();
    fill(255)
    let x = this.pos.x;
    let y = this.pos.y;
    circle(x, y, this.rad * 2);
  }

  update() {
    if (this.on_screen) {
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
    }  
  }

  addForce(x, y) {
    if (this.on_screen) {
      this.vel.x += x;
      this.vel.y += y;
    }
  }

  checkBorders() {
    let max_speed = 1;
    if (this.on_screen) {
      if ((this.pos.x > width && this.vel.x > 0) || 
          (this.pos.x < 0 && this.vel.x < 0)) {
        this.vel.x *= -1;
      }
      if (this.pos.y < 0 && this.vel.y < 0) {
        this.vel.y *= -1;
      }
      else if (this.pos.y > height) {
        this.disable();
      }
      let squared_speed = this.vel.x * this.vel.x + this.vel.y * this.vel.y;
      if (squared_speed > max_speed * max_speed) {
        let speed_mult = max_speed / sqrt(squared_speed);
        this.vel.x *= speed_mult;
        this.vel.y *= speed_mult;
      }
    }
  }

  disable() {
    this.on_screen = false;
    this.pos.x = width/2;
    this.pos.y = height;
    this.vel.x = 0;
    this.vel.y = 0;
  }

  checkCollisions(other_ball) {
    if (this.on_screen && other_ball.on_screen) {
      let tx = this.pos.x;
      let ty = this.pos.y;
      let ox = other_ball.pos.x;
      let oy = other_ball.pos.y;
      if (dist(tx, ty, ox, oy) <= (this.rad + other_ball.rad)) {
        let velx = (abs(this.vel.x) + abs(other_ball.vel.x)) / 2;
        let vely = (abs(this.vel.y) + abs(other_ball.vel.y)) / 2;
        if (tx >= ox) {
          this.vel.x += velx;
        } else {
          this.vel.x -= velx;
        }
        if (ty >= oy) {
          this.vel.y += vely;
        } else {
          this.vel.y -= vely;
        }
      }
    }
  }
}