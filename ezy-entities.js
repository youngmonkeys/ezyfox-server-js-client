var EzyUser = function (id, name) {
    this.id = id;
    this.name = name;
};

//===================================================

var EzyZone = function (client, id, name) {
    this.id = id;
    this.name = name;
    this.client = client;
    this.appManager = client.newAppManager(name);
    this.pluginManager = client.newPluginManager(name);
};

//===================================================

var EzyApp = function (client, zone, id, name) {
    this.id = id;
    this.name = name;
    this.client = client;
    this.zone = zone;
    this.dataHandlers = client.handlerManager.getAppDataHandlers(name);

    this.send = function (cmd, data) {
        this.sendRequest(cmd, data);
    };

    this.sendRequest = function (cmd, data) {
        var validData = data;
        if (!validData) validData = {};
        var requestData = [this.id, [cmd, validData]];
        this.client.sendRequest(EzyCommand.APP_REQUEST, requestData);
    };

    this.getDataHandler = function (cmd) {
        var handler = this.dataHandlers.getHandler(cmd);
        return handler;
    };
};

//===================================================

var EzyPlugin = function (client, zone, id, name) {
    this.id = id;
    this.name = name;
    this.client = client;
    this.zone = zone;
    this.dataHandlers = client.handlerManager.getPluginDataHandlers(name);

    this.send = function (cmd, data) {
        this.sendRequest(cmd, data);
    };

    this.sendRequest = function (cmd, data) {
        var validData = data;
        if (!validData) validData = {};
        var requestData = [this.id, [cmd, validData]];
        this.client.sendRequest(EzyCommand.PLUGIN_REQUEST, requestData);
    };

    this.getDataHandler = function (cmd) {
        var handler = this.dataHandlers.getHandler(cmd);
        return handler;
    };
};
