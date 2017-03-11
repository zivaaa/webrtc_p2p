class p2p {
    constructor(connector, ownTag, remoteTag) {
        this.peerConnection = null;
        this.stream = null;
        this.isCaller = false;
        this.connector = null;

        this.ownVideo = ownTag;
        this.remoteVideo = remoteTag;

        this.connector = connector;
        connector.setOnMessage(this._onMessage.bind(this));
    }

    catchStream(onSuccess, onFailed) {
        navigator.getUserMedia({
                audio: true,
                video: true
            },
            (stream)=> {
                this._handleStream(stream);
                onSuccess();
            },
            (err)=> {
                this.onError(err);
                if (onFailed)
                    onFailed();
            }
        );
    }

    call() {
        this.isCaller = true;
        this._send("calling", "");

        //this is kostyl', you know... to set some delay =)
        setTimeout(()=> {

            if (!this.stream) {

                return this.catchStream(()=> {
                    this._makePeerConnection();
                }, ()=> {
                    console.error("no stream handled!");
                })
            }

            this._makePeerConnection();
        }, 1000);


    }


    /**
     * save stream, and show local video
     * @param stream
     * @private
     */
    _handleStream(stream) {
        this.stream = stream;
        this._showVideo(this.ownVideo, stream);
    }

    /**
     * create peerConnection (connection handler)
     * @private
     */
    _makePeerConnection() {
        var peerConnection = new RTCPeerConnection(p2p.getPeerConfig().iceServers);

        peerConnection.onicecandidate = (e) => {
            if (e.candidate) {
                this._send("ice", JSON.stringify({"candidate": e.candidate}));
            }
        };

        peerConnection.addStream(this.stream);

        if (this.isCaller) {
            //create offer to another person if this is caller. if not will wait for offer signal and create answer
            this._createOffer(peerConnection);
        }

        peerConnection.onaddstream = (ev) => {
            //when remote stream added, shot video
            console.log("add stream");
            this._showVideo(this.remoteVideo, ev.stream);
        };

        this.peerConnection = peerConnection;
    }

    _createOffer(peerConnection) {
        if (!peerConnection) {
            peerConnection = this.peerConnection;
        }

        peerConnection.createOffer(p2p.getOfferConfig())
            .then((offer) => {
                return peerConnection.setLocalDescription(offer);
            }).then(() => {
                this._send("offer", JSON.stringify(peerConnection.localDescription));
            }).catch(function (reason) {
                console.error(reason);
            });
    }

    _createAnswer(peerConnection) {
        if (!peerConnection) {
            peerConnection = this.peerConnection;
        }

        peerConnection.createAnswer().then((answer) => {
            peerConnection.setLocalDescription(answer);
        }).then(()=> {
            this._send("answer", JSON.stringify(peerConnection.localDescription));
        }).catch(function (reason) {
            console.error(reason);
        });
    }

    /**
     * send data to signal server
     * @param action
     * @param data
     * @private
     */
    _send(action, data) {
        this.connector.emit(action, data);
    }

    /**
     * receive signal from server
     * @param action
     * @param _data
     * @private
     */
    _onMessage(action, _data) {
        var data = null;
        if (_data) {
            try {
                data = JSON.parse(_data);
            } catch (e) {
                console.error("some sort of bad string received, bla bla bla...");
            }

        }

        console.log("_onMessage : " + action);
        console.log(data);

        if (action == 'ice') {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate), ()=> {
                console.info("candidate success");
            }, (reason)=> {
                console.warn("candidate failed");
            });
        } else if (action == 'answer') {
            var remoteDescription = new RTCSessionDescription({
                type: data.type,
                sdp: data.sdp
            });
            this.peerConnection.setRemoteDescription(remoteDescription);
        } else if (action == 'offer') {
            var remoteDescription = new RTCSessionDescription({
                type: data.type,
                sdp: data.sdp
            });
            this.peerConnection.setRemoteDescription(remoteDescription);
            this._createAnswer(this.peerConnection, remoteDescription);
        } else if (action == "calling") {
            this._makePeerConnection();
        }
    }

    /**
     * attach stream to video node
     * @param video
     * @param stream
     * @private
     */
    _showVideo(video, stream) {
        video.srcObject = stream;
        video.play();
    }

    onError(err) {
        console.error(err);
    }


    //static

    /**
     * Get peer peerConfiguration
     * @returns {{iceServers: string[]}}
     */
    static getPeerConfig() {
        return {
            iceServers: [
                {url: "stun.l.google.com:19302"},
                {url: "stun1.l.google.com:19302"},
                {url: "stun2.l.google.com:19302"},
                {url: "stun3.l.google.com:19302"},
                {url: "stun4.l.google.com:19302"}
            ]
        }
    }

    static getOfferConfig() {
        return {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        };
    }

}