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