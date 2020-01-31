import Matter from 'matter-js';


var c = document.getElementById("cv"); // get the canvas element
var ctx = c.getContext("2d"); // get the canvas context
c.width = window.innerWidth; // set canvas width and height to browser window size
c.height = window.innerHeight;

// add a function to adjust the canvas size if the screen is resized
window.onresize = function(event) {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
};


// set up module aliases
var Engine = Matter.Engine,
  World = Matter.World,
  Composites = Matter.Composites,
  Composite = Matter.Composite,
  Body = Matter.Body,
  Bodies = Matter.Bodies,
  Events = Matter.Events,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse;

var playerBody = Bodies.rectangle(window.innerWidth / 2, 225, 20, 20, {
  density: 0.002,
  friction: 0.5
});
var playerFloorSensor = Bodies.circle(window.innerWidth / 2, 245, 2, {
  density: 0,
  friction: 0.3,
  isSensor: true
});

var player = Body.create({
  parts: [playerBody, playerFloorSensor],
  friction: 0
});
// create a group/grid of bodies
var stackA = Composites.stack(window.innerWidth/2 -75, 150, 15, 15, 2, 2, function(x, y) {
    return Bodies.circle(x, y, 3,{friction:0}); // create a circle body
});

// create player body parts
var playerBody = Bodies.rectangle(window.innerWidth/2,225,20,20,{density:0.002, friction:0.5});
var playerFloorSensor = Bodies.circle(window.innerWidth/2,245,2,{density:0, friction:0.3, isSensor: true});

// join body parts into one
var player = Body.create({
            parts: [playerBody, playerFloorSensor],
            friction:0
});
playerBody.col = '#FFDDDD';

// create 2 static bars that cross each other
var wall = Bodies.rectangle(window.innerWidth/2,  window.innerHeight /2, 500, 20, {
    isStatic: true,
    angle:0.2
});

var wall2 = Bodies.rectangle(window.innerWidth/2,  window.innerHeight /2, 500, 20, {
    isStatic: true,
    angle:-0.2
});

// add the bodies to the world (won't appear unless added to world)
World.add(engine.world, [stackA, wall,wall2, player]);


// create 4 walls to contains all our objects within the screen boundaries.
var offset = 1;
var wallSize = 20;
World.add(engine.world, [
    //top
    Bodies.rectangle(window.innerWidth/2, -offset, window.innerWidth + 2 * offset, wallSize, {
        isStatic: true
    }),
    //bottom
    Bodies.rectangle(window.innerWidth/2, window.innerHeight + offset, window.innerWidth + 2 * offset, wallSize, {
        isStatic: true
    }),
    //right
    Bodies.rectangle(window.innerWidth+ offset, window.innerHeight /2, wallSize, window.innerHeight + 2 * offset, {
        isStatic: true
    }),
    // left
    Bodies.rectangle(-offset, window.innerHeight /2, wallSize, window.innerHeight + 2 * offset, {
        isStatic: true
    })
]);

//render
(
    function render() {
    // keep player at 0 rotation
    Body.setAngle(player, 0);

    // react to key commands and apply force as needed
    if((keys[KEY_SPACE] || keys[KEY_W]) && playerOnFloor){
        let force = (-0.013 * player.mass) ;
        Body.applyForce(player,player.position,{x:0,y:force});
    }

    if(keys[KEY_D]){
        let force = (0.0004 * player.mass) ;
        Body.applyForce(player,player.position,{x:force,y:0});
    }
    if(keys[KEY_A]){
        let force = (-0.0004 * player.mass) ;
        Body.applyForce(player,player.position,{x:force,y:0});
    }

    // react to mouse command and add object on click (add check to only place block where no other blocks exist)
    if(mouseIsDown){
        World.add(engine.world,Bodies.rectangle(mp.x, mp.y, 20, 20, {isStatic:true}));
    }

    // get all bodies
    var bodies = Composite.allBodies(engine.world);
    // request a chance to draw to canvas
    window.requestAnimationFrame(render);

    // empty canvas
    ctx.clearRect(0, 0, c.width, c.height);

    //start drawing a objects
    ctx.beginPath();
    for (var i = 0; i < bodies.length; i += 1) {
        var vertices = bodies[i].vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (var j = 1; j < vertices.length; j += 1) {
            ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#DDDDDD';
    ctx.stroke();
    ctx.fillStyle='#FAFAFF';
    ctx.fill();

    // fill player separatly
    fillObject(playerBody);


})();

const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
const KEY_SPACE = 32;
const KEY_SHIFT = 16;

var playerOnFloor = false;

var mouseIsDown = false;
var mp;
var keys = [];

// hook in mouse control
mouseConstraint = MouseConstraint.create(engine, {
                    element: c
});

MouseConstraint.create(engine, {
 element: c
});

Events.on(mouseConstraint, 'mousedown', function(event) {
    var mousePosition = event.mouse.position;
    mp = mousePosition;
    mouseIsDown = true;
});

Events.on(mouseConstraint, 'mouseup', function(event) {
    var mousePosition = event.mouse.position;
    mp = mousePosition;
    mouseIsDown = false;
});
Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA === playerFloorSensor) {
            playerBody.col = '#ddddFF';
        } else if (pair.bodyB === playerFloorSensor) {
            playerBody.col = '#ddddFF';
        }
    }
})

Events.on(engine, 'collisionEnd', function(event) {
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA === playerFloorSensor) {
            playerBody.col = '#FFdddd';
            playerOnFloor = false;
        } else if (pair.bodyB === playerFloorSensor) {
            playerBody.col = '#FFdddd';
            playerOnFloor = false;
        }
    }
})

 Events.on(engine, 'collisionActive', function(event) {
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA === playerFloorSensor) {
            playerBody.col = '#DDFFDD';
            playerOnFloor = true;
        } else if (pair.bodyB === playerFloorSensor) {
            playerBody.col = '#DDFFDD';
            playerOnFloor = true;
        }
    }
})
