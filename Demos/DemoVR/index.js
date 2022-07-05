/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('selector', {
    init: function () {
        scene = this.el

        let inmersiveElement = document.createElement('a-entity');

        inmersiveElement.setAttribute('gltf-model', '#inmersive');
        inmersiveElement.setAttribute('position', '-7 7 30');
        inmersiveElement.setAttribute('scale', '10 10 10');
        scene.appendChild(inmersiveElement);
        inmersiveElement.addEventListener('click', function () {
            desktopText.parentNode.removeChild(desktopText);
            inmersiveText.parentNode.removeChild(inmersiveText);
            desktopElement.parentNode.removeChild(desktopElement);
            inmersiveElement.parentNode.removeChild(inmersiveElement);

            scene.setAttribute('inmersiveMode', '');

        });

        let inmersiveText = document.createElement('a-entity');
        inmersiveText.setAttribute('html', '#inmersive-mode');
        inmersiveText.setAttribute('position', { x: -7, y: 16, z: 30 });
        inmersiveText.setAttribute('scale', '30 30 30');
        inmersiveText.setAttribute('look-at', "[camera]");
        scene.appendChild(inmersiveText);

        let desktopElement = document.createElement('a-entity');

        desktopElement.setAttribute('gltf-model', '#desktop');
        desktopElement.setAttribute('position', '7 6 30');
        desktopElement.setAttribute('rotation', '0 -90 0');
        scene.appendChild(desktopElement);
        desktopElement.addEventListener('click', function () {
            desktopText.parentNode.removeChild(desktopText);
            inmersiveText.parentNode.removeChild(inmersiveText);
            inmersiveElement.parentNode.removeChild(inmersiveElement);
            desktopElement.parentNode.removeChild(desktopElement);
            scene.setAttribute('network', { filename: 'netgui.nkp', elementsScale: 1, height: 1, connectionscolor: 'red' });
        });

        let desktopText = document.createElement('a-entity');
        desktopText.setAttribute('html', '#web-mode');
        desktopText.setAttribute('position', { x: 7, y: 16, z: 30 });
        desktopText.setAttribute('scale', '30 30 30');
        desktopText.setAttribute('look-at', "[camera]");
        scene.appendChild(desktopText);

    }
});

AFRAME.registerComponent('inmersiveMode', {
    init: function () {
        scene = this.el

        let inmersiveElement = document.createElement('a-entity');

        inmersiveElement.setAttribute('gltf-model', '#table');
        inmersiveElement.setAttribute('position', '2 0 3');
        inmersiveElement.setAttribute('scale', '15 10 15');
        inmersiveElement.setAttribute('rotation', '0 -90 0');
        scene.appendChild(inmersiveElement);

        let light = document.createElement('a-entity');

        light.setAttribute('light', { type: 'ambient', color: '#FFF' });
        scene.appendChild(light);

        let ambientLight = document.createElement('a-entity');

        ambientLight.setAttribute('light', { color: '#FFF', intensity: '1.5' });
        ambientLight.setAttribute('position', '0 30 0');
        scene.appendChild(ambientLight);

        scene.setAttribute('network', { filename: 'netgui.nkp', elementsScale: 4, height: 6, connectionscolor: 'blue' });
    }
});

AFRAME.registerComponent('network', {
    schema: {
        filename: { type: 'string', default: '' },
    },

    init: function () {
        nodeList = [];
        data = this.data
        file = data.filename
        request = new XMLHttpRequest();
        request.open('GET', file);
        request.responseType = 'text';
        request.send();
        scene = this.el
        request.onload = function () {
            response = request.response;
            response.split('<nodes>')
            nodes = response.split('position')

            // Establecemos los diferentes nodos de la escena
            setNodes(nodes, nodeList, data)

            // Asociamos a cada nodo su nombre de máquina
            machineNamesFile = 'machineNames.json'
            requestMachineNames = new XMLHttpRequest();
            requestMachineNames.open('GET', machineNamesFile);
            requestMachineNames.responseType = 'text';
            requestMachineNames.send();
            requestMachineNames.onload = function () {
                response = requestMachineNames.response;
                responseParse = JSON.parse(response);

                for (const interface in responseParse) {
                    for (const currentNode in responseParse[interface]) {
                        nodeList.find(o => o.name === currentNode).machineName.push(responseParse[interface][currentNode])
                    }
                }

                connections = nodesInfo[1].split('link')
                connectionsLinks = []

                finalConnectionsLinks = setConnectionsLinks(connections, connectionsLinks, nodeList, data)

                filePackets = 'new_file.json'
                requestPackets = new XMLHttpRequest();
                requestPackets.open('GET', filePackets);
                requestPackets.responseType = 'text';
                requestPackets.send();
                requestPackets.onload = function () {
                    response = requestPackets.response;
                    responseParse = JSON.parse(response);

                    packets = readPackets(responseParse)


                    let startButton = document.createElement('a-sphere');

                    startButton.setAttribute('position', { x: -20, y: 2, z: 10 });
                    startButton.setAttribute('color', 'orange');
                    startButton.setAttribute('scale', '2 2 2');
                    startButton.setAttribute('id', 'startButton');
                    startButton.setAttribute('sound', { on: 'click', src: '#playPause', volume: 5 });
                    scene.appendChild(startButton);

                    let buttonText = document.createElement('a-entity');
                    buttonText.setAttribute('html', '#start-button');
                    buttonText.setAttribute('position', { x: -20, y: 20, z: 10 });
                    buttonText.setAttribute('scale', '30 30 30');
                    buttonText.setAttribute('look-at', "[camera]");
                    scene.appendChild(buttonText);

                    animatePackets(packets, finalConnectionsLinks, data)
                }
            }



        }
    }
});



