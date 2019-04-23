/*
TABLE OF CONTENTS 


	1. Variables and document ready
		1.1 - Variables are defined
		1.2 - Document ready function
		1.3 - Calls registered AJAX function from PHP file

	2. MAP FUNCTIONS
		2.1 - dml_initiate_Map()			Initiates map
		2.2 - Load_Dml_Map_Api() 			Loads GOOGLE MAP API if page does not have API code 
		2.3 - dml_Load_Map()				Load Google Map with default GOOGLE MAP styles (sattelite, terrain, roadmap)
		2.4 - dml_load_JSON()				Load Google Map with customized style if selected
		2.5	- dml_init_Map() 				Binds Google Map

	3. MARKER FUNCTIONS
		3.1 - dml_add_Cluster_Markers()		Adds temporary marker when clicked on the map
		3.2 - dml_add_Lines() 				Draws lines on the map 
		3.3 - dml_add_Polygons() 			Draws polygones on the map 
		3.3.1 dml_add_Circles() 			Draw circles on the map
		3.4 - dml_delete_Markers() 			Clears markers 
			  dml_clear_Markers()			
		3.5 - dml_set_Map_On_All()			Sets the map on all markers in the array.
		3.6 - dml_add_for_distance() 		Add marker for distance measurement
		3.7 - dml_Compute_Distance() 		Calculates distance and drwas lines
		3.8 - dml_toRad() 					Helper function to calculate distance
		3.9 - dml_Reset_Distance_Elements() Resets distance compute markers and route
		3.10- dml_add_Marker() 				Creates temp marker to calculate distance 
		3.11- dml_Clear_Temp_Marker			Clear temporary marker from the map 
	
	4. HELPER FUNCTIONS 
		4.1	- dmlWriteInfoImageHelper() 	Shows image on the info window
		4.2	- dmlWriteInfoVideoHelper() 	Shows video on the info window
		4.3	- dmlWriteInfoLink() 			Shows link on the info window

*/


// 1	- VARIABLES
// 1.1  - Variables
var dml_map_wpajax_url;

var dmlmap;
var dmlmarkers = []; //It's core array and used to locate markers on the map
var dmlDbMarkers = []; //It's temporary array and used to clear all db markers on the map
var dmlmyArr = [];
var dmlDbStatus = 0;
var dmlApiStatus = 0;

// Variables for distance between two points
var dmlDistLocation1_lat;
var dmlDistLocation1_lng;
var dmlDistLocation2_lat;
var dmlDistLocation2_lng;
var dmlDistStatus = 0;
var directionsDisplay; //will be used to clear distance route
var dmlDistmarker1; //will be used to clear distance marker1
var dmlDistmarker2; //will be used to clear distance marker2
var dmlDistline; //will be used to clear distance straight line
var newMarker = ""; //will be used to clear temporary marker

var PolylineInfoWindow = null;
var PolygoninfoWindow = null;
var CircleInfoWindow = null;

var inherits = function (childCtor, parentCtor) {
	/** @constructor */
	function tempCtor() { };
	tempCtor.prototype = parentCtor.prototype;
	childCtor.superClass_ = parentCtor.prototype;
	childCtor.prototype = new tempCtor();
	childCtor.prototype.constructor = childCtor;
};

// 1.2 - Document ready function
jQuery(document).ready(function () {
	// setup our wp ajax URL
	dml_map_wpajax_url = dml_pub_php_links.UrlofPubAdmin + 'admin-ajax.php';
	dml_Call_Ajax(1);


	// End of Document Ready
});
// 1.3 - Calls registered AJAX function from PHP file
function dml_Call_Ajax(AjaxType) {
	// Determines AJAX parameters according to the action
	if (AjaxType == 1) {
		// Gets the map data and dml_init_Map
		var ajax_data = {
			action: "dml_call_ajax",
			dml_backend_function: AjaxType,
			dml_page_link: jQuery(location).attr('href'),
		}
	} else if (AjaxType == 2) {
		// Creates new map record and dml_init_Map
		var ajax_data = {
			action: "dml_call_ajax",
			dml_backend_function: AjaxType,
			dml_page_link: jQuery(location).attr('href'),
			dml_api_code: jQuery("#dmlTxtApiKey").val(),
		}
	} else if (AjaxType == 3) {
		// Saves map settings
		var ajax_data = {
			action: "dml_call_ajax",
			dml_backend_function: AjaxType,
			dml_page_link: jQuery(location).attr('href'),
			dml_post_id: dmlmyArr[0].dml_id,
			dml_api_code: jQuery("#dmlMapApiCode").val(),
			dml_height_title: jQuery("#dmlMapHeight").val(),
			dml_fill_color: dmlmyArr[0].dml_fill_color,
			dml_zoom_icon: jQuery("#dmlMapZoom").val(),
		}
	}

	// Calls AJAX
	jQuery.ajax({
		'method': 'post',
		'url': dml_map_wpajax_url,
		'data': ajax_data,
		'dataType': 'json',
		'cache': false,
		'success': function (data, textStatus) {
			console.log(data);

			if (data.status == 2) {
				jQuery("#dmlMapContainer").hide();
				if (jQuery("#dmlmyMap1Edit").html() == 1) {
					jQuery("#dmlApiDiv").show();
				}
			} else {
				dml_initiate_Map(data);
			}
		},
		'error': function (jqXHR, textStatus, errorThrown) {
			alert("Error occured");
			// ajax didn't work
		}

	});

}

