var EzyZone = function(id, name) {
    this.id = id;
    this.name = name;
    this.me = null;
    this.appList = [];
    this.appsById = {};
    this.appsByName = {};

    this.getApp = function() {
        return this.appList[0];
    }

    this.addApp = function(app) {
        this.appList.push(app);
        this.appsById[app.id] = app;
        this.appsByName[app.name] = app;
    }

}

var EzyApp = function(context, id, name) {
    this.id = id;
    this.name = name;

    this.sendRequest = function(cmd, data) {
        var requestData = [EzyCommand.APP_REQUEST, [cmd, data]];
        context.sendRequest(requestData);
    }
}

var EzyUser = function(id, name) {
    this.id = id;
    this.name = name;
    this.joinedAppList = [];
    this.joinedAppsById = {};
    this.joinedAppsByName = {};

    this.addJoinedApp = function(app) {
        this.joinedAppList.push(app);
        this.joinedAppsById[app.id] = app;
        this.joinedAppsByName[app.name] = app;
    }
}