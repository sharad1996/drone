var http = require('http');
var Static = require('node-static');
var app = http.createServer(handler);
var _ = require('lodash');
var io = require('socket.io').listen(app);
var port = 8000;

var files = new Static.Server('./public');

function handler(request, response) {
  request.on('end', function () {
    files.serve(request, response);
  }).resume();
}

var drones = [];

//start socket programming
io.on('connection', function (socket) {
  
  //drone connected
  console.log(socket.id + " " + "connected");

	//send updated info of all drones
  socket.on('send-data', function (data) {
    const drone = {...data, socketId: socket.id}
    socket.emit('show-to-drone', data);
    drones.push(drone);
  });

  //disconnect drone
  socket.on('disconnect', function () {
    console.log(socket.id + " " + "disconnected");
  });
});

// start app on specified port
app.listen(port);
console.log('Your server goes on localhost:' + port);