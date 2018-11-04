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
        var joinedAppArray = data[4];
        var responseData = data[5];

        var zone = new EzyZone(this.client, zoneId, zoneName);
        var user = new EzyUser(userId, username);
        this.client.me = user;
        this.client.zone = zone;
        var allowReconnect = this.allowReconnection();
        var appCount = joinedAppArray.length;
        var shouldReconnect = allowReconnect && appCount > 0
        this.handleResponseData(responseData);
        if(shouldReconnect) {
            this.handleResponseAppDatas(joinedAppArray);
            this.handleReconnectSuccess(responseData);
        }
        else {
            this.handleLoginSuccess(responseData);
        }            
        console.log("user: " + user.name + " logged in successfully");
    }

    this.allowReconnection = function() {
        return false;
    }
    
    this.handleResponseData = function(data) {
    }

    this.handleResponseAppDatas = function(appDatas) {
        var handlerManager = this.client.handlerManager;
        var appAccessHandler = handlerManager.getDataHandler(EzyCommand.APP_ACCESS);
        appDatas.forEach(function(app) {
            appAccessHandler.handle(app);
        });
    }

    this.handleLoginSuccess = function(data) {
    }

    this.handleReconnectSuccess = function(data) {
        this.handleLoginSuccess(data);
    }
}

//======================================

var EzyAppAccessHandler = function() {
    this.handle = function(data) {
        var zone = this.client.zone;
        var appManager = zone.appManager;
        var app = this.newApp(zone, data);
        appManager.addApp(app);
        this.client.addApp(app);
        this.postHandle(app, data);
        console.log("access app: " + app.name + " successfully");
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

var EzyPongHandler = function() {
    this.handle = function(client) {
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
        var handler = app.getDataHandler(cmd);
        if(handler)
            handler(app, commandData);
        else
            console.log("app: " + app.name + " has no handler for command: " + cmd);
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