var keys=[];
var walls=[];
var cursor={"x":0,"y":0};
var select={"x":0,"y":0};
var drawingRect=false;
var ctx;

class Wall {
    constructor(x,y,w,h,type) {
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.type=type;
    }
    
    contains(x,y) {
        return x>this.x&&y>this.y&&x<this.x+this.w&&y<this.y+this.h;
    }
    
    render(ctx) {
        if (this.type==1||this.type==3) {
            ctx.fillStyle="#f00";
        } else {
            ctx.fillStyle="#000";
        }
        ctx.fillRect(this.x,this.y,this.w,this.h);
    }
}
var load=function() {
    keys=[keyboard(38),keyboard(40),keyboard(37),keyboard(39),keyboard(32),keyboard(16),keyboard(46),keyboard(13)];
    walls=[new Wall(0,550,800,50,0)];
    ctx=document.getElementById("canvas").getContext("2d");
    gameLoop();
}

var gameLoop=function() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

var update=function() {
    var speed=(keys[5].isDown)?5:1;
    if (keys[0].isDown) {
        cursor.y-=speed;
    }
    if (keys[1].isDown) {
        cursor.y+=speed;
    }
    if (keys[2].isDown) {
        cursor.x-=speed;
    }
    if (keys[3].isDown) {
        cursor.x+=speed;
    }
    if (keys[5].isDown) {
        cursor.y-=cursor.y%5;
        cursor.x-=cursor.x%5;
    }
    if (keys[4].isPressed) {
        keys[4].isPressed=false;
        if (drawingRect) {
            var type=prompt("Which type?");
            walls.push(new Wall(Math.min(select.x,cursor.x),Math.min(select.y,cursor.y),Math.abs(select.x-cursor.x),Math.abs(select.y-cursor.y),parseInt(type)));
            drawingRect=false;
        } else {
            select.x=cursor.x;
            select.y=cursor.y;
            drawingRect=true;
        }
    }
    if (keys[6].isPressed) {
        keys[6].isPressed=false;
        for (var i=walls.length-1; i>=0; i--) {
            if (walls[i].contains(cursor.x,cursor.y)) {
                walls.splice(i,1);
                break;
            }
        }
    }
    if (keys[7].isPressed) {
        keys[7].isPressed=false;
        var level={};
        level.rects=walls;
        level.spawn={"x":50,"y":530};
        console.log(JSON.stringify(level));
    }
}

var render=function() {
    ctx.fillStyle="#fff";
    ctx.fillRect(0,0,800,600);
    for (var i=0; i<walls.length; i++) {
        walls[i].render(ctx);
    }
    if (drawingRect) {
        ctx.fillStyle="#000";
        ctx.fillRect(Math.min(select.x,cursor.x),Math.min(select.y,cursor.y),Math.abs(select.x-cursor.x),Math.abs(select.y-cursor.y));
    }
    ctx.fillStyle="#000";
    ctx.fillRect(cursor.x,0,1,600);
    ctx.fillRect(0,cursor.y,800,1);
    ctx.fillStyle="#00f";
    ctx.fillText("("+cursor.x+","+cursor.y+")",10,20);
}