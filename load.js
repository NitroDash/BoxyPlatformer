var textures=[];
var loadStatus=[];

var srcs=[];

var numImages=0;
var loaded=0;

var hasSetup=0;

var debug=true;

function load() {
    init();
}

function requestLoad(id) {
    if (loadStatus[id]==0) {
        textures[id]=loadImage(srcs[id],id);
    } else if (loadStatus[id]==3) {
        loadStatus[id]=2;
    }
}

function deallocate(id) {
    textures[id]=null;
    loadStatus[id]=0;
}

function loadImage(src,id) {
    loaded++;
    loadStatus[id]=1;
    var obj=new Image();
    obj.src=src;
    obj.onload=function() {incrementLoad(id);};
    return obj;
}

function incrementLoad(id) {
    loaded--;
    if (id!=null) {
        loadStatus[id]=2;
    }
    if (loaded<=0) {
        if (hasSetup==0) {
            hasSetup=1;
            setupSelect();
        } else if (hasSetup==1) {
            hasSetup=2;
            setup();
        }
    }
}

function loadJSON(filename,callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(JSON.parse(xobj.responseText));
          }
    };
    xobj.send(null);  
 }