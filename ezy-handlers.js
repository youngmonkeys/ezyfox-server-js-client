var EzyMessageEventHandler = function() {
    this.handle = function(context, message) {
        var cmd = message[0];
        var data = message.length > 1 ? message[1] : [];
        var cmdName = EzyCommandNames[cmd];
        if(!EzyUnlogCommands.includes(cmd)) {
            console.log('received cmd: ' + cmdName + ", data: " + data);
        }
        if(cmd == EzyCommand.DISCONNECT) {
            context.connected = false;
            context.disconnected = true;
            var disconnectReason = data[0];
            var eventHandler = context.eventHandlers[EzyEventType.DISCONNECTION];
            eventHandler.handle(context, disconnectReason);
        }
        else if(cmd == EzyCommand.PONG) {
            var dataHandler = context.dataHandlers[EzyCommand.PONG];
            dataHandler.handle(context);
        }
        else {
            var handler = context.dataHandlers[cmd];
            if(handler)
                handler.handle(context, data);
            else
                console.log("has no handler with command: " + cmdName);
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
        var keyPair = this.loadKeyPair();
        var clientId = this.getClientId();
        var clientKey = keyPair.getPublicBaseKeyB64();
        var reconnectToken = this.getReconnectToken();
        var request = [clientId, clientKey, reconnectToken, this.clientType, this.clientVersion];
        context.sendRequest(EzyCommand.HANDSHAKE, request);
    }

    this.getReconnectToken = function() {
        return "";
    }

    this.getClientId = function() {
        return Guid.generate();
    }

    this.loadKeyPair = function() {
        var keyPairGenerator = new EzyRSAKeyPairGenerator();
        var keyPair = keyPairGenerator.generateKeyPair(1024);
        return keyPair;
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
    }

    this.handleResponseData = function(context, data) {
    }

    this.handleLoginSuccess = function(context) {
    }
}

var EzyAppAccessHandler = function() {
    this.handle = function(context, data) {
        var appId = data[0];
        var appName = data[1];
        var app = new EzyApp(context, appId, appName);
        var me = context.zone.me;
        me.addJoinedApp(app);
        this.handleAccessAppSuccess(context, app);
        console.log("access app: " + app.name + " successfully");
    }

    this.handleAccessAppSuccess = function(context, app) {
    }
}