AFRAME.registerComponent('packet', {
    schema: {
        xPosition: { type: 'number', default: 0 },
        yPosition: { type: 'number', default: 1 },
        zPosition: { type: 'number', default: 0 },
        toXPosition: { type: 'string', default: '' },
        toYPosition: { type: 'string', default: ' 1 ' },
        toZPosition: { type: 'string', default: '' },
        duration: { type: 'number', default: 0 },
        elementsScale: { type: 'number', default: 0 },
        id: { type: 'number', default: 0 },
        class: { type: 'string' },
        start: { type: 'number', default: 0 },
        ip: { default: null },
        eth: { default: null },
        arp: { default: null },
        dataInfo: { default: null },
        tcp: { default: null },
    },
    init: function () {
        let packet = this.el
        let packetParams = this.data

        console.log(packetParams.yPosition)



        let i = 0;

        function startAnimation() {
            if (animationStatus == 'move-pause') {
                if (i == Math.ceil(packetParams.start / 1000)) {
                    let nodePositionFrom = ''
                    if (Number.isInteger((packetParams.xPosition * 15) * packetParams.elementsScale)) {
                        nodePositionFrom += parseFloat((packetParams.xPosition * 15) * packetParams.elementsScale).toFixed(1).toString()
                    } else {
                        nodePositionFrom += ((packetParams.xPosition * 15) * packetParams.elementsScale).toString()
                    }
                    nodePositionFrom += ','
                    if (Number.isInteger((packetParams.zPosition * 15) * packetParams.elementsScale)) {
                        nodePositionFrom += parseFloat((packetParams.zPosition * 15) * packetParams.elementsScale).toFixed(1).toString()
                    } else {
                        nodePositionFrom += ((packetParams.zPosition * 15) * packetParams.elementsScale).toString()
                    }
                    nodeAnimation = nodeList.find(o => o.position === nodePositionFrom)
                    var nodeFromAnimation = document.getElementById(nodeAnimation.name);
                    console.log(nodeAnimation.name)

                    if (nodeAnimation.name.startsWith('pc')) {
                        nodeFromAnimation.setAttribute('animation', { property: 'scale', from: { x: 0.012 / packetParams.elementsScale, y: 0.012 / packetParams.elementsScale, z: 0.012 / packetParams.elementsScale }, to: { x: 0.006 / packetParams.elementsScale, y: 0.006 / packetParams.elementsScale, z: 0.006 / packetParams.elementsScale }, loop: '2', dur: '1000', easing: 'linear' })
                    } else if (nodeAnimation.name.startsWith('hub')) {
                        nodeFromAnimation.setAttribute('animation', { property: 'scale', from: { x: 2 / packetParams.elementsScale, y: 2 / packetParams.elementsScale, z: 2 / packetParams.elementsScale }, to: { x: 1 / packetParams.elementsScale, y: 1 / packetParams.elementsScale, z: 1 / packetParams.elementsScale }, loop: '2', dur: '1000', easing: 'linear' })
                    } else if (nodeAnimation.name.startsWith('r')) {
                        nodeFromAnimation.setAttribute('animation', { property: 'scale', from: { x: 0.016 / packetParams.elementsScale, y: 0.016 / packetParams.elementsScale, z: 0.016 / packetParams.elementsScale }, to: { x: 0.008 / packetParams.elementsScale, y: 0.008 / packetParams.elementsScale, z: 0.008 / packetParams.elementsScale }, loop: '2', dur: '1000', easing: 'linear' })
                    }

                    packet.setAttribute('geometry', { primitive: 'cylinder', 'height': 0.4 / packetParams.elementsScale, radius: 0.4 / packetParams.elementsScale });
                    let packetColor = ''
                    if (packetParams.tcp) {
                        packetColor = 'blue'
                    } else if (packetParams.ip) {
                        packetColor = 'yellow'
                    } else if (packetParams.arp) {
                        packetColor = 'green'
                    } else {
                        packetColor = 'red'
                    }
                    packet.setAttribute('material', 'color', packetColor);
                    packet.setAttribute('position', { x: packetParams.xPosition, y: packetParams.yPosition, z: packetParams.zPosition });
                    packet.setAttribute('class', packetParams.class);
                    packet.setAttribute('sound', { src: '#packetIn', volume: 5, autoplay: "true" });
                    packet.setAttribute('id', packetParams.id);

                    var packet_move = document.getElementById(packetParams.id);

                    let levels = {}
                    let closeInfo = true
                    let actualInfoShown = ''
                    notValid = false

                    var htmltemplates = document.getElementById("htmltemplates");
                    var newSectionTemplate = document.createElement("section");
                    newSectionTemplate.style = "display: inline-block; background: #EEEEEE; color: purple; border-radius: 1em; padding: 1em; margin:0;"

                    newSectionTemplate.id = packetParams.id + '-template'
                    htmltemplates.appendChild(newSectionTemplate);

                    let newInfoText = document.createElement('a-entity');

                    newInfoText.setAttribute('position', { x: 5, y: 3, z: 0 });
                    newInfoText.setAttribute('look-at', "[camera]");
                    newInfoText.setAttribute('visible', false);
                    newInfoText.setAttribute('scale', { x: 20, y: 20, z: 20 });
                    newInfoText.setAttribute('isPoster', true);

                    packet.appendChild(newInfoText);

                    if (packetParams.eth) {
                        const ethInfo = {
                            eth: packetParams.eth
                        }
                        levels = Object.assign(levels, ethInfo);
                    }
                    if (packetParams.ip) {
                        const ipInfo = {
                            ip: packetParams.ip
                        }
                        levels = Object.assign(levels, ipInfo);
                    }
                    if (packetParams.arp) {
                        const arpInfo = {
                            arp: packetParams.arp
                        }
                        levels = Object.assign(levels, arpInfo);
                    }
                    if (packetParams.tcp) {
                        const tcpInfo = {
                            tcp: packetParams.tcpInfo
                        }
                        levels = Object.assign(levels, tcpInfo);
                    }
                    if (packetParams.dataInfo) {
                        const dataInfo = {
                            dataInfo: packetParams.dataInfo
                        }
                        levels = Object.assign(levels, dataInfo);
                    }

                    if (levels.hasOwnProperty('eth')) {
                        index = Object.keys(levels).findIndex(item => item === 'eth')

                        let newEthBox = document.createElement('a-box');
                        newEthBox.setAttribute('position', { x: 0, y: 2 + (index), z: 0 });
                        newEthBox.setAttribute('color', 'red');
                        newEthBox.setAttribute('visible', false);
                        packet.appendChild(newEthBox);

                        newEthBox.addEventListener('mouseenter', function () {
                            newEthBox.setAttribute('scale', { x: 1.2, y: 1.2, z: 1.2 });

                        });
                        newEthBox.addEventListener('mouseleave', function () {
                            newEthBox.setAttribute('scale', { x: 1, y: 1, z: 1 })
                            newEthBox.removeAttribute('animation');
                            newEthBox.setAttribute('rotation', { x: 0, y: 0, z: 0 });
                        });
                        newEthBox.addEventListener('click', function () {
                            if (newEthBox.hasAttribute('isVisible')) {
                                let infoText = '<p>Nivel Ethernet:</p><p>Origen: ' + packetParams.eth['eth.src'] + '</p><p>Destino: ' + packetParams.eth['eth.dst'] + '</p><p>Tipo: ' + packetParams.eth['eth.type'] + '</p>'
                                if (closeInfo == true) {
                                    closeInfo = false
                                    actualInfoShown = 'eth'
                                    newInfoText.setAttribute('visible', true);
                                    newInfoText.removeAttribute('html');
                                    var textTemplate = document.getElementById(packetParams.id + '-template');
                                    textTemplateContent = '<h1 style="padding: 0rem 1rem; font-size: 1rem; font-weight: 700; text-align: center; color: red">' + infoText + '</h1>'
                                    textTemplate.innerHTML = textTemplateContent;
                                    newInfoText.setAttribute('html', '#' + packetParams.id + '-template');
                                    newInfoText.setAttribute('visible', true);
                                    newEthBox.removeAttribute('sound');
                                    newEthBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                } else if (closeInfo == false && actualInfoShown == 'eth') {
                                    actualInfoShown = ''
                                    newInfoText.setAttribute('visible', false);
                                    newEthBox.removeAttribute('sound');
                                    newInfoText.removeAttribute('html');
                                    newEthBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                } else if (closeInfo == false && actualInfoShown != '') {
                                    closeInfo = false
                                    actualInfoShown = 'eth'
                                    newInfoText.removeAttribute('html');
                                    var textTemplate = document.getElementById(packetParams.id + '-template');
                                    textTemplateContent = '<h1 style="padding: 0rem 1rem; font-size: 1rem; font-weight: 700; text-align: center; color: red"">' + infoText + '</h1>'
                                    textTemplate.innerHTML = textTemplateContent;
                                    newInfoText.setAttribute('html', '#' + packetParams.id + '-template');
                                    newEthBox.removeAttribute('sound');
                                    newEthBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                }
                            } else {
                                notValid = true
                            }
                        });
                    }
                    if (levels.hasOwnProperty('ip')) {
                        index = Object.keys(levels).findIndex(item => item === 'ip')
                        let newIpBox = document.createElement('a-box');
                        newIpBox.setAttribute('position', { x: 0, y: 2 + (index), z: 0 });
                        newIpBox.setAttribute('color', 'yellow');
                        newIpBox.setAttribute('visible', false);
                        packet.appendChild(newIpBox);
                        newIpBox.addEventListener('mouseenter', function () {
                            newIpBox.setAttribute('scale', { x: 1.2, y: 1.2, z: 1.2 });
                        });
                        newIpBox.addEventListener('mouseleave', function () {
                            newIpBox.setAttribute('scale', { x: 1, y: 1, z: 1 })
                            newIpBox.removeAttribute('animation');
                            newIpBox.setAttribute('rotation', { x: 0, y: 0, z: 0 });
                        });
                        newIpBox.addEventListener('click', function () {
                            if (newIpBox.hasAttribute('isVisible')) {
                                let infoText = '<p>Nivel IP:</p><p>Origen: ' + packetParams.ip['ip.src'] + '</p><p>Destino: ' + packetParams.ip['ip.dst'] + '</p><p>Version: ' + packetParams.ip['ip.version'] + '</p><p>Ttl: ' + packetParams.ip['ip.ttl'] + '</p>'
                                if (closeInfo == true) {
                                    closeInfo = false
                                    actualInfoShown = 'ip'
                                    newInfoText.setAttribute('visible', true);
                                    newInfoText.removeAttribute('html');
                                    var textTemplate = document.getElementById(packetParams.id + '-template');
                                    textTemplateContent = '<h1 style="padding: 0rem 1rem; font-size: 1rem; font-weight: 700; text-align: center; color: yellow">' + infoText + '</h1>'
                                    textTemplate.innerHTML = textTemplateContent;
                                    newInfoText.setAttribute('html', '#' + packetParams.id + '-template');
                                    newIpBox.removeAttribute('sound');
                                    newIpBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                } else if (closeInfo == false && actualInfoShown == 'ip') {
                                    actualInfoShown = ''
                                    newInfoText.setAttribute('visible', false);
                                    newIpBox.removeAttribute('sound');
                                    newInfoText.removeAttribute('html');
                                    newIpBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                } else if (closeInfo == false && actualInfoShown != '') {
                                    closeInfo = false
                                    actualInfoShown = 'ip'
                                    newInfoText.removeAttribute('html');
                                    var textTemplate = document.getElementById(packetParams.id + '-template');
                                    textTemplateContent = '<h1 style="padding: 0rem 1rem; font-size: 1rem; font-weight: 700; text-align: center; color: yellow">' + infoText + '</h1>'
                                    textTemplate.innerHTML = textTemplateContent;
                                    newInfoText.setAttribute('html', '#' + packetParams.id + '-template');
                                    newIpBox.removeAttribute('sound');
                                    newIpBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                }
                            } else {
                                notValid = true
                            }

                        });
                    }
                    if (levels.hasOwnProperty('arp')) {
                        index = Object.keys(levels).findIndex(item => item === 'arp')
                        let newArpBox = document.createElement('a-box');
                        newArpBox.setAttribute('position', { x: 0, y: 2 + (index), z: 0 });
                        newArpBox.setAttribute('color', 'green');
                        newArpBox.setAttribute('visible', false);
                        packet.appendChild(newArpBox);
                        newArpBox.addEventListener('mouseenter', function () {
                            newArpBox.setAttribute('scale', { x: 1.2, y: 1.2, z: 1.2 });
                        });
                        newArpBox.addEventListener('mouseleave', function () {
                            newArpBox.setAttribute('scale', { x: 1, y: 1, z: 1 })
                            newArpBox.removeAttribute('animation');
                            newArpBox.setAttribute('rotation', { x: 0, y: 0, z: 0 });
                        });
                        newArpBox.addEventListener('click', function () {
                            if (newArpBox.hasAttribute('isVisible')) {
                                let infoText = '<p>Nivel ARP:</p><p>Origen: ' + packetParams.arp['arp.src.hw_mac'] + '</p><p>Destino: ' + packetParams.arp['arp.dst.hw_mac'] + '</p>'
                                if (closeInfo == true) {
                                    closeInfo = false
                                    actualInfoShown = 'arp'
                                    newInfoText.setAttribute('visible', true);
                                    newInfoText.removeAttribute('html');
                                    var textTemplate = document.getElementById(packetParams.id + '-template');
                                    textTemplateContent = '<h1 style="padding: 0rem 1rem; font-size: 1rem; font-weight: 700; text-align: center; color: green">' + infoText + '</h1>'
                                    textTemplate.innerHTML = textTemplateContent;
                                    newInfoText.setAttribute('html', '#' + packetParams.id + '-template');
                                    newArpBox.removeAttribute('sound');
                                    newArpBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                } else if (closeInfo == false && actualInfoShown == 'arp') {
                                    actualInfoShown = ''
                                    newInfoText.setAttribute('visible', false);
                                    newArpBox.removeAttribute('sound');
                                    newInfoText.removeAttribute('html');
                                    newArpBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                } else if (closeInfo == false && actualInfoShown != '') {
                                    closeInfo = false
                                    actualInfoShown = 'arp'
                                    newInfoText.removeAttribute('html');
                                    var textTemplate = document.getElementById(packetParams.id + '-template');
                                    textTemplateContent = '<h1 style="padding: 0rem 1rem; font-size: 1rem; font-weight: 700; text-align: center; color: green">' + infoText + '</h1>'
                                    textTemplate.innerHTML = textTemplateContent;
                                    newInfoText.setAttribute('html', '#' + packetParams.id + '-template');
                                    newArpBox.removeAttribute('sound');
                                    newArpBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                }
                            } else {
                                notValid = true
                            }

                        });
                    }
                    if (levels.hasOwnProperty('tcp')) {
                        index = Object.keys(levels).findIndex(item => item === 'tcp')
                        let newTcpBox = document.createElement('a-box');
                        newTcpBox.setAttribute('position', { x: 0, y: 2 + (index), z: 0 });
                        newTcpBox.setAttribute('color', 'blue');
                        newTcpBox.setAttribute('visible', false);
                        packet.appendChild(newTcpBox);
                        newTcpBox.addEventListener('mouseenter', function () {
                            newTcpBox.setAttribute('scale', { x: 1.2, y: 1.2, z: 1.2 });
                        });
                        newTcpBox.addEventListener('mouseleave', function () {
                            newTcpBox.setAttribute('scale', { x: 1, y: 1, z: 1 })
                            newTcpBox.removeAttribute('animation');
                            newTcpBox.setAttribute('rotation', { x: 0, y: 0, z: 0 });
                        });
                        newTcpBox.addEventListener('click', function () {
                            if (newTcpBox.hasAttribute('isVisible')) {
                                let infoText = '<p>Nivel TCP:</p><p>Puerto origen: ' + packetParams.tcp['tcp.srcport'] + '</p><p>Puerto destino: ' + packetParams.tcp['tcp.dstport'] + '</p>'
                                if (closeInfo == true) {
                                    closeInfo = false
                                    actualInfoShown = 'tcp'
                                    newInfoText.setAttribute('visible', true);
                                    newInfoText.removeAttribute('html');
                                    var textTemplate = document.getElementById(packetParams.id + '-template');
                                    textTemplateContent = '<h1 style="padding: 0rem 1rem; font-size: 1rem; font-weight: 700; text-align: center; color: blue">' + infoText + '</h1>'
                                    textTemplate.innerHTML = textTemplateContent;
                                    newInfoText.setAttribute('html', '#' + packetParams.id + '-template');
                                    newTcpBox.removeAttribute('sound');
                                    newTcpBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                } else if (closeInfo == false && actualInfoShown == 'tcp') {
                                    actualInfoShown = ''
                                    newInfoText.setAttribute('visible', false);
                                    newTcpBox.removeAttribute('sound');
                                    newInfoText.removeAttribute('html');
                                    newTcpBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                } else if (closeInfo == false && actualInfoShown != '') {
                                    closeInfo = false
                                    actualInfoShown = 'tcp'
                                    newInfoText.removeAttribute('html');
                                    var textTemplate = document.getElementById(packetParams.id + '-template');
                                    textTemplateContent = '<h1 style="padding: 0rem 1rem; font-size: 1rem; font-weight: 700; text-align: center; color: blue">' + infoText + '</h1>'
                                    textTemplate.innerHTML = textTemplateContent;
                                    newInfoText.setAttribute('html', '#' + packetParams.id + '-template');
                                    newTcpBox.removeAttribute('sound');
                                    newTcpBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                }
                            } else {
                                notValid = true
                            }

                        });
                    }
                    if (levels.hasOwnProperty('dataInfo')) {
                        index = Object.keys(levels).findIndex(item => item === 'dataInfo')
                        let newDataBox = document.createElement('a-box');
                        newDataBox.setAttribute('position', { x: 0, y: 2 + (index), z: 0 });
                        newDataBox.setAttribute('color', 'white');
                        newDataBox.setAttribute('visible', false);
                        packet.appendChild(newDataBox);
                        newDataBox.addEventListener('mouseenter', function () {
                            newDataBox.setAttribute('scale', { x: 1.2, y: 1.2, z: 1.2 });
                        });
                        newDataBox.addEventListener('mouseleave', function () {
                            newDataBox.setAttribute('scale', { x: 1, y: 1, z: 1 })
                            newDataBox.removeAttribute('animation');
                            newDataBox.setAttribute('rotation', { x: 0, y: 0, z: 0 });
                        });
                        newDataBox.addEventListener('click', function () {
                            if (newDataBox.hasAttribute('isVisible')) {
                                let infoText = '<p>DATOS:</p><p>Info datos: ' + packetParams.dataInfo['data.data'] + '</p><p>Longitud de datos: ' + packetParams.dataInfo['data.len'] + '</p>'
                                if (closeInfo == true) {
                                    closeInfo = false
                                    actualInfoShown = 'dataInfo'
                                    newInfoText.setAttribute('visible', true);
                                    newInfoText.removeAttribute('html');
                                    var textTemplate = document.getElementById(packetParams.id + '-template');
                                    textTemplateContent = '<h1 style="padding: 0rem 1rem; font-size: 1rem; font-weight: 700; text-align: center; color: black">' + infoText + '</h1>'
                                    textTemplate.innerHTML = textTemplateContent;
                                    newInfoText.setAttribute('html', '#' + packetParams.id + '-template');
                                    newDataBox.removeAttribute('sound');
                                    newDataBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                } else if (closeInfo == false && actualInfoShown == 'dataInfo') {
                                    actualInfoShown = ''
                                    newInfoText.setAttribute('visible', false);
                                    newDataBox.removeAttribute('sound');
                                    newInfoText.removeAttribute('html');
                                    newDataBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                } else if (closeInfo == false && actualInfoShown != '') {
                                    closeInfo = false
                                    actualInfoShown = 'dataInfo'
                                    newInfoText.removeAttribute('html');
                                    var textTemplate = document.getElementById(packetParams.id + '-template');
                                    textTemplateContent = '<h1 style="padding: 0rem 1rem; font-size: 1rem; font-weight: 700; text-align: center; color: black">' + infoText + '</h1>'
                                    textTemplate.innerHTML = textTemplateContent;
                                    newInfoText.setAttribute('html', '#' + packetParams.id + '-template');
                                    newDataBox.removeAttribute('sound');
                                    newDataBox.setAttribute('sound', { src: '#showLevels', volume: 5, autoplay: "true" });
                                }
                            } else {
                                notValid = true
                            }
                        });
                    }


                    packet.addEventListener('click', function () {
                        if (notValid) {
                            notValid = false
                        } else {
                            if (closeInfo) {
                                for (var a = 0; a < packet.children.length; a++) {
                                    if (packet.children[a].hasAttribute('isVisible')) {
                                        packet.children[a].setAttribute('visible', false);
                                        packet.children[a].removeAttribute('isVisible');
                                        packet.removeAttribute('sound');
                                        packet.setAttribute('sound', { src: '#showInfo', volume: 5, autoplay: "true" });
                                    } else {
                                        if (!packet.children[a].hasAttribute('isPoster')) {
                                            packet.children[a].setAttribute('isVisible', null);
                                            packet.children[a].setAttribute('visible', true);
                                            packet.removeAttribute('sound');
                                            packet.setAttribute('sound', { src: '#showInfo', volume: 5, autoplay: "true" });
                                        }
                                    }
                                }
                            }
                        }

                        if (actualInfoShown == '') {
                            closeInfo = true
                        }

                    });

                    packet_move.setAttribute('animation', {
                        property: 'position',
                        to: packetParams.toXPosition + packetParams.toYPosition + packetParams.toZPosition,
                        dur: packetParams.duration,
                        easing: 'linear',
                        pauseEvents: 'move-pause',
                        resumeEvents: 'move-resume'
                    });
                    packet.addEventListener('animationcomplete', function () {
                        longitud = packet.children.length
                        nodeFromAnimation.removeAttribute('animation');
                        for (var a = 0; a < longitud; a++) {
                            packet.children[0].remove()
                        }
                        packet.parentNode.removeChild(packet);
                    });
                }
                i++;
            }
        }

        var startButton = document.querySelector('#startButton');
        var packets = document.getElementsByClassName('packetClass');

        var animationStatus = 'animation-starts'
        startButton.addEventListener('click', function () {

            for (var a = 0; a < packets.length; a++) {
                packets[a].emit(animationStatus, null, false)
            }

            switch (animationStatus) {
                case 'animation-starts':
                    setInterval(startAnimation, 1000);
                    animationStatus = 'move-pause'
                    break
                case 'move-resume':
                    animationStatus = 'move-pause'
                    console.log('click')
                    break
                case 'move-pause':
                    animationStatus = 'move-resume'
                    console.log('click2')
                    break
            }
        });
    }
});

