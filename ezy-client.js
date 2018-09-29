var EzyConnector = function(context) {
    this.ws = null;
    this.connect = function(url) {
        this.ws = new WebSocket(url);

        this.ws.onerror = function (e) {
            console.log('error : ' + e.message)
        }

        this.ws.onopen = function () {
            console.log('connected');
            context.connected = true;
            context.disconnected = false;
            var handler = context.eventHandlers[EzyEventType.CONNECTION_SUCCESS];
            handler.handle(context);
        }

        this.ws.onclose = function () {
            if(context.connected) {
                var handler = context.eventHandlers[EzyEventType.DISCONNECTION];
                handler.handle(context, EzyDisconnectReason.UNKNOWN);
            }
            context.connected = false;
            context.disconnected = true;
        }

        this.ws.onmessage = function (event) {
            context.lostPingCount = 0;
            var data = event.data;
            var message = JSON.parse(data);
            var handler = context.eventHandlers[EzyEventType.MESSAGE];
            handler.handle(context, message);
        }
    }

    this.disconnect = function() {
        this.ws.close();
    }

    this.send = function(data) {
        var json = JSON.stringify(data);
        this.ws.send(json);
    }
}

var EzyClient = function () {
    this.connector = null;
    this.pingInterval = null;
    this.pingIntervalTime = 3000;
    this.connected = false;
    this.disconnected = false;
    this.lostPingCount = 0;
    this.maxLostPingCount = 3;
    this.zone = null;
    this.eventHandlers = {};
    this.eventHandlers[EzyEventType.CONNECTION_SUCCESS] = new EzyConnectionEventHandler();
    this.eventHandlers[EzyEventType.MESSAGE] = new EzyMessageEventHandler();
    this.eventHandlers[EzyEventType.DISCONNECTION] = new EzyDisconnectionEventHandler();
    this.dataHandlers = {};
    this.dataHandlers[EzyCommand.PONG.id] = new EzyPongHandler();
    this.dataHandlers[EzyCommand.HANDSHAKE.id] = new EzyHandshakeHandler();
    this.dataHandlers[EzyCommand.LOGIN.id] = new EzyLoginHandler();
    this.dataHandlers[EzyCommand.APP_ACCESS.id] = new EzyAppAccessHandler();
    this.dataHandlers[EzyCommand.APP_REQUEST.id] = new EzyAppResponseHandler();
    this.appDataHandlers = {};

    this.connect = function(url) {
        this.connector = new EzyConnector(this);
        this.connector.connect(url);
    }

    this.disconnect = function() {
        this.connector.disconnect();
    }

    this.send = function(data) {
        this.connector.send(data);
    }

    this.sendRequest = function(cmd, data) {
        if(!EzyUnlogCommands.includes(cmd)) {
            console.log('send cmd: ' + cmd.name + ", data: " + JSON.stringify(data));
        }
        var request = [cmd.id, data];
        this.send(request);
    }

    this.addEventHandler = function(eventType, handler) {
        this.eventHandlers[eventType] = handler;
    }

    this.addDataHandler = function(cmd, handler) {
        this.dataHandlers[cmd.id] = handler;
    }

    this.addAppDataHandler = function(appName, handler) {
        this.appDataHandlers[appName] = handler;
    }

    this.startPing = function() {
        var startPingNow = function(client) {
            var pingInterval = setInterval(
                function() {
                    if(client.lostPingCount < client.maxLostPingCount) {
                        client.lostPingCount ++;
                        client.sendRequest(EzyCommand.PING, []);
                    }
                    else {
                        client.connected = false;
                        client.disconnected = true;
                        var handler = client.eventHandlers[EzyEventType.DISCONNECTION];
                        handler.handle(client, EzyDisconnectReason.SERVER_NOT_RESPONSE);
                        client.disconnect();
                    }
                }, 
                client.pingIntervalTime
            );
            return pingInterval;
        }
        this.stopPing();
        this.pingInterval = startPingNow(this);
    }

    this.stopPing = function() {
        if(this.pingInterval)
            clearInterval(this.pingInterval);
    }
}

var EzyClients = (function() {
    
    var EzyClientsClass = function() {
        this.clients = {};
        this.defaultClient = "defaultClient";
        
        this.addClient = function(name, client) {
        this.clients[name] = client;
        }

        this.addDefaultClient = function(client) {
            this.clients[this.defaultClient] = client;
        }

        this.getClient = function(clientName) {
            return this.clients[clientName];
        }

        this.getDefaultClient = function() {
            return this.clients[this.defaultClient];
        }
    }
    
    var instance = null;
    
    return {
        getInstance: function () {
            if (!instance) {
                instance = new EzyClientsClass();
            }
            return instance;
        }
    };
})();