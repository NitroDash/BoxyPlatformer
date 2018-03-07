var ctx;
var walls;
var player;

var gold=0;
var goldDisplayTimer=0;

var level=0;
var numLevels=18;

var drawToBackground=false;
var bg_canvas;
var bg_ctx;
var slideX=0;

var loading=false;

var init=function() {
    ctx=document.getElementById("canvas").getContext("2d");
    bg_canvas=document.createElement("canvas");
    bg_canvas.width=800;
    bg_canvas.height=600;
    bg_ctx=bg_canvas.getContext("2d");
    ctx.font="30px Arial";
    bg_ctx.font="30px Arial";
    walls=[];
    player=new Player(200,440);
    loadLevel(level,gameLoop);
}

var loadLevel=function(id,callback) {
    loadJSON("levels/"+id+".json",function(level) {
        walls.splice(0,walls.length);
        for (var i=0; i<level.rects.length; i++) {
            walls.push(makeWall(level.rects[i]));
        }
        player.respawn=level.spawn;
        player.reset();
        callback();
    });
}

var makeWall=function(rect) {
    if (rect.type==0) {
        return new Wall(rect.x,rect.y,rect.w,rect.h);
    } else if (rect.type==1) {
        return new HurtWall(rect.x,rect.y,rect.w,rect.h);
    } else if (rect.type==2) {
        return new MoveWall(rect.x,rect.y,rect.w,rect.h,rect.dx,rect.dy,rect.t);
    } else if (rect.type==3) {
        return new MoveHurtWall(rect.x,rect.y,rect.w,rect.h,rect.dx,rect.dy,rect.t);
    } else if (rect.type==-1) {
        return new Text(rect.x,rect.y,rect.text);
    } else if (rect.type==-2) {
        return new Gold(rect.x,rect.y);
    }
}

var gameLoop=function() {
    update();
    render();
    window.requestAnimationFrame(gameLoop);
}

var reset=function() {
    player.reset();
    for (var i=0; i<walls.length; i++) {
        walls[i].reset();
    }
}

var update=function() {
    if (goldDisplayTimer>0) {
        goldDisplayTimer--;
    }
    if (loading) {return;}
    if (slideX!=0) {
        slideX-=20;
        if (slideX<=0) {
            slideX=0;
        }
        return;
    }
    player.update();
    if (!player.dead) {
        for (var i=0; i<walls.length; i++) {
            walls[i].update();
        }
    }
    if (!player.dead) {
        for (var i=0; i<walls.length; i++) {
            if (walls[i].rect.inside(player.rect)&&walls[i].rect.getHorizOverlap(player.rect)+walls[i].rect.getVertOverlap(player.rect)>25) {
                player.die();
                break;
            }
        }
    }
    if (!player.dead&&player.rect.getRight()>=800) {
        if (level>numLevels) {
            player.rect.x=800-player.rect.w;
        } else {
            drawToBackground=true;
            loading=true;
            awardGold();
            level++;
            loadLevel((level==numLevels+1)?"end":level,function() {
                loading=false;
                slideX=800;
            });
        }
    }
    for (var i=0; i<keys.length; i++) {
        keys[i].isPressed=false;
    }
}

var awardGold=function() {
    for (var i=0; i<walls.length; i++) {
        if (walls[i].isGold&&walls[i].captured) {
            gold++;
            goldDisplayTimer=100;
        }
    }
}

var render=function() {
    if (drawToBackground) {
        drawToBackground=false;
        bg_ctx.fillStyle="#fff";
        bg_ctx.fillRect(0,0,800,600);
        for (var i=0; i<walls.length; i++) {
            walls[i].render(bg_ctx);
        }
    }
    if (slideX!=0) {
        ctx.translate(slideX,0);
        ctx.drawImage(bg_canvas,-800,0);
    }
    ctx.fillStyle="#fff";
    ctx.fillRect(0,0,800,600);
    for (var i=0; i<walls.length; i++) {
        walls[i].render(ctx);
    }
    player.render(ctx);
    if (slideX!=0) {
        ctx.translate(-slideX,0);
    }
    if (goldDisplayTimer>0) {
        ctx.fillStyle="#aa0";
        ctx.fillRect(10,10,20,20);
        ctx.fillStyle="#000";
        ctx.fillText("x "+((goldDisplayTimer>60)?gold-1:gold),40,30);
    }
}