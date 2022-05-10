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

            filePackets = 'captura.json'
            requestPackets = new XMLHttpRequest();
            requestPackets.open('GET', filePackets);
            requestPackets.responseType = 'text';
            requestPackets.send();
            requestPackets.onload = function() {
                response = requestPackets.response;
                responseParse = JSON.parse(response);
 
                packets = readPackets(responseParse)

                let startButton = document.createElement('a-box');

                startButton.setAttribute('position', '0 1 15');
                startButton.setAttribute('color', 'yellow');
                startButton.setAttribute('id', 'startButton');
                scene.appendChild(startButton);

                animatePackets(packets, finalConnectionsLinks)
            }
        }
    }
});



AFRAME.registerComponent('packet', {
    schema: {
        xPosition: {type: 'number', default: 0},
        yPosition: {type: 'number', default: 1},
        zPosition: {type: 'number', default: 0},
        angle: {type: 'number', default: 0},
        toXPosition: {type: 'string', default: ''},
        toYPosition: {type: 'string', default:  ' 1 '},
        toZPosition: {type: 'string', default: ''},
        duration: {type: 'number', default: 0},
        packetDelay: {type: 'number', default: 0},
        id: {type: 'number', default: 0},
        class:{type: 'string'},
        start:{type: 'number', default: 0},
        ip:{default: null},
        eth:{default: null},
        arp:{default: null},
        dataInfo:{default: null},
        tcp:{default: null}
    },
    init: function () {
      let packet = this.el
      let packetParams = this.data

        packet.setAttribute('geometry', {primitive: 'cylinder', 'radius': 0.35, 'height': 0.5 });
        packet.setAttribute('material', 'color', 'green');
        packet.setAttribute('rotation', '90 0 ' + packetParams.angle);
        packet.setAttribute('position', { x: packetParams.xPosition, y: packetParams.yPosition, z: packetParams.zPosition });
        packet.setAttribute('class', packetParams.class);
        packet.setAttribute('id', packetParams.id);

        packet.addEventListener('click', function () {
            console.log('IP: ');
            console.log(packetParams.ip);
            console.log('ETH: ');
            console.log(packetParams.eth);
            console.log('ARP: ');
            console.log(packetParams.arp);
            console.log('DATA: ');
            console.log(packetParams.dataInfo);
            console.log('TCP: ');
            console.log(packetParams.tcp);
        });

        let i = 0;

        function startAnimation() {
            if (animationStatus == 'move-pause') {
                if (i == Math.ceil(packetParams.start/1000)) {
                  var packet_move = document.getElementById(packetParams.id);
                  packet_move.setAttribute('animation', {
                    property: 'position',
                    to: packetParams.toXPosition + packetParams.toYPosition + packetParams.toZPosition,
                    dur: packetParams.duration,
                    easing: 'linear',
                    pauseEvents:'move-pause', 
                    resumeEvents:'move-resume'
                  });
                }
                i++;
            }
        }

        var startButton = document.querySelector('#startButton');
        var packets = document.getElementsByClassName('packetClass');

        var animationStatus = 'animation-starts'
        startButton.addEventListener('click', function () {
          for (var a=0; a< packets.length; a++) {
            packets[a].emit(animationStatus,null,false)
          }

          switch(animationStatus) {
            case 'animation-starts':
                setInterval(startAnimation, 1000);
                animationStatus = 'move-pause'
                break
            case 'move-resume':
                animationStatus = 'move-pause'
                break
            case 'move-pause':
                animationStatus = 'move-resume'
                break
          }
        });
    }
});




//             this.el.setAttribute('packetInfo', {
//                 'xPosition': this.data.xPosition, 
//                 'zPosition':  this.data.zPosition,
//                 'toXPosition': this.data.toXPosition,
//                 'toZPosition': this.data.toZPosition,
//                 'angle': this.data.angle,
//                 'duration': this.data.duration,
//                 'packetDelay': this.data.packetDelay,
//                 'id': this.data.id,
//                 'ip': this.data.ip,
//                 'eth': this.data.eth,
//                 'arp':  this.data.arp,
//                 'data':  this.data.data,
//                 'tcp':  this.data.tcp
//             });

