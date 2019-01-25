var EzyPingSchedule = function(client) {
    this.client = client;
    this.pingManager = client.pingManager;
    this.eventMessageHandler = null;

    this.start = function() {
        var startPingNow = function(thiz) {
            thiz.pingInterval = setInterval(
                function() {
                    thiz.sendPingRequest();
                }, 
                thiz.pingManager.pingPeriod
            );
        }
        this.stop();
        startPingNow(this);
    }

    this.sendPingRequest = function() {
        var maxLostPingCount = this.pingManager.maxLostPingCount;
        var lostPingCount = this.pingManager.increaseLostPingCount();
        if(lostPingCount >= maxLostPingCount) {
            var reason = EzyDisconnectReason.SERVER_NOT_RESPONSE;
            this.eventMessageHandler.handleDisconnection(reason);
        }
        else {
            this.client.sendRequest(EzyCommand.PING, []);
        }
    }

    this.stop = function() {
        if(this.pingInterval)
            clearInterval(this.pingInterval);
    }
}