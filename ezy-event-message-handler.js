var EzyEventMessageHandler = function(client) {
    this.client = client;
    this.handlerManager = client.handlerManager;
    this.unloggableCommands = client.unloggableCommands;

    this.handleEvent = function(event) {
        var eventHandler = this.handlerManager.getEventHandler(event.getType());
        if(eventHandler)
            eventHandler.handle(event);
        else
            console.log('has no handler with event: ' + event.getType());
    }

    this.handleDisconnection = function(reason) {
        this.client.onDisconnected(reason);
        var event = new EzyDisconnectionEvent(reason);
        this.handleEvent(event);
    }

    this.handleMessage = function(message) {
        var cmd = EzyCommands[message[0]];
        var data = message.length > 1 ? message[1] : [];
        if(!this.unloggableCommands.includes(cmd))
            console.log('received cmd: ' + cmd.name + ", data: " + JSON.stringify(data));
        if(cmd === EzyCommand.DISCONNECT)
            this.handleDisconnectionData(data);
        else
            this.handleResponseData(cmd, data);
    }

    this.handleStreaming = function(bytes) {
        var streamingHandler = this.handlerManager.streamingHandler;
        streamingHandler.handle(bytes);
    }

    this.handleDisconnectionData = function(resonseData) {
        var reason = resonseData[0];
        this.handleDisconnection(reason);
    }

    this.handleResponseData = function(cmd, responseData) {
        var handler = this.handlerManager.getDataHandler(cmd);
        if(handler)
            handler.handle(responseData);
        else
            console.log("has no handler with command: " + cmd.name);
    }
}
