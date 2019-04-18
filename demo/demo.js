(function(){

    var demoExamples = []

    function addDemo(name, id, init){
        demoExamples.push({
            name: name,
            id: id,
            init: init
        });
    };

    addDemo('Circular Motion', 'circularMotion', Example.circularMotion);
    addDemo('Falling Objects', 'projectile', Example.projectile);
    addDemo('2-D Motion', 'motion', Example.motion);
    addDemo('Dielectrics', 'dielectric', Example.dielectric);
    addDemo('Universal Gravitation', 'universalGravitation', Example.universalGravitation);
    // Add demos here ^

    var demo = MatterTools.Demo.create({
        toolbar: {
            reset: false,
            source: false,
            inspector: false,
            tools: false,
            fullscreen: false,
            exampleSelect: false
        },
        tools: {
            inspector: false,
            gui: false
        },
        inline: false,
        preventZoom: true,
        resetOnOrientation: true,
        routing: true,
        startExample: 'dielectric',
        examples: demoExamples
    });

    function removeVar(){
        document.getElementById("variables").innerHTML = "";
    }

    document.getElementById("circularMotion").onclick = function() {
        MatterTools.Demo.setExampleById(demo, 'circularMotion')
        removeVar();
    };
    
    document.getElementById("universalGravitation").onclick = function() 
    {
        MatterTools.Demo.setExampleById(demo, 'universalGravitation')
        removeVar();
    };
    
    document.getElementById("dielectrics").onclick = function() {
        MatterTools.Demo.setExampleById(demo, 'dielectric')
    };
    
    MatterTools.Demo.start(demo);
    
})();
