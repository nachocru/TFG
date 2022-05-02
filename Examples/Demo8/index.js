// Component for injecting some A-Frame entities in a scene

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('network', {
    schema: {
        filename: {type: 'string', default: ''},
    },

    init: function() {
        nodeList = [];
        file = this.data.filename
        request = new XMLHttpRequest();
        request.open('GET', file);
        request.responseType = 'text';
        request.send();
        scene = this.el
        request.onload = function() {
            response = request.response;
            response.split('<nodes>')
            nodes = response.split('position')

            // Establecemos los diferentes nodos de la escena
            setNodes(nodes, nodeList)
            
            // Asociamos a cada nodo su nombre de máquina
            setMachineNames(nodeList)

            connections = nodesInfo[1].split('link')
            connectionsLinks = []

            finalConnectionsLinks = setConnectionsLinks(connections, connectionsLinks, nodeList)

            console.log(finalConnectionsLinks)

            file2 = 'captura.json'
            request2 = new XMLHttpRequest();
            request2.open('GET', file2);
            request2.responseType = 'text';
            request2.send();
            request2.onload = function() {
                response = request2.response;
                responseParse = JSON.parse(response);
 
                process = readPackets(responseParse)

                let startButton = document.createElement('a-box');
                let activeAnimation = false;
                startButton.setAttribute('position', '0 1 15');
                startButton.setAttribute('color', 'yellow');
                startButton.setAttribute('id', 'startButton');
                scene.appendChild(startButton);
                startButton.addEventListener('click', function () {
                    if(!activeAnimation){
                        activeAnimation = true;
                        timeToFinish = process.length * 5000 
                        setTimeout(function(){
                            activeAnimation = false;
                        }, timeToFinish)
                        animatePackets(process, finalConnectionsLinks)
                    }
                });
  
            }
        }
    }
});

