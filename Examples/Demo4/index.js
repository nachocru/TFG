// Component for injecting some A-Frame entities in a scene

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('network', {
    init: function() {
        network = {
            nodes: 0,
            position: { x: 0, y: 0, z: 0 },
            radius: 0
        }

        file = 'index.json'
        scene = this.el
        request = new XMLHttpRequest();
        request.open('GET', file);
        request.responseType = 'text';
        request.send();
        request.onload = function() {
            response = request.response;
            responseParse = JSON.parse(response);
            console.log(responseParse)
            machines = []
            for (i in responseParse) {
                if (machines.includes(responseParse[i]._source.layers.eth['eth.src'])) {
                    null
                } else {
                    machines.push(responseParse[i]._source.layers.eth['eth.src'])
                }
            }
            console.log(machines)
            positionFirst = { "x": 1, "y": 1, "z": -2 },
                alpha = 2 * Math.PI / machines.length
            incremento = alpha
                // Añadimos tantas cajas como nodos hayamos indicado
                // Calculamos su posición en el círculo
            for (var i = 0; i < machines.length; i++) {
                let newBox = document.createElement('a-box');
                positionFirst.x = positionFirst.x + (20 / machines.length) * Math.cos(alpha);
                positionFirst.z = positionFirst.z + (20 / machines.length) * Math.sin(alpha);
                newBox.setAttribute('position', positionFirst);
                newBox.setAttribute('color', 'red');
                scene.appendChild(newBox);
                alpha += incremento
            }
        }


    },

});