$(function() {
	// generate unique drone id
	var droneId = Math.random().toString(16).substring(2,15);
	var socket = io.connect('https://686d8f29.ngrok.io');
	var dronelist = $('#dronelist');
	var infobox = $('infobox');
	var connects = {}, droneData = [];
	var options = { enableHighAccuracy: true, maximumAge: Infinity, timeout: Infinity};
	var doc = $(document);

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

	// show only drone data at socket server or browser
	socket.on('show-to-drone', function(data) {	
		if ($(`#${data.droneId}`).length) {
			$(`#${data.droneId}`).text(":>" + " " + "DroneId: " + data.droneId + " " + "Latitude: " + data.latitude + " " + "Longitude: " + data.longitude + " " + "speed: " + data.speed);
		}
		else {
			var para = $('<p>').attr('id', data.droneId).text(":>" + " " + "DroneId: " + data.droneId + " " + "Latitude: " + data.latitude + " " + "Longitude: " + data.longitude + " " + "speed: " + data.speed);
			dronelist.append(para);
		}
	});

	// show all drone data at central server
	socket.on('show', function(data, drones) {
		if(drones !== undefined && drones !== null) {
			droneData = drones;
		}
		if ($(`#${data.droneId}`).length) {
			$(`#${data.droneId}`).text(":>" + " " + "DroneId: " + data.droneId + " " + "Latitude: " + data.latitude + " " + "Longitude: " + data.longitude + " " + "speed: " + data.speed);
		}
		else {
			var para1 = $('<p>').attr('id', data.droneId).text(":>" + " " + "DroneId: " + data.droneId + " " + "Latitude: " + data.latitude + " " + "Longitude: " + data.longitude + " " + "speed: " + data.speed);
			dronelist.append(para1);
		}
	});

	// show current position of drone 
	function positionSuccess(position) {
		var lat =  position.coords.latitude;
		var lng =  position.coords.longitude;
		var speed =  position.coords.speed;
		var data  = {droneId: droneId, latitude: lat, longitude: lng, speed: speed};
		socket.emit('send-data', data);
	}
	
	// drone tracking function
	function getLocation() {
		navigator.geolocation.watchPosition(matchPosition, positionError, options);
	}

	// highlight drone when its not moving more than 10 sec
	function matchPosition(position) {
		var lat1 =  position.coords.latitude;
		var lng1 =  position.coords.longitude;
		var speed1 =  position.coords.speed;
		var data1  = {droneId: droneId, latitude: lat1, longitude: lng1, speed: speed1};
		var coords = new google.maps.LatLng(lat1, lng1);
		var mapOptions = {
			zoom: 15,
			center: coords,
			mapTypeControl: true,
			navigationControlOptions: {
				style: google.maps.NavigationControlStyle.SMALL
			},
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(
			document.getElementById("map"), mapOptions
		);
		var marker;
		droneData.map(d => {
			if(d.latitude === data1.latitude && d.longitude === data1.longitude){
				setInterval(function(){
					$(`#${d.droneId}`).addClass('not-active');
				}, 10000);
			} else {
				socket.emit('send-update-data', data1);
			}
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(d.latitude, d.longitude),
				map: map
			});
		});
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

	// show error function
	function showError(msg) {
		infobox.addClass('error').text(msg);

		doc.click(function() {
			infobox.removeClass('error');
		});
	}

	// match geolocation after every 10 sec.
	setInterval(function(){
		getLocation();
	}, 10000);

});
