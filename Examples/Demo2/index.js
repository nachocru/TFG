// Component for injecting some A-Frame entities in a scene

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('network', {
  schema: {
    nodes: {type: 'number', default: 0},
    position: {type: 'vec3'},
    radius: {type: 'number', default: 0},
  },

  init: function() {
    // Box
    data = this.data
    positionFirst = data.position
    alpha = 2 * Math.PI / data.nodes
    incremento = alpha
    // Añadimos tantas cajas como nodos hayamos indicado
    // Calculamos su posición en el círculo
    for (var i = 0; i < data.nodes; i++) {
      let newBox = document.createElement('a-box');
      data.position.x = positionFirst.x + (data.radius / data.nodes) * Math.cos(alpha);
      data.position.z = positionFirst.z  + (data.radius / data.nodes) * Math.sin(alpha);
      newBox.setAttribute('position', data.position);
      newBox.setAttribute('color', 'red');
      this.el.appendChild(newBox);
      alpha += incremento
    }
  },
  
});
