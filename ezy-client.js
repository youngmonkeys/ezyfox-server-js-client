var EzyConnector = function() {
    this.ws = null;
    this.connect = function(client, url) {
        this.ws = new WebSocket(url);
        var failed = false;
        var pingManager = client.pingManager;
        var eventMessageHandler = client.eventMessageHandler;

        this.ws.onerror = function (e) {
            console.log('connect to: ' + url + ' error : ' + JSON.stringify(e));
            failed = true;
            var event = new EzyConnectionFailureEvent(
                EzyConnectionFailedReason.UNKNOWN);
            eventMessageHandler.handleEvent(event);
        }

        this.ws.onopen = function () {
            console.log('connected to: ' + url);
            client.reconnectCount = 0;
            client.status = EzyConnectionStatus.CONNECTED;
            var event = new EzyConnectionSuccessEvent();
            eventMessageHandler.handleEvent(event);
        }

        this.ws.onclose = function () {
            if(failed)
                return;
            if(client.isConnected()) {
                var reason = EzyDisconnectReason.UNKNOWN;
                eventMessageHandler.handleDisconnection(reason);
            }
            else {
                console.log('connection to: ' + url + " has disconnected before");
            }
        }

        this.ws.onmessage = function (event) {
            pingManager.lostPingCount = 0;
            var data = event.data;
            var message = JSON.parse(data);
            eventMessageHandler.handleMessage(message);
        }
    }

    this.disconnect = function() {
        if(this.ws)
            this.ws.close();
    }

    this.send = function(data) {
        var json = JSON.stringify(data);
        this.ws.send(json);
    }
}

//===============================================

var EzyClient = function (config) {
    this.config = config;
    this.name = config.getClientName();
    this.url = null;
    this.connector = null;
    this.zone = null;
    this.me = null;
    this.status = EzyConnectionStatus.NULL;
    this.reconnectCount = 0;
    this.disconnected = false;
    this.reconnectTimeout = null;
    this.pingManager = new EzyPingManager();
    this.pingSchedule = new EzyPingSchedule(this);
    this.handlerManager = new EzyHandlerManager(this);
    this.setup = new EzySetup(this.handlerManager);
    this.appsById = {};
    this.unloggableCommands = [EzyCommand.PING, EzyCommand.PONG];
    this.eventMessageHandler = new EzyEventMessageHandler(this);
    this.pingSchedule.eventMessageHandler = this.eventMessageHandler;

    this.connect = function(url) {
        this.url = url ? url : this.url;
        this.preconnect();
        this.reconnectCount = 0;
        this.status = EzyConnectionStatus.CONNECTING;
        this.connector = new EzyConnector();
        this.connector.connect(this, this.url);
    }

    this.reconnect = function() {
        var reconnectConfig = this.config.reconnect;
        var maxReconnectCount = reconnectConfig.maxReconnectCount;
        if(this.reconnectCount >= maxReconnectCount)
            return false;
        this.preconnect();
        this.status = EzyConnectionStatus.RECONNECTING;
        function reconnectNow(thiz) {
            thiz.reconnectTimeout = setTimeout(
                function() {
                    thiz.connector = new EzyConnector();
                    thiz.connector.connect(thiz, thiz.url);
                }, 
                reconnectConfig.reconnectPeriod
            );
        }
        reconnectNow(this);
        this.reconnectCount ++;
        var event = new EzyTryConnectEvent(this.reconnectCount);
        this.eventMessageHandler.handleEvent(event);
    }

    this.preconnect = function() {
        this.zone = null;
        this.me = null;
        this.appsById = {};
        if(this.reconnectTimeout)
            clearTimeout(this.reconnectTimeout);
    }

    this.disconnect = function() {
        if(this.connector)
            this.connector.disconnect();
    }

    this.send = function(data) {
        this.connector.send(data);
    }

    this.sendRequest = function(cmd, data) {
        if(!this.unloggableCommands.includes(cmd)) {
            console.log('send cmd: ' + cmd.name + ", data: " + JSON.stringify(data));
        }
        var request = [cmd.id, data];
        this.send(request);
    }

    this.onDisconnected = function(reason) {
        var reasonName = Const.EzyDisconnectReasonNames.parse(reason);
        console.log('disconnect with: ' + this.url + ", reason: " + reasonName);
        this.status = EzyConnectionStatus.DISCONNECTED;
        this.pingSchedule.stop();
        this.disconnect();
    }

    this.isConnected = function() {
        var connected = (this.status == EzyConnectionStatus.CONNECTED);
        return connected;
    }

    this.addApp = function(app) {
        this.appsById[app.id] = app;
    }

    this.getAppById = function(appId) {
        return this.appsById[appId];
    }
}