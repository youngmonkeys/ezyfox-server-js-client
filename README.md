# ezyfox-server-es6-client <img src="https://github.com/youngmonkeys/ezyfox-server/blob/master/logo.png" width="48" height="48" />
javascript client for ezyfox server

# Synopsis

javascript client for ezyfox server

# Documentation

[https://youngmonkeys.org/ezyfox-javascript-client-sdk](https://youngmonkeys.org/ezyfox-javascript-client-sdk/)

# Code Example

You can find the full example [here](https://github.com/youngmonkeys/ezyfox-server-js-client/blob/master/index.html)

**1. Create ws client**
```javascript
var config = new EzyClientConfig;
config.zoneName = "zoneName";
var clients = EzyClients.getInstance();
var client = clients.newDefaultClient(config);
```

**2. Setup ws client***

```javascript
var setup = client.setup;
setup.addEventHandler(EzyEventType.DISCONNECTION, disconnectionHandler);
setup.addDataHandler(EzyCommand.HANDSHAKE, handshakeHandler);
setup.addDataHandler(EzyCommand.LOGIN, userLoginHandler);
setup.addDataHandler(EzyCommand.APP_ACCESS, accessAppHandler);
var setupApp = setup.setupApp("appName");
setupApp.addDataHandler("command", function(app, data) {
    controller.contactController.handleSuggestedContactsResponse(data);
});
```

**3. Connect to server**

```javascript
client.connect("ws://localhost:2208/ws");
```

# Installation

You can download latest version from [bin](https://github.com/youngmonkeys/ezyfox-server-js-client/tree/master/bin) folder, add the latest version file to you project and import to your html file:

``` html
<script src="ezyclient-1.0.3.min.js"></script>
```