class Connector {
    constructor(url) {
        this.url = url || 'http://127.0.0.1:3000';
        this.onMessage = null;
    }

    connect(roomId, onConnected) {
        this.socket = io(this.url);

        var that = this;

        this.socket.on('connect', function(){
            that.emit("room", roomId);
            onConnected(null);
        });

        this.socket.on('offer', function(data){
            that.notify("offer", data);
        });

        this.socket.on('ice', function(data){
            that.notify("ice", data);
        });

        this.socket.on('answer', function(data){
            that.notify("answer", data);
        });

        this.socket.on('calling', function(data){
            that.notify("calling", data);
        });
    }

    /**
     * send to p2p new message from server
     * @param action
     * @param data
     */
    notify(action, data) {
        if (this.onMessage) {
            this.onMessage(action, data);
        }
    }

    /**
     * emit message to signal server
     * @param action
     * @param data
     */
    emit(action, data) {
        this.socket.emit(action, data);
    }

    /**
     * who will receive signal server messages
     * @param onMessage
     */
    setOnMessage(onMessage) {
        this.onMessage = onMessage;
    }
}