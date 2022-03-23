// Component for injecting some A-Frame entities in a scene

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('network', {
  init: function() {
    network = {
      nodes: 0,
      position: {x: 0, y: 0, z: 0},
      radius: 0
    }

    file = 'index.json' 
    scene = this.el
    request = new XMLHttpRequest();
    request.open('GET', file);
    request.responseType = 'text';
    request.send();
    request.onload = function() {
        response =  request.response;
        responseParse = JSON.parse(response);
        network = responseParse
        console.log(network)
        positionFirst = network.position
        alpha = 2 * Math.PI / network.nodes
        incremento = alpha
        // Añadimos tantas cajas como nodos hayamos indicado
        // Calculamos su posición en el círculo
        for (var i = 0; i < network.nodes; i++) {
          let newBox = document.createElement('a-box');
          network.position.x = positionFirst.x + (network.radius / network.nodes) * Math.cos(alpha);
          network.position.z = positionFirst.z  + (network.radius / network.nodes) * Math.sin(alpha);
          newBox.setAttribute('position', network.position);
          newBox.setAttribute('color', 'red');
          scene.appendChild(newBox);
          alpha += incremento
        }
    }

    
  },
  
});
