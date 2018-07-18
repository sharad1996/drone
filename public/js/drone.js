$(function() {
	// generate unique drone id
	var droneId = Math.random().toString(16).substring(2,15);
	var socket = io.connect('localhost:8000');
	var dronelist = $('#dronelist');
	var infobox = $('infobox');
	var connects = {};

	socket.on('connect', function(){
		socket.emit('send', {droneId: droneId});
	})

	socket.on('load', function(data) {
		connects[data.droneId] = data;
		connects[data.droneId].updated = $.now();
	});

});
