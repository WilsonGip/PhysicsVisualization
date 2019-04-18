var Example = Example || {};

Example.dielectric = function(){
	var canvas = document.getElementById('diagram');

	var demVar = 
	{
		PERMITIVITY_OF_FREE_SPACE: 0.00000000000885,
		capacitance: 0,
		charge: 0,
		k: 1,
		Area: 5,
		distance: 5,
		voltage: 1.5,
		bVoltageNegative: false,
		objects: [],
		particles: [],
		charges: [],
		capacitor: [],
	}

	// module aliases
	var Engine = Matter.Engine,
		Render = Matter.Render,
		World = Matter.World,
		Bodies = Matter.Bodies,
		Body = Matter.Body,
		Composites = Matter.Composites,
		Runner = Matter.Runner;
		
	// create an engine
	var engine = Engine.create();

	var render = Render.create({
		element: canvas,
		engine: engine,
		options:
		{
			width: 700,
			height: 400,
			background: 'white',
			wireframeBackground: '#222',
			enabled: true,
			wireframes: false,
			showVelocity: false,
			showAngleIndicator: false,
			showCollisions: false,
			pixelRatio: 1
		}
	});

    Render.run( render );
    
    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

	// Color
	var RED = '#FF0000',
		BLUE = '#0000FF',
		YELLOW = '#999900',
		GRAY = '#CCCCCC';
		BLACK = '#000000';

	// Create a particle in the dielectric
	function createParticle( x, y ) 
	{
		// Offset charge positions in the particle depending on the current value of k and the voltage
		offset = Math.min( 15, ( demVar.k * demVar.voltage ) ) * ( demVar.bVoltageNegative ? -1 : 1 );
		
		var plusA = Bodies.rectangle( x + offset , y, 12.5, 1, { render: { fillStyle: RED } } ),
			plusB = Bodies.rectangle( x + offset, y,  1, 12.5, { render: { fillStyle: RED } } ),
			minus = createNegativeCharge( x - offset, y, 12.5 ),
			particle = Bodies.circle( x, y, 20, { render: { fillStyle: BLACK, opacity: .25 } } );

		return Body.create({
			isStatic: true,
			parts: [particle, plusA, plusB, minus],
		});
	}

	// Create a positive charge
	function createPositiveCharge( x, y, length )
	{
		var plusA = Bodies.rectangle( x, y, length, 1, { render: { fillStyle: RED } } ),
			plusB = Bodies.rectangle( x, y,  1, length, { render: { fillStyle: RED } } );

		return Body.create({
			isStatic: true,
			parts: [plusA, plusB],
		});
	}

	// Create a minus charge
	function createNegativeCharge( x, y, length )
	{
		return Bodies.rectangle( x, y, length, 1, 
		{ 
			isStatic: true,
			render: { fillStyle: BLUE },
		} );
	}

	// create dielectric particle array and render in a 3x3 grid
	function createParticleArray()
	{
		// clear particles
		World.remove( engine.world, demVar.particles );
		demVar.particles = [];
		
		for ( var i = 0; i < Math.floor( demVar.distance / 5 ); i++ )
		{
			for ( var j = 0; j < 3; j++ )
			{
				demVar.particles.push( createParticle( 375 - ( 5 * demVar.distance ) + ( 50 * i ), 50 + ( 50 * j ) ) );
			}
		}
		
		World.add( engine.world, demVar.particles );
	}

	// create array of charges held by capacitor plates
	function createChargeArray()
	{
		// clear charges
		World.remove( engine.world, demVar.charges );
		demVar.charges = [];
		
		// Our capacitors can fit twice as many rows as columns, so calculate the desired amount of each based on charge count
		// Equation to calculate is: Charge = rows^2 / 2
		nCharges = Math.floor( ( demVar.voltage * demVar.Area * demVar.k ) / ( demVar.distance ) );
		nRows = Math.ceil( Math.sqrt( 2 * nCharges ) );
		nColumns = Math.ceil( Math.sqrt( 2 * nCharges ) /2 );
		
		// Don't make more than 10 rows at most
		// Columns shouldn't exceed the area
		if ( nRows > 10 || demVar.Area <= nColumns )
		{
			nRows = 10;
			nColumns = Math.min( demVar.Area, Math.ceil( nCharges / 10 ) );
		}

		for ( var i = 1; i <= nRows; i++ )
		{
			for ( var j = 1; j <= nColumns; j++ )
			{
				// Check if we've created enough charges
				if ( nCharges == 0 )
				{
					break;
				}
				
				xOffset = ( 5 * demVar.distance ) + ( ( ( demVar.Area * 10 ) / ( nColumns + 1 ) ) * j );
				yOffset = 25 + ( ( 150 / ( nRows + 1 ) ) * i );
				
				// Charge of each plate changes depending on the current flow of electricity (is the voltage positive or negative?)		
				demVar.charges.push( createNegativeCharge( ( demVar.bVoltageNegative ? 350 - xOffset : 350 + xOffset ), yOffset, 7.5 ) );
				demVar.charges.push( createPositiveCharge( ( demVar.bVoltageNegative ? 350 + xOffset : 350 - xOffset ), yOffset, 7.5 ) );
				
				nCharges--;
			}
		}

		World.add( engine.world, demVar.charges );
	}
	
	// When creating the capacitor the offset is adjusted based on the area of the plates as well as the 
	// distance between the plates specified by the user.
	// 1cm = 10px horizontally
	function createCapacitor()
	{
		World.remove( engine.world, demVar.capacitor );
		demVar.capacitor = [];
		
		// Left capacitor plate
		demVar.capacitor.push( leftPlate = Bodies.rectangle( 350 + ( 5 * ( demVar.distance + demVar.Area ) ), 100, 10 * demVar.Area, 150, 
		{ 
			isStatic: true,
			render: { fillStyle: GRAY },  
		} ) );
		
		// Right capacitor plate
		demVar.capacitor.push( rightPlate = Bodies.rectangle( 350 - ( 5 * ( demVar.distance + demVar.Area ) ), 100, 10 * demVar.Area, 150, 
		{ 
			isStatic: true,
			render: { fillStyle: GRAY }, 
		} ) );
		
		// Dielectric
		demVar.capacitor.push( dielectric = Bodies.rectangle( 350 , 100, 10 * demVar.distance, 150, 
		{
			isStatic: true,
			render: { fillStyle: YELLOW },
		} ) );
		
		World.add( engine.world, demVar.capacitor );
	}

	// We need to create a circuit diagram and matter isn't really the ideal
	// engine for this sort of thing, but really thin, static boxes will probably
	// work fine for now.
	function createEnvironment()
	{
		World.remove( engine.world, demVar.objects );
		demVar.objects= [];
		
		// Left wall 
		demVar.objects.push( Bodies.rectangle( 75, 225, 1, 250, { isStatic: true } ) );
		
		// Right wall 
		demVar.objects.push( Bodies.rectangle( 625, 225, 1, 250, { isStatic: true } ) );
		
		// Top wall
		demVar.objects.push( Bodies.rectangle( 350, 100, 550, 1, { isStatic: true } ) );
		
		// Bottom wall left side
		demVar.objects.push( Bodies.rectangle( 205, 350, 262, 1, { isStatic: true } ) );
		
		// Bottom wall right side
		demVar.objects.push( Bodies.rectangle( 495, 350, 262, 1, { isStatic: true } ) );
		
		// Battery + and - flip depending on whether the voltage is postive or negative
		demVar.objects.push( Bodies.rectangle( 337, 350, 1, ( demVar.bVoltageNegative ? 50 : 75 ), { isStatic: true } ) );
		demVar.objects.push( Bodies.rectangle( 363, 350, 1, ( demVar.bVoltageNegative ? 75 : 50 ), { isStatic: true } ) );
		
		World.add( engine.world, demVar.objects );
	}


	document.getElementById('settings').innerHTML = `
			<div class="input-group">
				<input type="number" class="form-control" placeholder="Dielectric Constant κ" min=0 step=any aria-label="Dielectric Constant κ" aria-describedby="basic-addon2" id="kInput">
				<div class="input-group-append">
					<button class="btn btn-outline-secondary text-white btn-apply" type="submit" id="kConstant">Apply</button>
				</div>
			</div>
			<div class="input-group">
				<input type="number" class="form-control" placeholder="Plate Area" min=0 step=any aria-label="Plate Area" aria-describedby="basic-addon2" id="areaInput">
				<div class="input-group-append">
					<button class="btn btn-outline-secondary text-white btn-apply" type="button" disabled="true">cm<sup>2</sup></button>
					<button class="btn btn-outline-secondary text-white btn-apply" type="button" id="area">Apply</button>
				</div>
			</div>
			<div class="input-group">
				<input type="number" class="form-control" placeholder="Distance Between Plates" min=0 step=any aria-label="Distance Between Plates" aria-describedby="basic-addon2" id="distanceInput">
				<div class="input-group-append">
					<button class="btn btn-outline-secondary text-white btn-apply" type="button" disabled="true">cm</button>
					<button class="btn btn-outline-secondary text-white btn-apply" type="button" id="distance">Apply</button>
				</div>
			</div>
			<div class="input-group">
				<input type="number" class="form-control" placeholder="Voltage" min=0 step=any aria-label="Voltage" aria-describedby="basic-addon2" id="voltageInput">
				<div class="input-group-append">
					<button class="btn btn-outline-secondary text-white btn-apply" type="button" disabled="true">v</button>
					<button class="btn btn-outline-secondary text-white btn-apply" type="button" id="voltage">Apply</button>
				</div>
			</div>
	`;
	
	function updateHTML()
	{
		document.getElementById('problemDescription').innerHTML = `
				<p style="text-align: center"> 
					A parallel-plate capacitor with an area of  
					`+ demVar.Area + `cm<sup>2</sup> has a dielectric rested between itself with a dielectric constant of 
					`+ demVar.k + ` and a distance of 
					`+ demVar.distance + `cm. This demo visualizes how capacitance and charge of a parallel-plate capacitor can change depending on various factors.
				</p> 
				<p>
				   <div>Capacitor Plate: <img src="../images/plate.jpg"></div>
				   <div>Dielectric: <img src="../images/dielectric.jpg"></div>
				</p>
		`;
	
		document.getElementById('equations').innerHTML = `
			<div class="p-3">
				$$C = { kε_0A \\over d }$$
				$$C = { Q\\over V }$$
			</div>
		`;

		document.getElementById('variables').innerHTML = `
			<div class="container card-header bg-lightblue">
				<p class="h3 border-bottom border-light p-3">Variables</p>
			</div>
			<div class="container bg-mdblue">
				<div class="row">
					<div class="col">
						<ul class="equationDesc list-group border-0" id="variablesA">
							<li class="equationDesc list-unstyled border-0">$$V = `+ demVar.voltage +`v$$</li>
							<li class="equationDesc list-unstyled border-0">$$A = `+ demVar.Area +`{ cm^2 }$$</li>
							<li class="equationDesc list-unstyled border-0">$$k = `+ demVar.k +`$$</li>
							<li class="equationDesc list-unstyled border-0">$$Q = `+ demVar.charge + `C$$</li>
						</ul>
					</div>
					<div class="col">
						<ul class="equationDesc list-group border-0" id="variablesB">
							<li class="equationDesc list-unstyled border-0">$$d = `+ demVar.distance +`cm$$</li>
							<li class="equationDesc list-unstyled border-0">$$ε_0 = { 8.854e^{-12} \\space _{ F \\over m } }$$</li>
							<li class="equationDesc list-unstyled border-0">$$C = `+ demVar.capacitance + `F$$</li>
						</ul>
					</div>
				</div>
			<div>
		`;

		if ( window.MathJax )
		{
			MathJax.Hub.Queue( ['Typeset', MathJax.Hub, document.getElementById( 'equations' )[0]] );
		}
	}
	// Variable changed. Update objects and compute output
	function update()
	{	
		// Refresh canvas
		createEnvironment();
		createCapacitor();
		createParticleArray();
		createChargeArray();
		
		// Compute capacitance and charge
		demVar.capacitance = ( demVar.k * demVar.PERMITIVITY_OF_FREE_SPACE * demVar.Area ) / ( demVar.distance * 100 );
		demVar.charge = demVar.capacitance * demVar.voltage;
		
		// Update HTML values
		updateHTML();
	}

	
	// Variables 
	
	document.getElementById( "kConstant" ).onclick = function()
	{   		
		demVar.k = parseFloat( document.getElementById( "kInput" ).value );
		update();
	}

	document.getElementById( "area" ).onclick = function()
	{   		
		demVar.Area = parseFloat( document.getElementById( "areaInput" ).value );
		update();
	}

	document.getElementById( "distance" ).onclick = function()
	{   		
		demVar.distance = parseFloat( document.getElementById( "distanceInput" ).value );
		update();
		}

	document.getElementById( "voltage" ).onclick = function()
	{   		
		demVar.voltage = parseFloat( document.getElementById( "voltageInput" ).value );
		
		// Check if the voltage is negative so we can invert the charge flow
		if ( demVar.voltage < 0 )
		{
			demVar.voltage = -demVar.voltage;
			demVar.bVoltageNegative = true;
		}
		else
		{
			demVar.bVoltageNegative = false;
		}
		
		update();
	}	
	update();
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