$(function() {
	// generate unique drone id
	var droneId = Math.random().toString(16).substring(2,15);
	var socket = io.connect('localhost:8000');
	var dronelist = $('#dronelist');
	var infobox = $('infobox');
	var connects = {};
	var options = { enableHighAccuracy: true, maximumAge: Infinity, timeout: Infinity};

	socket.on('connect', function(){
		socket.emit('send', {droneId: droneId});
	})

	socket.on('load', function(data) {
		connects[data.droneId] = data;
		connects[data.droneId].updated = $.now();
	});

	// check whether browser supports geolocation api
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(positionSuccess, positionError, options);
	} else {
		console.log('error.............');
	}

	//show only drone data at socket server or browser
	socket.on('show-to-drone', function(data) {	
		if ($(`#${data.droneId}`).length) {
			$(`#${data.droneId}`).text(":>" + " " + "DroneId: " + data.droneId + " " + "Latitude: " + data.latitude + " " + "Longitude: " + data.longitude + " " + "speed: " + data.speed);
		}
		else {
			var para1 = $('<p>').attr('id', data.droneId).text(":>" + " " + "DroneId: " + data.droneId + " " + "Latitude: " + data.latitude + " " + "Longitude: " + data.longitude + " " + "speed: " + data.speed);
			dronelist.append(para1);
		}
	});

	//show current position of drone 
	function positionSuccess(position) {
		var lat =  position.coords.latitude;
		var lng =  position.coords.longitude;
		var speed =  position.coords.speed;
		var data  = {droneId: droneId, latitude: lat, longitude: lng, speed: speed};
		socket.emit('send-data', data);
	}

	// handle geolocation api errors
	function positionError(error) {
		var errors = {
			1: 'Authorization fails', // permission denied
			2: 'Can\'t detect your location', //position unavailable
			3: 'Connection timeout' // timeout
		};
		showError('Error:' + errors[error.code]);
	}

	function showError(msg) {
		infobox.addClass('error').text(msg);

		doc.click(function() {
			infobox.removeClass('error');
		});
	}

});