function setNodes(nodes, nodeList, data) {
    for (var i = 1; i < nodes.length; i++) {
        nodesInfo = nodes[i].split(');')
        nodesName = nodesInfo[1].split('"')
        newNode = {
            position: nodesInfo[0].slice(1),
            name: nodesName[1],
            machineName: []
        }

        let newNodeElement = document.createElement('a-entity');

        if (newNode.name.startsWith('pc')) {
            newNodeElement.setAttribute('gltf-model', '#computer');
            newNodeElement.setAttribute('position', { x: (newNode.position.split(',')[0] / 15) / data.elementsScale, y: data.height, z: (newNode.position.split(',')[1] / 15) / data.elementsScale });
            newNodeElement.setAttribute('id', newNode.name);
            newNodeElement.setAttribute('scale', { x: 0.006 / data.elementsScale, y: 0.006 / data.elementsScale, z: 0.006 / data.elementsScale });
            newNodeElement.setAttribute('rotation', '0 -90 0');
        } else if (newNode.name.startsWith('hub')) {
            newNodeElement.setAttribute('gltf-model', '#hub');
            newNodeElement.setAttribute('position', { x: (newNode.position.split(',')[0] / 15) / data.elementsScale, y: data.height, z: (newNode.position.split(',')[1] / 15) / data.elementsScale });
            newNodeElement.setAttribute('id', newNode.name);
            newNodeElement.setAttribute('scale', { x: 1 / data.elementsScale, y: 1 / data.elementsScale, z: 1 / data.elementsScale });
        } else if (newNode.name.startsWith('r')) {
            newNodeElement.setAttribute('gltf-model', '#router');
            newNodeElement.setAttribute('position', { x: ((newNode.position.split(',')[0] / 15) - 1.5) / data.elementsScale, y: data.height, z: (newNode.position.split(',')[1] / 15) / data.elementsScale });
            newNodeElement.setAttribute('id', newNode.name);
            newNodeElement.setAttribute('scale', { x: 0.008 / data.elementsScale, y: 0.008 / data.elementsScale, z: 0.008 / data.elementsScale });
        }

        scene.appendChild(newNodeElement);

        var htmltemplates = document.getElementById("htmltemplates");
        var newSectionTemplate = document.createElement("section");
        templateText = '<h1 style="padding: 0rem 1rem; font-size: 3rem; font-weight: 700;">' + newNode.name + '</h1>'
        newSectionTemplate.innerHTML = templateText;
        newSectionTemplate.style = "display: inline-block; background: #CCCCCC; color: yellow; border-radius: 1em; padding: 1em; margin:0;"
        newSectionTemplate.id = newNode.name + '-template'
        htmltemplates.appendChild(newSectionTemplate);

        let newText = document.createElement('a-entity');
        newText.setAttribute('position', { x: ((newNode.position.split(',')[0] / 15) - 0.5) / data.elementsScale, y: (4) / data.elementsScale + data.height, z: (newNode.position.split(',')[1] / 15) / data.elementsScale });
        newText.setAttribute('html', '#' + newNode.name + '-template');
        newText.setAttribute('scale', { x: 10 / data.elementsScale, y: 10 / data.elementsScale, z: 10 / data.elementsScale });
        newText.setAttribute('look-at', "[camera]");

        scene = document.querySelector('#escena');
        scene.appendChild(newText);
        nodeList.push(newNode)

    }

    return nodeList
}

