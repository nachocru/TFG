# capsFile = 'caps.json'
# capsRequest = new XMLHttpRequest();
# capsRequest.open('GET', capsFile);
# capsRequest.responseType = 'text';
# capsRequest.send();
# capsRequest.onload = function() {
#     response = capsRequest.response;
#     responseParse = JSON.parse(response)[0];

#     for (const hola in responseParse) {
#         console.log(hola)
#     }
# }

import json

class Packet(object):
    src = ""
    dst = ""
    time = ""
    id = 0
    tcp = []
    data = []
    arp = []
    ip = []
    eth = []

hola = []

with open('caps.json', 'r') as file:
    # caps = json.load(file)[0]
    caps = json.load(file)
    for cap in caps:
        with open(cap, 'r') as capFile:
            capFileParsed = json.load(capFile)
            # print(capFileParsed)

            for packet in capFileParsed:
                dictionary = {
                    'src': packet['_source']['layers']['eth']['eth.src'],
                    'dst': packet['_source']['layers']['eth']['eth.dst'],
                    'time': packet['_source']['layers']['frame']['frame.time_relative'],
                    'id': packet['_source']['layers']['frame']['frame.time_epoch'].split('.')[0],
                    'date': packet['_source']['layers']['frame']['frame.time'],
                    'tcp': [],
                    'data': [],
                    'arp': [],
                    'ip': [],
                    'eth': []
                }
                

                for layer in packet['_source']['layers']:
                    if layer == 'frame':
                        None
                        # No se añade
                    elif layer == 'tcp':
                        dictionary['tcp'] = packet['_source']['layers']['tcp']
                    elif layer == 'data':
                        dictionary['data'] = packet['_source']['layers']['data']
                    elif layer == 'arp':
                        dictionary['arp'] =  packet['_source']['layers']['arp']
                    elif layer == 'ip':
                        dictionary['ip'] = packet['_source']['layers']['ip']
                    elif layer == 'eth':
                        dictionary['eth'] = packet['_source']['layers']['eth']
                    else:
                        print('Nuevo valor ' + layer)
                    
                hola.append(dictionary)



    with open('new_file.json', 'w') as f:
        hola.sort(key=lambda x: x['date'])
        ids = []
        idsAndInfo = []
        packetsFinal = []
        for packet in hola:
            if packet['id'] not in ids:
                newRegister = {
                    'id': packet['id'],
                    'src': [],
                    'dst': []
                }
                newRegister['src'].append(packet['src'])
                newRegister['dst'].append(packet['dst'])

                packetsFinal.append(packet)
                ids.append(packet['id'])
                idsAndInfo.append(newRegister)
            else:
                for x in idsAndInfo:
                    if x['id'] == packet['id']:
                        if packet['src'] not in x['src'] and packet['dst'] not in x['dst']:
                            x['src'].append(packet['src'])
                            x['dst'].append(packet['dst'])
                            packetsFinal.append(packet)
                        break

        print(idsAndInfo)

        json_object = json.dumps(packetsFinal, indent = 2)
        f.write(json_object)
        print("The json file is created")