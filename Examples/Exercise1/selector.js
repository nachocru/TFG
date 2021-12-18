AFRAME.registerComponent('mainfigure', {
    schema: {
      width: {type: 'number', default: 1},
      height: {type: 'number', default: 1},
      depth: {type: 'number', default: 1},
      color: {type: 'color', default: '#AAA'}
    },
  
    init: function () {
      var data = this.data;
      var el = this.el;
      //createelement()
      // .appendchild
      // Investigar superhands
      //
      el.setAttribute('geometry', {primitive: 'box'});
      el.setAttribute('material', {color: data.color});
      el.setAttribute('rotation', {x: 0, y: 45, z: 45});
      el.setAttribute('scale', {x: 2, y: 2, z: 2});
    },
  }),
  
  AFRAME.registerComponent('colorselector', {
    schema: {
    },
    
    init: function () {
      var data = this.data;
      var el = this.el;
  
      var yellow = document.querySelector('#yellow');
      var red = document.querySelector('#red');
      var blue = document.querySelector('#blue');
      var green = document.querySelector('#green');
      var figure = document.querySelector('#mainFigure')
      el.appendChild(yellow);
      el.appendChild(red);
      el.appendChild(green);
      el.appendChild(blue);
      el.setAttribute('rotation', el.rotation);
    
      yellow.addEventListener('click', function () {
        changeColor(figure, 'yellow')
      });
  
      red.addEventListener('click', function () {
        changeColor(figure, 'red')
      });
  
      green.addEventListener('click', function () {
        changeColor(figure, 'green')
      });
  
      blue.addEventListener('click', function () {
        changeColor(figure, 'blue')
      });
    },
  
  });
  
  AFRAME.registerComponent('figureselector', {
    schema: {
    },
    init: function () {
      var data = this.data;
      var el = this.el;
  
      var cube = document.querySelector('#cube');  // 
      var sphere = document.querySelector('#sphere');  // 
      var cone = document.querySelector('#cone');  //
      var figure = document.querySelector('#mainFigure')
      el.appendChild(cube);
      el.appendChild(sphere);
      el.appendChild(cone);
      el.setAttribute('rotation', el.rotation);
    
      cube.addEventListener('click', function () {
        changeFigure(figure, 'box')
      });
  
      sphere.addEventListener('click', function () {
        changeFigure(figure, 'sphere')
      });
  
      cone.addEventListener('click', function () {
        changeFigure(figure, 'cone')
      });
    },
  
  });
  
  function changeColor(figure, color) {
    figure.setAttribute('material', {color: color});
  }
  
  function changeFigure(figure, figureType) {
    figure.setAttribute('geometry', {primitive: figureType});
    if(figureType == 'cone') {
      figure.setAttribute('geometry', {radiusBottom: 0.5, radiusTop: 0});
    }
  }
  
  
    // Si añadimos los elementos de la siguiente manera:
    // Cómo podemos detectar los clicks?
    // var node = document.createElement("a-entity");  
    // addEntity(node, el, 'red', 0);
  
    // var node2 = document.createElement("a-entity");  
    // addEntity(node2, el, 'blue', 1.5);
  
    // var node3 = document.createElement("a-entity");  
    // addEntity(node3, el, 'yellow', 3);
  
    // var node4 = document.createElement("a-entity");  
    // addEntity(node4, el, 'green', 4.5);
  
    // function addEntity(entity, element, color, margin) {
    //   entity.setAttribute('rotation', element.rotation);   
    //   entity.setAttribute('visible', true);   
    //   entity.setAttribute('position', {x: margin, y: 0, z: 0});  
    //   entity.setAttribute('id', color);                    // Append the text to <li>
    //   element.appendChild(entity);
    // }
  
  