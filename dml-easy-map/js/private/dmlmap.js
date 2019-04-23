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
		3.1 - dml_add_Cluster_Markers()		Draw markers on the map
		3.1.1 Marker 						Custom Marker 
		3.1.2 Marker.prototype.setMap 		Custom marker set map
		3.1.3 MarkerLabel 					Marker Label Overlay
		3.2 - dml_add_Lines() 				Draw lines on the map
		3.3 - dml_add_Polygons() 			Draw polygones on the map
		3.3.1 dml_add_Circles() 			Draw circles on the map
		3.4 - dml_add_Marker() 				Creates new pin on the map 
		3.5 - dml_delete_Markers()
			  dml_clear_Markers()			Clears markers from the map 
		3.6 - dml_set_Map_On_All() 			Sets the map on all markers in the array.
		3.7 - dml_Center_Map() 				Centers map 
		3.8 - dml_Create_New_Marker() 		Creates new marker and shape on the map 
		3.9 - dml_Find_From_Address() 		Finds and shows temp marker on the map based on the address

	4. SETTINGS FUNCTIONS
		4.1 - dml_Fill_Settings()			Fills map settings panel
		4.2 - dml_Fill_Marker_Settings() 	Fills marker settings panel
		4.3 - dml_Edit_Marker_Description() Fills marker description settings panel
		4.4 - dml_Save_Settings() 			Calls AJAX according to the save action
		4.5 - dml_Save_Settings_Panel()		Calls AJAX to save map settings to the database 
		4.6 - dml_Fill_Line_Settings_Panel()Fills lines settings panel
		4.7 - dml_reset_button() 			Deletes shapes
		4.8 - dml_Fill_Polygon_Settings_Panel() Fills polygon settings panel 
		4.9 - dml_Fill_Circle_Settings_Panel() Fills circle settings panel

	5. HELPER FUNCTIONS
		5.1 - dml_Change_Map_Type()			Changes map style icon when map settings panel active
		5.2 - dml_Clear_All_Db_Markers() 	Clears all markers from the map
		5.3 - dml_Select_One_icon() 		Sets icon ID when a new icon selected for the marker
		5.4 - dml_Delete_Db_Marker() 		Calls AJAX to delete selected marker from the database
		5.5 - dml_hide_polygons() 			Hides polygons 
		5.6 - dml_show_polygons() 			Showes polygons
		5.7 - dml_solve_Coordinates_Lat()	Solves Lat data of the shape
		5.8 - dml_solve_Coordinates_Lng() 	Solves Lng data of the shape
		5.9 - dml_deleteAllDrawingShapes() 	Clears all drawing temporary shapes
		5.10- dml_Marker_Show_Empty_Helper()Shows inputs with empty data// Show functions
		5.11- dmlWriteInfoImageHelper() 	Shows image on the info window
		5.12- dmlWriteInfoVideoHelper() 	Shows video on the info window
		5.13- dmlWriteInfoLink() 			Shows link on the info window
		5.14- dmlMarkerImgVidLinkHelper() 	Shows inputs with empty data// Show functions
		5.15- dmlMarkerLinkHelper() 		Shows inputs with empty data// Show functions
		5.16- dml_Marker_Show_Empty_Helper()Shows line, polygons and circles info window data 

	6. DISTANCE COMPUTING FUNCTIONS
		6.1	- dml_add_for_distance() 		Add marker for distance measurement 
		6.2 - dml_Compute_Distance() 		Calculates distance and draws lines 
		6.3 - dml_toRad() 					Helper function to calculate distance 
		6.4 - dml_Reset_Distance_Elements() Resets distance compute markers and route 
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
var dmlClearMultiDbLines = []; //This's core. It's used both to draw and clear lines
var dmlClearMultiDbPolygones = []; //This's core. It's used both to draw and clear polygons
var dmlClearMultiDbCircles = [];
var dmlLineList = []; //It's used to populate Line Control Panel
var dmlPolygonList = []; //It's used to populate Polygon Control Panel

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

// Variable for DRAWING
var all_overlays = [];