function setConnectionsLinks(connections, connectionsLinks, nodeList, data) {
    for (var i = 1; i < connections.length; i++) {
        if (i % 2 == 1) {
            connectionLink = {
                from: connections[i].split('"')[1],
                to: connections[i].split('"')[3],
            }
            connectionsLinks.push(connectionLink)
        }
    }
    return setStandardConnectionsLinks(connectionsLinks, nodeList, data)
}

function setStandardConnectionsLinks(connectionsLinks, nodeList, data) {
    connectionsLinksStandard = []
    for (var k = 0; k < nodeList.length; k++) {
        actualNode = []
        actualNodeConnectionsFrom = connectionsLinks.filter(o => o.from === nodeList[k].name)
        for (var j = 0; j < actualNodeConnectionsFrom.length; j++) {
            actualNode.push(actualNodeConnectionsFrom[j].to)
        }

        actualNodeConnectionsTo = connectionsLinks.filter(o => o.to === nodeList[k].name)
        for (var j = 0; j < actualNodeConnectionsTo.length; j++) {
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

    writeConnections(connectionsLinksStandard, nodeList, data)

    return connectionsLinksStandard
}

function writeConnections(connectionsLinksStandard, nodeList, data) {
    for (var k = 0; k < connectionsLinksStandard.length; k++) {
        nodeFromPosition = connectionsLinksStandard[k].position.split('"')
        for (var j = 0; j < connectionsLinksStandard[k].to.length; j++) {
            nodeTo = connectionsLinksStandard.find(o => o.from === connectionsLinksStandard[k].to[j])
            nodeToPosition = nodeTo.position.split('"')

            let newLine = document.createElement('a-entity');
            newLine.setAttribute('line', 'start: ' + (nodeFromPosition[0].split(',')[0] / 15) / data.elementsScale + ' ' + data.height + ' ' + (nodeFromPosition[0].split(',')[1] / 15) / data.elementsScale + '; end: ' + (nodeToPosition[0].split(',')[0] / 15) / data.elementsScale + ' ' + data.height + ' ' + (nodeToPosition[0].split(',')[1] / 15) / data.elementsScale + '; color: ' + data.connectionscolor);
            scene.appendChild(newLine);
        }
    }

    return connectionsLinksStandard
}

function readPackets(responseParse) {
    packets = []
    for (var j = 0; j < responseParse.length; j++) {
        newAnimation = {
            src: responseParse[j].src,
            dst: responseParse[j].dst,
            time: responseParse[j].time,
            id: j,
        }
        if (responseParse[j].tcp.length !== 0) {
            newAnimation.tcp = responseParse[j].tcp;
        }
        if (responseParse[j].data.length !== 0) {
            newAnimation.data = responseParse[j].data;
        }
        if (responseParse[j].arp.length !== 0) {
            newAnimation.arp = responseParse[j].arp;
        }
        if (responseParse[j].ip.length !== 0) {
            newAnimation.ip = responseParse[j].ip;
        }
        if (responseParse[j].eth.length !== 0) {
            newAnimation.eth = responseParse[j].eth;
        }
        packets.push(newAnimation)
    }
    return packets
}

function animatePackets(packets, connectionsLinks, data) {
    console.log(data.elementsScale)
    finalPackets = []
    for (var j = 0; j < packets.length; j++) {
        from = connectionsLinks.find(o => o.machineName.includes(packets[j].src))

        if (packets[j].dst != 'ff:ff:ff:ff:ff:ff') {
            escena = document.querySelector('#escena');
            to = connectionsLinks.find(o => o.machineName.includes(packets[j].dst))
            if (from.to.includes(to.from)) {
                packetDelay = 10000 * j
                finalPackets.push({
                    'xPosition': (from.position.split(',')[0] / 15) / data.elementsScale,
                    'zPosition': (from.position.split(',')[1] / 15) / data.elementsScale,
                    'toXPosition': (to.position.split(',')[0] / 15) / data.elementsScale,
                    'toZPosition': (to.position.split(',')[1] / 15) / data.elementsScale,
                    'duration': 10000,
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
                    if (from.to.includes(to.to[f])) {
                        intermediateNode = connectionsLinks.find(o => o.from === to.to[f])
                        packetDelay = 10000 * j
                        finalPackets.push({
                            'xPosition': (from.position.split(',')[0] / 15) / data.elementsScale,
                            'zPosition': (from.position.split(',')[1] / 15) / data.elementsScale,
                            'toXPosition': (intermediateNode.position.split(',')[0] / 15) / data.elementsScale,
                            'toZPosition': (intermediateNode.position.split(',')[1] / 15) / data.elementsScale,
                            'duration': 5000,
                            'packetDelay': packetDelay,
                            'id': packets[j].id,
                            'ip': packets[j].ip,
                            'eth': packets[j].eth,
                            'arp': packets[j].arp,
                            'dataInfo': packets[j].data,
                            'tcp': packets[j].tcp
                        })

                        packetDelay = 10000 * j + 5000
                        newPrueba = document.createElement('a-cylinder');
                        finalPackets.push({
                            'xPosition': (intermediateNode.position.split(',')[0] / 15) / data.elementsScale,
                            'zPosition': (intermediateNode.position.split(',')[1] / 15) / data.elementsScale,
                            'toXPosition': (to.position.split(',')[0] / 15) / data.elementsScale,
                            'toZPosition': (to.position.split(',')[1] / 15) / data.elementsScale,
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


        } else {
            for (var s = 0; s < from.to.length; s++) {
                escena = document.querySelector('#escena');
                to = connectionsLinks.find(o => o.from === from.to[s])
                if (to.from.startsWith('hub')) {
                    packetDelay = 10000 * j
                    finalPackets.push({
                        'xPosition': (from.position.split(',')[0] / 15) / data.elementsScale,
                        'zPosition': (from.position.split(',')[1] / 15) / data.elementsScale,
                        'toXPosition': (to.position.split(',')[0] / 15) / data.elementsScale,
                        'toZPosition': (to.position.split(',')[1] / 15) / data.elementsScale,
                        'duration': 5000,
                        'packetDelay': packetDelay,
                        'id': packets[j].id,
                        'ip': packets[j].ip,
                        'eth': packets[j].eth,
                        'arp': packets[j].arp,
                        'dataInfo': packets[j].data,
                        'tcp': packets[j].tcp
                    })

                    for (var d = 0; d < to.to.length; d++) {
                        if (to.to[d] != from.from) {
                            secondFrom = to
                            secondTo = connectionsLinks.find(o => o.from === to.to[d])
                            packetDelay = 10000 * j + 5000
                            finalPackets.push({
                                'xPosition': (secondFrom.position.split(',')[0] / 15) / data.elementsScale,
                                'zPosition': (secondFrom.position.split(',')[1] / 15) / data.elementsScale,
                                'toXPosition': (secondTo.position.split(',')[0] / 15) / data.elementsScale,
                                'toZPosition': (secondTo.position.split(',')[1] / 15) / data.elementsScale,
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

                } else {
                    packetDelay = 10000 * j
                    finalPackets.push({
                        'xPosition': (from.position.split(',')[0] / 15) / data.elementsScale,
                        'zPosition': (from.position.split(',')[1] / 15) / data.elementsScale,
                        'toXPosition': (to.position.split(',')[0] / 15) / data.elementsScale,
                        'toZPosition': (to.position.split(',')[1] / 15) / data.elementsScale,
                        'duration': 10000,
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
        newPacket.setAttribute('packet', 'xPosition', finalPackets[currentPacket].xPosition);
        newPacket.setAttribute('packet', 'yPosition', ' ' + data.height + ' ');
        newPacket.setAttribute('packet', 'zPosition', finalPackets[currentPacket].zPosition);
        newPacket.setAttribute('packet', 'duration', finalPackets[currentPacket].duration);
        newPacket.setAttribute('packet', 'toXPosition', finalPackets[currentPacket].toXPosition);
        newPacket.setAttribute('packet', 'toYPosition', ' ' + data.height + ' ');
        newPacket.setAttribute('packet', 'elementsScale', data.elementsScale);
        newPacket.setAttribute('packet', 'class', 'packetClass')
        newPacket.setAttribute('packet', 'toZPosition', finalPackets[currentPacket].toZPosition);
        newPacket.setAttribute('packet', 'id', currentPacket);
        newPacket.setAttribute('packet', 'start', finalPackets[currentPacket].packetDelay);
        console.log(finalPackets[currentPacket].xPosition)
        console.log(finalPackets[currentPacket].zPosition)

        if (finalPackets[currentPacket].ip) {
            newPacket.setAttribute('packet', 'ip', finalPackets[currentPacket].ip);
        }
        if (finalPackets[currentPacket].eth) {
            newPacket.setAttribute('packet', 'eth', finalPackets[currentPacket].eth);
        }
        if (finalPackets[currentPacket].arp) {
            newPacket.setAttribute('packet', 'arp', finalPackets[currentPacket].arp);
        }
        if (finalPackets[currentPacket].dataInfo) {
            newPacket.setAttribute('packet', 'dataInfo', finalPackets[currentPacket].dataInfo);
        }
        if (finalPackets[currentPacket].tcp) {
            newPacket.setAttribute('packet', 'tcp', finalPackets[currentPacket].tcp);
        }
        escena.appendChild(newPacket);
    }
}