var EzyMessageEventHandler = function() {
    this.handle = function(context, message) {
        var cmd = EzyCommands[message[0]];
        var data = message.length > 1 ? message[1] : [];
        if(!EzyUnlogCommands.includes(cmd)) {
            console.log('received cmd: ' +  cmd.name + ", data: " + JSON.stringify(data));
        }
        if(cmd == EzyCommand.DISCONNECT) {
            context.connected = false;
            context.disconnected = true;
            var disconnectReason = data[0];
            var eventHandler = context.eventHandlers[EzyEventType.DISCONNECTION];
            eventHandler.handle(context, disconnectReason);
        }
        else if(cmd == EzyCommand.PONG) {
            var dataHandler = context.dataHandlers[EzyCommand.PONG.id];
            dataHandler.handle(context);
        }
        else {
            var handler = context.dataHandlers[cmd.id];
            if(handler)
                handler.handle(context, data);
            else
                console.log("has no handler with command: " +  cmd.name);
        }
    }
}

var EzyConnectionEventHandler = function() {
    this.clientType = "JAVASCRIPT";
    this.clientVersion = "1.0.0";

    this.handle = function(context) {
        this.sendHandshake(context);
    }

    this.sendHandshake = function(context) {
        var clientId = this.getClientId();
        var clientKey = this.getClientKey();;
        var token = this.getToken();
        var enableEncryption = this.isEnableEncryption();
        var request = [clientId, clientKey, this.clientType, this.clientVersion, enableEncryption, token];
        context.sendRequest(EzyCommand.HANDSHAKE, request);
    }
    
    this.getClientKey = function() {
        return "";
    }

    this.getClientId = function() {
        return Guid.generate();
    }

    this.getToken = function() {
        return "";
    }

    this.isEnableEncryption = function() {
        return false;
    }
}

var EzyDisconnectionEventHandler = function() {
    this.handle = function(context, reason) {
        var reasonName = EzyDisconnectReasonNames[reason];
        console.log("disconnected, reason: " + reasonName);
        context.stopPing();
    }
}

var EzyPongHandler = function() {
    this.handle = function(context) {
    }
}

var EzyHandshakeHandler = function() {
	this.handle = function(context, data) {
		this.sendLoginRequest(context);
		this.startPing(context);
	}

	this.startPing = function(context) {
		context.startPing();
	}

	this.sendLoginRequest = function(context) {
		var loginRequest = this.newLoginRequest(context);
		context.sendRequest(EzyCommand.LOGIN, loginRequest);
    }
    
    this.newLoginRequest = function(context) {
        return ["test", "test", "test", []];
    }
}

var EzyLoginHandler = function() {
    this.handle = function(context, data) {
        var zoneId = data[0];
        var zoneName = data[1];
        var userId = data[2];
        var username = data[3];
        var joinedAppArray = data[4];
        var responseData = data[5];

        var zone = new EzyZone(zoneId, zoneName);
        var user = new EzyUser(userId, username);
        joinedAppArray.forEach(function(item) {
            var app = new EzyApp(context, item[0], item[1]);
            zone.addApp(app);
            user.addJoinedApp(app);
        });
        zone.me = user;
        context.zone = zone;
        this.handleResponseData(context, responseData);
        this.handleLoginSuccess(context);
        console.log("user: " + user.name + " logged in successfully")
        var appAccessHandler = context.dataHandlers[EzyCommand.APP_ACCESS];
        if(appAccessHandler) {
            zone.appList.forEach(function(app) {
                appAccessHandler.handleAccessApp(context, app);
            });
        } else {
            console.log("has no app access handler, ignore handling apps on user logged in");
        }
    }

    this.handleResponseData = function(context, data) {
    }

    this.handleLoginSuccess = function(context) {
        var me = context.zone.me;
        if(me.joinedAppList.length <= 0) 
            this.handleHasntJoinedApp(context);
        else
            this.handleHasJoinedApps(context);
    }

    this.handleHasntJoinedApp = function(context) {
    }

    this.handleHasJoinedApps = function(context) {
        var zone = context.zone;
        var appList = zone.appList;
        appList.forEach(function(app) {
            
        });
    }

}

var EzyAppAccessHandler = function() {
    this.handle = function(context, data) {
        var appId = data[0];
        var appName = data[1];
        var app = new EzyApp(context, appId, appName);
        var zone = context.zone;
        var me = zone.me;
        zone.addApp(app);
        me.addJoinedApp(app);
        this.handleAccessAppSuccess(context, app);
    }

    this.handleAccessApp = function(context, app) {
        console.log("access app: " + app.name + " successfully");
        this.handleAccessAppSuccess(context, app);
    }

    this.handleAccessAppSuccess = function(context, app) {
    }
}

var EzyAppResponseHandler = function() {
    this.handle = function(context, data) {
        var appId = data[0];
        var responseData = data[1];
        var app = context.zone.appsById[appId];
        var handler = app.dataHandler;
        if(handler)
            handler.handle(app, responseData);
        else
            console.log("app: " + app.name + " has no handler");
    }
}

var EzyAppDataHandler = function() {
    this.handlers = {};

    this.addHandler = function(cmd, handler) {
        this.handlers[cmd] = handler;
    }

    this.handle = function(app, data) {
        var cmd = this.getCommand(data);
        var responseData = this.getResponseData(data);
        var handler = this.handlers[cmd];
        if(handler)
            handler(app, responseData);
        else
            console.log("app: " + app.name + " has no handler with command: " + cmd);
    }

    this.getCommand = function(data) {
        return data[0];
    }

    this.getResponseData = function(data) {
        return data[1];
    }
}