//Marker Containers
/*
var DmlMarkerPin = 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z';
var DmlMarkerSquarePin = 'M22-48h-44v43h16l6 5 6-5h16z';
var DmlMarkerShield = 'M18.8-31.8c.3-3.4 1.3-6.6 3.2-9.5l-7-6.7c-2.2 1.8-4.8 2.8-7.6 3-2.6.2-5.1-.2-7.5-1.4-2.4 1.1-4.9 1.6-7.5 1.4-2.7-.2-5.1-1.1-7.3-2.7l-7.1 6.7c1.7 2.9 2.7 6 2.9 9.2.1 1.5-.3 3.5-1.3 6.1-.5 1.5-.9 2.7-1.2 3.8-.2 1-.4 1.9-.5 2.5 0 2.8.8 5.3 2.5 7.5 1.3 1.6 3.5 3.4 6.5 5.4 3.3 1.6 5.8 2.6 7.6 3.1.5.2 1 .4 1.5.7l1.5.6c1.2.7 2 1.4 2.4 2.1.5-.8 1.3-1.5 2.4-2.1.7-.3 1.3-.5 1.9-.8.5-.2.9-.4 1.1-.5.4-.1.9-.3 1.5-.6.6-.2 1.3-.5 2.2-.8 1.7-.6 3-1.1 3.8-1.6 2.9-2 5.1-3.8 6.4-5.3 1.7-2.2 2.6-4.8 2.5-7.6-.1-1.3-.7-3.3-1.7-6.1-.9-2.8-1.3-4.9-1.2-6.4z';
var DmlMarkerRoute = 'M24-28.3c-.2-13.3-7.9-18.5-8.3-18.7l-1.2-.8-1.2.8c-2 1.4-4.1 2-6.1 2-3.4 0-5.8-1.9-5.9-1.9l-1.3-1.1-1.3 1.1c-.1.1-2.5 1.9-5.9 1.9-2.1 0-4.1-.7-6.1-2l-1.2-.8-1.2.8c-.8.6-8 5.9-8.2 18.7-.2 1.1 2.9 22.2 23.9 28.3 22.9-6.7 24.1-26.9 24-28.3z';
var DmlMarkerSquare = 'M-24-48h48v48h-48z';
var DmlMarkerSquareRounded = 'M24-8c0 4.4-3.6 8-8 8h-32c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h32c4.4 0 8 3.6 8 8v32z';
*/

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
	dml_map_wpajax_url = dml_php_links.UrlofAdmin + 'admin-ajax.php';

	// registers admin buttons
	jQuery("#dml_map_list").change(function () {
		dmlmyArr = [];

		var mySelectedLink = jQuery("#dml_map_list option:selected").val();
		if (mySelectedLink != 0) {
			jQuery("#dmlAdminRemoveMap").show();
			jQuery("#dmlAdminGoMap").show();
			jQuery("#dmlAdminHidePolygones").show();
			jQuery("#dmlAdminAdressDiv").show();
			jQuery("#dmlAdminAddressSubmit").show();
			dmlDbStatus = 0;

			var ajax_data = {
				action: "dml_call_ajax",
				dml_backend_function: 1,
				dml_page_link: mySelectedLink,
			}
			dml_Call_Ajax(ajax_data, 1);
		}
	});

	jQuery("#dmlAdminGoMap").click(function (event) {
		event.preventDefault();
		var dmlPageUrl = jQuery("#dml_map_list option:selected").val();
		window.open(dmlPageUrl);
	});

	jQuery("#dmlAdminRemoveMap").click(function (event) { // <- goes here !
		event.preventDefault();
		var mySelectedLink = jQuery("#dml_map_list option:selected").val();


		var r = confirm("Do you want to remove map located on the " + mySelectedLink + " link permanently?");
		if (r == true) {

			var ajax_data = {
				action: "dml_call_ajax",
				dml_backend_function: 7,
				dml_page_link: mySelectedLink,
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
					jQuery("#dml_map_list option:selected").remove();
					jQuery("#dmlmap").html("Selected map has been removed.Do not forget to remove short code from the page.<br />Click <a href='" + mySelectedLink + "' target=''blank>here</a> to go to the page");
					jQuery("#dmlBtnSettings").hide();
					dmlDbStatus = 0;

				},
				'error': function (jqXHR, textStatus, errorThrown) {
					alert("Error occured");
				}
			});
		}

	});

	jQuery("#dmlAdminHidePolygones").click(function (event) {
		event.preventDefault();
		var myButtonText = jQuery("#dmlAdminHidePolygones").val();

		if (myButtonText == "Hide Polygons") {
			jQuery("#dmlAdminHidePolygones").val("Show Polygons");
			dml_hide_polygons();
		} else {
			jQuery("#dmlAdminHidePolygones").val("Hide Polygons");
			dml_show_polygons();
		}
	});

	jQuery("#dmlAdminAddressSubmit").click(function (event) {
		event.preventDefault();
		dml_Find_From_Address();
	});

	// End of Document Ready
});
// 1.3 - Calls registered AJAX function from PHP file
function dml_Call_Ajax(ajax_data, succesType) {
	// Calls AJAX
	jQuery.ajax({
		'method': 'post',
		'url': dml_map_wpajax_url,
		'data': ajax_data,
		'dataType': 'json',
		'cache': false,
		'success': function (data, textStatus) {
			console.log(data);

			if (data.status == 0) {
				alert(data.message);
			} else if (succesType = 1 && data.status == 2) {
				jQuery("#dmlMapContainer").hide();
				if (jQuery("#dmlmyMap1Edit").html() == 1) {
					jQuery("#dmlApiDiv").show();
				}
			} else {
				dml_Clear_All_Db_Markers();
				dml_initiate_Map(data); //Refills dmlmyArr and bind map without calling AJAX
				dml_delete_Markers();
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
		var myStyleFile = dml_php_links.UrlofPlugin + "/dml-easy-map/styles/style" + myStyleNu + ".json";
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

		// This event listener will call dml_add_Marker() when the map is clicked.
		if (jQuery("#dmlmyMap1Edit").html() == 1) {
			dmlmap.addListener('click', function (event) {
				dml_add_Marker(event.latLng);
			});
		}
		//FILLING MAPHOLDER_ID
		//jQuery("#dmlMap1idHolder").html(dmlmyArr[0].dml_id + '_0_7_' + dmlmyArr[0].dml_maptype__markerdesc + '_' + dmlmyArr[0].dml_height_title + '_' + dmlmyArr[0].dml_fill_color + '_' + dmlmyArr[0].dml_fill_color + '_' + dmlmyArr[0].dml_zoom_icon);

		//CLICK ON THE MAP WHEN LOGGEDIN
		google.maps.event.addListener(dmlmap, 'click', function (e) {
			jQuery("#dmlLblSonuc").html("");
			if (jQuery("#dmlmyMap1Edit").html() == 1) {
				myDeger1 = e.latLng.lat();
				myDeger2 = e.latLng.lng();
				jQuery("#dmlText1").val(myDeger1);
				jQuery("#dmlText2").val(myDeger2);


				var position = jQuery("#dmlRepeater1Map").position();

				var y1 = position.top + 44;
				var x1 = position.left + 20;
				jQuery("#dmlBtnSettings").css({ position: "absolute", top: y1 + "px", left: x1 + "px" }).show();
				var y2 = position.top + 44;
				var x2 = position.left + 64;
				jQuery("#BtnDmlMapRefresh").css({ position: "absolute", top: y2 + "px", left: x2 + "px" }).show();

				jQuery("#idholder").html(dmlmyArr[0].dml_id + "_0_7");
			}
		});

		// DRAWING MANAGER
		// ***********************************************************
		var drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: google.maps.drawing.OverlayType.MARKER,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: ['circle', 'polygon', 'polyline']
			},

			circleOptions: {
				fillColor: '#2E2EFE',
				fillOpacity: 1,
				strokeWeight: 5,
				clickable: true,
				zIndex: 1
			}

		});
		drawingManager.setDrawingMode(null);
		drawingManager.setMap(dmlmap);

		// DRAWING complete functions
		google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
			all_overlays.push(event);
			if (event.type == 'circle') {
				var r = confirm("Do you want to save this circle to the database?");
				if (r == true) {
					var center = event.overlay.getCenter();
					var radius = event.overlay.getRadius();
					dml_Create_New_Marker(center.lat(), center.lng(), 4, radius);
				}
			} else if (event.type == 'polygon') {
				var r = confirm("Do you want to save this polygon to the database?");
				if (r == true) {
					var bounds = [];
					bounds = event.overlay.getPath().getArray();
					var dmlPolygonLats = dml_solve_Coordinates_Lat(bounds);
					var dmlPolygonLngs = dml_solve_Coordinates_Lng(bounds);

					dml_Create_New_Marker(dmlPolygonLats, dmlPolygonLngs, 3, 0);
				}
			} else if (event.type == 'polyline') {
				var r = confirm("Do you want to save this polyline to the database?");
				if (r == true) {
					var bounds = [];
					bounds = event.overlay.getPath().getArray();
					var dmlPolylineLats = dml_solve_Coordinates_Lat(bounds);
					var dmlPolylineLngs = dml_solve_Coordinates_Lng(bounds);

					dml_Create_New_Marker(dmlPolylineLats, dmlPolylineLngs, 2, 0);
				}
			}

		});
	}

	//FILLING MAPHOLDER_ID
	jQuery("#dmlMap1idHolder").html(dmlmyArr[0].dml_id + '_0_7_' + dmlmyArr[0].dml_maptype__markerdesc + '_' + dmlmyArr[0].dml_height_title + '_' + dmlmyArr[0].dml_fill_color + '_' + dmlmyArr[0].dml_fill_color + '_' + dmlmyArr[0].dml_zoom_icon);

	
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
	jQuery("#dmlAdminHidePolygones").val("Hide Polygons");
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
// 3.1	- Draw markers on the map
function dml_add_Cluster_Markers() {
	var infowindow = new google.maps.InfoWindow({});
	var marker, i;
	var imagePath = dml_php_links.UrlofPlugin + "/dml-easy-map/icons/";

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

				infowindow.setContent('<strong><span id="' + dmlClusterArr[i].dml_id + '_H">' + dmlClusterArr[i].dml_height_title + '</span></strong>' + dmlWriteInfoImageHelper(dmlClusterArr[i].dml_id, dmlClusterArr[i].dml_image_link) + dmlWriteInfoVideoHelper(dmlClusterArr[i].dml_id, dmlClusterArr[i].dml_video_link) + '<div id="' + dmlClusterArr[i].dml_id + '_D">' + dmlClusterArr[i].dml_maptype__markerdesc + '</div>' + dmlWriteInfoLink(dmlClusterArr[i].dml_id, dmlClusterArr[i].dml_link_text, dmlClusterArr[i].dml_link_url) + '<br><div onclick="dml_Edit_Marker_Description(' + dmlClusterArr[i].dml_id + ');" class="button btn btn-success btn-sm fontawesome-pencil"></div><div onclick="dml_Delete_Db_Marker(' + dmlClusterArr[i].dml_id + ', 1);" class="btn btn-danger btn-sm fontawesome-trash" style="margin-left:2px;"></div><div onclick="dml_Fill_Marker_Settings(' + dmlClusterArr[i].dml_id + ', \'' + dmlClusterArr[i].dml_zoom_icon + '\');" class="btn btn-primary btn-sm fontawesome-picture" style="margin-left:2px;"></div><div class="btn btn-default btn-sm" style="display:none;"><span class="badge">' + dmlClusterArr[i].dml_id + '</span></div><br/><div class="dmlselectdistancediv" onclick="dml_add_for_distance(' + dmlClusterArr[i].dml_lat + ', ' + dmlClusterArr[i].dml_lng + ');">Calculate distance</div>');

				infowindow.open(dmlmap, marker);

			}
		})(marker, i));

		dmlDbMarkers.push(marker);

		return marker;
	});

	var clusterStyles = [
		{
			textColor: 'black',
			url: dml_php_links.UrlofPlugin + '/dml-easy-map/icons/m1.png',
			height: 52,
			width: 53,
			textSize: 12
		},
		{
			textColor: 'black',
			url: dml_php_links.UrlofPlugin + '/dml-easy-map/icons/m2.png',
			height: 56,
			width: 55,
			textSize: 12
		},
		{
			textColor: 'black',
			url: dml_php_links.UrlofPlugin + '/dml-easy-map/icons/m3.png',
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
	} else if (myContainerName == 195) {
		// 195 Route
		myPath = 'M24-28.3c-.2-13.3-7.9-18.5-8.3-18.7l-1.2-.8-1.2.8c-2 1.4-4.1 2-6.1 2-3.4 0-5.8-1.9-5.9-1.9l-1.3-1.1-1.3 1.1c-.1.1-2.5 1.9-5.9 1.9-2.1 0-4.1-.7-6.1-2l-1.2-.8-1.2.8c-.8.6-8 5.9-8.2 18.7-.2 1.1 2.9 22.2 23.9 28.3 22.9-6.7 24.1-26.9 24-28.3z';
	} else if (myContainerName == 196) {
		// 196 Square rounded
		myPath = 'M24-8c0 4.4-3.6 8-8 8h-32c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h32c4.4 0 8 3.6 8 8v32z';
	}

	return myPath;
}
// 3.2	- Draw lines on the map
function dml_add_Lines() {

	var addListenersOnLines = function (myLine, myLineDesc, myLineImage, myLineVideoCode, myLineLinkText, myLineLinkUrl, myLat, myLng) {

		google.maps.event.addListener(myLine.getPath(), 'set_at', function () {
			var bounds = [];
			bounds = myLine.getPath().getArray();
			var dmlPolylineLats = dml_solve_Coordinates_Lat(bounds);
			var dmlPolylineLngs = dml_solve_Coordinates_Lng(bounds);
			myLat = dmlPolylineLats;
			myLng = dmlPolylineLngs;
		});

		google.maps.event.addListener(myLine.getPath(), 'insert_at', function () {
			var bounds = [];
			bounds = myLine.getPath().getArray();
			var dmlPolylineLats = dml_solve_Coordinates_Lat(bounds);
			var dmlPolylineLngs = dml_solve_Coordinates_Lng(bounds);
			myLat = dmlPolylineLats;
			myLng = dmlPolylineLngs;
		});


		google.maps.event.addListener(myLine, 'click', function (event) {
			dml_Fill_Line_Settings_Panel(myLine.indexID, myLine.strokeColor, myLineDesc, myLineImage, myLineVideoCode, myLineLinkText, myLineLinkUrl, myLat, myLng);
		});

	}

	for (var i = 0; i < dmlmyArr.length; i++) {
		if (dmlmyArr[i].dml_record_type == "L") {
			var MultiLineCorners = [];
			var LatArr = dmlmyArr[i].dml_lat.split("_");
			var LngArr = dmlmyArr[i].dml_lng.split("_");
			var myLineColor = dmlmyArr[i].dml_border_color;
			var myLineID = dmlmyArr[i].dml_id;
			var myLineDesc = dmlmyArr[i].dml_maptype__markerdesc;
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

			addListenersOnLines(MultiFlightPath, myLineDesc, dmlmyArr[i].dml_image_link, dmlmyArr[i].dml_video_link, dmlmyArr[i].dml_link_text, dmlmyArr[i].dml_link_url, dmlmyArr[i].dml_lat, dmlmyArr[i].dml_lng);

			// Fills LineList for Control Panel
			dmlLineList.push({
				LineID: dmlmyArr[i].dml_id,
				LineColor: dmlmyArr[i].dml_border_color
			});
			// Populates clear array
			dmlClearMultiDbLines.push(MultiFlightPath);
		}
	}
}
// 3.3	- Draw Polygones on the map 
function dml_add_Polygons() {
	var addListenersOnPolygon = function (polygon, myPolygonDesc, myPolygonImage, myPolygonVideoCode, myPolygonLinkText, myPolygonLinkUrl, myLat, myLng, myFillColor, myFillHoverColor) {

		google.maps.event.addListener(polygon, 'click', function (event) {
			dml_Fill_Polygon_Settings_Panel(polygon.indexID, polygon.strokeColor, myFillColor, myPolygonDesc, myPolygonImage, myPolygonVideoCode, myPolygonLinkText, myPolygonLinkUrl, myLat, myLng, myFillHoverColor);
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

			addListenersOnPolygon(MultiBermudaTriangle, myDescription, dmlmyArr[i].dml_image_link, dmlmyArr[i].dml_video_link, dmlmyArr[i].dml_link_text, dmlmyArr[i].dml_link_url, dmlmyArr[i].dml_lat, dmlmyArr[i].dml_lng, myFillColor, myFillHoverColor);

			// Fills LineList for Control Panel
			dmlPolygonList.push({
				PolygonID: dmlmyArr[i].dml_id,
				PolygonBorderColor: dmlmyArr[i].dml_border_color,
				PolygonFillColor: dmlmyArr[i].dml_fill_color
			});
			// Populates clear array 	
			dmlClearMultiDbPolygones.push(MultiBermudaTriangle);
		}
	}
}
// 3.3.1- Draw Circles on the map
function dml_add_Circles() {

	var addListenersOnCircles = function (myCircle, myCircleDesc, myCircleImage, myCircleVideoCode, myCircleLinkText, myCircleLinkUrl, myCircleCenterLat, myCircleCenterLng, myCircleRadius, myFillColor, myFillHoverColor) {

		google.maps.event.addListener(myCircle, 'radius_changed', function () {
			myCircleRadius = this.getRadius();
		});

		google.maps.event.addListener(myCircle, 'center_changed', function () {
			myCircleCenterLat = this.getCenter().lat();
			myCircleCenterLng = this.getCenter().lng();
		});

		google.maps.event.addListener(myCircle, 'click', function (event) {
			dml_Fill_Circle_Settings_Panel(myCircle.indexID, myCircle.strokeColor, myFillColor, myCircleDesc, myCircleImage, myCircleVideoCode, myCircleLinkText, myCircleLinkUrl, myCircleCenterLat, myCircleCenterLng, myCircleRadius, myFillHoverColor)
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

			addListenersOnCircles(dmlCircle, dmlmyArr[i].dml_maptype__markerdesc, dmlmyArr[i].dml_image_link, dmlmyArr[i].dml_video_link, dmlmyArr[i].dml_link_text, dmlmyArr[i].dml_link_url, dmlmyArr[i].dml_lat, dmlmyArr[i].dml_lng, dmlmyArr[i].dml_zoom_icon, myFillColor, myFillHoverColor);

			dmlClearMultiDbCircles.push(dmlCircle);
		}
	}
}
// 3.4	- Creates new temporary pin on the map
function dml_add_Marker(location) {
	//1) Firstly clears all temporary markers
	dml_delete_Markers();
	//2) Adds a new marker to the map
	var newMarker = new google.maps.Marker({
		position: location,
		map: dmlmap
	});
	//3)Push new marker to the array
	dmlmarkers.push(newMarker);
	//4) Adds info window for newMarker if user loggedin
	if (jQuery("#dmlmyMap1Edit").html() == 1) {
		var newinfowindow = new google.maps.InfoWindow({});
		google.maps.event.addListener(newMarker, 'click', (function (newMarker) {
			return function () {

				newinfowindow.setContent('<div onclick="dml_Center_Map(' + location.lat() + ', ' + location.lng() + ');" class="btn btn-success fontawesome-screenshot buttonhover" style="margin-left:2px;"></div><div id="Map1AddMarkerBtn" onclick="dml_Create_New_Marker(' + location.lat() + ', ' + location.lng() + ', 1, 0);" class="btn btn-primary fontawesome-map-marker" style="margin-left:2px;"></div><div id="dmlClearTempMarker" onclick="dml_delete_Markers();" class="btn btn-danger fontawesome-trash" style="margin-left:2px;"></div><br/><div class="dmlselectdistancediv" onclick="dml_add_for_distance(' + location.lat() + ', ' + location.lng() + ');">Calculate distance</div>');

				newinfowindow.open(dmlmap, newMarker);
			}
		})(newMarker));
	}
}
// 3.5	- Clear markers
function dml_delete_Markers() {
	// Deletes all markers in the array by removing references to them.
	dml_clear_Markers();
	dmlmarkers = [];
}
function dml_clear_Markers() {
	// Removes the markers from the map, but keeps them in the array.
	dml_set_Map_On_All(null);
}
// 3.6	- Sets the map on all markers in the array.
function dml_set_Map_On_All(dmlmap) {
	for (var i = 0; i < dmlmarkers.length; i++) {
		dmlmarkers[i].setMap(dmlmap);
	}
}
// 3.7	- Centers map
function dml_Center_Map(myLat, myLng) {
	var r = confirm("Do you want to center map according to this location?");
	if (r == true) {

		var ajax_data = {
			action: "dml_call_ajax",
			dml_backend_function: 4,
			dml_page_link: jQuery("#dml_map_list option:selected").val(),
			dml_post_id: dmlmyArr[0].dml_id,
			dml_field1: 'dml_lat',
			dml_value1: myLat,
			dml_field2: 'dml_lng',
			dml_value2: myLng,
			dml_field_num: 2,
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

				dmlmyArr[0].dml_lat = myLat;
				dmlmyArr[0].dml_lng = myLng;
				// Centers map
				dmlmap.setCenter({ lat: parseFloat(myLat), lng: parseFloat(myLng) });
				// Clears marker
				dml_delete_Markers();

			},
			'error': function (jqXHR, textStatus, errorThrown) {
				alert("Error occured");
			}

		});
	}
}
// 3.8	- Creates new marker on the map
function dml_Create_New_Marker(myLat, myLng, myMarkerType, myRadius) {
	dml_delete_Markers();
	if (myMarkerType == 1) {
		// Creates new marker
		var ajax_data = {
			action: "dml_call_ajax",
			dml_backend_function: 5,
			dml_page_link: jQuery("#dml_map_list option:selected").val(),
			dml_record_type: 'R',
			dml_lat: myLat,
			dml_lng: myLng,
			dml_height_title: 'Marker title',
			dml_maptype__markerdesc: 'Marker description',
			dml_zoom_icon: 0,
			dml_temp_MyMarkerType: myMarkerType,
			dml_image_link: '.',
			dml_video_link: '.',
			dml_link_text: '.',
			dml_link_url: '.',
		}
	} else if (myMarkerType == 2) {
		// Creates new line
		var ajax_data = {
			action: "dml_call_ajax",
			dml_backend_function: 5,
			dml_page_link: jQuery("#dml_map_list option:selected").val(),
			dml_record_type: 'L',
			dml_lat: myLat,
			dml_lng: myLng,
			dml_height_title: 'Line title',
			dml_maptype__markerdesc: 'Line description',
			dml_zoom_icon: 'L',
			dml_border_color: '#FE2E2E',
			dml_temp_MyMarkerType: myMarkerType,
		}
	} else if (myMarkerType == 3) {
		// Creates new polygon
		var ajax_data = {
			action: "dml_call_ajax",
			dml_backend_function: 5,
			dml_page_link: jQuery("#dml_map_list option:selected").val(),
			dml_record_type: 'P',
			dml_lat: myLat,
			dml_lng: myLng,
			dml_height_title: 'Polygon title',
			dml_maptype__markerdesc: 'Polygon description',
			dml_zoom_icon: 'P',
			dml_border_color: '#FE2E2E',
			dml_fill_color: '#2E2EFE',
			dml_temp_MyMarkerType: myMarkerType,
		}
	} else if (myMarkerType == 4) {
		// Creates new circle
		var ajax_data = {
			action: "dml_call_ajax",
			dml_backend_function: 5,
			dml_page_link: jQuery("#dml_map_list option:selected").val(),
			dml_record_type: 'C',
			dml_lat: myLat,
			dml_lng: myLng,
			dml_height_title: 'Circle title',
			dml_maptype__markerdesc: 'Circle description',
			dml_zoom_icon: myRadius,
			dml_border_color: '#FE2E2E',
			dml_fill_color: '#2E2EFE',
			dml_temp_MyMarkerType: myMarkerType,
		}
	}

	dml_Call_Ajax(ajax_data, 1);
}
function dml_Find_From_Address() {

	var geocoder = new google.maps.Geocoder(); // creating a new geocode object
	var location1;

	// getting the address valuE
	address1 = jQuery("#dmlAdminAddressInput").val();

	// finding out the coordinates
	if (geocoder) {
		geocoder.geocode({ 'address': address1 }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				//location of first address (latitude + longitude)
				location1 = results[0].geometry.location;
				//alert(location1.lat() + " 1");
				dmlmap.setCenter({ lat: parseFloat(location1.lat()), lng: parseFloat(location1.lng()) });
				dml_add_Marker(location1);
			} else {
				alert("Geocode was not successful for the following reason: " + status);
			}
		});
	}
}


