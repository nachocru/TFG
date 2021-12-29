// Component for injecting some A-Frame entities in a scene

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
  }
  
  AFRAME.registerComponent('basic-scene', {
  
    init: function() {
        // Box
        // <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
        let box = document.createElement('a-box');
        box.setAttribute('color', 'red');
        box.setAttribute('position', {x: 0, y: 0.5, z: -3});
        box.setAttribute('rotation', {x: 0, y: 0, z: 0});
        box.setAttribute('color', "#4CC3D9");
        box.setAttribute('extra-figure', null);
        this.el.appendChild(box); 
  
    }
  });

  AFRAME.registerComponent('extra-figure', {
  
    init: function() {
        // Sphere
        // <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
        let sphere = document.createElement('a-sphere');
        sphere.setAttribute('position', {x:-2, y: 1.25, z: 2});
        sphere.setAttribute('radius', 1.25);
        sphere.setAttribute('color', "#EF2D5E");
        this.el.appendChild(sphere);
  
        // Cylinder
        // <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
        let cylinder = document.createElement('a-cylinder');
        cylinder.setAttribute('position', {x:2, y: 0.75, z: 2});
        cylinder.setAttribute('radius', 0.5);
        cylinder.setAttribute('height', 1.5);
        cylinder.setAttribute('color', "#FFC65D");
        this.el.appendChild(cylinder);
  
    }
  });