
var map;
console.log("TEST1")
function initialize(){
	console.log("TEST")
	var mapOptions = {
		zoom: 13,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	};

	map = new google.maps.Map(document.getElementById('map'), mapOptions);

	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(position){
			console.log(position);

			var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			var infoWindow =  new google.maps.InfoWindow({
				map: map,
				position: pos,
				content: "I'm here!"
			});

			map.setCenter(pos);
		}, function(error){
			handleNoGeolocation(error);
		});
	}
	else{
		handleNoGeolocation(error);
	}
}

function handleNoGeolocation(error){
	var content = 'Location error';
	if(error){
		console.log(error);
	}

	var options = {
		map: map,
		position: new google.maps.LatLng(60, 105),
		content: content
	};

	var infoWindow = new google.maps.InfoWindow(options);
	map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);