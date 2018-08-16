var EzyRSAKeyPairGenerator = function() {
    this.generateKeyPair = function(keySize) {
        var crypt = new JSEncrypt({default_key_size: keySize});
        var key = crypt.getKey();
        return key;
    }
}