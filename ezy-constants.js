var EzyEventType = EzyEventType || {
    CONNECTION_SUCCESS : "CONNECTION_SUCCESS",
    CONNECTION_FAILURE : "CONNECTION_FAILURE",
    DISCONNECTION : "DISCONNECTION",
    MESSAGE : "MESSAGE"
}

Object.freeze(EzyEventType);

var EzyCommand = EzyCommand || {
    ERROR : {id: 10, name: "ERROR"},
    HANDSHAKE : {id: 11, name: "HANDSHAKE"},
    PING : {id: 12, name: "PING"},
    PONG : {id: 13, name: "PONG"},
    DISCONNECT : {id: 14, name: "DISCONNECT"},
    LOGIN : {id: 20, name: "LOGIN"},
    LOGIN_ERROR : {id: 21, name: "LOGIN_ERROR"},
    LOGOUT : {id: 22, name: "LOGOUT"},
    APP_ACCESS : {id: 30, name: "APP_ACCESS"},
    APP_REQUEST : {id: 31, name: "APP_REQUEST"},
    APP_EXIT : {id: 33, name: "APP_EXIT"},
    APP_ACCESS_ERROR : {id: 34, name: "APP_ACCESS_ERROR"},
    PLUGIN_INFO : {id: 40, name: "PLUGIN_INFO"},
    PLUGIN_REQUEST_BY_NAME : {id: 41, name: "PLUGIN_REQUEST_BY_NAME"},
    PLUGIN_REQUEST_BY_ID : {id: 42, name: "PLUGIN_REQUEST_BY_ID"}
}

Object.freeze(EzyCommand);

var EzyCommands = EzyCommands || {};
EzyCommands[EzyCommand.ERROR.id] = EzyCommand.ERROR;
EzyCommands[EzyCommand.HANDSHAKE.id] = EzyCommand.HANDSHAKE;
EzyCommands[EzyCommand.PING.id] = EzyCommand.PING;
EzyCommands[EzyCommand.PONG.id] = EzyCommand.PONG;
EzyCommands[EzyCommand.DISCONNECT.id] = EzyCommand.DISCONNECT;
EzyCommands[EzyCommand.LOGIN.id] = EzyCommand.LOGIN;
EzyCommands[EzyCommand.LOGIN_ERROR.id]  = EzyCommand.LOGIN_ERROR;
EzyCommands[EzyCommand.LOGOUT.id]  = EzyCommand.LOGOUT;
EzyCommands[EzyCommand.APP_ACCESS.id]  = EzyCommand.APP_ACCESS;
EzyCommands[EzyCommand.APP_REQUEST.id] = EzyCommand.APP_REQUEST;
EzyCommands[EzyCommand.APP_EXIT.id] = EzyCommand.APP_EXIT;
EzyCommands[EzyCommand.APP_ACCESS_ERROR.id] = EzyCommand.APP_ACCESS_ERROR;
EzyCommands[EzyCommand.PLUGIN_INFO.id] = EzyCommand.PLUGIN_INFO;
EzyCommands[EzyCommand.PLUGIN_REQUEST_BY_NAME.id] = EzyCommand.PLUGIN_REQUEST_BY_NAME;
EzyCommands[EzyCommand.PLUGIN_REQUEST_BY_ID.id] = EzyCommand.PLUGIN_REQUEST_BY_ID;

Object.freeze(EzyCommands);

var EzyUnlogCommands = EzyUnlogCommands || {}
EzyUnlogCommands = [EzyCommand.PING, EzyCommand.PONG];

var EzyDisconnectReason = EzyDisconnectReason || {};
EzyDisconnectReason.UNKNOWN = 0;
EzyDisconnectReason.IDLE = 1;
EzyDisconnectReason.NOT_LOGGED_IN = 2;
EzyDisconnectReason.ANOTHER_SESSION_LOGIN = 3;
EzyDisconnectReason.ADMIN_BAN = 4;
EzyDisconnectReason.ADMIN_KICK = 5;
EzyDisconnectReason.MAX_REQUEST_PER_SECOND = 6;
EzyDisconnectReason.MAX_REQUEST_SIZE = 7;
EzyDisconnectReason.SERVER_ERROR = 8;
EzyDisconnectReason.SERVER_NOT_RESPONSE = 300;

var EzyDisconnectReasonNames = EzyDisconnectReasonNames || {};
EzyDisconnectReasonNames[EzyDisconnectReason.UNKNOWN] = "UNKNOWN";
EzyDisconnectReasonNames[EzyDisconnectReason.IDLE] = "IDLE";
EzyDisconnectReasonNames[EzyDisconnectReason.NOT_LOGGED_IN] = "NOT_LOGGED_IN";
EzyDisconnectReasonNames[EzyDisconnectReason.ANOTHER_SESSION_LOGIN] = "ANOTHER_SESSION_LOGIN";
EzyDisconnectReasonNames[EzyDisconnectReason.ADMIN_BAN] = "ADMIN_BAN";
EzyDisconnectReasonNames[EzyDisconnectReason.ADMIN_KICK] = "ADMIN_KICK";
EzyDisconnectReasonNames[EzyDisconnectReason.MAX_REQUEST_PER_SECOND] = "MAX_REQUEST_PER_SECOND";
EzyDisconnectReasonNames[EzyDisconnectReason.MAX_REQUEST_SIZE] = "MAX_REQUEST_SIZE";
EzyDisconnectReasonNames[EzyDisconnectReason.SERVER_ERROR] = "SERVER_ERROR";
EzyDisconnectReasonNames[EzyDisconnectReason.SERVER_NOT_RESPONSE] = "SERVER_NOT_RESPONSE";