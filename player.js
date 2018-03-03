var keys=[keyboard(38),keyboard(40),keyboard(37),keyboard(39),keyboard(32),keyboard(16)];

var WALK_SPEED=3;
var GRAVITY=0.5;
var FALL_SPEED=6;
var JUMP_SPEED=7;
var CLIMB_SPEED=1;
var WALL_JUMP_SPEED=5;

var CAN_JUMP_COLOR="#00f";
var CANT_JUMP_COLOR="#080";

class Player extends Entity {
    constructor(x,y) {
        super(x,y,20,20);
        this.respawn={"x":x,"y":y};
        this.reset();
    }
    
    reset() {
        this.rect.moveTo(this.respawn.x,this.respawn.y);
        this.dx=0;
        this.dy=0;
        this.grounded=false;
        this.doubleJump=true;
        this.holdWall=null;
        this.velWall=null;
        this.knockbackTime=0;
        this.platformDx=0;
        this.platformDy=0;
        this.doubleJumped=false;
        this.dead=false;
        this.prevVelWall=null;
    }
    
    die() {
        this.dead=true;
        if (this.pieces==null) {
            this.pieces=[];
            for (var i=0; i<4; i++) {
                this.pieces.push(new PlayerPiece(0,0,0,0,null));
            }
        }
        var color=(this.doubleJump)?CAN_JUMP_COLOR:CANT_JUMP_COLOR;
        this.pieces[0].reset(this.rect.x,this.rect.y,-2,-6,color);
        this.pieces[1].reset(this.rect.getCenterX(),this.rect.y,2,-6,color);
        this.pieces[2].reset(this.rect.x,this.rect.getCenterY(),-1.6,-4,color);
        this.pieces[3].reset(this.rect.getCenterX(),this.rect.getCenterY(),1.6,-4,color);
    }
    
    update() {
        if (this.dead) {
            var active=false;
            for (var i=0; i<4; i++) {
                this.pieces[i].update();
                active=active||this.pieces[i].active;
            }
            if (!active) {
                reset();
            }
            return;
        }
        this.doubleJumped=false;
        if (this.knockbackTime==0) {
            if (keys[2].isDown) {
                if (this.dx>-WALK_SPEED) {
                    this.dx-=WALK_SPEED;
                    if (this.dx<-WALK_SPEED) {
                        this.dx=-WALK_SPEED;
                    }
                }
            } else if (keys[3].isDown) {
                if (this.dx<WALK_SPEED) {
                    this.dx+=WALK_SPEED;
                    if (this.dx>WALK_SPEED) {
                        this.dx=WALK_SPEED;
                    }
                }
            } else {
                this.dx=0;
            }
        } else {
            this.knockbackTime--;
        }
        if (!this.grounded&&this.holdWall==null) {
            this.dy+=GRAVITY;
            if (this.dy>FALL_SPEED-this.platformDy) {
                this.dy=FALL_SPEED-this.platformDy;
            }
            if (this.doubleJump&&keys[4].isPressed) {
                this.doubleJump=false;
                this.dy=-JUMP_SPEED;
                this.velWall=null;
                this.platformDx=0;
                this.platformDy=0;
                this.doubleJumped=true;
            }
        } else if (this.holdWall!=null) {
            this.knockbackTime=0;
            this.dy=0;
            if (keys[0].isDown) {
                this.rect.translate(0,-CLIMB_SPEED);
            }
            if (keys[1].isDown) {
                this.rect.translate(0,CLIMB_SPEED);
            }
            if (this.rect.getCenterY()<=this.holdWall.rect.getTop()) {
                this.dy=-JUMP_SPEED/2;
            }
            if (keys[4].isPressed) {
                this.dy=-JUMP_SPEED;
                this.dx=(this.holdWall.rect.getLeft()<this.rect.getLeft())?WALK_SPEED:-WALK_SPEED;
            }
        } else if (this.grounded) {
            this.knockbackTime=0;
            if (keys[4].isPressed) {
                this.dy=-JUMP_SPEED;
            }
        }
        this.rect.translate(this.dx,Math.max(-FALL_SPEED,this.dy));
        this.rect.translate(this.platformDx,this.platformDy);
        if (this.rect.getLeft()<=0) {
            this.rect.x=0;
        }
        if (this.holdWall==null&&this.velWall==null) {
            this.dx+=this.platformDx;
            this.dy+=this.platformDy;
            this.platformDx=0;
            this.platformDy=0;
        }
        this.grounded=false;
        this.holdWall=null;
        this.prevVelWall=this.velWall;
        this.velWall=null;
    }
    
    hitFloor(rect) {
        if (rect.dy<=this.dy||rect==this.prevVelWall) {
            this.dy=0;
            this.dx=Math.max(-WALK_SPEED,Math.min(WALK_SPEED,this.dx));
            this.grounded=true;
            this.doubleJump=true;
            this.velWall=rect;
            this.platformDx=rect.dx;
            this.platformDy=rect.dy;
        }
    }
    
    hitWall(rect) {
        if (keys[5].isDown&&this.rect.getCenterY()>=rect.rect.getTop()) {
            this.holdWall=rect;
            this.velWall=rect;
            this.platformDx=rect.dx;
            this.platformDy=rect.dy;
            this.dy=0;
        } else if (keys[4].isPressed&&(keys[2].isDown&&rect.rect.getLeft()<this.rect.getLeft()||keys[3].isDown&&rect.rect.getLeft()>this.rect.getLeft())) {
            this.dx=(rect.rect.getLeft()<this.rect.getLeft())?WALK_SPEED:-WALK_SPEED;
            this.dy=-JUMP_SPEED;
            this.knockbackTime=14;
            if (this.doubleJumped) {
                this.doubleJump=true;
            }
        } else {
            this.dx=0;
        }
        if ((rect.rect.getLeft()<this.rect.getLeft())!=(rect.dx<0)) {
            this.velWall=rect;
            this.platformDx=rect.dx;
            this.platformDy=rect.dy;
        }
        
    }
    
    render(ctx) {
        if (this.dead) {
            for (var i=0; i<this.pieces.length; i++) {
                this.pieces[i].render(ctx);
            }
            return;
        }
        if (this.doubleJump) {
            ctx.fillStyle=CAN_JUMP_COLOR;
        } else {
            ctx.fillStyle=CANT_JUMP_COLOR;
        }
        ctx.fillRect(this.rect.getLeft(),this.rect.getTop(),this.rect.w,this.rect.h);
    }
}

class PlayerPiece extends Entity {
    constructor(x,y,dx,dy,color) {
        super(x,y,10,10);
        this.reset(x,y,dx,dy,color);
    }
    
    reset(x,y,dx,dy,color) {
        this.color=color;
        this.rect.moveTo(x,y);
        this.dx=dx;
        this.dy=dy;
        this.active=true;
    }
    
    update() {
        if (this.active) {
            this.dy+=GRAVITY;
            this.rect.translate(this.dx,this.dy);
            if (this.rect.getTop()>600) {
                this.active=false;
            }
        }
    }
    
    render(ctx) {
        if (this.active) {
            ctx.fillStyle=this.color;
            ctx.fillRect(this.rect.getLeft(),this.rect.getTop(),this.rect.w,this.rect.h);
        }
    }
}