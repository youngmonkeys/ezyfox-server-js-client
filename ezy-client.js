var EzyConnector = function () {
    this.ws = null;
    this.destroyed = false;
    this.disconnectReason = null;

    this.connect = function (client, url) {
        this.ws = new WebSocket(url);
        var thiz = this;
        var failed = false;
        var pingManager = client.pingManager;
        var eventMessageHandler = client.eventMessageHandler;

        this.ws.onerror = function (e) {
            EzyLogger.console(
                'connect to: ' + url + ' error : ' + JSON.stringify(e)
            );
            failed = true;
            var event = new EzyConnectionFailureEvent(
                EzyConnectionFailedReason.UNKNOWN
            );
            eventMessageHandler.handleEvent(event);
        };

        this.ws.onopen = function () {
            EzyLogger.console('connected to: ' + url);
            client.reconnectCount = 0;
            client.status = EzyConnectionStatus.CONNECTED;
            var event = new EzyConnectionSuccessEvent();
            eventMessageHandler.handleEvent(event);
        };

        this.ws.onclose = function () {
            if (failed) return;
            if (thiz.destroyed) return;
            if (client.isConnected()) {
                var reason =
                    thiz.disconnectReason || EzyDisconnectReason.UNKNOWN;
                eventMessageHandler.handleDisconnection(reason);
            } else {
                EzyLogger.console(
                    'connection to: ' + url + ' has disconnected before'
                );
            }
        };

        this.ws.onmessage = function (event) {
            if (thiz.destroyed) return;
            pingManager.lostPingCount = 0;
            var data = event.data;
            if (typeof data === 'string') {
                handleTextMessage(data);
            } else {
                handleBinaryMessage(data);
            }
        };

        var handleTextMessage = function (data) {
            var message = JSON.parse(data);
            eventMessageHandler.handleMessage(message);
        };

        var handleBinaryMessage = function (bytes) {
            var arrayBuffer;
            var fileReader = new FileReader();
            fileReader.onload = function (event) {
                arrayBuffer = event.target.result;
                var uint8ArrayNew = new Uint8Array(arrayBuffer);
                var headerByte = uint8ArrayNew[0];
                var isRawBytes = (headerByte & (1 << 4)) != 0;
                if (isRawBytes) {
                    var isBigSize = (headerByte & (1 << 0)) != 0;
                    var offset = isBigSize ? 1 + 4 : 1 + 2;
                    var contentBytes = bytes.slice(offset);
                    eventMessageHandler.handleStreaming(contentBytes);
                } else {
                    // nerver fire, maybe server error
                }
            };
            fileReader.readAsArrayBuffer(bytes.slice(0, 1));
        };
    };

    this.disconnect = function (reason) {
        if (this.ws) {
            this.disconnectReason = reason;
            this.ws.close();
        }
    };

    this.destroy = function () {
        this.destroyed = true;
        this.disconnect();
    };

    this.send = function (data) {
        var json = JSON.stringify(data);
        this.ws.send(json);
    };

    this.sendBytes = function (bytes) {
        this.ws.send(bytes);
    };
};

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
    this.unloggableCommands = [EzyCommand.PING, EzyCommand.PONG];
    this.eventMessageHandler = new EzyEventMessageHandler(this);
    this.pingSchedule.eventMessageHandler = this.eventMessageHandler;

    this.connect = function (url) {
        this.url = url ? url : this.url;
        this.preconnect();
        this.reconnectCount = 0;
        this.status = EzyConnectionStatus.CONNECTING;
        this.connector = new EzyConnector();
        this.connector.connect(this, this.url);
    };

    this.reconnect = function () {
        var reconnectConfig = this.config.reconnect;
        var maxReconnectCount = reconnectConfig.maxReconnectCount;
        if (this.reconnectCount >= maxReconnectCount) return false;
        this.preconnect();
        this.status = EzyConnectionStatus.RECONNECTING;
        function reconnectNow(thiz) {
            thiz.reconnectTimeout = setTimeout(function () {
                thiz.connector = new EzyConnector();
                thiz.connector.connect(thiz, thiz.url);
            }, reconnectConfig.reconnectPeriod);
        }
        reconnectNow(this);
        this.reconnectCount++;
        var event = new EzyTryConnectEvent(this.reconnectCount);
        this.eventMessageHandler.handleEvent(event);
    };

    this.preconnect = function () {
        this.zone = null;
        this.me = null;
        this.appsById = {};
        if (this.connector) this.connector.destroy();
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    };

    this.disconnect = function (reason) {
        var actualReason = reason || EzyDisconnectReason.CLOSE;
        this.internalDisconnect(actualReason);
    };

    this.close = function () {
        this.disconnect();
    };

    this.internalDisconnect = function (reason) {
        if (this.connector) this.connector.disconnect(reason);
    };

    this.sendBytes = function (bytes) {
        this.connector.sendBytes(bytes);
    };

    this.send = function (cmd, data) {
        this.sendRequest(cmd, data);
    };

    this.sendRequest = function (cmd, data) {
        if (!this.unloggableCommands.includes(cmd)) {
            EzyLogger.console(
                'send cmd: ' + cmd.name + ', data: ' + JSON.stringify(data)
            );
        }
        var request = [cmd.id, data];
        this.connector.send(request);
    };

    this.onDisconnected = function (reason) {
        this.status = EzyConnectionStatus.DISCONNECTED;
        this.pingSchedule.stop();
        this.internalDisconnect();
    };

    this.isConnected = function () {
        var connected = this.status == EzyConnectionStatus.CONNECTED;
        return connected;
    };

    this.getApp = function () {
        if (!this.zone) return null;
        var appManager = this.zone.appManager;
        return appManager.getApp();
    };

    this.getAppById = function (appId) {
        if (!this.zone) return null;
        var appManager = this.zone.appManager;
        return appManager.getAppById(appId);
    };

    this.getPlugin = function (pluginId) {
        if (!this.zone) return null;
        var pluginManager = this.zone.pluginManager;
        return pluginManager.getPlugin();
    };

    this.getPluginById = function (pluginId) {
        if (!this.zone) return null;
        var pluginManager = this.zone.pluginManager;
        return pluginManager.getPluginById(pluginId);
    };

    this.newAppManager = function (zoneName) {
        return new EzyAppManager(zoneName);
    };

    this.getAppManager = function () {
        if (!this.zone) return null;
        return this.zone.appManager;
    };

    this.newPluginManager = function (zoneName) {
        return new EzyPluginManager(zoneName);
    };

    this.getPluginManager = function () {
        if (!this.zone) return null;
        return this.zone.pluginManager;
    };
};
