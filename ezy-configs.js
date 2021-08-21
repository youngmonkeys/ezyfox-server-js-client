var EzyClientConfig = function () {
    this.zoneName = '';
    this.clientName = '';
    this.reconnect = new EzyReconnectConfig();

    this.getClientName = function () {
        if (this.clientName == '') return this.zoneName;
        return this.clientName;
    };
};

var EzyReconnectConfig = function () {
    this.enable = true;
    this.maxReconnectCount = 5;
    this.reconnectPeriod = 3000;
};
