class SFilter {
    constructor(stream, options) {
        this.props = {
            canvasWidth: 500,
            ratio: 0.75,
            ownStreamContainerId: "ownScreen"
        };

        Object.assign(this.props, options);

        this.video = document.createElement("video");
        this.video.srcObject = stream;
        this.originalStream = stream;
        //setup pixi app
        var pixiApp = new PIXI.Application(this.props.canvasWidth, this.props.canvasWidth * this.props.ratio, {transparent: true});

        this.pixiApp = pixiApp;

        this.currentFilter = null;

        this.video.oncanplay = ()=> {
            //setup pixi texture from original video
            var texture = PIXI.Texture.fromVideo(this.video);
            this.videoSprite = new PIXI.Sprite(texture);

            this.videoSprite.width = pixiApp.renderer.width;
            this.videoSprite.height = pixiApp.renderer.height;

            pixiApp.stage.addChild(this.videoSprite);
            pixiApp.ticker.add(this.onTick, this);
        };
    }

    setFilter(name) {
        console.log("set filter : " + name);

        if (this.currentFilter === "text" && name !== "text") {
            this.pixiApp.stage.removeChild(this.filterData.text);
        }

        if (name == "blur") {
            var blur = new PIXI.filters.BlurFilter();
            blur.blur = 5;
            blur.passes = 5;

            this.filterData = {
                blur: 5,
                filter: blur
            };

            this.videoSprite.filters = [blur];
        } else if (name == "color") {
            var colorFilter = new PIXI.filters.ColorMatrixFilter();
            this.filterData = {
                hue: 0,
                filter: colorFilter
            };

            this.videoSprite.filters = [colorFilter];
        } else if (name == "noise") {
            var noiseFilter = new PIXI.filters.NoiseFilter();
            noiseFilter.noisenumber = 0.5;
            noiseFilter.time = 5;
            this.filterData = {
                noisenumber: 0.5,
                filter: noiseFilter
            };

            this.videoSprite.filters = [noiseFilter];
        } else if (name == "text") {

            var text = new PIXI.Text("Look at me!", {
                font: "40px Arial",
                fill: "black"
            });
            text.anchor.set(0.5);
            text.x = this.pixiApp.renderer.width / 2;
            text.y = this.pixiApp.renderer.height / 2;

            this.pixiApp.stage.addChild(text);

            this.filterData = {
                text: text,
                rotation: 0,
                changeDirection: 1
            };

            this.videoSprite.filters = [];
        } else {
            this.videoSprite.filters = [];
        }

        this.currentFilter = name;
    }

    /*
     on Each tick check selected feature and apply data
     */
    onTick() {
        if (this.currentFilter === "color") {
            this.filterData.filter.hue(this.filterData.hue++);
        } else if (this.currentFilter === "text") {

            if (this.filterData.rotation > 0.3) {
                this.filterData.changeDirection = -1;
            } else if (this.filterData.rotation < -0.3) {
                this.filterData.changeDirection = 1;
            }

            this.filterData.rotation += this.filterData.changeDirection * 0.01;
            this.filterData.text.rotation = this.filterData.rotation;
        }
    }

    /**
     * show canvas in container
     */
    showVideo() {
        document.getElementById(this.props.ownStreamContainerId).appendChild(this.pixiApp.view);
    }

    /**
     * return stream from created canvas
     */
    filter() {
        //return stream from canvas with 25 fps
        var stream = this.pixiApp.view.captureStream(25);
        var audioTracks = this.originalStream.getAudioTracks();

        if (audioTracks.length > 0) {
            stream.addTrack(audioTracks[0]);
        }

        return stream;
    }

    pause() {
        this.video.pause();
    }

    play() {
        this.video.play();
    }

    mute() {
        this.video.muted = "true";
    }

}