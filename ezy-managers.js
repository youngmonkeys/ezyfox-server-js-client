var EzyAppManager = function (zoneName) {
    this.zoneName = zoneName;
    this.appList = [];
    this.appsById = {};
    this.appsByName = {};

    this.getApp = function () {
        var app = null;
        if (this.appList.length > 0) app = this.appList[0];
        else EzyLogger.console('has no app in zone: ' + this.zoneName);
        return app;
    };

    this.addApp = function (app) {
        this.appList.push(app);
        this.appsById[app.id] = app;
        this.appsByName[app.name] = app;
    };

    this.removeApp = function (appId) {
        var app = this.appsById[appId];
        if (app) {
            delete this.appsById[appId];
            delete this.appsByName[app.name];
            this.appList = this.appList.filter(function (item) {
                return item.id != appId;
            });
        }
        return app;
    };

    this.getAppById = function (id) {
        var app = this.appsById[id];
        return app;
    };

    this.getAppByName = function (name) {
        var app = this.appsByName[name];
        return app;
    };
};

//======================================

var EzyPluginManager = function (zoneName) {
    this.zoneName = zoneName;
    this.pluginList = [];
    this.pluginsById = {};
    this.pluginsByName = {};

    this.getPlugin = function () {
        var plugin = null;
        if (this.pluginList.length > 0) plugin = this.pluginList[0];
        else EzyLogger.console('has no plugin in zone: ' + this.zoneName);
        return plugin;
    };

    this.addPlugin = function (plugin) {
        this.pluginList.push(plugin);
        this.pluginsById[plugin.id] = plugin;
        this.pluginsByName[plugin.name] = plugin;
    };

    this.getPluginById = function (id) {
        var plugin = this.pluginsById[id];
        return plugin;
    };

    this.getPluginByName = function (name) {
        var plugin = this.pluginsByName[name];
        return plugin;
    };
};

//======================================

var EzyPingManager = function () {
    this.pingPeriod = 5000;
    this.lostPingCount = 0;
    this.maxLostPingCount = 5;

    this.increaseLostPingCount = function () {
        return ++this.lostPingCount;
    };
};

//======================================
var EzyStreamingHandler = function () {
    this.handle = function (bytes) {};
};

//======================================

var EzyHandlerManager = function (client) {
    this.streamingHandler = new EzyStreamingHandler();
    this.streamingHandler.client = client;

    this.newEventHandlers = function () {
        var handlers = new EzyEventHandlers(this.client);
        handlers.addHandler(
            EzyEventType.CONNECTION_SUCCESS,
            new EzyConnectionSuccessHandler()
        );
        handlers.addHandler(
            EzyEventType.CONNECTION_FAILURE,
            new EzyConnectionFailureHandler()
        );
        handlers.addHandler(
            EzyEventType.DISCONNECTION,
            new EzyDisconnectionHandler()
        );
        return handlers;
    };

    this.newDataHandlers = function () {
        var handlers = new EzyDataHandlers(this.client);
        handlers.addHandler(EzyCommand.PONG, new EzyPongHandler());
        handlers.addHandler(EzyCommand.HANDSHAKE, new EzyHandshakeHandler());
        handlers.addHandler(EzyCommand.LOGIN, new EzyLoginSuccessHandler());
        handlers.addHandler(EzyCommand.LOGIN_ERROR, new EzyLoginErrorHandler());
        handlers.addHandler(EzyCommand.APP_ACCESS, new EzyAppAccessHandler());
        handlers.addHandler(
            EzyCommand.APP_REQUEST,
            new EzyAppResponseHandler()
        );
        handlers.addHandler(EzyCommand.APP_EXIT, new EzyAppExitHandler());
        handlers.addHandler(EzyCommand.PLUGIN_INFO, new EzyPluginInfoHandler());
        handlers.addHandler(
            EzyCommand.PLUGIN_REQUEST,
            new EzyPluginResponseHandler()
        );
        return handlers;
    };

    this.getDataHandler = function (cmd) {
        var handler = this.dataHandlers.getHandler(cmd);
        return handler;
    };

    this.getEventHandler = function (eventType) {
        var handler = this.eventHandlers.getHandler(eventType);
        return handler;
    };

    this.getAppDataHandlers = function (appName) {
        var answer = this.appDataHandlerss[appName];
        if (!answer) {
            answer = new EzyAppDataHandlers();
            this.appDataHandlerss[appName] = answer;
        }
        return answer;
    };

    this.getPluginDataHandlers = function (pluginName) {
        var answer = this.pluginDataHandlerss[pluginName];
        if (!answer) {
            answer = new EzyPluginDataHandlers();
            this.pluginDataHandlerss[pluginName] = answer;
        }
        return answer;
    };

    this.addDataHandler = function (cmd, dataHandler) {
        this.dataHandlers.addHandler(cmd, dataHandler);
    };

    this.addEventHandler = function (eventType, eventHandler) {
        this.eventHandlers.addHandler(eventType, eventHandler);
    };

    this.setStreamingHandler = function (streamingHandler) {
        this.streamingHandler = streamingHandler;
        this.streamingHandler.client = this.client;
    };

    this.client = client;
    this.dataHandlers = this.newDataHandlers();
    this.eventHandlers = this.newEventHandlers();
    this.appDataHandlerss = {};
    this.pluginDataHandlerss = {};
};
