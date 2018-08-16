var EzyMessageEventHandler = function() {
    this.handle = function(context, message) {
        var cmd = message[0];
        var data = message.length > 1 ? message[1] : [];
        var cmdName = EzyCommandNames[cmd];
        console.log('received cmd: ' + cmdName + ", data: " + data);
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