var Example = Example || {};

Example.universalGravitation = function(){
    var canvas = document.getElementById('diagram');

    var demVar = {
        width: 700,
        height: 400,
        gravityConstant: 0.001,
        ballSize: 10,
        friction: 0,
        frictionStatic: 1,
        frictionAir: 0,
        restitution: 0.5,
        velocityVector: true,
        offset: 25,
        lastTimeStamp: 0,
        objects: [],
        playing: false,
        firstTime: true,
        objectsTrails: [],
        smallObjectVelocity: [],
        colorSwap: false,
        presets: [],
        currentPreset: 'uniGrav',
        trailMaxTime: 1,
        settingInputs: '',
        initialVelocity: 6,
        baseVelocity: [6,1],
        inputVelocity: 360
    }

    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Events = Matter.Events,
        Bodies = Matter.Bodies,
        Runner = Matter.Runner,
        Body = Matter.Body,
        Vector = Matter.Vector;



    // create an engine
    var engine = Engine.create();

    var render = Render.create({
        element: canvas,
        engine: engine,
        options:
        {
            width: demVar.width,
            height: demVar.height,
            background: 'white',
            wireframeBackground: '#222',
            enabled: true,
            wireframes: false,
            showVelocity: true,
            showAngleIndicator: false,
            showCollisions: true,
            pixelRatio: 1
        }
    });
    
    Render.run( render );
    
    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    function addObjectInEnviroment(x, y, r, sides, Vx, Vy, earth){
        var imgPath = (earth ? '../images/earth.svg' : '../images/moon.png');
        var scale = (earth ? 0.2 : 0.3);
        var index = demVar.objects.length;
        demVar.objects.push(
            Bodies.polygon(x, y, sides,r, {
                friction: demVar.friction,
                frictionStatic: demVar.frictionStatic,
                frictionAir: demVar.frictionAir,
                restitution: demVar.restitution,
                render: {
                    fillStyle: randomColor(),
                    strokeStyle: 'black',
                    lineWidth: 3,
                    sprite:{
                        texture: imgPath,
                        xScale: scale,
                        yScale: scale
                    }
                }
            })
        );
        demVar.objectsTrails.push([]);
        Matter.Body.setVelocity(demVar.objects[index], {
            x: Vx,
            y: Vy
        });
        World.add(engine.world, demVar.objects[index]);
        demVar.smallObjectVelocity.push({x: Vx, y: Vy});
    }


    function resetSettings(){
        demVar.gravityConstant = 0.001;
        demVar.friction = 0;
        World.clear(engine.world, true);
        demVar.objects = [];
        demVar.objectsTrails = [];
        demVar.lastTimeStamp = 0;
        demVar.playing = false;
        demVar.smallObjectVelocity = [];
        demVar.firstTime = true;
        demVar.colorSwap = false;
    }

    uniGravInputs = `
        <div class="input-group">
            <input type="number" class="form-control" min=0 step=any placeholder="Initial Velocity" aria-label="Initial Velocity" aria-describedby="basic-addon2" id="veloInput">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary text-white btn-apply" type="button" disabled="true">m/s</button>
                <button class="btn btn-outline-secondary text-white btn-apply" type="button" id="veloButton">Apply</button>
            </div>
        </div>
    `;

    gravBodInputs = `
        <div class="input-group">
            <input type="number" class="form-control" min=0 step=any placeholder="Initial Velocity for all objects" aria-label="Initial Velocity for all objects" aria-describedby="basic-addon2" id="veloInput">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary text-white btn-apply" type="button" disabled="true">m/s</button>
                <button class="btn btn-outline-secondary text-white btn-apply" type="button" id="veloButton">Apply</button>
            </div>
        </div>
    `;

    function simpleOrbit(){
        resetSettings();
        addObjectInEnviroment(demVar.width*0.5, demVar.height*0.5, 50, 0, 0, 0, true);
        addObjectInEnviroment(demVar.width*0.5-150, demVar.height*0.5, 10, 0, 0, demVar.initialVelocity, false);
        demVar.trailMaxTime = 1;
        demVar.settingInputs = uniGravInputs;
        updateSettings();
    }

    function grav4Bodies(){
        resetSettings();
        addObjectInEnviroment(demVar.width*0.5+100, demVar.height*0.5+100, 12, 0, demVar.initialVelocity, 0, false);
        addObjectInEnviroment(demVar.width*0.5-100, demVar.height*0.5-100, 12, 0,-demVar.initialVelocity, 0, false);
        addObjectInEnviroment(demVar.width*0.5-100, demVar.height*0.5+100, 12, 0, 0, demVar.initialVelocity, false);
        addObjectInEnviroment(demVar.width*0.5+100, demVar.height*0.5-100, 12, 0, 0,-demVar.initialVelocity, false);
        demVar.colorSwap = true;
        demVar.trailMaxTime = 10;
        demVar.settingInputs = gravBodInputs;
        updateSettings();
    }

    function grav2Bodies(){
        resetSettings();
        addObjectInEnviroment(demVar.width*0.5+50, demVar.height*0.5-50, 12, 0, -demVar.initialVelocity, -demVar.initialVelocity, false);
        addObjectInEnviroment(demVar.width*0.5-50, demVar.height*0.5+50, 12, 0, demVar.initialVelocity, demVar.initialVelocity, false);
        demVar.trailMaxTime = 10;
        demVar.settingInputs = gravBodInputs;
        updateSettings();
    }

    engine.velocityIterations = 4;
    engine.positionIterations = 6;
    engine.world.gravity.y = 0;

    function gravity() {
        if(demVar.playing){
            var length = demVar.objects.length;
            for (var i = (demVar.currentPreset == 'uniGrav' ? 1 : 0); i < length; i++) {
                for (var j = 0; j < length; j++) {
                    if (i != j) {
                        var Dx = demVar.objects[j].position.x - demVar.objects[i].position.x;
                        var Dy = demVar.objects[j].position.y - demVar.objects[i].position.y;
                        var force = (engine.timing.timestamp-demVar.lastTimeStamp) * demVar.gravityConstant * demVar.objects[j].mass * demVar.objects[i].mass / (Math.sqrt(Dx * Dx + Dy * Dy))
                        var angle = Math.atan2(Dy, Dx);
                        demVar.objects[i].force.x += force * Math.cos(angle)
                        demVar.objects[i].force.y += force * Math.sin(angle)
                        demVar.smallObjectVelocity[i].x = demVar.objects[i].velocity.x;
                        demVar.smallObjectVelocity[i].y = demVar.objects[i].velocity.y;
                    }
                }
            }
        }else{
            for (var i = 0; i < demVar.objects.length; i++) {
                Body.setVelocity(demVar.objects[i], {x: 0, y: 0});
            }
        }
        demVar.lastTimeStamp = engine.timing.timestamp;
    }

    function playPause(){
        if(demVar.playing && demVar.firstTime){
            for(var i = 0; i < demVar.objects.length; i++){
                Body.setVelocity(demVar.objects[i], {
                    x: demVar.smallObjectVelocity[i].x,
                    y: demVar.smallObjectVelocity[i].y
                });
            }
            demVar.firstTime = false;
        }
        if(demVar.currentPreset == 'uniGrav') Body.setVelocity(demVar.objects[0], {x: 0, y: 0});
        gravity();
    }

    function getColor(bodyIndex, currentTrail, maxTrail){
        var rgb;
        if(demVar.colorSwap){
            if(bodyIndex > 2){
                rgb = [165,255,0];
            }else{
                var i = bodyIndex % 3;
                rgb = [0,0,0];
                rgb[i] = 255;
            }
        }else{
            rgb = [255/4,255/4,255/4];
            var i = bodyIndex % 2 + 1;
            rgb[i] = 255;
        }
        var alpha = currentTrail/maxTrail;
        var ret = `rgba(`+rgb[1]+`,`+rgb[0]+`,`+rgb[2]+`,`+ alpha +`)`;
        return ret;
    }

    function renderTrails(){
        if(demVar.playing){
            for (var i = 0; i <  demVar.objectsTrails.length; i++) {
                demVar.objectsTrails[i].push({
                    position: Vector.clone(demVar.objects[i].position),
                    timestamp: engine.timing.timestamp,
                });
            }
            for (var i = 0; i < demVar.objectsTrails.length; i++) {
                for (var j = 0; j < demVar.objectsTrails[i].length; j++) {
                    if(((engine.timing.timestamp - demVar.objectsTrails[i][j].timestamp)/1000) > demVar.trailMaxTime){
                        demVar.objectsTrails[i].shift();
                    }
                }
            }
        }
        Render.startViewTransform(render);
        for (var i = 0; i < demVar.objectsTrails.length; i++) {
            var len = demVar.objectsTrails[i].length;
            for (var j = 0; j < len; j++) {
                var point = demVar.objectsTrails[i][j].position;
                
                //color of the trace    
                render.context.fillStyle = getColor( i, j, len );
                //size of the dots
                render.context.fillRect(point.x, point.y, 2, 2);
            }
        }
        Render.endViewTransform(render);
    }

    Events.on( runner, "beforeTick", function(event) {
        playPause();
    } );

    Events.on( render, 'afterRender', function() {
        renderTrails();        
    });

    Events.on( engine, 'collisionStart', ({ pairs }) => {
        pairs.forEach(({ bodyA, bodyB }) => {
            if(demVar.currentPreset == 'uniGrav'){
                if(bodyA !== demVar.objects[0]) Matter.World.remove(engine.world, bodyA);
                if(bodyB !== demVar.objects[0]) Matter.World.remove(engine.world, bodyB);
            }else{
                Matter.World.remove(engine.world, bodyA);
                Matter.World.remove(engine.world, bodyB);
            }

        });
    });

     document.getElementById('equations').innerHTML = `
        <div class="p-3">
            $$F = {GM_1M_2 \\over R^2}$$
        </div>
     `;

    if(window.MathJax){
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById('equations')[0]]);
    }

    function loadPreset(){
        if(demVar.currentPreset == 'uniGrav'){
            simpleOrbit();
        }else if(demVar.currentPreset == '2Bodies'){
            grav2Bodies();
        }else{
            grav4Bodies();
        }
        updateProblemDescription();
    }

    function addPreset(id, name){
        demVar.presets.push({
            id: id,
            name: name
        });
    }

    addPreset('uniGrav', 'Universal Gravitation');
    addPreset('2Bodies', 'Gravitation with 2 Bodies');
    addPreset('4Bodies', 'Gravitation with 4 Bodies');

    var presetOptions = demVar.presets.map(function (preset) {
        return '<a class="dropdown-item" href="javascript:void(0)" id="' + preset.id + '">' + preset.name + '</a>';
    }).join(' ');

    document.getElementById('settings').innerHTML = `
            <div class="container p-2">
                <button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="preset">
                Presets
                </button>
                <div class="dropdown-menu">
                    ${presetOptions}
                </div>
                <button type="button" class="btn btn-outline-secondary text-white btn-apply" id="play-pause">Play</button>
            </div>
            <div class="container" id="userInput">
                    ${demVar.settingInputs}
            </div>
    `;

    function updateSettings(){
        document.getElementById('userInput').innerHTML = `
            ${demVar.settingInputs}
        `;

        document.getElementById('veloButton').onclick = function(){
            if(document.getElementById('veloInput').value.length !== 0){
                demVar.inputVelocity = parseFloat( document.getElementById( "veloInput" ).value );
                demVar.initialVelocity = demVar.inputVelocity * 0.01666;
                console.log(demVar.initialVelocity);
                demVar.playing = false;
                demVar.firstTime = true;
                updatePlayPause();
                loadPreset();
            }
        }
    }

    function updatePlayPause(){
        document.getElementById('play-pause').innerHTML = (demVar.playing ? "Pause" : "Play");
    }

    document.getElementById('play-pause').onclick = function(){
        demVar.playing = !demVar.playing;
        demVar.firstTime = true;
        updatePlayPause();
    };

    // Default demo
    loadPreset()

    function createFunction(id){
        document.getElementById(id).onclick = function(){
            demVar.currentPreset = id;
            demVar.playing = false;
            demVar.firstTime = true;
            demVar.initialVelocity = (id == 'uniGrav' ? demVar.baseVelocity[0] : demVar.baseVelocity[1]);
            demVar.inputVelocity = (id == 'uniGrav' ? demVar.baseVelocity[0] : demVar.baseVelocity[1]) * 60;
            updatePlayPause();
            loadPreset();
        }
    }

    for (var i = 0; i < demVar.presets.length; i++) {
        createFunction(demVar.presets[i].id);
    }

    function updateProblemDescription(){
        var desc;
        if(demVar.currentPreset == 'uniGrav'){
            desc = `A small object orbits around a larger object.
            The initial velocity of the small object is ${demVar.inputVelocity} m/s`;
        }else{
            desc = `The initial velocity of the all small objects is ${demVar.inputVelocity} m/s`;
        }
        document.getElementById('problemDescription').innerHTML = `
            <p class='text-center'> 
                ${desc}
            </p> 
        `;
    }

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