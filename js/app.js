var map;
var infowindow;
var markers = [];

// List of interesting places in Austin - locationList
var locations = [{
	title: 'McKinney Falls State Park',
	location: {
		lat: 30.1768058,
		lng: -97.7214234
	}
}, {
	title: 'Zilker Park',
	location: {
		lat: 30.2660703,
		lng: -97.7691348
	}
}, {
	title: 'Rainey Street',
	location: {
		lat: 30.25791169999999,
		lng: -97.7390973
	}
}, {
	title: 'Bullock Texas State History Museum',
	location: {
		lat: 30.2802961,
		lng:  -97.739171
	}
}, {
	title: 'Auditorium Shores',
	location: {
		lat: 30.2627167,
		lng: -97.7515303
	}
}, {
	title: 'Congress Ave. Bridge - Bat Watching',
	location: {
		lat: 30.2634927802915,
		lng: -97.74370741970849
	}
}, ];

//INITIATE MAP FUNCTION
function initMap() {
	'use strict';
	var styles = [{
		featureType: 'water',
		stylers: [{
			color: '#42acb2'
		}]
	}, {
		featureType: 'administrative',
		elementType: 'labels.text.stroke',
		stylers: [{
			color: '#ffffff'
		}, {
			weight: 4
		}]
	}, {
		featureType: 'administrative',
		elementType: 'labels.text.fill',
		stylers: [{
			color: '#7dcb81'
		}]
	}, {
		featureType: 'road.highway',
		elementType: 'geometry.stroke',
		stylers: [{
			color: '#efe9e4'
		}, {
			lightness: -40
		}]
	}, {
		featureType: 'transit.station',
		stylers: [{
			weight: 8
		}, {
			hue: '#7dcb81'
		}]
	}, {
		featureType: 'road.highway',
		elementType: 'labels.icon',
		stylers: [{
			visibility: 'off'
		}]
	}, {
		featureType: 'water',
		elementType: 'labels.text.stroke',
		stylers: [{
			lightness: 90
		}]
	}, {
		featureType: 'water',
		elementType: 'labels.text.fill',
		stylers: [{
			lightness: -100
		}]
	}, {
		featureType: 'poi',
		elementType: 'geometry',
		stylers: [{
			visibility: 'on'
		}, {
			color: '#f0e4d3'
		}]
	}, {
		featureType: 'road.highway',
		elementType: 'geometry.fill',
		stylers: [{
			color: '#efe9e4'
		}, {
			lightness: -25
		}]
	}];

function googleError() {
  window.alert("I'm sorry there has been an error with Google Maps.");
}

// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 30.267153,
			lng: -97.7430608
		},
		zoom: 13,
		styles: styles
	});


	var Location = function(location, i) {
		this.title = location.title;
		this.marker = markers[i];
	};
	
//VIEW MODEL
	var viewModel = function() {
		var self = this;

		this.locationList = ko.observableArray([]);
		
		locations.forEach(function(location, i) {
			self.locationList.push(new Location(location, i));
		});
		
		this.currentLocation = ko.observable( this.locationList()[0] );
		
		//Make list clickable.....
		//click bind
		this.setList = function(locationList) {
			//infowindow.open(map, marker);
			//populateInfoWindow(marker, infowindow);
			console.log('hi');
		};		

	};
	ko.applyBindings(new viewModel());
	
	
	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();

	// Marker Styles
	var defaultIcon = makeMarkerIcon('bde4c0');

	// Marker mouse over
	var highlightedIcon = makeMarkerIcon('7ec8cc');

	function makeMarkerIcon(markerColor) {
		var markerImage = new google.maps.MarkerImage(
			'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
			'|40|_|%E2%80%A2',
			new google.maps.Size(21, 34),
			new google.maps.Point(0, 0),
			new google.maps.Point(10, 34),
			new google.maps.Size(21, 34));
		return markerImage;
	}

	// The following group uses the location array to create an array of markers on initialize.
	for (var i = 0; i < locations.length; i++) {
		// Get the position from the location array.
		var position = locations[i].location;
		var title = locations[i].title;
		// Create a marker per location, and put into markers array.
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			icon: defaultIcon,
			id: i
		});
		// Push the marker to our array of markers.
		markers.push(marker);
		// Create an onclick event to open an infowindow at each marker.
		marker.addListener('click', function() {
			populateInfoWindow(this, largeInfowindow);
		});
		// Two event listeners - one for mouseover, one for mouseout, to change the colors back and forth.
		marker.addListener('mouseover', function() {
			this.setIcon(highlightedIcon);
		});
		marker.addListener('mouseout', function() {
			this.setIcon(defaultIcon);
		});
		bounds.extend(markers[i].position);
	}
	// Extend the boundaries of the map for each marker
	map.fitBounds(bounds);
}

// Populates the infowindow when the marker is clicked. 
function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker !== marker) {
          infowindow.setContent('');
          infowindow.marker = marker;
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          function getStreetView(data, status) {
            if (status === google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          infowindow.open(map, marker);
        }
}
