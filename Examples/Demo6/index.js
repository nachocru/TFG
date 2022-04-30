// Component for injecting some A-Frame entities in a scene

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('network', {
    init: function() {
        nodeList = [];
        file = 'netgui4.nkp'
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

            file2 = 'captura.json'
            request2 = new XMLHttpRequest();
            request2.open('GET', file2);
            request2.responseType = 'text';
            request2.send();
            request2.onload = function() {
                response = request2.response;
                responseParse = JSON.parse(response);
 
                process = readPackets(responseParse)

                animatePackets(process, nodeList)
            }
        }
    }
});

function setNodes(nodes, nodeList) {
    for (var i = 1; i < nodes.length; i++) {
        nodesInfo = nodes[i].split(');')
        nodesName = nodesInfo[1].split('"')
        if (nodesName[1].startsWith('hub')) {
            // No estamos interesados en los hubs a la hora de represnetar la escena
            null;
        } else {
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
    // Ponemos los hubs siempre como destino
    connectionsLinksStandard = []
    for (var k = 0; k < connectionsLinks.length; k++) {
        if (connectionsLinks[k].from.startsWith('hub')) {
            auxiliar = connectionsLinks[k].from
            connectionLink = {
                from: connectionsLinks[k].to,
                to: auxiliar
            }
            connectionsLinksStandard.push(connectionLink)
        } else {
            connectionsLinksStandard.push(connectionsLinks[k])
        }
    }

    return removeNotValidConnections(connectionsLinksStandard, nodeList)
}

function removeNotValidConnections(connectionsLinksStandard, nodeList){
    // Borramos todas las conexiones con hubs
    for (var k = 0; k < connectionsLinksStandard.length; k++) {
        if (connectionsLinksStandard[k].to.startsWith('hub')) {
            connections = connectionsLinksStandard.filter(o => o.to === connectionsLinksStandard[k].to)

            provisionalValidLinks = []
            for (var t = 0; t < connections.length; t++) {
                if (connections[t].from.startsWith('pc')) {
                    null
                } else {
                    provisionalValidLinks.push(connections[t].from)

                }
            }

            for (var c = 0; c < provisionalValidLinks.length; c++) {
                connectionLink = {
                    from: connectionsLinksStandard[k].from,
                    to: provisionalValidLinks[c],
                }
                connectionsLinksStandard.push(connectionLink)
            }
        }
    }

    return writeConnections(connectionsLinksStandard, nodeList)
}

function writeConnections(connectionsLinksStandard, nodeList) {
    finalConnectionsLinks = []
    for (var l = 0; l < connectionsLinksStandard.length; l++) {
        if (connectionsLinksStandard[l].to.startsWith('hub')) {
            null;
        } else if (connectionsLinksStandard[l].from == connectionsLinksStandard[l].to) {
             null;
        } else {
            connectionLink = {
                from: connectionsLinksStandard[l].from,
                to: connectionsLinksStandard[l].to,
            }
            finalConnectionsLinks.push(connectionLink)
        }
    }

    for (var j = 0; j < finalConnectionsLinks.length; j++) {
        nodeFrom = nodeList.find(o => o.name === finalConnectionsLinks[j].from)
        nodeFromPosition = nodeFrom.position.split('"')

        nodeTo = nodeList.find(o => o.name === finalConnectionsLinks[j].to)
        nodeToPosition = nodeTo.position.split('"')

        let newLine = document.createElement('a-entity');
        newLine.setAttribute('line', 'start: ' + nodeFromPosition[0].split(',')[0] / 30 + ' 1 ' + nodeFromPosition[0].split(',')[1] / 30 + '; end: ' + nodeToPosition[0].split(',')[0] / 30 + ' 1 ' + nodeToPosition[0].split(',')[1] / 30 + '; color: red');
        scene.appendChild(newLine);
    }

    return finalConnectionsLinks
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

function animatePackets(process, nodeList){
    for (var j = 0; j < process.length; j++) {
        from = nodeList.find(o => o.machineName === process[j].src)
        if (process[j].dst != 'ff:ff:ff:ff:ff:ff') {
            packetSource = finalConnectionsLinks.find(o => o.from === from.name)
            packetDst = ''
            if (!packetSource) {
                packetSource = finalConnectionsLinks.find(o => o.to === from.name)
                packetDst = nodeList.find(o => o.name === packetSource.from)
            } else {
                packetDst = nodeList.find(o => o.name === packetSource.to)
            }
            escena = document.querySelector('#escena');
                // <a-box position="-1 1.6 -5" animation="property: position; to: 1 8 -10; dur: 2000; easing: linear; loop: true" color="tomato"></a-box>
            packetDelay = 5000 * j

            let newPacketAnimation = document.createElement('a-cylinder');
            angle = calculateAngle(from.position.split(',')[0] / 30, from.position.split(',')[1] / 30, packetDst.position.split(',')[0] / 30, packetDst.position.split(',')[1] / 30)
            newPacketAnimation.setAttribute('position', { x: from.position.split(',')[0] / 30, y: 1, z: from.position.split(',')[1] / 30 });
            newPacketAnimation.setAttribute('color', 'green');
            newPacketAnimation.setAttribute('radius', 0.35);
            newPacketAnimation.setAttribute('height', 0.5);
            newPacketAnimation.setAttribute('rotation', '90 0 ' + angle);
            newPacketAnimation.setAttribute('animation', {
                property: 'position',
                to: packetDst.position.split(',')[0] / 30 + ' 1 ' + packetDst.position.split(',')[1] / 30,
                dur: 5000,
                delay: packetDelay,
                easing: 'linear'
            });
            escena.appendChild(newPacketAnimation);

        } else {
            packetSource = nodeList.find(o => o.machineName === process[j].src)
            validConnections = []
            availableSourceNodes = finalConnectionsLinks.filter(o => o.from === packetSource.name)
            if (availableSourceNodes.length) {
                for (var d = 0; d < availableSourceNodes.length; d++) {
                    validConnections.push(availableSourceNodes[d].from)
                }
            }
            availableDstNodes = finalConnectionsLinks.filter(o => o.to === packetSource.name)
            if (availableDstNodes.length) {
                for (var d = 0; d < availableDstNodes.length; d++) {
                    validConnections.push(availableDstNodes[d].from)
                }
            }
            if (validConnections.length) {
                for (var s = 0; s < validConnections.length; s++) {
                    to = nodeList.find(o => o.name === validConnections[s])
                    escena = document.querySelector('#escena');

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