// 2	- MAP FUNCTIONS
// 2.1 	- Initiates map
function dml_initiate_Map(data) {
	dmlmyArr = data;
	var myLenght = dmlmyArr.length;

	if (myLenght == 0) {
		// There is table without data. So, shows API panel
		jQuery("#dmlMapContainer").hide();
		if (jQuery("#dmlmyMap1Edit").html() == 1) {
			jQuery("#dmlApiDiv").show();
		}
	} else {
		jQuery("#dmlMapContainer").show();
		jQuery("#dmlApiDiv").hide();
		if (dmlApiStatus == 0) {
			Load_Dml_Map_Api(dmlmyArr[0].dml_maptype__markerdesc);
		} else {
			dml_Load_Map();
		}
	}
}
// 2.2	- Loads GOOGLE MAP API if page does not have API code 
function Load_Dml_Map_Api(myApi) {
	var script = document.createElement("script");
	script.src = "https://maps.google.com/maps/api/js?key=" + myApi + "&v=3&libraries=drawing&callback=dml_Load_Map";
	script.id = "dmlMapApi";
	document.getElementsByTagName("head")[0].appendChild(script);
	dmlApiStatus = 1;
}
// 2.3	- Load Google Map with default GOOGLE MAP styles (sattelite, terrain, roadmap)
function dml_Load_Map() {
	var myMapType = dmlmyArr[0].dml_fill_color;
	if (myMapType == "1" || myMapType == "2" || myMapType == "3") {
		dml_init_Map(myMapType);
	} else {
		dml_load_JSON(myMapType);
	}
}
// 2.4	- Load Google Map with customized style if selected
function dml_load_JSON(myStyleNu) {
	if (myStyleNu == 0) {
		var myStyleCode = dmlmyArr[0].dml_border_color;
		try {
			var c = jQuery.parseJSON(myStyleCode);
			dml_init_Map(myStyleCode);
		}
		catch (err) {
			alert('It is not a valid JSON STYLE format. Please reload the map. If you continue receiving this message, please refer to the documentation');
			dml_init_Map(1);
		}
	} else {
		var myStyleFile = dml_pub_php_links.UrlofPubPlugin + "/dml-easy-map/styles/style" + myStyleNu + ".json";
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', myStyleFile, true); // Replace 'my_data' with the path to your file
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {
				dml_init_Map(xobj.responseText);
			}
		};
		xobj.send(null);
	}
}
// 2.5	- Binds Google Map
function dml_init_Map(myStyle) {
	var dmlLayerStatusArr = [];
	if (dmlDbStatus == 0) {
		//jQuery("#dmlMapContainer").show();
		jQuery("#dmlmap").attr('style', 'width: 100%; height: ' + dmlmyArr[0].dml_height_title + 'px; margin: 0; padding: 0;');
		var haightAshbury = { lat: parseFloat(dmlmyArr[0].dml_lat), lng: parseFloat(dmlmyArr[0].dml_lng) };

		// LAYERS
		// ***********************************************************
		// Binds Layer data. If there is no postmeta related with layers, it is set as 0_0_0
		// Fourth number is SCROOL_LOCK. 
		dmlLayerStatusArr = dmlmyArr[0].dml_layers.split("_");
		var dmlScrollLock = true;
		// SCROLL_LOCK value is being prepared for the map
		if ( !dmlLayerStatusArr[3] || dmlLayerStatusArr[3] == 0 ) {
			dmlScrollLock = true;
		} else {
			dmlScrollLock = false;
		}

		if (myStyle == "1" || myStyle == "2" || myStyle == "3") {
			dmlmap = new google.maps.Map(document.getElementById('dmlmap'), {
				zoom: parseInt(dmlmyArr[0].dml_zoom_icon),
				center: haightAshbury,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				scrollwheel: dmlScrollLock,
			});

			// Determines map type
			if (myStyle == "1") {
				//Displays a normal, default 2D map
				dmlmap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
			} else if (myStyle == "2") {
				//Displays a photographic map
				dmlmap.setMapTypeId(google.maps.MapTypeId.SATELLITE);
			} else if (myStyle == "3") {
				//Displays a map with mountains, rivers, etc.
				dmlmap.setMapTypeId(google.maps.MapTypeId.TERRAIN);
			}
		} else {
			dmlmap = new google.maps.Map(document.getElementById('dmlmap'), {
				zoom: parseInt(dmlmyArr[0].dml_zoom_icon),
				center: haightAshbury,
				styles: JSON.parse(myStyle),
				scrollwheel: dmlScrollLock,
			});
		}

		dmlDbStatus = 1;


	}

	dmlmap.addListener('rightclick', function (event) {
		dml_add_Marker(event.latLng);
	});

	// Traffic layer activation
	if (dmlLayerStatusArr[0] == 1) {
		var trafficLayer = new google.maps.TrafficLayer();
		trafficLayer.setMap(dmlmap);
	}

	// Transit layer activation
	if (dmlLayerStatusArr[1] == 1) {
		var transitLayer = new google.maps.TransitLayer();
		transitLayer.setMap(dmlmap);
	}

	// Bicycle layer activation
	if (dmlLayerStatusArr[2] == 1) {
		var bikeLayer = new google.maps.BicyclingLayer();
		bikeLayer.setMap(dmlmap);
	}

	// Adds a markers at the map.
	dml_add_Cluster_Markers();
	dml_add_Lines();
	dml_add_Polygons();
	dml_add_Circles();
}


