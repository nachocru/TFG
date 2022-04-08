// Component for injecting some A-Frame entities in a scene

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('network', {
    init: function() {
        nodeList = [];
        file = 'netgui.nkp'
        request = new XMLHttpRequest();
        request.open('GET', file);
        request.responseType = 'text';
        request.send();
        scene = this.el
        request.onload = function() {
            response = request.response;
            response.split('<nodes>')
            nodes = response.split('position')
            for (var i = 1; i < nodes.length; i++) {
                nodesInfo = nodes[i].split(');')
                nodesName = nodesInfo[1].split('"')
                newNode = {
                    position: nodesInfo[0].slice(1),
                    name: nodesName[1]
                }
                let newBox = document.createElement('a-box');
                newBox.setAttribute('position', { x: newNode.position.split(',')[0] / 30, y: 1, z: newNode.position.split(',')[1] / 30 });
                newBox.setAttribute('color', 'red');
                newBox.setAttribute('id', newNode.name);
                scene.appendChild(newBox);
                let newText = document.createElement('a-text');
                newText.setAttribute('position', { x: (newNode.position.split(',')[0] / 30) - 0.5, y: 2, z: newNode.position.split(',')[1] / 30 });
                newText.setAttribute('value', newNode.name);
                newText.setAttribute('scale', '2 2 2');
                scene.appendChild(newText);

                nodeList.push(newNode)
                if (i + 1 == nodes.length) {
                    connections = nodesInfo[1].split('link')
                    for (var i = 1; i < connections.length; i++) {
                        if (i % 2 == 1) {
                            from = connections[i].split('"')[1]
                            to = connections[i].split('"')[3]
                            nodeFrom = nodeList.find(o => o.name === from)
                            nodeFromPosition = nodeFrom.position.split('"')

                            nodeTo = nodeList.find(o => o.name === to)
                            nodeToPosition = nodeTo.position.split('"')

                            let newLine = document.createElement('a-entity');
                            newLine.setAttribute('line', 'start: ' + nodeFromPosition[0].split(',')[0] / 30 + ' 1 ' + nodeFromPosition[0].split(',')[1] / 30 + '; end: ' + nodeToPosition[0].split(',')[0] / 30 + ' 1 ' + nodeToPosition[0].split(',')[1] / 30 + '; color: red');
                            scene.appendChild(newLine);
                        }

                    }
                }
            }
            console.log(nodeList)
        }
    },
});