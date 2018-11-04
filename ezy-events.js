var EzyConnectionSuccessEvent = function() {

    this.getType = function() {
        return EzyEventType.CONNECTION_SUCCESS;
    }

}

var EzyTryConnectEvent = function(count) {
    this.count = count;

    this.getType = function() {
        return EzyEventType.TRY_CONNECT;
    }
}

var EzyConnectionFailureEvent = function(reason) {
    this.reason = reason;

    this.getType = function() {
        return EzyEventType.CONNECTION_FAILURE;
    }

}

var EzyLostPingEvent = function(count) {
    this.count = count;

    this.getType = function() {
        return EzyEventType.LOST_PING;
    }
}

var EzyDisconnectionEvent = function(reason) {
    this.reason = reason;

    this.getType = function() {
        return EzyEventType.DISCONNECTION;
    }

}