function setNodes(nodes, nodeList) {
    for (var i = 1; i < nodes.length; i++) {
        nodesInfo = nodes[i].split(');')
        nodesName = nodesInfo[1].split('"')
        newNode = {
            position: nodesInfo[0].slice(1),
            name: nodesName[1],
            machineName: ''
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

        scene = document.querySelector('#escena');
        scene.appendChild(newText);
        nodeList.push(newNode)
        
    }

    return nodeList
}

function setMachineNames(nodeList) {
    nodeList.find(o => o.name === 'pc1').machineName = '4e:da:80:75:67:a6'
    nodeList.find(o => o.name === 'r1').machineName = '86:5b:92:e6:f6:af'

    return nodeList
}

function setConnectionsLinks(connections, connectionsLinks, nodeList){
    for (var i = 1; i < connections.length; i++) {
        if (i % 2 == 1) {
            connectionLink = {
                from: connections[i].split('"')[1],
                to: connections[i].split('"')[3],
            }
            connectionsLinks.push(connectionLink)
        }

    }
    
    return setStandardConnectionsLinks(connectionsLinks, nodeList)
}

function setStandardConnectionsLinks(connectionsLinks, nodeList){
    connectionsLinksStandard = []
    for (var k = 0; k < nodeList.length; k++) {
        actualNode = []
        actualNodeConnectionsFrom = connectionsLinks.filter(o => o.from === nodeList[k].name)
        for (var j = 0; j <actualNodeConnectionsFrom.length; j++) {
            actualNode.push(actualNodeConnectionsFrom[j].to)
        }

        actualNodeConnectionsTo = connectionsLinks.filter(o => o.to === nodeList[k].name)
        for (var j = 0; j <actualNodeConnectionsTo.length; j++) {
            actualNode.push(actualNodeConnectionsTo[j].from)
        }

        connectionLink = {
            from: nodeList[k].name,
            to: actualNode,
            position: nodeList[k].position,
            machineName: nodeList[k].machineName
        }
        connectionsLinksStandard.push(connectionLink)
    }

    writeConnections(connectionsLinksStandard, nodeList)

    return connectionsLinksStandard
}

function writeConnections(connectionsLinksStandard, nodeList) {
    for (var k = 0; k < connectionsLinksStandard.length; k++) {
        nodeFromPosition = connectionsLinksStandard[k].position.split('"')
        for (var j = 0; j < connectionsLinksStandard[k].to.length; j++) {
            nodeTo = connectionsLinksStandard.find(o => o.from === connectionsLinksStandard[k].to[j])
            nodeToPosition = nodeTo.position.split('"')

            let newLine = document.createElement('a-entity');
            newLine.setAttribute('line', 'start: ' + nodeFromPosition[0].split(',')[0] / 30 + ' 1 ' + nodeFromPosition[0].split(',')[1] / 30 + '; end: ' + nodeToPosition[0].split(',')[0] / 30 + ' 1 ' + nodeToPosition[0].split(',')[1] / 30 + '; color: red');
            scene.appendChild(newLine);
        }
    }

    return connectionsLinksStandard
}

function  readPackets(responseParse) {
    process = []
    for (var j = 0; j < responseParse.length; j++) {
        newAnimation = {
            src: responseParse[j]._source.layers.eth['eth.src'],
            dst: responseParse[j]._source.layers.eth['eth.dst'],
            time: responseParse[j]._source.layers.frame['frame.time_relative']
        }
        process.push(newAnimation)
    }
    return process
}

function animatePackets(process, connectionsLinks){

    for (var j = 0; j < process.length; j++) {
        from = connectionsLinks.find(o => o.machineName === process[j].src)
        if (process[j].dst != 'ff:ff:ff:ff:ff:ff') {
            escena = document.querySelector('#escena');
            to = connectionsLinks.find(o => o.machineName === process[j].dst)
            if(from.to.includes(to.from)){
                packetDelay = 5000 * j

                let newPacketAnimation = document.createElement('a-cylinder');

                angle = calculateAngle(from.position.split(',')[0] / 30, from.position.split(',')[1] / 30, to.position.split(',')[0] / 30, to.position.split(',')[1] / 30)
                newPacketAnimation.setAttribute('position', { x: from.position.split(',')[0] / 30, y: 1, z: from.position.split(',')[1] / 30 });
                newPacketAnimation.setAttribute('color', 'green');
                newPacketAnimation.setAttribute('radius', 0.35);
                newPacketAnimation.setAttribute('height', 0.5);
                newPacketAnimation.setAttribute('rotation', '90 0 ' + angle);
                newPacketAnimation.setAttribute('animation', {
                    property: 'position',
                    to: to.position.split(',')[0] / 30 + ' 1 ' + to.position.split(',')[1] / 30,
                    dur: 5000,
                    delay: packetDelay,
                    easing: 'linear'
                });
                escena.appendChild(newPacketAnimation);
            }else{
                for (var f = 0; f < to.to.length; f++) {
                    if(from.to.includes(to.to[f])){
                        intermediateNode = connectionsLinks.find(o => o.from === to.to[f])
                        packetDelay = 5000 * j

                        let newPacketAnimation = document.createElement('a-cylinder');

                        angle = calculateAngle(from.position.split(',')[0] / 30, from.position.split(',')[1] / 30, intermediateNode.position.split(',')[0] / 30, intermediateNode.position.split(',')[1] / 30)
                        newPacketAnimation.setAttribute('position', { x: from.position.split(',')[0] / 30, y: 1, z: from.position.split(',')[1] / 30 });
                        newPacketAnimation.setAttribute('color', 'green');
                        newPacketAnimation.setAttribute('radius', 0.35);
                        newPacketAnimation.setAttribute('height', 0.5);
                        newPacketAnimation.setAttribute('rotation', '90 0 ' + angle);
                        newPacketAnimation.setAttribute('animation', {
                            property: 'position',
                            to: intermediateNode.position.split(',')[0] / 30 + ' 1 ' + intermediateNode.position.split(',')[1] / 30,
                            dur: 2500,
                            delay: packetDelay,
                            easing: 'linear'
                        });
                        escena.appendChild(newPacketAnimation);

                        packetDelay = 5000 * j + 2500
    
                        newPacketAnimation = document.createElement('a-cylinder');
    
                        angle = calculateAngle(intermediateNode.position.split(',')[0] / 30, intermediateNode.position.split(',')[1] / 30, to.position.split(',')[0] / 30, to.position.split(',')[1] / 30)
                        newPacketAnimation.setAttribute('position', { x: intermediateNode.position.split(',')[0] / 30, y: 1, z: intermediateNode.position.split(',')[1] / 30 });
                        newPacketAnimation.setAttribute('color', 'green');
                        newPacketAnimation.setAttribute('radius', 0.35);
                        newPacketAnimation.setAttribute('height', 0.5);
                        newPacketAnimation.setAttribute('rotation', '90 0 ' + angle);
                        newPacketAnimation.setAttribute('animation', {
                            property: 'position',
                            to: to.position.split(',')[0] / 30 + ' 1 ' + to.position.split(',')[1] / 30,
                            dur: 2500,
                            delay: packetDelay,
                            easing: 'linear'
                        });
                        escena.appendChild(newPacketAnimation);
                    }
                }
            }


        } else {
            for (var s = 0; s < from.to.length; s++) {
                escena = document.querySelector('#escena');
                to = connectionsLinks.find(o => o.from === from.to[s])
                if(to.from.startsWith('hub')){
                    packetDelay = 5000 * j

                    let newPacketAnimation = document.createElement('a-cylinder');

                    angle = calculateAngle(from.position.split(',')[0] / 30, from.position.split(',')[1] / 30, to.position.split(',')[0] / 30, to.position.split(',')[1] / 30)
                    newPacketAnimation.setAttribute('position', { x: from.position.split(',')[0] / 30, y: 1, z: from.position.split(',')[1] / 30 });
                    newPacketAnimation.setAttribute('color', 'green');
                    newPacketAnimation.setAttribute('radius', 0.35);
                    newPacketAnimation.setAttribute('height', 0.5);
                    newPacketAnimation.setAttribute('rotation', '90 0 ' + angle);
                    newPacketAnimation.setAttribute('animation', {
                        property: 'position',
                        to: to.position.split(',')[0] / 30 + ' 1 ' + to.position.split(',')[1] / 30,
                        dur: 2500,
                        delay: packetDelay,
                        easing: 'linear'
                    });
                    escena.appendChild(newPacketAnimation);

                    for (var d = 0; d < to.to.length; d++) {
                        if(to.to[d] != from.from){
                            secondFrom = to
                            secondTo = connectionsLinks.find(o => o.from === to.to[d])
                            packetDelay = 5000 * j + 2500
    
                            let newPacketAnimation = document.createElement('a-cylinder');
    
                            angle = calculateAngle(secondFrom.position.split(',')[0] / 30, secondFrom.position.split(',')[1] / 30, secondTo.position.split(',')[0] / 30, secondTo.position.split(',')[1] / 30)
                            newPacketAnimation.setAttribute('position', { x: secondFrom.position.split(',')[0] / 30, y: 1, z: secondFrom.position.split(',')[1] / 30 });
                            newPacketAnimation.setAttribute('color', 'green');
                            newPacketAnimation.setAttribute('radius', 0.35);
                            newPacketAnimation.setAttribute('height', 0.5);
                            newPacketAnimation.setAttribute('rotation', '90 0 ' + angle);
                            newPacketAnimation.setAttribute('animation', {
                                property: 'position',
                                to: secondTo.position.split(',')[0] / 30 + ' 1 ' + secondTo.position.split(',')[1] / 30,
                                dur: 2500,
                                delay: packetDelay,
                                easing: 'linear'
                            });
                            escena.appendChild(newPacketAnimation);
                        }
                    }

                }else{
                    packetDelay = 5000 * j

                    let newPacketAnimation = document.createElement('a-cylinder');

                    angle = calculateAngle(from.position.split(',')[0] / 30, from.position.split(',')[1] / 30, to.position.split(',')[0] / 30, to.position.split(',')[1] / 30)
                    newPacketAnimation.setAttribute('position', { x: from.position.split(',')[0] / 30, y: 1, z: from.position.split(',')[1] / 30 });
                    newPacketAnimation.setAttribute('color', 'green');
                    newPacketAnimation.setAttribute('radius', 0.35);
                    newPacketAnimation.setAttribute('height', 0.5);
                    newPacketAnimation.setAttribute('rotation', '90 0 ' + angle);
                    newPacketAnimation.setAttribute('animation', {
                        property: 'position',
                        to: to.position.split(',')[0] / 30 + ' 1 ' + to.position.split(',')[1] / 30,
                        dur: 5000,
                        delay: packetDelay,
                        easing: 'linear'
                    });
                    escena.appendChild(newPacketAnimation);
                }
                

            }
        }
    }
}

function calculateAngle(x1, z1, x2, z2) {
    cateto1 = Math.abs(parseFloat(x1) - parseFloat(x2))
    cateto2 = Math.abs(parseFloat(z1) - parseFloat(z2))
    hipotenusa = Math.sqrt(cateto1 * cateto1 + cateto2 * cateto2);
    A = Math.asin(cateto1 / hipotenusa);

    A_s = A * 180 / Math.PI;

    if (parseFloat(x1) > parseFloat(x2)) {
        if (parseFloat(z1) > parseFloat(z2)) {
            return (A_s * (-1))
        } else {
            return A_s
        }
    } else {
        if (parseFloat(z1) > parseFloat(z2)) {
            return A_s
        } else {
            return (A_s * (-1))
        }

    }


} 