var Example = Example || {};

Example.projectile = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Events = Matter.Events,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
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

    // position for projectile
    var xPos = 400,
        yPos = 500;

    // add bodies
    var projectileOptions = { density: 0.004 },
        projectile = Bodies.circle(xPos, yPos, 25, projectileOptions),
        target = Bodies.rectangle(50, 50, 100, 100),
        anchor = { x: xPos, y: yPos },
        elastic = Constraint.create({
            pointA: anchor,
            bodyB: projectile,
            stiffness: 0.05
        });

    World.add(engine.world, [projectile, elastic]);

    Events.on(engine, 'onclick', function () {
        var x = Math.floor((Math.random() * 500));
        target = Bodies.rectangle(x, 50, 50, 50),
            World.add(engine.world, [projectile, target]);
    })

    var targetInterval = setInterval(createTarget, 1500);
    function createTarget() {
        var x = Math.floor((Math.random() * 500));
        target = Bodies.rectangle(x, 50, 50, 50);
        World.add(engine.world, target);
    }

    Events.on(engine, 'afterUpdate', function() {

        if (mouseConstraint.mouse.button === -1 && (projectile.position.x > xPos + 20
            || projectile.position.x < xPos - 20
            || projectile.position.y > yPos + 20
            || projectile.position.y < yPos - 20)) {
            projectile = Bodies.circle(xPos, yPos, 25, projectileOptions);
            World.add(engine.world, projectile);
            elastic.bodyB = projectile;
        }
    });

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: true
                }
            }
        });

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });
    document.getElementById('settings').innerHTML = `
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