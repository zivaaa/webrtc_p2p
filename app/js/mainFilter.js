class Main {
    onPlay(onCaptured) {
        navigator.getUserMedia({
                audio: false,
                video: true
            },
            (stream)=> {
                console.log("stream captured");
                this._handleStream(stream, onCaptured);
            },
            (err)=> {
                console.error(err);
                alert("no no no... an error detected....");
            }
        );
    }

    _handleStream(stream, onCaptured) {
        console.log("creating filter...");
        var filter = new SFilter(stream, {
            canvasWidth: 500
        });
        filter.filter();
        filter.play();
        console.log("creating filter succeeded");
        onCaptured(filter);
    }
}
