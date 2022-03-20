// Component for injecting some A-Frame entities in a scene

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('network', {
  schema: {
    nodes: {type: 'number', default: 0},
    position: {type: 'vec3'},
  },

  init: function() {
    // Box
    data = this.data
    // Añadimos tantas cajas como nodos hayamos indicado
    for (var i = 0; i < data.nodes; i++) {
      let newBox = document.createElement('a-box');
      newBox.setAttribute('position', data.position);
      newBox.setAttribute('color', 'red');
      this.el.appendChild(newBox);
      data.position.x = data.position.x + 2
    }
  },
  
});