// 4	- SETTINGS
// 4.1	- Fills map settings panel 
function dml_Fill_Settings() {
	//if (jQuery("#dmlModalTitle1").length == 0) {
	// Clears content of panel
	jQuery("#dmlEssSettingsModalBody").html("");
	jQuery("#dmlPnlSettingsTitle").html("Settings Panel");
	jQuery("#dmlBtnSettingsSave").val("Save Settings");
	jQuery("#dmlBtnReset").val("Reset Map");
	var dmlSettingsDiv = jQuery("#dmlMap1idHolder").html();

	//CREATE NEW TEXTBOX
	var newElement1 = jQuery(document.createElement('h5')).attr('id', 'dmlModalTitle1').attr('class', 'modal-title');
	newElement1.after().html("<div class='input-group'><span class='input-group-addon' id='dml-basic-addon1'>API code (pure code)</span><input id='dmlMapApiCode' type='text' class='form-control StngElement' aria-describedby='dml-basic-addon1'></div>");
	newElement1.appendTo("#dmlEssSettingsModalBody");

	var newElement2 = jQuery(document.createElement('h5')).attr('id', 'ModalTitle2').attr('class', 'modal-title');
	newElement2.after().html("<div class='input-group'><span class='input-group-addon' id='dml-basic-addon2'>Map height (numbers)</span><input id='dmlMapHeight' type='number' class='form-control StngElement' aria-describedby='dml-basic-addon2'></div>");
	newElement2.appendTo("#dmlEssSettingsModalBody");

	var newElement3 = jQuery(document.createElement('h5')).attr('id', 'ModalTitle6').attr('class', 'modal-title');
	newElement3.after().html("<div class='input-group'><span class='input-group-addon' id='dml-basic-addon6'>Map zoom (numbers)</span><input id='dmlMapZoom' type='number' class='form-control StngElement' aria-describedby='dml-basic-addon6'></div>");
	newElement3.appendTo("#dmlEssSettingsModalBody");

	var newElement5 = jQuery(document.createElement('div')).attr('id', 'ModalTitle7').attr('class', 'StngElement');
	newElement5.after().html("<div class='input-group'><span class='input-group-addon' id='dml-basic-addon7'>Map Style</span><select id='dmlMapTypeOptions' onchange='dml_Change_Map_Type(this.value);'  class='form-control StngElement' aria-describedby='dml-basic-addon7'></select></div><div id='dmlSelectedStyleThmb'></div><div id='dmlSelectedStyleHolder' style='display:none;'></div>");
	newElement5.appendTo("#dmlEssSettingsModalBody");

	for (var i = 1; i < 31; i++) {
		jQuery('#dmlMapTypeOptions').append(jQuery("<option />").val(i).text("Style " + i).attr("id", "dmlOpt" + i));
	}

	var newElementResult = jQuery(document.createElement('div')).attr('id', 'SettingsResult');
	newElementResult.after().html("<div style='clear: both;'></div><div id='dmlLblSettingsSonuc'></div><div id='LblControlType' style='display:none;'></div>");
	newElementResult.appendTo("#dmlEssSettingsModalBody");

	var newElement6 = jQuery(document.createElement('div')).attr('id', 'ModalTitle8').attr('class', 'StngElement');
	newElement6.after().html("<div class='row'><div class='col-sm-6'><input type='checkbox' id='dmlTrafficChb' name='dmlTrafficChb' value='1'> Traffic layer</div><div class='col-sm-6'><input type='checkbox' id='dmlTransportChb' name='dmlTransportChb' value='1'> Transport layer</div><div class='col-sm-6'><input type='checkbox' id='dmlBcycleChb' name='dmlBcycleChb' value='1'> Bicycle layer</div><div class='col-sm-6'><input type='checkbox' id='dmlScrollLockChb' name='dmlScrollLockChb' value='1'> Scroll lock</div></div>");
	newElement6.appendTo("#dmlEssSettingsModalBody");

	//PASS SETTINGS PARAMETERS TO THE #dmlBtnSettings BUTTON
	var mySettingsParams = dmlSettingsDiv.split("_");
	jQuery("#dmlMapApiCode").val(mySettingsParams[3]);
	jQuery("#dmlMapHeight").val(mySettingsParams[4]);
	jQuery("#dmlMapZoom").val(mySettingsParams[7]);
	var mySelectedStyle = mySettingsParams[5];
	jQuery("#dmlOpt" + mySelectedStyle).attr("selected", "selected");
	jQuery("#dmlSelectedStyleHolder").html(mySelectedStyle);
	//jQuery("#dmlSelectedStyleThmb").html("<div class='input-group'><img src='" + dml_php_links.UrlofPlugin + "/dml-easy-map/styles/thmbs/" + mySelectedStyle + ".png' /></div>");
	jQuery(dml_Change_Map_Type(mySelectedStyle));

	var dmlLayerStatusArr = [];
	dmlLayerStatusArr = dmlmyArr[0].dml_layers.split("_");
	if (dmlLayerStatusArr[0] == 1) {
		jQuery("#dmlTrafficChb").attr('checked', true);
	}
	if (dmlLayerStatusArr[1] == 1) {
		jQuery("#dmlTransportChb").attr('checked', true);
	}
	if (dmlLayerStatusArr[2] == 1) {
		jQuery("#dmlBcycleChb").attr('checked', true);
	}
	if (dmlLayerStatusArr[3] == 1) {
		jQuery("#dmlScrollLockChb").attr('checked', true);
	}

	//SETTINGS SAVE PARAMETER
	jQuery("#mySettingSaveStart").html(mySettingsParams[0] + "_" + 3);

	//}
	jQuery("#dmlSettingsDiv").modal("toggle");
}
// 4.2	- Fills marker settings panel
function dml_Fill_Marker_Settings(myMarkerId, myMarkerIcon) {
	jQuery("#dmlSettingsCustomText").html(myMarkerId);

	jQuery("#dmlEssSettingsModalBody").html("");
	jQuery("#dmlPnlSettingsTitle").html("Icon Update Panel");
	jQuery("#dmlBtnSettingsSave").val("Change Icon");
	jQuery("#dmlBtnReset").hide();

	//Creates two texboxes for text
	var newElement1 = jQuery(document.createElement('h2')).attr('id', 'dmlMarkerDescription').attr('class', 'modal-title');
	newElement1.after().html("<img id='con191' onclick='dml_Select_Icon_Container(191)' class='dmlMarkerContainersList' src='" + dml_php_links.UrlofPlugin + "/dml-easy-map/icons/191.png'></img><img id='con192' onclick='dml_Select_Icon_Container(192)' class='dmlMarkerContainersList' src='" + dml_php_links.UrlofPlugin + "/dml-easy-map/icons/192.png'></img><img  id='con193' class='dmlMarkerContainersList' onclick='dml_Select_Icon_Container(193)' src='" + dml_php_links.UrlofPlugin + "/dml-easy-map/icons/193.png'></img><img id='con194' class='dmlMarkerContainersList' onclick='dml_Select_Icon_Container(194)' src='" + dml_php_links.UrlofPlugin + "/dml-easy-map/icons/194.png'></img><img id='con195' class='dmlMarkerContainersList' onclick='dml_Select_Icon_Container(195)' src='" + dml_php_links.UrlofPlugin + "/dml-easy-map/icons/195.png'></img><img id='con196' onclick='dml_Select_Icon_Container(196)' class='dmlMarkerContainersList' src='" + dml_php_links.UrlofPlugin + "/dml-easy-map/icons/196.png'></img><div style='width: 100%;><div class='input-group'><input id='dmlMarkerContainerColor' type='color' onchange='dml_Select_Icon_Container_Color()' class='form-control StngElement'></input></div><div id='dmlIconList' style='width: 100%; height: 120px; overflow-y : scroll;'></div><div id='dmlMySelectediconContainer' style='display:none;'></div><div id='dmlMySelectediconID' style='display:none;'></div><div id='dml_Icon_Container_Color_Text' style='font-size: 14px; display: none;'></div>");
	newElement1.appendTo("#dmlEssSettingsModalBody");

	//var myiconTempList;
	for (var i = 201; i < 376; i++) {
		jQuery('#dmlIconList').append("<span id='maricon" + i + "' onclick='dml_Select_One_icon(" + i + ");' class='map-icon i" + i + " dmlMarkerIconsList' title='" + i + "' />");
	}
	jQuery("#dmlSettingsDiv").modal("toggle");
	// Binds Value 
	var myMarkerArray = myMarkerIcon.split("_");

	if (myMarkerArray.length > 1) {
		// Determines container 
		dml_Select_Icon_Container(myMarkerArray[1]);

		// Determines container color 
		var myColorCode = '#' + myMarkerArray[2];
		jQuery("#dmlMarkerContainerColor").val(myColorCode);
		dml_Select_Icon_Container_Color();

		//Icon 
		dml_Select_One_icon(myMarkerArray[0]);
	}
}
// 4.3	- Fills marker description settings panel
function dml_Edit_Marker_Description(myMarkerID) {
	// Clears content of panel
	jQuery("#dmlEssSettingsModalBody").html("");
	jQuery("#dmlPnlSettingsTitle").html("Marker Edit Panel");
	jQuery("#dmlBtnSettingsSave").val("Save Text");
	jQuery("#dmlBtnReset").hide();
	var myMarkerTitle = jQuery("#" + myMarkerID + "_H").html();
	var myMarkerDesc = jQuery("#" + myMarkerID + "_D").html();
	//Creates two texboxes for text
	var newElement1 = jQuery(document.createElement('h2')).attr('id', 'dmlMarkerDescription').attr('class', 'modal-title');
	newElement1.after().html("<div id='dmlEditMarkerId' style='display:none;'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerTitle'>Title</span><input id='dmlMarkerTitleValue' type='text' class='form-control StngElement' aria-describedby='dmlMarkerTitle'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerImageLabel'>Image</span><input type='text' id='dmlMarkerImageValue' placeholder='Paste image link. It can be left blank' class='form-control StngElement' aria-describedby='dmlMarkerImageLabel'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerVideoLabel'>Video</span><input type='text' id='dmlMarkerVideoValue' placeholder='Paste just YouTube video code not link. It can be left blank' class='form-control StngElement' aria-describedby='dmlMarkerVideoLabel'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerLinkText'>Link Text</span><input id='dmlMarkerLinkValue' placeholder='It can be left blank' type='text' class='form-control StngElement' aria-describedby='dmlMarkerLinkText'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerLinkUrl'>Link Url</span><input id='dmlMarkerLinkUrlValue' type='text' placeholder='e.g. http://www.sitename.com It can be left blank' class='form-control StngElement' aria-describedby='dmlMarkerLinkUrl'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerDesc'>Desc.</span><input id='dmlMarkerDescValue' type='text' class='form-control StngElement' aria-describedby='dmlMarkerDesc'></div><br />");
	newElement1.appendTo("#dmlEssSettingsModalBody");
	jQuery("#dmlEditMarkerId").html(myMarkerID);
	jQuery("#dmlMarkerTitleValue").val(myMarkerTitle);
	jQuery("#dmlMarkerDescValue").val(myMarkerDesc);
	jQuery("#dmlMarkerImageValue").val(dml_Marker_Show_Empty_Helper(jQuery("#" + myMarkerID + "_IMG").html()));
	jQuery("#dmlMarkerVideoValue").val(dml_Marker_Show_Empty_Helper(jQuery("#" + myMarkerID + "_VID").html()));
	jQuery("#dmlMarkerLinkValue").val(dml_Marker_Show_Empty_Helper(jQuery("#" + myMarkerID + "_LT").html()));
	jQuery("#dmlMarkerLinkUrlValue").val(dml_Marker_Show_Empty_Helper(jQuery("#" + myMarkerID + "_LU").html()));
	jQuery("#dmlSettingsDiv").modal("toggle");
}
// 4.4	- Calls AJAX according to the save action
function dml_Save_Settings() {
	var mySaveType = jQuery("#dmlBtnSettingsSave").val();
	if (mySaveType == "Save Settings") {
		dml_Save_Settings_Panel();
	} else if (mySaveType == "Change Icon") {
		var mySelectedIconContainer = jQuery("#dmlMySelectediconContainer").html();
		var mySelectedIconContainerColor = jQuery("#dml_Icon_Container_Color_Text").html();
		var rawColorCode = mySelectedIconContainerColor.replace('#', '');
		var mySelectedIconNumber = jQuery("#dmlMySelectediconID").html();
		var myIconStringToDb = mySelectedIconNumber + '_' + mySelectedIconContainer + '_' + rawColorCode;

		var myNewIconMarkerId = jQuery("#dmlSettingsCustomText").html();
		//var mySelectedicon = jQuery("#dmlMySelectediconID").html();

		if (mySelectedIconContainer.length == 0) {
			alert("Please select a icon container");
		} else if (mySelectedIconContainerColor == 0) {
			alert("Please select the color of the icon container");
		} else if (mySelectedIconNumber == 0) {
			alert("Please select an icon");
		} else {
			var ajax_data = {
				action: "dml_call_ajax",
				dml_backend_function: 8,
				dml_page_link: jQuery("#dml_map_list option:selected").val(),
				dml_post_id: myNewIconMarkerId,
				dml_field1: 'dml_zoom_icon',
				dml_value1: myIconStringToDb,
			}
			// Calls AJAX
			jQuery("#dmlSettingsDiv").modal("toggle");
			dml_Call_Ajax(ajax_data, 2);
		}
	} else if (mySaveType == "Save Text") {
		var myTitle = jQuery("#dmlMarkerTitleValue").val();
		var myDesc = jQuery("#dmlMarkerDescValue").val();
		var myImageLink = dmlMarkerImgVidLinkHelper(".");
		var myVideoLink = dmlMarkerImgVidLinkHelper(".");
		var myMarkerLinkText = dmlMarkerLinkHelper(".");
		var myMarkerLinkUrl = dmlMarkerLinkHelper(".");

		if (myTitle.length == 0 || myDesc.length == 0 || myImageLink.length == 0 || myVideoLink.length == 0 || myMarkerLinkText.length == 0 || myMarkerLinkUrl.length == 0) {
			alert("Missing title or description");
		} else {
			var myID = jQuery("#dmlEditMarkerId").html();
			var ajax_data = {
				action: "dml_call_ajax",
				dml_backend_function: 9,
				dml_page_link: jQuery("#dml_map_list option:selected").val(),
				dml_post_id: myID,
				dml_field1: 'dml_height_title',
				dml_value1: myTitle,
				dml_field2: 'dml_maptype__markerdesc',
				dml_value2: myDesc,
				dml_field3: 'dml_image_link',
				dml_value3: myImageLink,
				dml_field4: 'dml_video_link',
				dml_value4: myVideoLink,
				dml_field5: 'dml_link_text',
				dml_value5: myMarkerLinkText,
				dml_field6: 'dml_link_url',
				dml_value6: myMarkerLinkUrl,
				dml_field_num: 6,
			}
			// Calls AJAX
			jQuery("#dmlSettingsDiv").modal("toggle");
			dml_Call_Ajax(ajax_data, 2);
		}
	} else if (mySaveType == "Create New Line") {
		var myLat = jQuery("#dmlShapeCornerLat").val();
		var myLng = jQuery("#dmlShapeCornerLng").val();
		if (myLat.length == 0 || myLng.length == 0) {
			alert("Missing coordinates for the line corner");
		} else {
			dml_Create_New_Marker(myLat, myLng, 2, 0);
		}
	} else if (mySaveType == "Save Line Settings") {
		var myLineID = jQuery("#dmlLineSettingsIdValue").text();
		var myLineColor = jQuery("#dmlLineSettingsColorValue").val();
		var isColorCode = myLineColor.substring(0, 1);
		var myLineDescription = jQuery("#dmlLineDescriptionValue").val();
		var myImageLink = dmlMarkerImgVidLinkHelper(".");
		var myVideoLink = dmlMarkerImgVidLinkHelper(".");
		var dmlLineLinkText = dmlMarkerLinkHelper(".");
		var dmlLineLinkValue = dmlMarkerLinkHelper(".");
		var myLineLat = jQuery("#dmlLineLatCoord").html();
		var myLineLng = jQuery("#dmlLineLngCoord").html();

		if (myLineID.length == 0 || myLineColor.length == 0 || myLineDescription.length == 0 || myImageLink.length == 0 || myVideoLink.length == 0 || dmlLineLinkText.length == 0 || dmlLineLinkValue.length == 0 || myLineLat.length == 0 || myLineLng.length == 0) {
			alert("Missing data for the line");
		} else if (isColorCode != "#") {
			alert("Enter a valid color code (ex. #EFEFEF)");
		} else {
			var ajax_data = {
				action: "dml_call_ajax",
				dml_backend_function: 11,
				dml_page_link: jQuery("#dml_map_list option:selected").val(),
				dml_post_id: myLineID,
				dml_field1: 'dml_border_color',
				dml_value1: myLineColor,
				dml_field2: 'dml_maptype__markerdesc',
				dml_value2: myLineDescription,
				dml_field3: 'dml_image_link',
				dml_value3: myImageLink,
				dml_field4: 'dml_video_link',
				dml_value4: myVideoLink,
				dml_field5: 'dml_link_text',
				dml_value5: dmlLineLinkText,
				dml_field6: 'dml_link_url',
				dml_value6: dmlLineLinkValue,
				dml_field7: 'dml_lat',
				dml_value7: myLineLat,
				dml_field8: 'dml_lng',
				dml_value8: myLineLng,
				dml_field_num: 8,
			}
			jQuery("#dmlSettingsDiv").modal("toggle");
			dml_Call_Ajax(ajax_data, 2);
		}
	} else if (mySaveType == "Create New Polygon") {
		var myLat = jQuery("#dmlShapeCornerLat").val();
		var myLng = jQuery("#dmlShapeCornerLng").val();
		if (myLat.length == 0 || myLng.length == 0) {
			alert("Missing coordinates for the polygon corner");
		} else {
			dml_Create_New_Marker(myLat, myLng, 3, 0);
		}
	} else if (mySaveType == "Save Polygon Settings") {
		var myPolygonID = jQuery("#dmlPolygonSettingsIdValue").text();
		var myPolygonBorderColor = jQuery("#dmlPolygonBorderColorValue").val();
		var isBorderColorCode = myPolygonBorderColor.substring(0, 1);
		var myPolygonFillColor = jQuery("#dmlPolygonFillColorValue").val();
		var myPolygonFillHoverColor = jQuery("#dmlPolygonFillColorValue").val();
		var isFillColorCode = myPolygonFillColor.substring(0, 1);
		var myPolygonDescription = jQuery("#dmlPolygonDescriptionValue").val();
		var myImageLink = dmlMarkerImgVidLinkHelper(".");
		var myVideoLink = dmlMarkerImgVidLinkHelper(".");
		var dmlPolygonLinkText = dmlMarkerLinkHelper(".");
		var dmlPolygonLinkValue = dmlMarkerLinkHelper(".");
		var myPolygonLat = jQuery("#dmlPolygonLatCoord").html();
		var myPolygonLng = jQuery("#dmlPolygonLngCoord").html();

		if (myPolygonID.length == 0 || myPolygonBorderColor.length == 0 || myPolygonFillColor.length == 0 || myPolygonDescription.length == 0 || myImageLink.length == 0 || myVideoLink.length == 0 || dmlPolygonLinkText.length == 0 || dmlPolygonLinkValue.length == 0 || myPolygonLat.length == 0 || myPolygonLng.length == 0 || myPolygonFillHoverColor.length == 0) {
			alert("Missing data for the polygon");
		} else if (isBorderColorCode != "#" && isFillColorCode != "#") {
			alert("Enter a valid color code (ex. #EFEFEF)");
		} else {
			var ajax_data = {
				action: "dml_call_ajax",
				dml_backend_function: 12,
				dml_page_link: jQuery("#dml_map_list option:selected").val(),
				dml_post_id: myPolygonID,
				dml_field1: 'dml_border_color',
				dml_value1: myPolygonBorderColor,
				dml_field2: 'dml_fill_color',
				dml_value2: myPolygonFillColor + "_" + myPolygonFillHoverColor,
				dml_field3: 'dml_maptype__markerdesc',
				dml_value3: myPolygonDescription,
				dml_field4: 'dml_image_link',
				dml_value4: myImageLink,
				dml_field5: 'dml_video_link',
				dml_value5: myVideoLink,
				dml_field6: 'dml_link_text',
				dml_value6: dmlPolygonLinkText,
				dml_field7: 'dml_link_url',
				dml_value7: dmlPolygonLinkValue,
				dml_field8: 'dml_lat',
				dml_value8: myPolygonLat,
				dml_field9: 'dml_lng',
				dml_value9: myPolygonLng,
				dml_field_num: 9,
			}
			jQuery("#dmlSettingsDiv").modal("toggle");
			dml_Call_Ajax(ajax_data, 2);
		}

	} else if (mySaveType == "Save Circle Settings") {
		var myCircleID = jQuery("#dmlCircleSettingsIdValue").text();
		var myCircleBorderColor = jQuery("#dmlCircleBorderColorValue").val();
		var isBorderColorCode = myCircleBorderColor.substring(0, 1);
		var myCircleFillColor = jQuery("#dmlCircleFillColorValue").val();
		var myCircleFillHoverColor = jQuery("#dmlCircleFillColorValue").val();
		var isFillColorCode = myCircleFillColor.substring(0, 1);
		var myCircleDescription = jQuery("#dmlCircleDescriptionValue").val();
		var myImageLink = dmlMarkerImgVidLinkHelper(".");
		var myVideoLink = dmlMarkerImgVidLinkHelper(".");
		var dmlCircleLinkText = dmlMarkerLinkHelper(".");
		var dmlCircleLinkValue = dmlMarkerLinkHelper(".");
		var myCircleSetCenterLat = jQuery("#dmlCircleNewCenterLat").html();
		var myCircleSetCenterLng = jQuery("#dmlCircleNewCenterLng").html();
		var myCircleSetRadius = jQuery("#dmlCircleNewRadius").html();
		
		if (myCircleID.length == 0 || myCircleBorderColor.length == 0 || myCircleFillColor.length == 0 || myCircleDescription.length == 0 || myImageLink.length == 0 || myVideoLink.length == 0 || dmlCircleLinkText.length == 0 || dmlCircleLinkValue.length == 0 || myCircleSetCenterLat.length == 0 || myCircleSetCenterLng.length == 0 || myCircleSetRadius.length == 0 || myCircleFillHoverColor.length == 0) {
			alert("Missing data for the circle");
		} else if (isBorderColorCode != "#" && isFillColorCode != "#") {
			alert("Enter a valid color code (ex. #EFEFEF)");
		} else {
			var ajax_data = {
				action: "dml_call_ajax",
				dml_backend_function: 13,
				dml_page_link: jQuery("#dml_map_list option:selected").val(),
				dml_post_id: myCircleID,
				dml_field1: 'dml_border_color',
				dml_value1: myCircleBorderColor,
				dml_field2: 'dml_fill_color',
				dml_value2: myCircleFillColor + "_" + myCircleFillHoverColor,
				dml_field3: 'dml_maptype__markerdesc',
				dml_value3: myCircleDescription,
				dml_field4: 'dml_image_link',
				dml_value4: myImageLink,
				dml_field5: 'dml_video_link',
				dml_value5: myVideoLink,
				dml_field6: 'dml_link_text',
				dml_value6: dmlCircleLinkText,
				dml_field7: 'dml_link_url',
				dml_value7: dmlCircleLinkValue,
				dml_field8: 'dml_lat',
				dml_value8: myCircleSetCenterLat,
				dml_field9: 'dml_lng',
				dml_value9: myCircleSetCenterLng,
				dml_field10: 'dml_zoom_icon',
				dml_value10: myCircleSetRadius,
				dml_field_num: 10,
			}
			jQuery("#dmlSettingsDiv").modal("toggle");
			dml_Call_Ajax(ajax_data, 2);
		}
	}

}
// 4.5	- Calls AJAX to save map settings to the database
function dml_Save_Settings_Panel() {
	var myApiCode = jQuery("#dmlMapApiCode").val();
	var myMapHeight = jQuery("#dmlMapHeight").val();
	var myMapType = dmlmyArr[0].dml_fill_color;
	var dmlMapCustomCode;
	if (myMapType == 0) {
		dmlMapCustomCode = jQuery("#dmlCustomStyleCode").val();
	} else {
		dmlMapCustomCode = '.';
	}
	var myMapZoom = jQuery("#dmlMapZoom").val();

	var dmlTrafficLayerVal = 0;
	var dmlTransportLayerVal = 0;
	var dmlBicycleLayerVal = 0;
	var dmlScrollLockVal = 0;
	if (jQuery("#dmlTrafficChb").is(':checked') == true) {
		dmlTrafficLayerVal = 1;
	}
	if (jQuery("#dmlTransportChb").is(':checked') == true) {
		dmlTransportLayerVal = 1;
	}
	if (jQuery("#dmlBcycleChb").is(':checked') == true) {
		dmlBicycleLayerVal = 1;
	}
	if (jQuery("#dmlScrollLockChb").is(':checked') == true) {
		dmlScrollLockVal = 1;
	}
	
	var dmlLayerStatusToDb = dmlTrafficLayerVal + '_' + dmlTransportLayerVal + '_' + dmlBicycleLayerVal + '_' + dmlScrollLockVal;

	// Validating data
	if (!myApiCode || !myMapHeight || !myMapZoom || !dmlMapCustomCode) {
		alert("All text areas are required");
	} else if (!jQuery.isNumeric(myMapHeight) || !jQuery.isNumeric(myMapZoom)) {
		alert("Please enter numeric value for Map Height and Zoom fields.");
	} else {
		dmlDbStatus = 0; // Map will be reloaded
		jQuery("#dmlSettingsDiv").modal("toggle");

		var ajax_data = {
			action: "dml_call_ajax",
			dml_backend_function: 3,
			dml_page_link: jQuery("#dml_map_list option:selected").val(),
			dml_post_id: dmlmyArr[0].dml_id,
			dml_api_code: myApiCode,
			dml_height_title: myMapHeight,
			dml_fill_color: dmlmyArr[0].dml_fill_color,
			dml_border_color: dmlMapCustomCode,
			dml_zoom_icon: myMapZoom,
			dml_layers: dmlLayerStatusToDb,
		}
		dml_Call_Ajax(ajax_data, 1);
	}

}
// 4.6	- Fills lines settings panel
function dml_Fill_Line_Settings_Panel(myLineID, myLineColor, myLineDesc, myLineImage, myLineVideoCode, myLineLinkText, myLineLinkUrl, myLineLat, myLineLng) {
	// Clears content of panel
	jQuery("#dmlEssSettingsModalBody").html("");
	jQuery("#dmlPnlSettingsTitle").html("Line Settings Panel");
	jQuery("#dmlBtnSettingsSave").val("Save Line Settings");
	jQuery("#dmlBtnReset").val("Delete Line").show();
	jQuery("#dmlSettingsDiv").modal("toggle");
	var newElement1 = jQuery(document.createElement('h2')).attr('id', 'dmlLineSettingsCover').attr('class', 'modal-title');
	newElement1.after().html("<div class='input-group'><span class='input-group-addon' id='dmlLineSettingsID'>Line ID</span><label id='dmlLineSettingsIdValue' class='form-control StngElement' aria-describedby='dmlLineSettingsID'>" + myLineID + "</div><div class='input-group'><span class='input-group-addon' id='dmlLineSettingsColor'>Color</span><input id='dmlLineSettingsColorValue' type='color' class='form-control StngElement' aria-describedby='dmlLineSettingsColor'></input></div><div class='input-group'><span class='input-group-addon' id='dmlLineDescription'>Description</span><input id='dmlLineDescriptionValue' type='text' class='form-control StngElement' aria-describedby='dmlLineDescription'></input></div><div id='dmlLineLatCoord' style='display: none;'></div><div id='dmlLineLngCoord' style='display: none;'></div><br />");
	newElement1.appendTo("#dmlEssSettingsModalBody");

	//jQuery("#dmlLineSettingsIdValue").text(myLineID);
	jQuery("#dmlLineSettingsColorValue").val(myLineColor);
	jQuery("#dmlLineDescriptionValue").val(myLineDesc);
	jQuery("#dmlLineLatCoord").html(myLineLat);
	jQuery("#dmlLineLngCoord").html(myLineLng);
}
// 4.7	- Delete Shapes
function dml_reset_button() {
	var myButtonText = jQuery("#dmlBtnReset").val();
	var myShapeID;
	var myShapeType;
	if (myButtonText == "Delete Line") {
		// Deletes one record from the database based on the ID number
		myShapeID = jQuery("#dmlLineSettingsIdValue").text();
		myShapeType = 2;
	} else if (myButtonText == "Delete Polygon") {
		// Deletes one record from the database based on the ID number
		myShapeID = jQuery("#dmlPolygonSettingsIdValue").text();
		myShapeType = 3;
	} else if (myButtonText == "Delete Circle") {
		// Deletes one record from the database based on the ID number
		myShapeID = jQuery("#dmlCircleSettingsIdValue").text();
		myShapeType = 4;
	}
	jQuery("#dmlSettingsDiv").modal("toggle");
	dml_Delete_Db_Marker(myShapeID, myShapeType);
}
// 4.8 - Fills polygones settings panel 
function dml_Fill_Polygon_Settings_Panel(myPolygonID, myPolygonBorderColor, myPolygonFillColor, myPolygonDescription, myPolygonImage, myPolygonVideoCode, myPolygonLinkText, myPolygonLinkUrl, myPolygonLat, myPolygonLng, myPolygonFillHoverColor) {
	// Clears content of panel
	jQuery("#dmlEssSettingsModalBody").html("");
	jQuery("#dmlPnlSettingsTitle").html("Polygon Settings Panel");
	jQuery("#dmlBtnSettingsSave").val("Save Polygon Settings");
	jQuery("#dmlBtnReset").val("Delete Polygon").show();
	jQuery("#dmlSettingsDiv").modal("toggle");
	var newElement1 = jQuery(document.createElement('h2')).attr('id', 'dmlPolygonSettingsCover').attr('class', 'modal-title');
	newElement1.after().html("<div class='input-group'><span class='input-group-addon' id='dmlPolygonSettingsID'>Polygon ID</span><label id='dmlPolygonSettingsIdValue' class='form-control StngElement' aria-describedby='dmlPolygonSettingsID'>" + myPolygonID + "</div><div class='input-group'><span class='input-group-addon' id='dmlPolygonBorderColor'>Border Color</span><input id='dmlPolygonBorderColorValue' type='color' class='form-control StngElement' aria-describedby='dmlPolygonBorderColor'></input></div><div class='input-group'><span class='input-group-addon' id='dmlPolygonFillColor'>Fill Color</span><input id='dmlPolygonFillColorValue' type='color' class='form-control StngElement' aria-describedby='dmlPolygonFillColor'></input></div><div class='input-group'><span class='input-group-addon' id='dmlPolygonDescription'>Description</span><input id='dmlPolygonDescriptionValue' type='text' class='form-control StngElement' aria-describedby='dmlPolygonDescription'></input></div><div id='dmlPolygonLatCoord' style='display: none;'></div><div id='dmlPolygonLngCoord' style='display: none;'></div><br />");
	newElement1.appendTo("#dmlEssSettingsModalBody");
	jQuery("#dmlPolygonBorderColorValue").val(myPolygonBorderColor);
	jQuery("#dmlPolygonFillColorValue").val(myPolygonFillColor);
	jQuery("#dmlPolygonDescriptionValue").val(myPolygonDescription);
	jQuery("#dmlPolygonLatCoord").html(myPolygonLat);
	jQuery("#dmlPolygonLngCoord").html(myPolygonLng);
}
// 4.9 - Fills circle settings panel 
function dml_Fill_Circle_Settings_Panel(myCircleID, myCircleBorderColor, myCircleFillColor, myCircleDescription, myCircleImage, myCircleVideoCode, myCircleLinkText, myCircleLinkUrl, myCircleCenterLat, myCircleCenterLng, myCircleRadius, myCircleFillHoverColor) {
	// Clears content of panel
	jQuery("#dmlEssSettingsModalBody").html("");
	jQuery("#dmlPnlSettingsTitle").html("Circle Settings Panel");
	jQuery("#dmlBtnSettingsSave").val("Save Circle Settings");
	jQuery("#dmlBtnReset").val("Delete Circle").show();
	jQuery("#dmlSettingsDiv").modal("toggle");
	var newElement1 = jQuery(document.createElement('h2')).attr('id', 'dmlCircleSettingsCover').attr('class', 'modal-title');
	newElement1.after().html("<div class='input-group'><span class='input-group-addon' id='dmlCircleSettingsID'>Circle ID</span><label id='dmlCircleSettingsIdValue' class='form-control StngElement' aria-describedby='dmlCircleSettingsID'>" + myCircleID + "</div><div class='input-group'><span class='input-group-addon' id='dmlCircleBorderColor'>Border Color</span><input id='dmlCircleBorderColorValue' type='color' class='form-control StngElement' aria-describedby='dmlCircleBorderColor'></input></div><div class='input-group'><span class='input-group-addon' id='dmlCircleFillColor'>Fill Color</span><input id='dmlCircleFillColorValue' type='color' class='form-control StngElement' aria-describedby='dmlCircleFillColor'></input></div><div class='input-group'><span class='input-group-addon' id='dmlCircleDescription'>Description</span><input id='dmlCircleDescriptionValue' type='text' class='form-control StngElement' aria-describedby='dmlCircleDescription'></input></div><div id='dmlCircleNewCenterLat' style='display: none;'></div><div id='dmlCircleNewCenterLng' style='display: none;'></div><div id='dmlCircleNewRadius' style='display: none;'></div><br />");
	newElement1.appendTo("#dmlEssSettingsModalBody");
	jQuery("#dmlCircleBorderColorValue").val(myCircleBorderColor);
	jQuery("#dmlCircleFillColorValue").val(myCircleFillColor);
	jQuery("#dmlCircleDescriptionValue").val(myCircleDescription);
	jQuery("#dmlCircleNewCenterLat").html(myCircleCenterLat);
	jQuery("#dmlCircleNewCenterLng").html(myCircleCenterLng);
	jQuery("#dmlCircleNewRadius").html(myCircleRadius);
}

