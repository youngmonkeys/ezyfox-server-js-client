var EzySetup = function(handlerManager) {
    this.handlerManager = handlerManager;
    this.appSetups = {};

    this.addDataHandler = function(cmd, dataHandler) {
        this.handlerManager.addDataHandler(cmd, dataHandler);
        return this;
    }

    this.addEventHandler = function(eventType, eventHandler) {
        this.handlerManager.addEventHandler(eventType, eventHandler);
        return this;
    }

    this.setupApp = function(appName) {
        var appSetup = this.appSetups[appName];
        if(!appSetup) {
            var appDataHandlers = this.handlerManager.getAppDataHandlers(appName);
            appSetup = new EzyAppSetup(appDataHandlers, this);
            this.appSetups[appName] = appSetup;
        }
        return appSetup;
    }

    this.setStreamingHandler = function(streamingHandler) {
        this.handlerManager.streamingHandler = streamingHandler;
    }
}

var EzyAppSetup = function(dataHandlers, parent) {
    this.parent = parent;
    this.dataHandlers = dataHandlers;

    this.addDataHandler = function(cmd, dataHandler) {
        this.dataHandlers.addHandler(cmd, dataHandler);
        return this;
    }

    this.done = function() {
        return this.parent;
    }
}