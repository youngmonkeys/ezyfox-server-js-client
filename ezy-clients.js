var EzyClients = (function() {
    
    var EzyClientsClass = function() {
        this.clients = {};
        this.defaultClientName = "";
    
        this.newClient = function(config) {
            var client = new EzyClient(config);
            this.addClient(client);
            if(this.defaultClientName == "")
                this.defaultClientName = client.name;
            return client;
        }
    
        this.newDefaultClient = function(config) {
            var client = this.newClient(config);
            this.defaultClientName = client.name;
            return client;
        }
    
        this.addClient = function(client) {
            this.clients[client.name] = client;
        }
    
        this.getClient = function(clientName) {
            return this.clients[clientName];
        }
    
        this.getDefaultClient = function() {
            return this.clients[this.defaultClientName];
        }
    }
    
    var instance = null;
    
    return {
        getInstance: function () {
            if (!instance) {
                instance = new EzyClientsClass();
            }
            return instance;
        }
    };
})();