// 3	- MARKER FUNCTIONS
// 3.1.1- Custom Marker
function Marker(options) {
	google.maps.Marker.apply(this, arguments);

	if (options.map_icon_label) {
		this.MarkerLabel = new MarkerLabel({
			map: this.map,
			marker: this,
			text: options.map_icon_label
		});
		this.MarkerLabel.bindTo('position', this, 'position');
	}
}
// 3.1.2- Custom Marker SetMap
Marker.prototype.setMap = function () {
	google.maps.Marker.prototype.setMap.apply(this, arguments);
	(this.MarkerLabel) && this.MarkerLabel.setMap.apply(this.MarkerLabel, arguments);
};
// 3.1.3- Marker Label Overlay
var MarkerLabel = function (options) {
	var self = this;
	this.setValues(options);

	// Create the label container
	this.div = document.createElement('div');
	this.div.className = 'map-icon-label';

	// Trigger the marker click handler if clicking on the label
	google.maps.event.addDomListener(this.div, 'click', function (e) {
		(e.stopPropagation) && e.stopPropagation();
		google.maps.event.trigger(self.marker, 'click');
	});
};
// 3.1	- Adds temporary marker when clicked on the map
function dml_add_Cluster_Markers() {
	var infowindow = new google.maps.InfoWindow({});
	var marker, i;
	var imagePath = dml_pub_php_links.UrlofPubPlugin + "/dml-easy-map/icons/";

	var dmlClusterArr = [];

	// Apply the inheritance
	inherits(Marker, google.maps.Marker);

	// Create MarkerLabel Object
	MarkerLabel.prototype = new google.maps.OverlayView;

	// Marker Label onAdd
	MarkerLabel.prototype.onAdd = function () {
		var pane = this.getPanes().overlayImage.appendChild(this.div);
		var self = this;

		this.listeners = [
			google.maps.event.addListener(this, 'position_changed', function () { self.draw(); }),
			google.maps.event.addListener(this, 'text_changed', function () { self.draw(); }),
			google.maps.event.addListener(this, 'zindex_changed', function () { self.draw(); })
		];
	};

	// Marker Label onRemove
	MarkerLabel.prototype.onRemove = function () {
		this.div.parentNode.removeChild(this.div);

		for (var i = 0, I = this.listeners.length; i < I; ++i) {
			google.maps.event.removeListener(this.listeners[i]);
		}
	};

	// Implement draw
	MarkerLabel.prototype.draw = function () {
		var projection = this.getProjection();
		var position = projection.fromLatLngToDivPixel(this.get('position'));
		var div = this.div;

		this.div.innerHTML = this.get('text').toString();

		div.style.zIndex = this.get('zIndex'); // Allow label to overlay marker
		div.style.position = 'absolute';
		div.style.display = 'block';
		div.style.left = (position.x - (div.offsetWidth / 2)) + 'px';
		div.style.top = (position.y - div.offsetHeight) + 'px';

	};

	for (var i = 0; i < dmlmyArr.length; i++) {
		if (dmlmyArr[i].dml_record_type == "R") {
			dmlClusterArr.push({
				dml_id: dmlmyArr[i].dml_id,
				dml_lat: dmlmyArr[i].dml_lat,
				dml_lng: dmlmyArr[i].dml_lng,
				dml_zoom_icon: dmlmyArr[i].dml_zoom_icon,
				dml_height_title: dmlmyArr[i].dml_height_title,
				dml_maptype__markerdesc: dmlmyArr[i].dml_maptype__markerdesc,
				dml_image_link: dmlmyArr[i].dml_image_link,
				dml_video_link: dmlmyArr[i].dml_video_link,
				dml_link_text: dmlmyArr[i].dml_link_text,
				dml_link_url: dmlmyArr[i].dml_link_url
			});
		}
	}

	var markers = dmlClusterArr.map(function (location, i) {

		if (dmlClusterArr[i].dml_zoom_icon < 200) {
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(dmlClusterArr[i].dml_lat, dmlClusterArr[i].dml_lng),
				map: dmlmap,
				icon: imagePath + dmlClusterArr[i].dml_zoom_icon + ".png"
			});
		} else {
			var MarkerArr = [];
			MarkerArr = dmlClusterArr[i].dml_zoom_icon.split("_");
			marker = new Marker({
				map: dmlmap,
				position: new google.maps.LatLng(dmlClusterArr[i].dml_lat, dmlClusterArr[i].dml_lng),
				icon: {
					path: dml_Container_Path(MarkerArr[1]),
					fillColor: '#' + MarkerArr[2],
					fillOpacity: 1,
					strokeColor: '',
					strokeWeight: 0
				},
				map_icon_label: '<span id="' + dmlClusterArr[i].dml_id + '_Label" class="map-icon i' + MarkerArr[0] + '"></span>'
			});

		}

		google.maps.event.addListener(marker, 'click', (function (marker, i) {
			return function () {
				infowindow.setContent('<strong>' + dmlClusterArr[i].dml_height_title + '</strong>' + dmlWriteInfoImageHelper(dmlClusterArr[i].dml_id, dmlClusterArr[i].dml_image_link) + dmlWriteInfoVideoHelper(dmlClusterArr[i].dml_id, dmlClusterArr[i].dml_video_link) + '<div style="width: 250px;">' + dmlClusterArr[i].dml_maptype__markerdesc + '</div>' + dmlWriteInfoLink(dmlClusterArr[i].dml_id, dmlClusterArr[i].dml_link_text, dmlClusterArr[i].dml_link_url) + '<div class="dmlselectdistancediv" onclick="dml_add_for_distance(' + dmlClusterArr[i].dml_lat + ', ' + dmlClusterArr[i].dml_lng + ');">Calculate distance</div>');
				infowindow.open(dmlmap, marker);
			}
		})(marker, i));

		dmlDbMarkers.push(marker);

		return marker;
	});

	var clusterStyles = [
		{
			textColor: 'black',
			url: dml_pub_php_links.UrlofPubPlugin + '/dml-easy-map/icons/m1.png',
			height: 52,
			width: 53,
			textSize: 12
		},
		{
			textColor: 'black',
			url: dml_pub_php_links.UrlofPubPlugin + '/dml-easy-map/icons/m2.png',
			height: 56,
			width: 55,
			textSize: 12
		},
		{
			textColor: 'black',
			url: dml_pub_php_links.UrlofPubPlugin + '/dml-easy-map/icons/m3.png',
			height: 66,
			width: 65,
			textSize: 12
		}
	];
	var mcOptions = {
		gridSize: 50,
		styles: clusterStyles,
		maxZoom: 15
	};
	var markerCluster = new MarkerClusterer(dmlmap, markers, mcOptions);

	google.maps.event.addListener(dmlmap, "idle", function () {
		var myCount = 0;
		var myMarkerID;
		for (var i = 0; i < markers.length; i++) {
			var mrkr = markers[i];
			if (mrkr.getMap() != null) {
				//myCount++;
			}
			else {
				myCount++;
				myMarkerID = myMarkerID + '_' + dmlClusterArr[i].dml_id;
				jQuery('#' + dmlClusterArr[i].dml_id + '_Label').hide();
			}
		}
	});
}
// 3.1.4- Draws containers
function dml_Container_Path(myContainerName) {
	var myPath;
	//if (myContainerName == 'DmlMarkerSquarePin') {
	if (myContainerName == 191) {
		// 191 Marker Pin
		myPath = 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z';
	} else if (myContainerName == 192) {
		// 192 Square Pin
		myPath = 'M22-48h-44v43h16l6 5 6-5h16z';
	} else if (myContainerName == 193) {
		// 193 Shield
		myPath = 'M18.8-31.8c.3-3.4 1.3-6.6 3.2-9.5l-7-6.7c-2.2 1.8-4.8 2.8-7.6 3-2.6.2-5.1-.2-7.5-1.4-2.4 1.1-4.9 1.6-7.5 1.4-2.7-.2-5.1-1.1-7.3-2.7l-7.1 6.7c1.7 2.9 2.7 6 2.9 9.2.1 1.5-.3 3.5-1.3 6.1-.5 1.5-.9 2.7-1.2 3.8-.2 1-.4 1.9-.5 2.5 0 2.8.8 5.3 2.5 7.5 1.3 1.6 3.5 3.4 6.5 5.4 3.3 1.6 5.8 2.6 7.6 3.1.5.2 1 .4 1.5.7l1.5.6c1.2.7 2 1.4 2.4 2.1.5-.8 1.3-1.5 2.4-2.1.7-.3 1.3-.5 1.9-.8.5-.2.9-.4 1.1-.5.4-.1.9-.3 1.5-.6.6-.2 1.3-.5 2.2-.8 1.7-.6 3-1.1 3.8-1.6 2.9-2 5.1-3.8 6.4-5.3 1.7-2.2 2.6-4.8 2.5-7.6-.1-1.3-.7-3.3-1.7-6.1-.9-2.8-1.3-4.9-1.2-6.4z';
	} else if (myContainerName == 194) {
		// 194 Square
		myPath = 'M-24-48h48v48h-48z';
	}  else if (myContainerName == 195) {
		// 195 Route
		myPath = 'M24-28.3c-.2-13.3-7.9-18.5-8.3-18.7l-1.2-.8-1.2.8c-2 1.4-4.1 2-6.1 2-3.4 0-5.8-1.9-5.9-1.9l-1.3-1.1-1.3 1.1c-.1.1-2.5 1.9-5.9 1.9-2.1 0-4.1-.7-6.1-2l-1.2-.8-1.2.8c-.8.6-8 5.9-8.2 18.7-.2 1.1 2.9 22.2 23.9 28.3 22.9-6.7 24.1-26.9 24-28.3z';
	}  else if (myContainerName == 196) {
		// 196 Square rounded
		myPath = 'M24-8c0 4.4-3.6 8-8 8h-32c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h32c4.4 0 8 3.6 8 8v32z';
	}

	return myPath;
}
// 3.2	- Draws lines on the map
function dml_add_Lines() {
	var addListenersOnPolyline = function (polyline, myLineDescription, myImageLink, myVideoLink, myLinkText, myLinkUrl) {
		google.maps.event.addListener(polyline, 'click', function (event) {
			if ( PolylineInfoWindow ) {
				PolylineInfoWindow.close();
			}
			PolylineInfoWindow = new google.maps.InfoWindow;
			var contentString = dmlShapeInfoWindowContent(myLineDescription, myImageLink, myVideoLink, myLinkText, myLinkUrl);
			PolylineInfoWindow.setContent(contentString);
			PolylineInfoWindow.setPosition(event.latLng);
			PolylineInfoWindow.open(dmlmap);
		});
	}
	for (var i = 0; i < dmlmyArr.length; i++) {
		if (dmlmyArr[i].dml_record_type == "L") {
			var MultiLineCorners = [];
			var LatArr = dmlmyArr[i].dml_lat.split("_");
			var LngArr = dmlmyArr[i].dml_lng.split("_");
			var myLineColor = dmlmyArr[i].dml_border_color;
			var myLineID = dmlmyArr[i].dml_id;
			var myLineDescription = dmlmyArr[i].dml_maptype__markerdesc;
			for (var k = 0; k < LatArr.length; k++) {
				MultiLineCorners.push({
					lat: parseFloat(LatArr[k]),
					lng: parseFloat(LngArr[k])
				});
			}
			var MultiFlightPath = new google.maps.Polyline({
				path: MultiLineCorners,
				geodesic: true,
				strokeColor: myLineColor,
				strokeOpacity: 1.0,
				strokeWeight: 5,
				indexID: myLineID
			});
			MultiFlightPath.setMap(dmlmap);

			addListenersOnPolyline(MultiFlightPath, myLineDescription, dmlmyArr[i].dml_image_link, dmlmyArr[i].dml_video_link, dmlmyArr[i].dml_link_text, dmlmyArr[i].dml_link_url);
		}
	}
}
// 3.3	- Draws polygones on the map
function dml_add_Polygons() {
	var addListenersOnPolygon = function (polygon, myPolygonDesc, myImageLink, myVideoLink, myLinkText, myLinkUrl, myFillColor, myFillHoverColor) {
		
		google.maps.event.addListener(polygon, 'click', function (event) {
			if ( PolygoninfoWindow ) {
				PolygoninfoWindow.close();
			}
			PolygoninfoWindow = new google.maps.InfoWindow;			
			var contentString = dmlShapeInfoWindowContent(myPolygonDesc, myImageLink, myVideoLink, myLinkText, myLinkUrl);
			PolygoninfoWindow.setContent(contentString);
			PolygoninfoWindow.setPosition(event.latLng);
			PolygoninfoWindow.open(dmlmap);
		});


	}
	for (var i = 0; i < dmlmyArr.length; i++) {
		if (dmlmyArr[i].dml_record_type == "P") {
			var MultiPolygonCorners = [];
			var LatArr = dmlmyArr[i].dml_lat.split("_");
			var LngArr = dmlmyArr[i].dml_lng.split("_");
			var myLineColor = dmlmyArr[i].dml_border_color;
			var myFillColorArr = [];
			var myFillColor;
			var myFillHoverColor;
			myFillColorArr = dmlmyArr[i].dml_fill_color.split("_");
			if ( myFillColorArr.length == 1 ) {
				myFillColor = myFillColorArr[0];
				myFillHoverColor = myFillColorArr[0];
			} else {
				myFillColor = myFillColorArr[0];
				myFillHoverColor = myFillColorArr[1];
			}
			
			var myDescription = dmlmyArr[i].dml_maptype__markerdesc;
			var myPolygonID = dmlmyArr[i].dml_id;
			for (var k = 0; k < LatArr.length; k++) {
				MultiPolygonCorners.push({
					lat: parseFloat(LatArr[k]),
					lng: parseFloat(LngArr[k])
				});
			}
			var MultiBermudaTriangle = new google.maps.Polygon({
				paths: MultiPolygonCorners,
				strokeColor: myLineColor,
				strokeOpacity: 0.7,
				strokeWeight: 4,
				fillColor: myFillColor,
				fillOpacity: 0.35,
				indexID: myPolygonID
			});
			MultiBermudaTriangle.setMap(dmlmap);

			addListenersOnPolygon(MultiBermudaTriangle, myDescription, dmlmyArr[i].dml_image_link, dmlmyArr[i].dml_video_link, dmlmyArr[i].dml_link_text, dmlmyArr[i].dml_link_url, myFillColor, myFillHoverColor);

		}
	}
}
// 3.3.1- Draw Circles on the map
function dml_add_Circles() {

	var addListenersOnCircles = function (myCircle, myCircleDesc, myImageLink, myVideoLink, myLinkText, myLinkUrl, myFillColor, myFillHoverColor) {
		
		google.maps.event.addListener(myCircle, 'click', function (event) {
			if ( CircleInfoWindow ) {
				CircleInfoWindow.close();
			}
			CircleInfoWindow = new google.maps.InfoWindow;
			var contentString = dmlShapeInfoWindowContent(myCircleDesc, myImageLink, myVideoLink, myLinkText, myLinkUrl);
			CircleInfoWindow.setContent(contentString);
			CircleInfoWindow.setPosition(event.latLng);
			CircleInfoWindow.open(dmlmap);
		});


	}

	for (var i = 0; i < dmlmyArr.length; i++) {
		if (dmlmyArr[i].dml_record_type == "C") {

			var myFillColorArr = [];
			var myFillColor;
			var myFillHoverColor;
			myFillColorArr = dmlmyArr[i].dml_fill_color.split("_");
			if ( myFillColorArr.length == 1 ) {
				myFillColor = myFillColorArr[0];
				myFillHoverColor = myFillColorArr[0];
			} else {
				myFillColor = myFillColorArr[0];
				myFillHoverColor = myFillColorArr[1];
			}

			var dmlCircle = new google.maps.Circle({
				strokeColor: dmlmyArr[i].dml_border_color,
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: myFillColor,
				fillOpacity: 0.35,
				map: dmlmap,
				center: { lat: parseFloat(dmlmyArr[i].dml_lat), lng: parseFloat(dmlmyArr[i].dml_lng) },
				radius: parseFloat(dmlmyArr[i].dml_zoom_icon),
				indexID: dmlmyArr[i].dml_id
			});
			dmlCircle.setMap(dmlmap);

			addListenersOnCircles(dmlCircle, dmlmyArr[i].dml_maptype__markerdesc, dmlmyArr[i].dml_image_link, dmlmyArr[i].dml_video_link, dmlmyArr[i].dml_link_text, dmlmyArr[i].dml_link_url, myFillColor, myFillHoverColor);

		}
	}
}
// 3.4	- Clear markers
function dml_delete_Markers() {
	// Deletes all markers in the array by removing references to them.
	dml_clear_Markers();
	dmlmarkers = [];
}
function dml_clear_Markers() {
	// Removes the markers from the map, but keeps them in the array.
	dml_set_Map_On_All(null);
}
// 3.5	- Sets the map on all markers in the array.
function dml_set_Map_On_All(dmlmap) {
	// Sets the map on all markers in the array.
	for (var i = 0; i < dmlmarkers.length; i++) {
		dmlmarkers[i].setMap(dmlmap);
	}
}
// 3.6	- Add marker for distance measurement
function dml_add_for_distance(distLat, distLng) {
	if (dmlDistStatus == 0) {
		dmlDistLocation1_lat = distLat;
		dmlDistLocation1_lng = distLng;
		dmlDistStatus = 1;
		alert("Select a second location or a marker.");
		jQuery("#distance_road").html('<hr /<span class="dmlselectdistancediv" onclick="dml_Reset_Distance_Elements();" >Reset calculation</span><br/>First location : ' + dmlDistLocation1_lat + ' - ' + dmlDistLocation1_lng);
	} else if (dmlDistStatus == 1) {
		//Checks if selected second point is the same with forst one
		if (dmlDistLocation1_lat == distLat && dmlDistLocation1_lng == distLng) {
			alert("Selected location is the same with the first one. Please select another location.");
		} else {
			dmlDistLocation2_lat = distLat;
			dmlDistLocation2_lng = distLng;
			dmlDistStatus = 2;
			dml_Compute_Distance();
		}
	} else {
		alert("You have selected 2 points. To compute new distance you have to clear current calculation.");
	}
}
// 3.7	- Calculates distance and draws lines
function dml_Compute_Distance() {
	// show route between the points
	var directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer(
		{
			suppressMarkers: true,
			suppressInfoWindows: true
		});
	directionsDisplay.setMap(dmlmap);
	var dmlOriginLocation = { lat: parseFloat(dmlDistLocation1_lat), lng: parseFloat(dmlDistLocation1_lng) };
	var dmlDestinationLocation = { lat: parseFloat(dmlDistLocation2_lat), lng: parseFloat(dmlDistLocation2_lng) };
	var request = {
		origin: dmlOriginLocation,
		destination: dmlDestinationLocation,
		travelMode: google.maps.DirectionsTravelMode.DRIVING
	};
	directionsService.route(request, function (response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
			distance = '<hr /><span class="dmlselectdistancediv" onclick="dml_Reset_Distance_Elements();" >Reset calculation</span><br/>First location : ' + dmlDistLocation1_lat + ' - ' + dmlDistLocation1_lng + '<br />Second location : ' + dmlDistLocation2_lat + ' - ' + dmlDistLocation2_lng;
			distance += "<br/>The distance between the two points on the chosen route is: <b>" + response.routes[0].legs[0].distance.text + "</b>";
			distance += "<br/>The aproximative driving time is: <b>" + response.routes[0].legs[0].duration.text + "</b>";
			jQuery("#distance_road").html(distance);
		}
	});

	// show a line between the two points
	dmlDistline = new google.maps.Polyline({
		map: dmlmap,
		path: [dmlOriginLocation, dmlDestinationLocation],
		strokeWeight: 7,
		strokeOpacity: 0.8,
		strokeColor: "#FF0000"
	});

	// create the markers for the two locations		
	dmlDistmarker1 = new google.maps.Marker({
		map: dmlmap,
		position: dmlOriginLocation,
		title: "First location"
	});
	dmlDistmarker2 = new google.maps.Marker({
		map: dmlmap,
		position: dmlDestinationLocation,
		title: "Second location"
	});

	// compute distance between the two points
	var R = 6371;
	var myLatDegfor_toRoad = parseFloat(dmlDestinationLocation.lat) - parseFloat(dmlOriginLocation.lat);
	var myLngDegfor_toRoad = parseFloat(dmlDestinationLocation.lng) - parseFloat(dmlOriginLocation.lng);
	var dLat = dml_toRad(myLatDegfor_toRoad);
	var dLon = dml_toRad(myLngDegfor_toRoad);

	var dLat1 = dml_toRad(dmlOriginLocation.lat);
	var dLat2 = dml_toRad(dmlDestinationLocation.lat);

	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(dLat1) * Math.cos(dLat1) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;

	jQuery("#distance_direct").html('The distance between the two points (in a straight line) is: <b>' + d + '</b>');

}
// 3.8	- Helper function to calculate distance
function dml_toRad(deg) {
	return deg * Math.PI / 180;
}
// 3.9 	- Resets distance compute markers and route 
function dml_Reset_Distance_Elements() {
	var r = confirm("Do you want to clear calculations from the map?");
	if (r == true) {
		dmlDistStatus = 0;
		directionsDisplay.setMap(null);
		dmlDistmarker1.setMap(null);
		dmlDistmarker2.setMap(null);
		dmlDistline.setMap(null);
		jQuery("#distance_road").html("");
		jQuery("#distance_direct").html("");
		dml_Clear_Temp_Marker();
	}
}
// 3.10	- Creates temp marker to calculate distance 
function dml_add_Marker(location) {
	//1) Firstly clears all temporary markers
	dml_Clear_Temp_Marker();
	//newMarker.setMap(null);
	//2) Adds a new marker to the map
	newMarker = new google.maps.Marker({
		position: location,
		map: dmlmap
	});
	//3) Adds info window for newMarker if user loggedin
	var newinfowindow = new google.maps.InfoWindow({});
	google.maps.event.addListener(newMarker, 'click', (function (newMarker) {
		return function () {

			newinfowindow.setContent('<div class="dmlselectdistancediv" onclick="dml_add_for_distance(' + location.lat() + ', ' + location.lng() + ');">Calculate distance</div>');

			newinfowindow.open(dmlmap, newMarker);
		}
	})(newMarker));

}
//3.11	- Clear temporary marker from the map 
function dml_Clear_Temp_Marker() {
	if (newMarker != "") {
		newMarker.setMap(null);
	}
}

