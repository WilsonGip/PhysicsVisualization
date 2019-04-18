var Example = Example || {};

Example.motion = function() {
    var canvas = document.getElementById('diagram');

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        World = Matter.World,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options:
            {
                width: 700,
                height: 400,
                background: 'black',
                wireframeBackground: '#222',
                enabled: true,
                wireframes: false,
                showVelocity: false,
                showAngleIndicator: false,
                showCollisions: false,
                pixelRatio: 1
            }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // colors
    var groundColor = '#ff691a';

    // particle properties
    var xVelocity = 0,
        yVelocity = 0,
        xGravity = 0,
        yGravity = 0;

    // add bodies
    var groundOptions = {
        render: { fillStyle: groundColor },
        isStatic:true,
        friction: 1,
        frictionStatic: 1};
    var ground = Bodies.rectangle(400, 600, 1400, 50, groundOptions);
    var particle;

    World.add(world, ground);

    //gets mouse position
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    canvas.onclick = function(evt) {

        mousePos = getMousePos(canvas, evt);
        particle = Bodies.circle(mousePos.x, mousePos.y, 10);

        Matter.Body.setVelocity(particle, {
            x: xVelocity,
            y: yVelocity
        });
        particle.frictionAir = 0;
        world.gravity.x = xGravity;
        world.gravity.y = yGravity;

        World.add(world, particle);
    };

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    document.getElementById('settings').innerHTML = `
            <div class="mult-btn">
                    <button class="btn btn-outline-secondary text-white" type="button" id="updateVariables">Apply Changes</button>
                    <button class="btn btn-outline-secondary text-white" type="button" id="clearWorld">Clear World</button>
            </div>
            <div class="input-group">
                <input type="text" class="form-control" placeholder="X Velocity" aria-label="X Velocity" aria-describedby="basic-addon2" id="enteredXVel">
            </div>
            <div class="input-group">
                <input type="text" class="form-control" placeholder="Y Velocity" aria-label="Y Velocity" aria-describedby="basic-addon2" id="enteredYVel">
            </div>
            <div class="input-group">
                <input type="text" class="form-control" placeholder="X Acceleration" aria-label="X Acceleration" aria-describedby="basic-addon2" id="enteredXAcc">
            </div>
            <div class="input-group">
                <input type="text" class="form-control" placeholder="Y Acceleration" aria-label="Y Acceleration" aria-describedby="basic-addon2" id="enteredYAcc">
            </div>
	`;

    document.getElementById("updateVariables").onclick = function()
    {
        xVelocity = document.getElementById("enteredXVel").value;
        yVelocity = document.getElementById("enteredYVel").value;
        xGravity = document.getElementById("enteredXAcc").value;
        world.gravity.x = xGravity;
        yGravity = document.getElementById("enteredYAcc").value;
        world.gravity.y = yGravity;

    }

    document.getElementById("clearWorld").onclick = function()
    {
        World.clear(world, true);
    }

    document.getElementById('problemDescription').innerHTML = `
			<h4 style="text-align: center;"><span style="color: #0000ff;">2-D Motion</span></h4>
            <p>Quick intro to position, velocity, and acceleration</p>

	`;

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};