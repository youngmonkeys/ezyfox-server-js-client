var EzyConnectionSuccessHandler = function () {
    this.clientType = 'JAVASCRIPT';
    this.clientVersion = '1.0.4';

    this.handle = function () {
        this.sendHandshakeRequest();
        this.postHandle();
    };

    this.postHandle = function () {};

    this.sendHandshakeRequest = function () {
        var request = this.newHandshakeRequest();
        this.client.sendRequest(EzyCommand.HANDSHAKE, request);
    };

    this.newHandshakeRequest = function () {
        var clientId = this.getClientId();
        var clientKey = this.getClientKey();
        var enableEncryption = this.isEnableEncryption();
        var token = this.getStoredToken();
        var request = [
            clientId,
            clientKey,
            this.clientType,
            this.clientVersion,
            enableEncryption,
            token,
        ];
        return request;
    };

    this.getClientKey = function () {
        return '';
    };

    this.getClientId = function () {
        var guid = EzyGuid.generate();
        return guid;
    };

    this.isEnableEncryption = function () {
        return false;
    };

    this.getStoredToken = function () {
        return '';
    };
};

//======================================

var EzyConnectionFailureHandler = function () {
    this.handle = function (event) {
        EzyLogger.console('connection failure, reason = ' + event.reason);
        var config = this.client.config;
        var reconnectConfig = config.reconnect;
        var should = this.shouldReconnect(event);
        var must = reconnectConfig.enable && should;
        var reconnecting = false;
        this.client.status = EzyConnectionStatus.FAILURE;
        if (must) reconnecting = this.client.reconnect();
        if (!reconnecting) {
            this.control(event);
        }
    };

    this.shouldReconnect = function (event) {
        return true;
    };

    this.control = function (event) {};
};

//======================================

var EzyDisconnectionHandler = function () {
    this.handle = function (event) {
        var reason = event.reason;
        var reasonName = EzyDisconnectReasonNames.parse(reason);
        EzyLogger.console('handle disconnection, reason = ' + reasonName);
        this.preHandle(event);
        var config = this.client.config;
        var reconnectConfig = config.reconnect;
        var should = this.shouldReconnect(event);
        var mustReconnect =
            reconnectConfig.enable &&
            reason != EzyDisconnectReason.UNAUTHORIZED &&
            reason != EzyDisconnectReason.CLOSE &&
            should;
        var reconnecting = false;
        this.client.status = EzyConnectionStatus.DISCONNECTED;
        if (mustReconnect) reconnecting = this.client.reconnect();
        if (!reconnecting) {
            this.control(event);
        }
        this.postHandle(event);
    };

    this.preHandle = function (event) {};

    this.shouldReconnect = function (event) {
        var reason = event.reason;
        if (reason == EzyDisconnectReason.ANOTHER_SESSION_LOGIN) return false;
        return true;
    };

    this.control = function (event) {};

    this.postHandle = function (event) {};
};

//======================================

var EzyEventHandlers = function (client) {
    this.handlers = {};
    this.client = client;
    this.pingSchedule = client.pingSchedule;

    this.addHandler = function (eventType, handler) {
        handler.client = this.client;
        handler.pingSchedule = this.pingSchedule;
        this.handlers[eventType] = handler;
    };

    this.getHandler = function (eventType) {
        var handler = this.handlers[eventType];
        return handler;
    };
};
