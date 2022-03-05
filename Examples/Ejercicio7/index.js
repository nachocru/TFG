// Component for injecting some A-Frame entities in a scene

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('figure', {
  init: function() {
      // Initial figure -> box
        // <a-entity position="0 1.25 -5"></a-entity>
        let figure = document.createElement('a-entity');
        figure.setAttribute('position', {x:0, y: 1.25, z: -5});
        figure.setAttribute('geometry', "primitive: box");
        this.el.appendChild(figure);
        var scene = this.el
        figure.addEventListener('click', function() {
          if(scene.hasAttribute('editionGeometry')) {
            scene.removeAttribute('editionGeometry');
          } else {
            scene.setAttribute('editionGeometry', 
              {'xPosition': -3.5, 'yPosition': 4, 'zPosition': -5, 'geometry': ['box', 'sphere', 'cone', 'cylinder'], 'number': 4}
            );
          }
    });
  },
});

AFRAME.registerComponent('editionGeometry', {
  schema: {
    xPosition: {type: 'number', default: 0},
    yPosition: {type: 'number', default: 0},
    zPosition: {type: 'number', default: 0},
    geometry: {type: 'array', default: []},
    number: {type: 'number', default: 0}
  },

  init: function() {
      data = this.data
      // Añadimos tantas geometrías como números hayamos indicado en el padre
      for (var i = 0; i < data.number; i++) {
        let newGeometry = document.createElement('a-entity');
        newGeometry.setAttribute('position', {x: data.xPosition  + (2.5 * i), y: data.yPosition, z: data.zPosition});
        newGeometry.setAttribute('geometry', "primitive: " + data.geometry[i]);
        newGeometry.setAttribute('rotation', {x: 0, y: 0, z: 45});
        newGeometry.setAttribute('id', data.geometry[i]);
        this.el.appendChild(newGeometry);
        let indice = i
        newGeometry.addEventListener('mouseenter', function () {
          newGeometry.setAttribute('scale', {x: 1.2, y: 1.2, z: 1.2});
          newGeometry.setAttribute('animation', 'property: rotation; to: 0 360 45; loop: true; dur: 3000; easing: linear');
        });
        newGeometry.addEventListener('mouseleave', function () {
          newGeometry.setAttribute('scale', {x: 1, y: 1, z: 1})
          newGeometry.removeAttribute('animation');
          newGeometry.setAttribute('rotation', {x: 0, y: 0, z: 0});
          newGeometry.setAttribute('rotation', {x: 0, y: 0, z: 45});
        });
        newGeometry.addEventListener('click', function () {
          document.getElementById("escena").children[0].setAttribute('geometry', "primitive: " + data.geometry[indice]);
          newGeometry.setAttribute('scale', {x: 1, y: 1, z: 1});
        });
      }
  },
  /**
   * Handle component removal.
   */
  remove: function () {
    var data = this.data;
    for (var i = 0; i < data.number; i++) {
      var el = document.querySelector("#" + data.geometry[i]);
      el.parentElement.removeChild(el);
    }
  }
  
});