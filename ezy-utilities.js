var EzyGuid = EzyGuid || function() {}

EzyGuid.generate = function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

var EzyCodecs = EzyCodecs || function() {}

EzyCodecs.getSizeLength = function(bytesLength) {
    if(bytesLength > MAX_SMALL_MESSAGE_SIZE)
        return 4;
    return 2;
}

EzyCodecs.getIntBytes = function(value, size) {
    var bytes = [];
    for(var i = 0 ; i < size ; i++) {
        var byteValue = (value >> ((size - i - 1) * 8) & 0xff);
        bytes.push(byteValue);
    }
    return bytes;
}

var EzyLogger = EzyLogger || function() {}

EzyLogger.debug = true;
EzyLogger.console = function(message) {
    if(EzyLogger.debug)
        console.log(message);
}