AFRAME.registerComponent('packetInfo', {
    schema: {
      xPosition: {type: 'number', default: 0},
      yPosition: {type: 'number', default: 10},
      zPosition: {type: 'number', default: 0},
      angle: {type: 'number', default: 0},
      toXPosition: {type: 'string', default: ''},
      toYPosition: {type: 'string', default:  ' 1 '},
      toZPosition: {type: 'string', default: ''},
      duration: {type: 'number', default: 0},
      packetDelay: {type: 'number', default: 0},
      id: {type: 'number', default: 0},
      ip: {default: null},
      eth: {default: null},
      arp: {default: null},
      data: {default: null},
      tcp: {default: null}
    },
  
    init: function() {
        let newText = document.createElement('a-entity');
        console.log(this.data)

        // Normal -> -90, 0, 0
        // Laterales -> 0, 90, -90
        // Oblicuos -> -90 + this.data.angle, 90, -90
        // let newPacketAnimation = document.createElement('a-cylinder');
        // newText.setAttribute('position', { x: -1 + Math.round(Math.abs(this.data.angle)/90), y: 0 + Math.sign(this.data.angle) * Math.round(Math.abs(this.data.angle)/90), z: -2 });
        // newText.setAttribute('rotation', { x: -90 + this.data.angle, y: 90, z: - 90 });
        // newText.setAttribute('color', 'yellow');
        // newText.setAttribute('id', this.data.id);
        // newText.setAttribute('value',  this.data.eth['eth.dst'])
        newText.setAttribute('geometry', {primitive:'plane',height: 1, width: 3});
        newText.setAttribute('text', {width:8, color:'red', value: this.data.eth['eth.dst'], align:'center'});
        newText.setAttribute('material', 'color', 'yellow');
        newText.setAttribute('position', { x: -1 + Math.round(Math.abs(this.data.angle)/90), y: 0 + Math.sign(this.data.angle) * Math.round(Math.abs(this.data.angle)/90), z: -2 });
        newText.setAttribute('rotation', { x: -90 + this.data.angle, y: 90, z: - 90 });
        this.el.appendChild(newText);
    },
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
    packets = []
    for (var j = 0; j < responseParse.length; j++) {
        newAnimation = {
            src: responseParse[j]._source.layers.eth['eth.src'],
            dst: responseParse[j]._source.layers.eth['eth.dst'],
            time: responseParse[j]._source.layers.frame['frame.time_relative'],
            id: j,
        }
        for (var r = 0; r < Object.keys(responseParse[j]._source.layers).length; r++) {
            switch (Object.keys(responseParse[j]._source.layers)[r]) {
                case 'frame':
                  // No se añade
                  break;
                case 'tcp':
                    newAnimation.tcp = responseParse[j]._source.layers.tcp;
                    break;
                case 'data':
                    newAnimation.data = responseParse[j]._source.layers.data;
                    break;
                case 'arp':
                    newAnimation.arp =  responseParse[j]._source.layers.arp;
                    break;
                case 'ip':
                    newAnimation.ip = responseParse[j]._source.layers.ip;
                    break;
                case 'eth':
                    newAnimation.eth = responseParse[j]._source.layers.eth;
                    break;
                default:
                  console.log('Nuevo valor ' + Object.keys(responseParse[j]._source.layers)[r])
                  break;
              }
        }
        packets.push(newAnimation)
    }
    return packets
}

function animatePackets(packets, connectionsLinks){
    finalPackets = []
    for (var j = 0; j < packets.length; j++) {
        from = connectionsLinks.find(o => o.machineName === packets[j].src)

        if (packets[j].dst != 'ff:ff:ff:ff:ff:ff') {
            escena = document.querySelector('#escena');
            to = connectionsLinks.find(o => o.machineName === packets[j].dst)
            if (from.to.includes(to.from)){
                packetDelay = 5000 * j
                angle = calculateAngle(from.position.split(',')[0] / 30, from.position.split(',')[1] / 30, to.position.split(',')[0] / 30, to.position.split(',')[1] / 30)
                finalPackets.push({
                    'xPosition': from.position.split(',')[0] / 30,
                    'zPosition': from.position.split(',')[1] / 30,
                    'angle': angle,
                    'toXPosition': to.position.split(',')[0] / 30,
                    'toZPosition': to.position.split(',')[1] / 30,
                    'duration': 5000,
                    'packetDelay': packetDelay,
                    'id': packets[j].id,
                    'ip': packets[j].ip,
                    'eth': packets[j].eth,
                    'arp': packets[j].arp,
                    'dataInfo': packets[j].data,
                    'tcp': packets[j].tcp
                })
               
            } else {
                for (var f = 0; f < to.to.length; f++) {
                    if(from.to.includes(to.to[f])){
                        intermediateNode = connectionsLinks.find(o => o.from === to.to[f])
                        packetDelay = 5000 * j
                        angle = calculateAngle(from.position.split(',')[0] / 30, from.position.split(',')[1] / 30, intermediateNode.position.split(',')[0] / 30, intermediateNode.position.split(',')[1] / 30)
                        finalPackets.push({
                            'xPosition': from.position.split(',')[0] / 30, 
                            'zPosition': from.position.split(',')[1] / 30, 
                            'angle': angle, 
                            'toXPosition': intermediateNode.position.split(',')[0] / 30,
                            'toZPosition': intermediateNode.position.split(',')[1] / 30,
                            'duration': 2500,
                            'packetDelay': packetDelay,
                            'id': packets[j].id,
                            'ip': packets[j].ip,
                            'eth': packets[j].eth,
                            'arp': packets[j].arp,
                            'dataInfo': packets[j].data,
                            'tcp': packets[j].tcp
                        })

                        packetDelay = 5000 * j + 2500
                        newPrueba = document.createElement('a-cylinder');
                        angle = calculateAngle(intermediateNode.position.split(',')[0] / 30, intermediateNode.position.split(',')[1] / 30, to.position.split(',')[0] / 30, to.position.split(',')[1] / 30)
                        finalPackets.push({
                            'xPosition': intermediateNode.position.split(',')[0] / 30, 
                            'zPosition': intermediateNode.position.split(',')[1] / 30, 
                            'angle': angle, 
                            'toXPosition': to.position.split(',')[0] / 30,
                            'toZPosition': to.position.split(',')[1] / 30,
                            'duration': 2500,
                            'packetDelay': packetDelay,
                            'id': packets[j].id,
                            'ip': packets[j].ip,
                            'eth': packets[j].eth,
                            'arp': packets[j].arp,
                            'dataInfo': packets[j].data,
                            'tcp': packets[j].tcp
                        })
                    }
                }
            }


        } else {
            for (var s = 0; s < from.to.length; s++) {
                escena = document.querySelector('#escena');
                to = connectionsLinks.find(o => o.from === from.to[s])
                if (to.from.startsWith('hub')){
                    packetDelay = 5000 * j
                    angle = calculateAngle(from.position.split(',')[0] / 30, from.position.split(',')[1] / 30, to.position.split(',')[0] / 30, to.position.split(',')[1] / 30)
                    finalPackets.push({
                        'xPosition': from.position.split(',')[0] / 30, 
                        'zPosition': from.position.split(',')[1] / 30, 
                        'angle': angle, 
                        'toXPosition': to.position.split(',')[0] / 30,
                        'toZPosition': to.position.split(',')[1] / 30,
                        'duration': 2500,
                        'packetDelay': packetDelay,
                        'id': packets[j].id,
                        'ip': packets[j].ip,
                        'eth': packets[j].eth,
                        'arp': packets[j].arp,
                        'dataInfo': packets[j].data,
                        'tcp': packets[j].tcp
                    })

                    for (var d = 0; d < to.to.length; d++) {
                        if (to.to[d] != from.from){
                            secondFrom = to
                            secondTo = connectionsLinks.find(o => o.from === to.to[d])
                            packetDelay = 5000 * j + 2500
                            angle = calculateAngle(secondFrom.position.split(',')[0] / 30, secondFrom.position.split(',')[1] / 30, secondTo.position.split(',')[0] / 30, secondTo.position.split(',')[1] / 30)
                            finalPackets.push({
                                'xPosition': secondFrom.position.split(',')[0] / 30, 
                                'zPosition': secondFrom.position.split(',')[1] / 30, 
                                'angle': angle, 
                                'toXPosition': secondTo.position.split(',')[0] / 30,
                                'toZPosition': secondTo.position.split(',')[1] / 30,
                                'duration': 2500,
                                'packetDelay': packetDelay,
                                'id': packets[j].id,
                                'ip': packets[j].ip,
                                'eth': packets[j].eth,
                                'arp': packets[j].arp,
                                'dataInfo': packets[j].data,
                                'tcp': packets[j].tcp
                            })
                        }
                    }

                } else {
                    packetDelay = 5000 * j
                    angle = calculateAngle(from.position.split(',')[0] / 30, from.position.split(',')[1] / 30, to.position.split(',')[0] / 30, to.position.split(',')[1] / 30)
                    finalPackets.push({
                        'xPosition': from.position.split(',')[0] / 30, 
                        'zPosition': from.position.split(',')[1] / 30, 
                        'angle': angle, 
                        'toXPosition': to.position.split(',')[0] / 30,
                        'toZPosition': to.position.split(',')[1] / 30,
                        'duration': 5000,
                        'packetDelay': packetDelay,
                        'id': packets[j].id,
                        'ip': packets[j].ip,
                        'eth': packets[j].eth,
                        'arp': packets[j].arp,
                        'dataInfo': packets[j].data,
                        'tcp': packets[j].tcp
                    })
                }
            }
        }
    }
    // --------- Create animations ----------
    escena = document.querySelector('#escena');
    for (var currentPacket = 0; currentPacket < finalPackets.length; currentPacket++) {
        var newPacket = document.createElement('a-entity');
        newPacket.setAttribute('packet','xPosition', finalPackets[currentPacket].xPosition);
        newPacket.setAttribute('packet','zPosition', finalPackets[currentPacket].zPosition);
        newPacket.setAttribute('packet','angle', finalPackets[currentPacket].angle);
        newPacket.setAttribute('packet','duration', finalPackets[currentPacket].duration);
        newPacket.setAttribute('packet','toXPosition', finalPackets[currentPacket].toXPosition);
        newPacket.setAttribute('packet','class', 'packetClass')
        newPacket.setAttribute('packet','toZPosition', finalPackets[currentPacket].toZPosition);
        newPacket.setAttribute('packet','id', currentPacket);
        newPacket.setAttribute('packet','start', finalPackets[currentPacket].packetDelay);
        if (finalPackets[currentPacket].ip){
            newPacket.setAttribute('packet','ip', finalPackets[currentPacket].ip);
        }
        if (finalPackets[currentPacket].eth){
            newPacket.setAttribute('packet','eth', finalPackets[currentPacket].eth);
        }
        if (finalPackets[currentPacket].arp){
            newPacket.setAttribute('packet','arp', finalPackets[currentPacket].arp);
        }
        if (finalPackets[currentPacket].dataInfo){
            newPacket.setAttribute('packet','dataInfo', finalPackets[currentPacket].dataInfo);
        }
        if (finalPackets[currentPacket].tcp){
            newPacket.setAttribute('packet','tcp', finalPackets[currentPacket].tcp);
        }
        escena.appendChild(newPacket);
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