var EzyHandshakeHandler = function() {

	this.handle = function(data) {
		this.startPing();
		this.handleLogin();
		this.postHandle(data);
	}

	this.postHandle = function(data) {
    }

	this.handleLogin = function() {
		var loginRequest = this.getLoginRequest();
		this.client.sendRequest(EzyCommand.LOGIN, loginRequest);
    }
    
    this.getLoginRequest = function() {
        return ["test", "test", "test", []];
	}
	
	this.startPing = function() {
		this.client.pingSchedule.start();
	}
}

//======================================

var EzyLoginSuccessHandler = function() {
    this.handle = function(data) {
        var zoneId = data[0];
        var zoneName = data[1];
        var userId = data[2];
        var username = data[3];
        var responseData = data[4];

        var zone = new EzyZone(this.client, zoneId, zoneName);
        var user = new EzyUser(userId, username);
        this.client.me = user;
        this.client.zone = zone;
        this.handleLoginSuccess(responseData);         
        EzyLogger.console("user: " + user.name + " logged in successfully");
    }

    this.handleLoginSuccess = function(responseData) {
    }
}

//======================================

var EzyLoginErrorHandler = function() {
    this.handle = function(data) {
        this.client.disconnect(401);
        this.handleLoginError(data);
    }

    this.handleLoginError = function(data) {
    }
}

//======================================

var EzyAppAccessHandler = function() {
    this.handle = function(data) {
        var zone = this.client.zone;
        var appManager = zone.appManager;
        var app = this.newApp(zone, data);
        appManager.addApp(app);
        this.postHandle(app, data);
        EzyLogger.console("access app: " + app.name + " successfully");
    }

    this.newApp = function(zone, data) {
        var appId = data[0];
        var appName = data[1];
        var app = new EzyApp(this.client, zone, appId, appName);
        return app;
    }

    this.postHandle = function(app, data) {
    }
}

//======================================

var EzyAppExitHandler = function() {
    this.handle = function(data) {
        var zone = this.client.zone;
        var appManager = zone.appManager
        var appId = data[0];
        var reasonId = data[1];
        var app = appManager.removeApp(appId);
        if(app) {
            this.postHandle(app, data);
            EzyLogger.console("user exit app: " + app.name + ", reason: " + reasonId);
        }
    }

    this.postHandle = function(app, data) {
    }

}

//======================================

var EzyAppResponseHandler = function() {
    this.handle = function(data) {
        var appId = data[0];
        var responseData = data[1];
        var cmd = responseData[0];
        var commandData = responseData[1];

        var app = this.client.getAppById(appId);
        if(!app) {
            EzyLogger.console("receive message when has not joined app yet");
            return;
        }
        var handler = app.getDataHandler(cmd);
        if(handler)
            handler(app, commandData);
        else
            EzyLogger.console("app: " + app.name + " has no handler for command: " + cmd);
    }
}

//======================================

var EzyPluginInfoHandler = function() {
    this.handle = function(data) {
        var zone = this.client.zone;
        var pluginManager = zone.pluginManager;
        var plugin = this.newPlugin(zone, data);
        pluginManager.addPlugin(plugin);
        this.postHandle(plugin, data);
        EzyLogger.console("request plugin: " + plugin.name + " info successfully");
    }

    this.newPlugin = function(zone, data) {
        var pluginId = data[0];
        var pluginName = data[1];
        var plugin = new EzyPlugin(this.client, zone, pluginId, pluginName);
        return plugin;
    }

    this.postHandle = function(plugin, data) {
    }
}

//======================================

var EzyPluginResponseHandler = function() {
    this.handle = function(data) {
        var pluginId = data[0];
        var responseData = data[1];
        var cmd = responseData[0];
        var commandData = responseData[1];

        var plugin = this.client.getPluginById(pluginId);
        var handler = plugin.getDataHandler(cmd);
        if(handler)
            handler(plugin, commandData);
        else
            EzyLogger.console("plugin: " + plugin.name + " has no handler for command: " + cmd);
    }
}

//======================================

var EzyPongHandler = function() {
    this.handle = function(client) {
    }
}

//======================================

var EzyDataHandlers = function(client) {
    this.handlers = {};
    this.client = client;
    this.pingSchedule = client.pingSchedule;

    this.addHandler = function(cmd, handler) {
        handler.client = this.client;
        handler.pingSchedule = this.pingSchedule;
        this.handlers[cmd.id] = handler;
    }

    this.getHandler = function(cmd) {
        var handler = this.handlers[cmd.id];
        return handler;
    }
}

//======================================

var EzyAppDataHandlers = function() {

    this.handlers = {}

    this.addHandler = function(cmd, handler) {
        this.handlers[cmd] = handler;
    }

    this.getHandler = function(cmd) {
        var handler = this.handlers[cmd];
        return handler;
    }

}