// 5 	- HELPERS
// 5.1	- Changes map style icon when map settings panel active
function dml_Change_Map_Type(myStyleNu) {
	jQuery("#dmlSelectedStyleHolder").html(myStyleNu);
	jQuery("#dmlSelectedStyleThmb").html(dmlMapTypeString(myStyleNu));
	dmlmyArr[0].dml_fill_color = myStyleNu;

}
// 5.1.1- Activates text field for the Map Style code
function dmlMapTypeString(dmlMapStyleNo) {
	var myString;
	if (dmlMapStyleNo == 0) {
		myString = "<div class='input-group'><textarea id='dmlCustomStyleCode' class='form-control'>" + dmlmyArr[0].dml_border_color + "</textarea>";
	} else {
		myString = "<div class='input-group'><img src='" + dml_php_links.UrlofPlugin + "/dml-easy-map/styles/thmbs/" + dmlMapStyleNo + ".png' /></div>";
	}
	return myString;
}
// 5.2	- Clears all markers from the map
function dml_Clear_All_Db_Markers() {
	for (var i = 0; i < dmlDbMarkers.length; i++) {
		dmlDbMarkers[i].setMap(null);
	}
	jQuery('.map-icon').hide();
	for (var j = 0; j < dmlClearMultiDbLines.length; j++) {
		dmlClearMultiDbLines[j].setMap(null);
	}
	dmlLineList = [];
	for (var k = 0; k < dmlClearMultiDbPolygones.length; k++) {
		dmlClearMultiDbPolygones[k].setMap(null);
	}
	dmlPolygonList = [];
	for (var m = 0; m < dmlClearMultiDbCircles.length; m++) {
		dmlClearMultiDbCircles[m].setMap(null);
	}
}
// 5.3	- Sets icon ID when a new icon selected for the marker
function dml_Select_One_icon(myId) {
	jQuery(".dmlMarkerIconsList").css("border", "solid 2px white");
	var mySelectedIconId = '#maricon' + myId;
	jQuery(mySelectedIconId).css("border", "solid 2px red");
	jQuery("#dmlMySelectediconID").html(myId);
}
// 5.3.1- Sets icon container ID when a new icon selected for the marker
function dml_Select_Icon_Container(myId) {
	jQuery(".dmlMarkerContainersList").css("border", "solid 2px white");
	var myConId = '#con' + myId;
	jQuery(myConId).css("border", "solid 2px red");
	jQuery("#dmlMySelectediconContainer").html(myId);
}
// 5.3.2- Sets container color
function dml_Select_Icon_Container_Color() {
	var myContainerColor = jQuery("#dmlMarkerContainerColor").val();
	jQuery("#dml_Icon_Container_Color_Text").html(myContainerColor);
}
// 5.4	- Calls AJAX to delete selected marker from the database
function dml_Delete_Db_Marker(myDeleteShapeID, myRecordType) {
	var myAlertMessage;
	if (myRecordType == 1) {
		myAlertMessage = "Do you want to delete this marker?";
	} else if (myRecordType == 2) {
		myAlertMessage = "Do you want to delete this line?";
	} else if (myRecordType == 3) {
		myAlertMessage = "Do you want to delete this polygon?";
	} else if (myRecordType == 4) {
		myAlertMessage = "Do you want to delete this circle?";
	}

	var r = confirm(myAlertMessage);
	if (r == true) {
		var ajax_data = {
			action: "dml_call_ajax",
			dml_backend_function: 6,
			dml_page_link: jQuery("#dml_map_list option:selected").val(),
			dml_post_id: myDeleteShapeID,
		}
		dml_Call_Ajax(ajax_data, 2);
	}
}
// 5.5	- Hides polygons
function dml_hide_polygons() {
	for (var k = 0; k < dmlClearMultiDbPolygones.length; k++) {
		dmlClearMultiDbPolygones[k].setMap(null);
	}
}
// 5.6	- Showes polygons
function dml_show_polygons() {
	for (var k = 0; k < dmlClearMultiDbPolygones.length; k++) {
		dmlClearMultiDbPolygones[k].setMap(dmlmap);
	}
}
// 5.7	- Solves Lat data of the shape
function dml_solve_Coordinates_Lat(myArr) {
	var myResult;
	var coords = [];

	for (var i = 0; i < myArr.length; i++) {

		if (i == 0) {
			myResult = myArr[i].lat();
		} else {
			myResult = myResult + '_' + myArr[i].lat();
		}

	}
	return myResult;
}
// 5.8	- Solves Lng data of the shape
function dml_solve_Coordinates_Lng(myArr) {
	var myResult;
	var coords = [];

	for (var i = 0; i < myArr.length; i++) {

		if (i == 0) {
			myResult = myArr[i].lng();
		} else {
			myResult = myResult + '_' + myArr[i].lng();
		}

	}
	return myResult;
}
// 5.9	- Clears all drawing temporary shapes
function dml_deleteAllDrawingShapes() {
	for (var i = 0; i < all_overlays.length; i++) {
		all_overlays[i].overlay.setMap(null);
	}
	all_overlays = [];
}
// 5.10	- Shows inputs with empty data// Show functions
function dml_Marker_Show_Empty_Helper(myDeger) {
	var myResult;
	if (myDeger == '' || myDeger == 'null' || myDeger == '.') {
		myResult = '';
	} else {
		myResult = myDeger;
	}
	return myResult;
}
// 5.11	- Shows image on the info window
function dmlWriteInfoImageHelper(myId, myValue) {
	var myResult;
	if (myValue == '.') {
		myResult = '<br><span id="' + myId + '_IMG" style="display: none;">' + myValue + '</span><br>';
	} else {
		myResult = '<br><span id="' + myId + '_IMG" style="display: none;">' + myValue + '</span><image width="250" height="150" src="' + myValue + '" /><br>';
	}
	return myResult;
}
// 5.12	- Shows video on the info window
function dmlWriteInfoVideoHelper(myId, myValue) {
	var myResult;
	if (myValue == '.') {
		myResult = '<span id="' + myId + '_VID" style="display: none;">' + myValue + '</span>';
	} else {
		myResult = '<span id="' + myId + '_VID" style="display: none;">' + myValue + '</span><iframe width="250" height="150" src="https://www.youtube.com/embed/' + myValue + '" frameborder="0" allowfullscreen=""></iframe><br>';
	}
	return myResult;
}
// 5.13	-Shows link on the info window
function dmlWriteInfoLink(myId, myLinkText, myLinkUrl) {
	var myResult;
	if (myLinkText == '.' || myLinkUrl == '.') {
		myResult = '<span id="' + myId + '_LT" style="display: none;">' + myLinkText + '</span><span id="' + myId + '_LU" style="display: none;">' + myLinkUrl + '</span>';
	} else {
		myResult = '<span id="' + myId + '_LT" style="display: none;">' + myLinkText + '</span><span id="' + myId + '_LU" style="display: none;">' + myLinkUrl + '</span><a href="' + myLinkUrl + '" target="blank">' + myLinkText + '</a><br>';
	}
	return myResult;
}
// 5.14	- Shows inputs with empty data// Show functions
function dmlMarkerImgVidLinkHelper(myDeger) {
	var myResult;
	if (myDeger == '' || myDeger == 'null') {
		myResult = '.';
	} else {
		myResult = myDeger;
	}
	return myResult;
}
// 5.15	- Shows inputs with empty data// Show functions
function dmlMarkerLinkHelper(myDeger) {
	var myResult;
	if (myDeger == '' || myDeger == 'null') {
		myResult = '.';
	} else {
		myResult = myDeger;
	}
	return myResult;
}
// 5.16 - Shows line, polygons and circles info window data 
function dml_Marker_Show_Empty_Helper(myDeger) {
	var myResult;
	if (myDeger == '' || myDeger == 'null' || myDeger == '.') {
		myResult = '';
	} else {
		myResult = myDeger;
	}
	return myResult;
}


// 6	- DISTANCE COMPUTING FUNCTIONS 
// 6.1	- Add marker for distance measurement
function dml_add_for_distance(distLat, distLng) {
	jQuery("#dmlBtnSettings").hide();
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
// 6.2	- Calculates distance and drwas lines
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
// 6.3	- Helper function to calculate distance
function dml_toRad(deg) {
	return deg * Math.PI / 180;
}
// 6.4 	- Resets distance compute markers and route 
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
		dml_delete_Markers();
	}
}
