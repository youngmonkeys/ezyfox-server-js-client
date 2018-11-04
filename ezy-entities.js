var EzyZone = function(client, id, name) {
    this.id = id;
    this.name = name;
    this.client = client;
    this.appManager = new EzyAppManager(name);
}

var EzyApp = function(client, zone, id, name) {
    this.id = id;
    this.name = name;
    this.client = client;
    this.zone = zone;
    this.dataHandlers = client.handlerManager.getAppDataHandlers(name);

    this.sendRequest = function(cmd, data) {
        var requestData = [this.id, [cmd, data]];
        this.client.sendRequest(EzyCommand.APP_REQUEST, requestData);
    }

    this.getDataHandler = function(cmd) {
        var handler = this.dataHandlers.getHandler(cmd);
        return handler;
    }
}

var EzyUser = function(id, name) {
    this.id = id;
    this.name = name;
}