/**
 * Simple signal server
 */
var fs = require("fs");

//certs should be generated for https
var privateKey  = fs.readFileSync('certs/5222964-192.168.0.103.key', 'utf8');
var certificate = fs.readFileSync('certs/5222964-192.168.0.103.cert', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var app = require('express')();
var http = require('http').createServer(app); //use with localhost
//var http = require('https').createServer(credentials, app);
var io = require('socket.io')(http);

app.use(require('express').static('app'));

var rooms = {};

io.on('connection', function(socket){
    console.log('a user connected');

    var room = null;

    /**
     * User requesting room add
     */
    socket.on("room", function(roomId) {
        socket.join(roomId);
        console.log("socket join in room : " + roomId);
        room = roomId;
    });

    /**
     * user will call, emit to another user
     */
    socket.on("calling", function(data) {
        console.log(" =>> calling");
        socket.broadcast.to(room).emit('calling', data);
    });

    /**
     * user send offer
     */
    socket.on("offer", function(data) {
        console.log(" =>> offer");
        console.log(data);
        socket.broadcast.to(room).emit('offer', data);
    });

    /**
     * user send answer
     */
    socket.on("answer", function(data) {
        console.log(" =>> answer");
        console.log(data);
        socket.broadcast.to(room).emit('answer', data);
    });

    /**
     * on ice candidates
     */
    socket.on("ice", function(data) {
        console.log(" =>> ice");
        console.log(data);
        socket.broadcast.to(room).emit('ice', data);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});