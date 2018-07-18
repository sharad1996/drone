$(function() {
	// generate unique drone id
	var droneId = Math.random().toString(16).substring(2,15);
	var socket = io.connect('https://e7cc53b1.ngrok.io');
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
			var para1 = $('<p>').attr('id', data.droneId).text(":>" + " " + "DroneId: " + data.droneId + " " + "Latitude: " + data.latitude + " " + "Longitude: " + data.longitude + " " + "speed: " + data.speed);
			dronelist.append(para1);
		}
	});

	// show all drone data at central server
	socket.on('show', function(data) {	
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
		
		var coords = new google.maps.LatLng(lat, lng);
		var mapOptions = {
			zoom: 15,
			center: coords,
			mapTypeControl: true,
			navigationControlOptions: {
					style: google.maps.NavigationControlStyle.SMALL
			},
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(
			document.getElementById("map"), mapOptions
		);

		// set marker on map
		var marker = new google.maps.Marker({
			position: coords,
			map: map,
			title: "Your current location!"
		});

		droneData.push(data);
		
		socket.emit('send-data', data);
	}
	
	// drone tracking function
	function getLocation() {
		navigator.geolocation.watchPosition(matchPosition, positionError, options);
	}

	// highlight drone when its not moving more than 10 sec
	function matchPosition(position) {
		var lat =  position.coords.latitude;
		var lng =  position.coords.longitude;
		var speed =  position.coords.speed;
		var data  = {droneId: droneId, latitude: lat, longitude: lng, speed: speed};
		droneData.map(d => {
			if(d.droneId === data.droneId && d.latitude === data.latitude && d.longitude === d.longitude){
				setInterval(function(){
					$(`#${data.droneId}`).addClass('not-active');
				}, 10000);
			} else {
				var coords = new google.maps.LatLng(lat, lng);
				var mapOptions = {
					zoom: 15,
					center: coords,
					mapTypeControl: true,
					navigationControlOptions: {
							style: google.maps.NavigationControlStyle.SMALL
					},
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				map = new google.maps.Map(
					document.getElementById("map"), mapOptions
				);

				// set marker on map
				var marker = new google.maps.Marker({
					position: coords,
					map: map,
					title: "Your current location!"
				});

				socket.emit('send-update-data', data);
			}
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