// 4	- HELPER FUNCTIONS 
// 4.1	- Shows image on the info window
function dmlWriteInfoImageHelper(myId, myValue) {
	var myResult;
	if (myValue == '.') {
		myResult = '<br><span id="' + myId + '_IMG" style="display: none;">' + myValue + '</span><br>';
	} else {
		myResult = '<br><span id="' + myId + '_IMG" style="display: none;">' + myValue + '</span><image width="250" height="150" src="' + myValue + '" /><br>';
	}
	return myResult;
}
// 4.2	- Shows video on the info window
function dmlWriteInfoVideoHelper(myId, myValue) {
	var myResult;
	if (myValue == '.') {
		myResult = '<span id="' + myId + '_VID" style="display: none;">' + myValue + '</span>';
	} else {
		myResult = '<span id="' + myId + '_VID" style="display: none;">' + myValue + '</span><iframe width="250" height="150" src="https://www.youtube.com/embed/' + myValue + '" frameborder="0" allowfullscreen=""></iframe><br>';
	}
	return myResult;
}
// 4.3	- Shows link on the info window
function dmlWriteInfoLink(myId, myLinkText, myLinkUrl) {
	var myResult;
	if (myLinkText == '.' || myLinkUrl == '.') {
		myResult = '<span id="' + myId + '_LT" style="display: none;">' + myLinkText + '</span><span id="' + myId + '_LU" style="display: none;">' + myLinkUrl + '</span>';
	} else {
		myResult = '<span id="' + myId + '_LT" style="display: none;">' + myLinkText + '</span><span id="' + myId + '_LU" style="display: none;">' + myLinkUrl + '</span><a href="' + myLinkUrl + '" target="blank">' + myLinkText + '</a><br>';
	}
	return myResult;
}
// 4.4	- Writes public info windows of the shapes 
function dmlShapeInfoWindowContent(myDescription, myImageUrl, myVideoCode, myLinkText, myLinkUrl) {
	var myResult = '<div style="width: 250px;">' + myDescription + '</div>' + dmlWriteShapeInfoImageHelper(myImageUrl) + dmlWriteShapeInfoVideoHelper(myVideoCode) + dmlWriteShapeInfoLink(myLinkText, myLinkUrl) + '';
	return myResult;
}
// 4.5	- Writes image link public info windows of the shapes
function dmlWriteShapeInfoImageHelper(myValue) {
	var myResult;
	if (myValue == '.') {
		myResult = '<br>';
	} else {
		myResult = '<br><image width="250" height="150" src="' + myValue + '" /><br>';
	}
	return myResult;
}
// 4.6	- Writes video link public info windows of the shapes
function dmlWriteShapeInfoVideoHelper(myValue) {
	var myResult;
	if (myValue == '.') {
		myResult = '';
	} else {
		myResult = '<iframe width="250" height="150" src="https://www.youtube.com/embed/' + myValue + '" frameborder="0" allowfullscreen=""></iframe><br>';
	}
	return myResult;
}
// 4.7	- Writes URL text and value public info windows of the shapes
function dmlWriteShapeInfoLink(myLinkText, myLinkUrl) {
	var myResult;
	if (myLinkText == '.' || myLinkUrl == '.') {
		myResult = '';
	} else {
		myResult = '<a href="' + myLinkUrl + '" target="blank">' + myLinkText + '</a><br>';
	}
	return myResult;
}