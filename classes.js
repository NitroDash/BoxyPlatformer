class Rect {
    constructor(x,y,w,h) {
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
    }
    
    getTop() {
        return this.y;
    }
    
    getBottom() {
        return this.y+this.h;
    }
    
    getLeft() {
        return this.x;
    }
    
    getRight() {
        return this.x+this.w;
    }
    
    getCenterX() {
        return this.x+this.w/2;
    }
    
    getCenterY() {
        return this.y+this.h/2;
    }
    
    translate(dx,dy) {
        this.x+=dx;
        this.y+=dy;
    }
    
    moveTo(x,y) {
        this.x=x;
        this.y=y;
    }
    
    intersectsHoriz(other) {
        return this.x<=other.getRight()&&other.x<=this.getRight();
    }
    
    intersectsVert(other) {
        return this.y<=other.getBottom()&&other.y<=this.getBottom();
    }
    
    intersects(other) {
        return this.intersectsHoriz(other)&&this.intersectsVert(other);
    }
    
    inside(other) {
       return this.x<other.getRight()&&other.x<this.getRight()&&this.y<other.getBottom()&&other.y<this.getBottom();
    }
    
    getHorizOverlap(other) {
        return Math.max(0,Math.min(this.getRight(),other.getRight())-Math.max(other.getLeft(),this.getLeft()));
    }
    
    getVertOverlap(other) {
        return Math.max(0,Math.min(this.getBottom(),other.getBottom())-Math.max(other.getTop(),this.getTop()));
    }
}

class Wall {
    constructor(x,y,w,h) {
        this.rect=new Rect(x,y,w,h);
        this.dx=0;
        this.dy=0;
    }
    
    eject(other) {
        if (this.rect.intersects(other.rect)) {
            var dir=other.decideEject(this.rect);
            if (dir==0) {
                other.rect.y=this.rect.getTop()-other.rect.h;
                other.hitFloor(this);
            } else if (dir==1) {
                other.rect.y=this.rect.getBottom();
                other.hitCeiling(this);
            } else if (dir==2) {
                other.rect.x=this.rect.getLeft()-other.rect.w;
                other.hitWall(this);
            } else {
                other.rect.x=this.rect.getRight();
                other.hitWall(this);
            }
        }
    }
    
    update() {
        this.eject(player);
    }
    
    reset() {
        
    }
    
    render(ctx) {
        ctx.fillStyle="#000";
        ctx.fillRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h);
    }
}

class MoveWall extends Wall {
    constructor(x,y,w,h,dx,dy,t) {
        super(x,y,w,h);
        this.X=x;
        this.Y=y;
        this.DX=dx;
        this.DY=dy;
        this.dx=dx;
        this.dy=dy;
        this.time=t;
        this.timer=0;
    }
    
    update() {
        this.rect.translate(this.dx,this.dy);
        this.timer++;
        if (this.timer==this.time) {
            this.timer=0;
            this.dx*=-1;
            this.dy*=-1;
        }
        this.eject(player);
    }
    
    reset() {
        this.rect.moveTo(this.X,this.Y);
        this.timer=0;
        this.dx=this.DX;
        this.dy=this.DY;
    }
}

class HurtWall extends Wall {
    constructor(x,y,w,h) {
        super(x,y,w,h);
    }
    
    eject(other) {
        if (this.rect.inside(other.rect)) {
            other.die();
        }
    }
    
    render(ctx) {
        ctx.fillStyle="#f00";
        ctx.fillRect(this.rect.getLeft(),this.rect.getTop(),this.rect.w,this.rect.h);
    }
}

class MoveHurtWall extends MoveWall {
    constructor(x,y,w,h,dx,dy,t) {
        super(x,y,w,h,dx,dy,t);
    }
    
    eject(other) {
        if (this.rect.inside(other.rect)) {
            other.die();
        }
    }
    
    render(ctx) {
        ctx.fillStyle="#f00";
        ctx.fillRect(this.rect.getLeft(),this.rect.getTop(),this.rect.w,this.rect.h);
    }
}

class Entity {
    constructor(x,y,w,h) {
        this.rect=new Rect(x,y,w,h);
        this.dx=0;
        this.dy=0;
        this.ejectDists=[0,0,0,0];
    }
    
    hitFloor(rect) {
        
    }
    
    hitWall(rect) {
        
    }
    
    hitCeiling(rect) {
        
    }
    
    decideEject(rect) {
        this.ejectDists[0]=this.rect.getBottom()-rect.getTop();
        this.ejectDists[1]=rect.getBottom()-this.rect.getTop();
        this.ejectDists[2]=this.rect.getRight()-rect.getLeft();
        this.ejectDists[3]=rect.getRight()-this.rect.getLeft();
        var least=0;
        for (var i=1; i<4; i++) {
            if (this.ejectDists[i]<this.ejectDists[least]) {
                least=i;
            }
        }
        return least;
    }
    
    render(ctx) {
        ctx.fillStyle="#00f";
        ctx.fillRect(this.rect.x,this.rect.y,this.rect.w,this.rect.h);
    }
}