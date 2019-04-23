<?php
	
/*
Plugin Name: DML Easy Map
Plugin URI: https://github.com/ardsoft/Google-Map-plugin-for-WordPress
Description: DML easy map lets you integrate easily a Google Map to the wordpress projects. This version lets you pin locations, customize markers and map, calculate distance and driving time between locations easily.
Version: 1.6.1
Author: Ozkan ARDIL
Author URI: http://googlemap.webmountain.net/index.php
License: GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: dml-easy-map
*/

/* !0. TABLE OF CONTENTS */

/*
	
	1. HOOKS
		1.1 - Hooks all shortcodes so WP show them
		1.2 - register ajax actions
		1.3 - load external files to public website
		1.4 - Registers our custom admin menus
		1.5 - Register activate/deactivate/uninstall functions
		
	2. SHORTCODES
		2.1 - dml_register_shortcodes()		register all custom shortcodes
		2.2 - dml_form_shortcode() 			Single shortcode return our html output

	3. FILTERS
		3.1 - dml_admin_menus() 			Creating custom admin menus
		
	4. EXTERNAL SCRIPTS
		4.1 - dml_public_scripts() 			loads external files into PUBLIC website
		4.2 - dml_private_scripts() 		Add scripts to the Admin Page

	5. DATA VALIDATION FUNCTIONS
		5.1 - dml_call_ajax() 				AJAX function caller
		5.2 - dml_validate_create_map_data()Validates create map data
		5.3 - dml_validate_map_settings() 	Validates map settings data
		5.4 - dml_validate_center_map_data()Validates center map data

	6. DATABASE ACTIONS
		6.1 - dml_create_map() 				Creates a new map with default values
		6.2 - dml_get_map() 				Gets map data from the database
		6.3 - dml_save_settings() 			Saves map settings
		6.4 - dml_update_fields() 			Updates fields
		6.5 - dml_create_new_marker() 		Creates new marker
		6.6 - dml_save_marker_text() 		Saves marker title and description
		6.7 - dml_save_marker_icon() 		Saves new icon marker
		6.8 - dml_delete_record() 			Deletes selected marker
		6.9 - dml_get_record_id() 			Gets selected record ID
		6.10- dml_remove_map() 				Removes map and its markers / contents from database
		6.11- dml_add_new_corner() 			Adds new corner to the axisting shape
		6.12- dml_Save_Line_Settings() 		Saves line settings 

	7. HELPERS
		7.1 - dml_return_json() 			Turns return value into JSON format
		7.2 - dml_check_wp_version() 		Check WP version
		7.3 - dml_get_admin_notice() 		Returns html formatted for WP admin notices
		7.4 - dml_search_link_string() 		Checks admin URL whether valid for PLUGIN or not
		7.5 - dml_check_layer_data() 		Checks the layer data
		7.6 - dml_check_infowindow_data() 	Checks the infowindow data 

	8. ACTIVATION, DEACTIVATION AND DELETING OF PLUGIN
		8.1 - dml_uninstall_plugin() 		Run functions for plugin uninstalls
		8.2 - dml_remove_post_data() 		Removes post_data on uninstall 
		8.3 - dml_deactivate_plugin() 		Hides shortcodes when plugin deactivated

	9. ADMIN PAGES
		9.1 - dml_dashboard_admin_page() 	Dashboard admin page
		9.2 - dml_list_admin_maps() 		Creates list of the maps

	10. SETTINGS
	
	11. MISCELLANEOUS 

*/


/* !1. HOOKS */
// 1.1 - Hooks all shortcodes so WP show them
add_action('init', 'dml_register_shortcodes');
// 1.2 - register ajax actions
add_action('wp_ajax_nopriv_dml_call_ajax', 'dml_call_ajax'); // regular website visitor
add_action('wp_ajax_dml_call_ajax', 'dml_call_ajax'); // admin user
// 1.3 - load external files to public website
add_action('wp_enqueue_scripts', 'dml_public_scripts', 9999);
add_action('admin_init','dml_private_scripts', 9999);
// 1.4 - Registers our custom admin menus 
add_action('admin_menu', 'dml_admin_menus');
// 1.5 - Register activate/deactivate/uninstall functions
add_action( 'admin_notices', 'dml_check_wp_version' );
register_deactivation_hook( __FILE__, 'dml_deactivate_plugin' );
register_uninstall_hook( __FILE__, 'dml_uninstall_plugin' );
// 1.6 - TEST TEST TEST
//add_filter( 'dml_emap', 'shortcode_unautop');
add_filter( 'the_excerpt', 'do_shortcode');


/* 2. SHORTCODES */
// 2.1 - register all custom shortcodes
function dml_register_shortcodes () {
	add_shortcode('dml_emap', 'dml_form_shortcode');
}
// 2.2 - HTML form
function dml_form_shortcode () {
	//setup our output variable - the form html
	$output = '
	<!-- MAP PANEL STARTS -->
	<div id="dmlMap1idHolder" style="display:none;"></div>';
		
		$userloggedin = is_user_logged_in();
		if ($userloggedin == 1):
			echo '<div id="dmlmyMap1Edit" style="display:none;">1</div>';
		else:
			echo '<div id="dmlmyMap1Edit" style="display:none;">0</div>';
		endif; 
		
	$output .= '
	<div id="dmlMapContainer" style="display:none;">
		<div id="Repeater1Container">
			<div class="row">
				<div id="distance_road"></div>
				<div id="distance_direct"></div>
				<div id="dmlRepeater1Map">
					<div id="dmlmap" class="container-fluid"></div>
				</div>				
			</div>
		</div>
	</div>
	<!-- MAP PANEL ENDS -->

	<!-- MAP ACTIVATION API PANEL STARTS -->
	<div id="dmlApiDiv" class="container-fluid" style="text-align: center; display: none;">
		<div id="dmlApiEnterPanel">
			<h3>PLEASE ENTER YOUR API KEY</h3>
			<p>To take your key, follow <a href="https://developers.google.com/maps/documentation/javascript/get-api-key#get-an-api-key"
					target="_blank">this link</a> and click on the <b>GET A KEY</b></p>
			<input id="dmlTxtApiKey" type="text" style="text-align:center;" />
			<h3>
				<div id="dmlBtnSaveApiKey" onclick="dml_Call_Ajax(2);" class="btn btn-success">Save Api Code</div>
			</h3>
		</div>
		<div id="dmlApiKeyError"></div>
	</div>
	<div style="clear: both;"></div>
	<!-- MAP ACTIVATION PANEL ENDS -->

	<!--SETTINGS MODAL POPUP STARTS-->
	<div id="dmlSettingsDiv" class="modal fade" role="dialog" style="display:none;">
		<div class="modal-dialog">
			<!-- Modal content-->
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal">&times;</button>
					<h4 id="dmlPnlSettingsTitle" class="modal-title">Settings Panel1</h4>
				</div>
				<div id="dmlEssSettingsModalBody" class="modal-body">
				</div>
				<div class="modal-footer">
					<input id="dmlBtnReset" type="button" class="btn btn-danger pull-left" onclick="dml_reset_button();" value="Reset" />
					<input id="dmlBtnSettingsSave" type="button" class="btn btn-success" value="Save" onclick="dml_Save_Settings();" />
					<div id="dmlSettingsCustomText" style="display:none;"></div>
				</div>
			</div>
		</div>
		<div id="mySettingSaveStart" style="display: none;"></div>
	</div>
	<!---SETTINGS MODAL POPUP ENDS-->

	<!--NON CONTENT AND HOVER BUTTON STARTS-->
	<div id="dmlBtnSettings" class="btn btn-primary fontawesome-cogs " onclick="dml_Fill_Settings();"
		style="display: none;"> Map Settings</div>
	<!--NON CONTENT AND HOVER BUTTON STARTS-->
	<br />	
	';
	
	//return our result/html
	return $output;
}


/* 3. FILTERS */
// 3.1 - Creating custom admin menus
 function dml_admin_menus() {
	
	/* main menu */
	
		$top_menu_item = 'dml_dashboard_admin_page';
	    
	    add_menu_page( '', 'DML Map', 'manage_options', 'dml_dashboard_admin_page', 'dml_dashboard_admin_page', 'dashicons-location-alt' );
  
}


/* 4. EXTERNAL SCRIPTS */
// 4.1 - loads external files into PUBLIC website
function dml_public_scripts() {
	
	if ( is_single() ) {
		global $post;
		if ( has_shortcode( $post->post_content, 'dml_emap') ) {
		
			// register scripts with WordPress's internal library
			wp_register_script('dmlmap-js-public', plugins_url('/js/public/dmlmap.js',__FILE__), array('jquery'),'',true);
			$dmlPubAdminLink = admin_url();
			$dmlPubPluginLink = plugins_url();
			$dataPubToBePassed = array(
				'UrlofPubAdmin' => __( $dmlPubAdminLink, 'default' ),
				'UrlofPubPlugin' => __( $dmlPubPluginLink, 'default' )
			);
			wp_localize_script( 'dmlmap-js-public', 'dml_pub_php_links', $dataPubToBePassed );
			wp_enqueue_script('dmlmap-js-public');
			
			wp_register_script('dmlmap-clusterjs', plugins_url('/js/markerclusterer.js',__FILE__), array('jquery'),'',true);
			wp_enqueue_script('dmlmap-clusterjs');
			
			wp_register_script('dmlmap-bootstrapjs-public', plugins_url('/js/bootstrap.min.js',__FILE__), array('jquery'),'',true);
			wp_enqueue_script('dmlmap-bootstrapjs-public');
				
			wp_register_style('dmlmap-css-public', plugins_url('/css/public/dmlbootstrap.css',__FILE__));
			wp_enqueue_style('dmlmap-css-public');

			wp_register_style('dmlmap-mapiconscss-public', plugins_url('/css/public/map-icons.css',__FILE__));
			wp_enqueue_style('dmlmap-mapiconscss-public');

			wp_register_style('dmlmap-customcss-public', plugins_url('/css/public/dmlcustomstyle.css',__FILE__));
			wp_enqueue_style('dmlmap-customcss-public');
		}
	}
}
// 4.2 - Add scripts to the Admin Page 
function dml_private_scripts() {
	global $pagenow, $typenow;

	$needle = "admin.php?page=dml_dashboard_admin_page";
	$dmlLinkSearch = dml_search_link_string($needle);

	if (is_admin() && $dmlLinkSearch == 1) {
	
		// register scripts with WordPress's internal library
		wp_enqueue_script('jquery');
		
		wp_register_script('dmlmap-js-private', plugins_url('/js/private/dmlmap.js',__FILE__), array('jquery'),'',true);
		$dmlAdminLink = admin_url();
		$dmlPluginLink = plugins_url();
		$dataToBePassed = array(
			'UrlofPlugin' => __( $dmlPluginLink, 'default' ),
			'UrlofAdmin' => __( $dmlAdminLink, 'default' )
		);
		wp_localize_script( 'dmlmap-js-private', 'dml_php_links', $dataToBePassed );
		wp_enqueue_script('dmlmap-js-private');

		wp_register_script('dmlmap-clusterjs', plugins_url('/js/markerclusterer.js',__FILE__), array('jquery'),'',true);
		wp_enqueue_script('dmlmap-clusterjs');

		wp_register_script('dmlmap-bootstrapjs-public', plugins_url('/js/bootstrap.min.js',__FILE__), array('jquery'),'',true);
		wp_enqueue_script('dmlmap-bootstrapjs-public');
			
		wp_register_style('dmlmap-mapiconscss-private', plugins_url('/css/public/map-icons.css',__FILE__));
		wp_enqueue_style('dmlmap-mapiconscss-private');

		wp_register_style('dmlmap-css-public', plugins_url('/css/public/dmlbootstrap.css',__FILE__));
		wp_enqueue_style('dmlmap-css-public');

		wp_register_style('dmlmap-customcss-public', plugins_url('/css/public/dmlcustomstyle.css',__FILE__));
		wp_enqueue_style('dmlmap-customcss-public');
	}
} 


/* 5. AJAX caller and DATA VALIDATION FUNCTIONS */
// 5.1 - AJAX function caller
function dml_call_ajax() {
	$result = array(
		'status' => '0',
		'message' => 'Enable to run request.',
	);

	$dml_backend_function = absint( $_POST['dml_backend_function'] );
	
	if ( isset( $dml_backend_function ) ) {
		if ($dml_backend_function == 1){
			$result = dml_get_map();
		} elseif ($dml_backend_function == 2) {
			$result = dml_validate_create_map_data();
		} elseif ($dml_backend_function == 3) {
			$result = dml_validate_map_settings();
		} elseif ($dml_backend_function == 4) {
			$result = dml_validate_center_map_data();
		} elseif ($dml_backend_function == 5) {
			$result = dml_create_new_marker();
		} elseif ($dml_backend_function == 6) {
			$result = dml_delete_record();
		} elseif ($dml_backend_function == 7) {
			// Removes map and all markers / shapes according to the link
			try {
				$myDeleteStatus = dml_remove_map();
				
				if( $myDeleteStatus ):
					$result['status'] = $myDeleteStatus;
					$result['message'] = "Map removed.";
				else:
					$result['message'] = "Unable to remove map.";
				endif;
			} catch ( Exception $e ) {
				$result['message'] = "Error: " . $e->getMessage();
			}	
		} elseif ($dml_backend_function == 8) {
			$result = dml_save_marker_icon();
		} elseif ($dml_backend_function == 9) {
			$result = dml_save_marker_text();
		} elseif ($dml_backend_function == 10) {
			$result = dml_add_new_corner();
		} elseif ($dml_backend_function == 11) {
			$result = dml_Save_Line_Settings();
		}  elseif ($dml_backend_function == 12) {
			$result = dml_Save_Polygon_Settings();
		}  elseif ($dml_backend_function == 13) {
			$result = dml_Save_Circle_Settings();
		}
		
	} else {
		$result['message'] = "Invalid AJAX call";
	}

	dml_return_json($result);
}
// 5.2 - Validates data to create a new map
function dml_validate_create_map_data(){
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to create map',
	);
	// Gets map data and dmlinitMap
	$dml_page_link = esc_url_raw( $_POST['dml_page_link'] );
	$dml_api_code = sanitize_text_field( $_POST['dml_api_code'] );

	if ( isset( $dml_page_link ) && isset( $dml_api_code ) ) {
		try {
			$newMapid = dml_create_map( $dml_page_link, $dml_api_code );

			if( $newMapid ):
				$result = dml_get_map();
			else:
				$result['status'] = 2;
				$result['message'] = "Centering map request could not be saved";
			endif;
		} catch ( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}	
	}
	return (array)$result;	
}
// 5.3 - Validates map settings data
function dml_validate_map_settings() {
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to save settings',
	);
	// Gets map data and dmlinitMap
	$dml_page_link = esc_url_raw( $_POST['dml_page_link'] );
	$dml_post_id = absint( $_POST['dml_post_id'] );
	$dml_api_code = sanitize_text_field( $_POST['dml_api_code'] );
	$dml_height_title = absint( $_POST['dml_height_title'] ); // map height must be positive integer
	$dml_fill_color = absint( $_POST['dml_fill_color'] ); // map style number must be positive integer
	$dml_border_color = sanitize_text_field ( $_POST['dml_border_color'] );
	$dml_zoom_icon = absint( $_POST['dml_zoom_icon'] ); // map zoom must be positive integer
	$dml_layers = sanitize_text_field( $_POST['dml_layers'] ); // map layers code

	if ( isset( $dml_page_link ) && isset( $dml_post_id ) && isset( $dml_api_code ) && isset( $dml_height_title ) && isset( $dml_fill_color ) && isset( $dml_border_color ) && isset( $dml_zoom_icon ) && isset( $dml_layers ) ) {
		try {
			$settingsData = array(
				'dml_post_id' => $dml_post_id,
				'dml_api_code' => $dml_api_code,
				'dml_height_title' => $dml_height_title,
				'dml_fill_color' => $dml_fill_color,
				'dml_border_color' => $dml_border_color,
				'dml_zoom_icon' => $dml_zoom_icon,
				'dml_layers' => $dml_layers,
			);
			
			$mySaveStatus = dml_save_settings($settingsData);

			if( $mySaveStatus == 1 ):
				$result = dml_get_map();
			else:
				$result['status'] = 2;
				$result['message'] = "Settings could not be saved.";
			endif;
		} catch ( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}	
	}
	return (array)$result;	
}
// 5.4 - Validates center map data 
function dml_validate_center_map_data() {
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to center map',
	);
	// Gets map data and dmlinitMap
	$dml_page_link = esc_url_raw( $_POST['dml_page_link'] );
	$dml_post_id = absint( $_POST['dml_post_id'] );
	$dml_field1 = sanitize_text_field( $_POST['dml_field1'] ); // Field1 name for update query
	$dml_value1 = sanitize_text_field( $_POST['dml_value1'] ); // Lat data
	$dml_field2 = sanitize_text_field( $_POST['dml_field2'] ); // Field2 name for update query
	$dml_value2 = sanitize_text_field( $_POST['dml_value2'] ); // Lng data
	$dml_field_num = absint( $_POST['dml_field_num'] );

	if ( isset( $dml_page_link ) && isset( $dml_post_id ) && isset( $dml_field1 ) && isset( $dml_value1 ) && isset( $dml_field2 ) && isset( $dml_value2 ) && isset( $dml_field_num ) ) {
		try {
			$centerData = array(
				'dml_post_id' => $dml_post_id,
				'dml_field1' => $dml_field1,
				'dml_value1' => $dml_value1,
				'dml_field2' => $dml_field2,
				'dml_value2' => $dml_value2,
				'dml_field_num' => $dml_field_num,
			);
			
			$mySaveStatus = dml_update_fields($centerData);
			
			if( $mySaveStatus == 1 ):
				$result = dml_get_map();
			else:
				$result['status'] = 2;
				$result['message'] = "Center map action could not be saved.";
			endif;
	
		} catch ( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}	
	}
	return (array)$result;
}


/* 6. DATABASE ACTIONS */
// 6.1 - Creates a new map with default values
function dml_create_map($url, $apicode) {

	$map_id = 0;
	
	try {
		// add new map to database	
		$map_id = wp_insert_post( 
			array(
				'post_type'=>'dml_location',
				'post_status'=>'publish',
				'post_title'=>sanitize_title( 'Dml Map Content' ),
				'post_content'=>$url,
			), 
			true
		);
		
		if( $map_id ):
			// add/update map meta data
			add_post_meta( $map_id, 'dml_page_link', $url );
			add_post_meta( $map_id, 'dml_record_type', 'M' );
			add_post_meta( $map_id, 'dml_lat', '-37.817564805286814' );
			add_post_meta( $map_id, 'dml_lng', '144.9440860748291' );
			add_post_meta( $map_id, 'dml_height_title', '650' );
			add_post_meta( $map_id, 'dml_maptype__markerdesc', $apicode );
			add_post_meta( $map_id, 'dml_zoom_icon', '12' );
			add_post_meta( $map_id, 'dml_fill_color', '1' );
			add_post_meta( $map_id, 'dml_layers', '0_0_0_0' );
		endif;
	
	} catch( Exception $e ) {
			
			die($e->getMessage());

	}

	return $map_id;
		
}
// 6.2 - Gets map data from the database
function dml_get_map(){
	$result = array(
		'status' => 0,
		'message' => 'Invalid page link to show map',
	);
	// Gets map data and dmlinitMap
	
	$url = esc_url_raw( $_POST['dml_page_link'] );

	if ( isset( $url ) ) {
		
		$record_id = dml_get_record_id( $url );
		
		if( $record_id ):
			
			$map_id = 0;
			try {
				$result=array();
				$args = array(
						'post_type'		=>	'dml_location',
						'posts_per_page' => -1,
						'orderby'       => 'ID',
						'order'         => 'ASC',
						'meta_key' 		=> 'dml_page_link',
						'meta_query' 	=> array(
							array(
								'key' => 'dml_page_link',
								'value' => $url,  // or whatever it is you're using here
								'compare' => '=',
							),
						),
				);
				$my_query = new WP_Query($args);

				if ($my_query->have_posts()) : 
					while ($my_query->have_posts()) : $my_query->the_post(); 
						$myRecordId = get_the_ID();
						$result[] = array(
							'status' => 1,
							'dml_id' => $myRecordId,
							'dml_page_link' => esc_url( get_post_meta(get_the_ID(), 'dml_page_link', true) ),
							'dml_record_type' => esc_html( get_post_meta(get_the_ID(), 'dml_record_type', true) ),
							'dml_lat' => esc_html( get_post_meta(get_the_ID(), 'dml_lat', true) ),
							'dml_lng' => esc_html( get_post_meta(get_the_ID(), 'dml_lng', true) ),
							'dml_height_title' => esc_html( get_post_meta(get_the_ID(), 'dml_height_title', true) ), //Map: height value holder, shape: title
							'dml_maptype__markerdesc' => esc_html( get_post_meta(get_the_ID(), 'dml_maptype__markerdesc', true) ), // Map: Api Code Holder
							'dml_zoom_icon' => esc_html( get_post_meta(get_the_ID(), 'dml_zoom_icon', true) ), //map: zoom
							'dml_fill_color' => esc_html( get_post_meta(get_the_ID(), 'dml_fill_color', true) ), //Map: Style
							'dml_border_color' => sanitize_text_field( get_post_meta(get_the_ID(), 'dml_border_color', true) ), //Shape: Border color
							'dml_layers' => dml_check_layer_data( esc_html( get_post_meta(get_the_ID(), 'dml_layers', true) ) ), //Layer code
							'dml_image_link' => dml_check_infowindow_data( esc_html( get_post_meta(get_the_ID(), 'dml_image_link', true) ) ), //Info window image link
							'dml_video_link' => dml_check_infowindow_data( esc_html( get_post_meta(get_the_ID(), 'dml_video_link', true) ) ), //Info window video link
							'dml_link_text' => dml_check_infowindow_data( esc_html( get_post_meta(get_the_ID(), 'dml_link_text', true) ) ), //Info window link text
							'dml_link_url' => dml_check_infowindow_data( esc_html( get_post_meta(get_the_ID(), 'dml_link_url', true) ) ), //Info window link url
						);
						
					endwhile;
				endif;
			} catch( Exception $e ) {
				$result['message'] = "Error: " . $e->getMessage();
			}
		else:
			$result['status'] = 2;
			$result['message'] = "There is no map on the page";
		endif;
	
	}

	// reset the Wordpress post object
	wp_reset_query();
	
	return (array)$result;
}
// 6.3 - Saves map settings
function dml_save_settings($settingsData){
	$result = 0;
	
	try {
		$map_id = (int)$settingsData['dml_post_id'];

		// add/update map meta data
		update_post_meta( $map_id, 'dml_maptype__markerdesc', $settingsData['dml_api_code'] );
		update_post_meta( $map_id, 'dml_height_title', $settingsData['dml_height_title'] );
		update_post_meta( $map_id, 'dml_fill_color', $settingsData['dml_fill_color'] );
		update_post_meta( $map_id, 'dml_border_color', $settingsData['dml_border_color'] );
		update_post_meta( $map_id, 'dml_zoom_icon', $settingsData['dml_zoom_icon'] );
		update_post_meta( $map_id, 'dml_layers', $settingsData['dml_layers'] );

		$result = 1;	
	} catch( Exception $e ) {
			
			die($e->getMessage());

	}
	return $result;
}
// 6.4 - Updates fields
function dml_update_fields($data){
	$result = 0;
	
	try {
		$map_id = $data['dml_post_id'];

		// add/update map meta data only 1 field as default
		update_post_meta( $map_id, $data['dml_field1'], $data['dml_value1'] );
				
		if ( $data['dml_field_num'] == 2 ) {
			update_post_meta( $map_id, $data['dml_field2'], $data['dml_value2'] );
		} else if ( $data['dml_field_num'] == 3 ) {
			update_post_meta( $map_id, $data['dml_field2'], $data['dml_value2'] );
			update_post_meta( $map_id, $data['dml_field3'], $data['dml_value3'] );
		} else if ( $data['dml_field_num'] == 6 ) {
			update_post_meta( $map_id, $data['dml_field2'], $data['dml_value2'] );
			update_post_meta( $map_id, $data['dml_field3'], $data['dml_value3'] );
			update_post_meta( $map_id, $data['dml_field4'], $data['dml_value4'] );
			update_post_meta( $map_id, $data['dml_field5'], $data['dml_value5'] );
			update_post_meta( $map_id, $data['dml_field6'], $data['dml_value6'] );
		}  else if ( $data['dml_field_num'] == 7 ) {
			update_post_meta( $map_id, $data['dml_field2'], $data['dml_value2'] );
			update_post_meta( $map_id, $data['dml_field3'], $data['dml_value3'] );
			update_post_meta( $map_id, $data['dml_field4'], $data['dml_value4'] );
			update_post_meta( $map_id, $data['dml_field5'], $data['dml_value5'] );
			update_post_meta( $map_id, $data['dml_field6'], $data['dml_value6'] );
			update_post_meta( $map_id, $data['dml_field7'], $data['dml_value7'] );
		}  else if ( $data['dml_field_num'] == 8 ) {
			update_post_meta( $map_id, $data['dml_field2'], $data['dml_value2'] );
			update_post_meta( $map_id, $data['dml_field3'], $data['dml_value3'] );
			update_post_meta( $map_id, $data['dml_field4'], $data['dml_value4'] );
			update_post_meta( $map_id, $data['dml_field5'], $data['dml_value5'] );
			update_post_meta( $map_id, $data['dml_field6'], $data['dml_value6'] );
			update_post_meta( $map_id, $data['dml_field7'], $data['dml_value7'] );
			update_post_meta( $map_id, $data['dml_field8'], $data['dml_value8'] );
		}  else if ( $data['dml_field_num'] == 9 ) {
			update_post_meta( $map_id, $data['dml_field2'], $data['dml_value2'] );
			update_post_meta( $map_id, $data['dml_field3'], $data['dml_value3'] );
			update_post_meta( $map_id, $data['dml_field4'], $data['dml_value4'] );
			update_post_meta( $map_id, $data['dml_field5'], $data['dml_value5'] );
			update_post_meta( $map_id, $data['dml_field6'], $data['dml_value6'] );
			update_post_meta( $map_id, $data['dml_field7'], $data['dml_value7'] );
			update_post_meta( $map_id, $data['dml_field8'], $data['dml_value8'] );
			update_post_meta( $map_id, $data['dml_field9'], $data['dml_value9'] );
		}  else if ( $data['dml_field_num'] == 10 ) {
			update_post_meta( $map_id, $data['dml_field2'], $data['dml_value2'] );
			update_post_meta( $map_id, $data['dml_field3'], $data['dml_value3'] );
			update_post_meta( $map_id, $data['dml_field4'], $data['dml_value4'] );
			update_post_meta( $map_id, $data['dml_field5'], $data['dml_value5'] );
			update_post_meta( $map_id, $data['dml_field6'], $data['dml_value6'] );
			update_post_meta( $map_id, $data['dml_field7'], $data['dml_value7'] );
			update_post_meta( $map_id, $data['dml_field8'], $data['dml_value8'] );
			update_post_meta( $map_id, $data['dml_field9'], $data['dml_value9'] );
			update_post_meta( $map_id, $data['dml_field10'], $data['dml_value10'] );
		}

		$result = 1;	
	} catch( Exception $e ) {
			
			die($e->getMessage());

	}
	return $result;
}
// 6.5 - Creates new marker
function dml_create_new_marker(){
	// Default result
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to create new marker',
	);

	// Data validation
	$dml_page_link = esc_url_raw( $_POST['dml_page_link'] );
	$dml_record_type = sanitize_text_field( $_POST['dml_record_type']);
	$dml_temp_MyMarkerType = absint( $_POST['dml_temp_MyMarkerType'] );
	$dml_lat = sanitize_text_field( $_POST['dml_lat'] );
	$dml_lng = sanitize_text_field( $_POST['dml_lng'] ); 
	$dml_height_title = sanitize_text_field( $_POST['dml_height_title'] );
	$dml_maptype__markerdesc = sanitize_text_field( $_POST['dml_maptype__markerdesc'] );
	$dml_image_link = sanitize_text_field( $_POST['dml_image_link'] );
	$dml_video_link = sanitize_text_field( $_POST['dml_video_link'] );
	$dml_link_text = sanitize_text_field( $_POST['dml_link_text'] );
	$dml_link_url = sanitize_text_field( $_POST['dml_link_url'] );

	if ( $dml_temp_MyMarkerType == 1 ) {
		// MARKER icon id
		$dml_zoom_icon = absint( $_POST['dml_zoom_icon'] );
	} else if ( $dml_temp_MyMarkerType == 2 ) {
		// LINE color and temp marker id
		$dml_zoom_icon = sanitize_text_field( $_POST['dml_zoom_icon'] );
		$dml_border_color = sanitize_text_field( $_POST['dml_border_color'] );
	} else if ( $dml_temp_MyMarkerType == 3 ) {
		// POLYGON color and temp marker id
		$dml_zoom_icon = sanitize_text_field( $_POST['dml_zoom_icon'] );
		$dml_border_color = sanitize_text_field( $_POST['dml_border_color'] );
		$dml_fill_color = sanitize_text_field( $_POST['dml_fill_color'] );
	} else if ( $dml_temp_MyMarkerType == 4 ) {
		// CIRCLE color and temp marker id
		$dml_zoom_icon = absint( $_POST['dml_zoom_icon'] );
		$dml_border_color = sanitize_text_field( $_POST['dml_border_color'] );
		$dml_fill_color = sanitize_text_field( $_POST['dml_fill_color'] );
	}

	// Database action
	if ( isset( $dml_page_link ) && isset( $dml_record_type ) && isset( $dml_lat ) && isset( $dml_lng ) && isset( $dml_height_title ) && isset( $dml_maptype__markerdesc ) && isset( $dml_zoom_icon ) && isset( $dml_temp_MyMarkerType ) && isset( $dml_image_link ) && isset( $dml_video_link ) && isset( $dml_link_text ) && isset( $dml_link_url ) ) {
		$map_id = 0;
	
		try {
			// add new map to database	
			$map_id = wp_insert_post( 
				array(
					'post_type'=>'dml_location',
					'post_status'=>'publish',
					'post_title'=>sanitize_title( 'Dml Map Content' ),
					'post_content'=>sanitize_text_field( $dml_page_link ),
				), 
				true
			);
			
			if( $map_id ):
				$markertype = $dml_temp_MyMarkerType;
				// add/update map meta data
				update_post_meta( $map_id, 'dml_page_link', $dml_page_link );
				update_post_meta( $map_id, 'dml_record_type', $dml_record_type );
				update_post_meta( $map_id, 'dml_lat', $dml_lat );
				update_post_meta( $map_id, 'dml_lng', $dml_lng );
				update_post_meta( $map_id, 'dml_height_title', $dml_height_title );
				update_post_meta( $map_id, 'dml_maptype__markerdesc', $dml_maptype__markerdesc );
				update_post_meta( $map_id, 'dml_zoom_icon', $dml_zoom_icon );
				update_post_meta( $map_id, 'dml_image_link', $dml_image_link );
				update_post_meta( $map_id, 'dml_video_link', $dml_video_link );
				update_post_meta( $map_id, 'dml_link_text', $dml_link_text );
				update_post_meta( $map_id, 'dml_link_url', $dml_link_url );

				if ( $markertype == 2 ) {
					// Add/update specific meta data for line
					update_post_meta( $map_id, 'dml_border_color', $dml_border_color );
				} elseif ( $markertype == 3 ) {
					// Add/update specific meta data for polygon
					update_post_meta( $map_id, 'dml_border_color', $dml_border_color );
					update_post_meta( $map_id, 'dml_fill_color', $dml_fill_color );
				}  elseif ( $markertype == 4 ) {
					// Add/update specific meta data for circle
					update_post_meta( $map_id, 'dml_border_color', $dml_border_color );
					update_post_meta( $map_id, 'dml_fill_color', $dml_fill_color );
				}

				$result = dml_get_map();
			else:
				$result['status'] = 2;
				$result['message'] = "Unable to create new marker.";
			endif;
		} catch( Exception $e ) {
			die($e->getMessage());
		}
	}
	return (array)$result;
}
// 6.6 - Saves marker title and description 
function dml_save_marker_text() {
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to update text fields',
	);
	// Gets map data and dmlinitMap
	$dml_page_link = esc_url_raw( $_POST['dml_page_link'] );
	$dml_post_id = absint( $_POST['dml_post_id'] );
	$dml_field1 = sanitize_text_field( $_POST['dml_field1'] ); // Field1 name for update query
	$dml_value1 = sanitize_text_field( $_POST['dml_value1'] ); // Textarea1
	$dml_field2 = sanitize_text_field( $_POST['dml_field2'] ); // Field2 name for update query
	$dml_value2 = sanitize_text_field( $_POST['dml_value2'] ); // Textarea2 
	$dml_field3 = sanitize_text_field( $_POST['dml_field3'] ); // Field3 name for update query
	$dml_value3 = esc_html( $_POST['dml_value3'] ); // Textarea3 
	$dml_field4 = sanitize_text_field( $_POST['dml_field4'] ); // Field4 name for update query
	$dml_value4 = sanitize_text_field( $_POST['dml_value4'] ); // Textarea4 
	$dml_field5 = sanitize_text_field( $_POST['dml_field5'] ); // Field5 name for update query
	$dml_value5 = sanitize_text_field( $_POST['dml_value5'] ); // Textarea5 
	$dml_field6 = sanitize_text_field( $_POST['dml_field6'] ); // Field6 name for update query
	$dml_value6 = esc_html( $_POST['dml_value6'] ); // Textarea6 
	$dml_field_num = absint( $_POST['dml_field_num'] );

	if ( isset( $dml_page_link ) && isset( $dml_post_id ) && isset( $dml_field1 ) && isset( $dml_value1 ) && isset( $dml_field2 ) && isset( $dml_value2 ) && isset( $dml_field3 ) && isset( $dml_value3 ) && isset( $dml_field4 ) && isset( $dml_value4 ) && isset( $dml_field5 ) && isset( $dml_value5 ) && isset( $dml_field6 ) && isset( $dml_value6 ) && isset( $dml_field_num ) ) {
		try {
			$textData = array(
				'dml_post_id' => $dml_post_id,
				'dml_field1' => $dml_field1,
				'dml_value1' => $dml_value1,
				'dml_field2' => $dml_field2,
				'dml_value2' => $dml_value2,
				'dml_field3' => $dml_field3,
				'dml_value3' => $dml_value3,
				'dml_field4' => $dml_field4,
				'dml_value4' => $dml_value4,
				'dml_field5' => $dml_field5,
				'dml_value5' => $dml_value5,
				'dml_field6' => $dml_field6,
				'dml_value6' => $dml_value6,
				'dml_field_num' => $dml_field_num,
			);
			
			$mySaveStatus = dml_update_fields($textData);
			
			if( $mySaveStatus == 1 ):
				$result = dml_get_map();
			else:
				$result['status'] = 2;
				$result['message'] = "Unable to save text fields.";
			endif;
	
		} catch ( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}	
	}
	return (array)$result;
}
// 6.7 - Saves new marker icon 
function dml_save_marker_icon() {
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to update icon',
	);
	// Gets map data and dmlinitMap
	$dml_page_link = esc_url_raw( $_POST['dml_page_link'] );
	$dml_post_id = absint( $_POST['dml_post_id'] );
	$dml_field1 = sanitize_text_field( $_POST['dml_field1'] ); // Field1 name for update query
	$dml_value1 = sanitize_text_field( $_POST['dml_value1'] ); // selected icon id 
		
	if ( isset( $dml_page_link ) && isset( $dml_post_id ) && isset( $dml_field1 ) && isset( $dml_value1 ) ) {
		try {
			$iconData = array(
				'dml_post_id' => $dml_post_id,
				'dml_field1' => $dml_field1,
				'dml_value1' => $dml_value1,
			);
			
			$mySaveStatus = dml_update_fields($iconData);
			
			if( $mySaveStatus == 1 ):
				$result = dml_get_map();
			else:
				$result['status'] = 2;
				$result['message'] = "Change icon request could not be saved.";
			endif;
	
		} catch ( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}	
	}
	return (array)$result;
} 
// 6.8 - Deletes selected marker
function dml_delete_record () {
	// default return value
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to delete the record',
	);
	// Data validation
	$dml_post_id = absint( $_POST['dml_post_id'] );
	
	if ( isset( $dml_post_id ) ) {
		// get WP's wpdb class
		global $wpdb;
		
		try {
			
			// get our custom table name
			$table_name = $wpdb->prefix . "posts";
			
			// remove data from the posts db table where post types are equal to our custom post types
			$result = $wpdb->query(
				$wpdb->prepare( 
					"
						DELETE FROM $table_name 
						WHERE ID = %s
					", 
					$dml_post_id
				) 
			);
			
			// get the table names for postmet and posts with the correct prefix
			$table_name_1 = $wpdb->prefix . "postmeta";
			$table_name_2 = $wpdb->prefix . "posts";
			
			// delete orphaned meta data
			$wpdb->query(
				$wpdb->prepare( 
					"
					DELETE pm
					FROM $table_name_1 pm
					LEFT JOIN $table_name_2 wp ON wp.ID = pm.post_id
					WHERE wp.ID IS NULL
					"
				) 
			);

			$result = dml_get_map();
			
		} catch( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}
	}
	return (array)$result;
}
// 6.9 - Gets selected record ID
function dml_get_record_id( $url ) {
	
	$record_id = 0;
	
	try {
	
		// check if subscriber already exists
		$record_query = new WP_Query( 
			array(
				'post_type'	=> 'dml_location',
				'posts_per_page' => 1,
				'meta_key' => 'dml_page_link',
				'meta_query' => array(
				    array(
				        'key' => 'dml_page_link',
				        'value' => $url,
				        'compare' => '=',
				    ),
				),
			)
		);
		
		// IF the subscriber exists...
		if( $record_query->have_posts() ):
		
			// get the record_id
			$record_query->the_post();
			$record_id = get_the_ID();
			
		endif;
	
	} catch( Exception $e ) {
		
		// a php error occurred
		
	}
		
	// reset the Wordpress post object
	wp_reset_query();
	
	return (int)$record_id;
	
}
// 6.10 - Removes map and its markers / contents from database
function dml_remove_map () {
	$postLink = esc_url_raw( $_POST['dml_page_link'] );

	if ( isset( $postLink ) ) {
		// get WP's wpdb class
		global $wpdb;
		
		// setup return variable
		$data_removed = 0;
		
		try {
			// get our custom table name
			$table_name = $wpdb->prefix . "posts";
			
			// remove data from the posts db table where post types are equal to our custom post types
			$data_removed = $wpdb->query(
				$wpdb->prepare( 
					"
						DELETE FROM $table_name 
						WHERE post_content = %s
					", 
					$postLink
				) 
			);
			
			// get the table names for postmet and posts with the correct prefix
			$table_name_1 = $wpdb->prefix . "postmeta";
			$table_name_2 = $wpdb->prefix . "posts";
			
			// delete orphaned meta data
			$wpdb->query(
				$wpdb->prepare( 
					"
					DELETE pm
					FROM $table_name_1 pm
					LEFT JOIN $table_name_2 wp ON wp.ID = pm.post_id
					WHERE wp.ID IS NULL
					"
				) 
			);

			$data_removed = 1;
			
		} catch( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}
	}
	// return result
	return $data_removed;
}
// 6.11 - Add new corner to the existing shape
function dml_add_new_corner() {
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to update shape',
	);
	// Gets map data and dmlinitMap
	$dml_page_link = esc_url_raw( $_POST['dml_page_link'] );
	$dml_post_id = absint( $_POST['dml_post_id'] );
	$dml_field1 = sanitize_text_field( $_POST['dml_field1'] ); // Field1 name for update query
	$dml_value1 = sanitize_text_field( $_POST['dml_value1'] ); // Combined Lat data
	$dml_field2 = sanitize_text_field( $_POST['dml_field2'] ); // Field1 name for update query
	$dml_value2 = sanitize_text_field( $_POST['dml_value2'] ); // Combined Lng data
	$dml_field_num = absint( $_POST['dml_field_num'] );

	if ( isset( $dml_page_link ) && isset( $dml_post_id ) && isset( $dml_field1 ) && isset( $dml_value1 ) && isset( $dml_field2 ) && isset( $dml_value2 ) && isset( $dml_field_num ) ) {
		try {
			$iconData = array(
				'dml_post_id' => $dml_post_id,
				'dml_field1' => $dml_field1,
				'dml_value1' => $dml_value1,
				'dml_field2' => $dml_field2,
				'dml_value2' => $dml_value2,
				'dml_field_num' => $dml_field_num,
			);
			
			$mySaveStatus = dml_update_fields($iconData);
			
			if( $mySaveStatus == 1 ):
				$result = dml_get_map();
			else:
				$result['status'] = 2;
				$result['message'] = "Unable to add new corner to the shape.";
			endif;
	
		} catch ( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}	
	}
	return (array)$result;
} 
// 6.12 - Saves line settings
function dml_Save_Line_Settings(){
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to update line settings',
	);
	// Gets map data and dmlinitMap
	$dml_page_link = esc_url_raw( $_POST['dml_page_link'] );
	$dml_post_id = absint( $_POST['dml_post_id'] );
	$dml_field1 = sanitize_text_field( $_POST['dml_field1'] ); // Field1 name for update query
	$dml_value1 = sanitize_text_field( $_POST['dml_value1'] ); // Line color code 
	$dml_field2 = sanitize_text_field( $_POST['dml_field2'] ); // Field1 name for update query
	$dml_value2 = sanitize_text_field( $_POST['dml_value2'] ); // Line color code 
	$dml_field3 = sanitize_text_field( $_POST['dml_field3'] ); // Field3 name for update query
	$dml_value3 = esc_html( $_POST['dml_value3'] ); // Textarea3 
	$dml_field4 = sanitize_text_field( $_POST['dml_field4'] ); // Field4 name for update query
	$dml_value4 = sanitize_text_field( $_POST['dml_value4'] ); // Textarea4 
	$dml_field5 = sanitize_text_field( $_POST['dml_field5'] ); // Field5 name for update query
	$dml_value5 = sanitize_text_field( $_POST['dml_value5'] ); // Textarea5 
	$dml_field6 = sanitize_text_field( $_POST['dml_field6'] ); // Field6 name for update query
	$dml_value6 = esc_html( $_POST['dml_value6'] ); // Textarea6 
	$dml_field7 = sanitize_text_field( $_POST['dml_field7'] ); // Lat field of Line
	$dml_value7 = sanitize_text_field( $_POST['dml_value7'] ); // Lat value of line 
	$dml_field8 = sanitize_text_field( $_POST['dml_field8'] ); // Lng field of Line
	$dml_value8 = sanitize_text_field( $_POST['dml_value8'] ); // Lng value of line 
	$dml_field_num = absint( $_POST['dml_field_num'] );

	if ( isset( $dml_page_link ) && isset( $dml_post_id ) && isset( $dml_field1 ) && isset( $dml_value1 ) && isset( $dml_field2 ) && isset( $dml_value2 ) && isset( $dml_field3 ) && isset( $dml_value3 ) && isset( $dml_field4 ) && isset( $dml_value4 ) && isset( $dml_field5 ) && isset( $dml_value5 ) && isset( $dml_field6 ) && isset( $dml_value6 ) && isset( $dml_field7 ) && isset( $dml_value7 ) && isset( $dml_field8 ) && isset( $dml_value8 ) && isset( $dml_field_num ) ) {
		try {
			$iconData = array(
				'dml_post_id' => $dml_post_id,
				'dml_field1' => $dml_field1,
				'dml_value1' => $dml_value1,
				'dml_field2' => $dml_field2,
				'dml_value2' => $dml_value2,
				'dml_field3' => $dml_field3,
				'dml_value3' => $dml_value3,
				'dml_field4' => $dml_field4,
				'dml_value4' => $dml_value4,
				'dml_field5' => $dml_field5,
				'dml_value5' => $dml_value5,
				'dml_field6' => $dml_field6,
				'dml_value6' => $dml_value6,
				'dml_field7' => $dml_field7,
				'dml_value7' => $dml_value7,
				'dml_field8' => $dml_field8,
				'dml_value8' => $dml_value8,
				'dml_field_num' => $dml_field_num,
			);
			
			$mySaveStatus = dml_update_fields($iconData);
			
			if( $mySaveStatus == 1 ):
				$result = dml_get_map();
			else:
				$result['status'] = 2;
				$result['message'] = "Settings of the line could not be saved.";
			endif;
	
		} catch ( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}	
	}
	return (array)$result;
} 
// 6.13 - Saves polygon settings
function dml_Save_Polygon_Settings(){
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to update polygon settings',
	);
	// Gets map data and dmlinitMap
	$dml_page_link = esc_url_raw( $_POST['dml_page_link'] );
	$dml_post_id = absint( $_POST['dml_post_id'] );
	$dml_field1 = sanitize_text_field( $_POST['dml_field1'] ); // Field1 name for update query
	$dml_value1 = sanitize_text_field( $_POST['dml_value1'] ); // Polygon border color code
	$dml_field2 = sanitize_text_field( $_POST['dml_field2'] ); // Field2 name for update query
	$dml_value2 = sanitize_text_field( $_POST['dml_value2'] ); // Polygon fill color code 
	$dml_field3 = sanitize_text_field( $_POST['dml_field3'] ); // Field3 name for update query
	$dml_value3 = sanitize_text_field( $_POST['dml_value3'] ); // Polygon description 

	$dml_field4 = sanitize_text_field( $_POST['dml_field4'] ); // Image Lınk FıeldName
	$dml_value4 = esc_html( $_POST['dml_value4'] ); // Imge Link Field Value
	$dml_field5 = sanitize_text_field( $_POST['dml_field5'] ); // Video Field Name
	$dml_value5 = sanitize_text_field( $_POST['dml_value5'] ); // Video Field Value
	$dml_field6 = sanitize_text_field( $_POST['dml_field6'] ); // Link Text FieldName
	$dml_value6 = sanitize_text_field( $_POST['dml_value6'] ); // Link Text FieldValue
	$dml_field7 = sanitize_text_field( $_POST['dml_field7'] ); // Link URL FieldName
	$dml_value7 = esc_html( $_POST['dml_value7'] ); // LinkURL FieldValue
	$dml_field8 = sanitize_text_field( $_POST['dml_field8'] ); // PolygonLat field
	$dml_value8 = sanitize_text_field( $_POST['dml_value8'] ); // PolygonLat value
	$dml_field9 = sanitize_text_field( $_POST['dml_field9'] ); // PolygonLng field
	$dml_value9 = sanitize_text_field( $_POST['dml_value9'] ); // PolygonLng value

	$dml_field_num = absint( $_POST['dml_field_num'] );

	if ( isset( $dml_page_link ) && isset( $dml_post_id ) && isset( $dml_field1 ) && isset( $dml_value1 ) && isset( $dml_field2 ) && isset( $dml_value2 ) && isset( $dml_field3 ) && isset( $dml_value3 ) && isset( $dml_field4 ) && isset( $dml_value4 ) && isset( $dml_field5 ) && isset( $dml_value5 ) && isset( $dml_field6 ) && isset( $dml_value6 ) && isset( $dml_field7 ) && isset( $dml_value7 ) && isset( $dml_field8 ) && isset( $dml_value8 ) && isset( $dml_field9 ) && isset( $dml_value9 ) && isset( $dml_field_num ) ) {
		try {
			$iconData = array(
				'dml_post_id' => $dml_post_id,
				'dml_field1' => $dml_field1,
				'dml_value1' => $dml_value1,
				'dml_field2' => $dml_field2,
				'dml_value2' => $dml_value2,
				'dml_field3' => $dml_field3,
				'dml_value3' => $dml_value3,
				'dml_field4' => $dml_field4,
				'dml_value4' => $dml_value4,
				'dml_field5' => $dml_field5,
				'dml_value5' => $dml_value5,
				'dml_field6' => $dml_field6,
				'dml_value6' => $dml_value6,
				'dml_field7' => $dml_field7,
				'dml_value7' => $dml_value7,
				'dml_field8' => $dml_field8,
				'dml_value8' => $dml_value8,
				'dml_field9' => $dml_field9,
				'dml_value9' => $dml_value9,
				'dml_field_num' => $dml_field_num,
			);
			
			$mySaveStatus = dml_update_fields($iconData);
			
			if( $mySaveStatus == 1 ):
				$result = dml_get_map();
			else:
				$result['status'] = 2;
				$result['message'] = "Settings of the polygon could not be saved.";
			endif;
	
		} catch ( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}	
	}
	return (array)$result;
} 
// 6.14 - Saves circle settings
function dml_Save_Circle_Settings(){
	$result = array(
		'status' => '0',
		'message' => 'Invalid data to update polygon settings',
	);
	// Gets map data and dmlinitMap
	$dml_page_link = esc_url_raw( $_POST['dml_page_link'] );
	$dml_post_id = absint( $_POST['dml_post_id'] );
	$dml_field1 = sanitize_text_field( $_POST['dml_field1'] ); // Field1 name for update query
	$dml_value1 = sanitize_text_field( $_POST['dml_value1'] ); // Polygon border color code
	$dml_field2 = sanitize_text_field( $_POST['dml_field2'] ); // Field2 name for update query
	$dml_value2 = sanitize_text_field( $_POST['dml_value2'] ); // Polygon fill color code 
	$dml_field3 = sanitize_text_field( $_POST['dml_field3'] ); // Field3 name for update query
	$dml_value3 = sanitize_text_field( $_POST['dml_value3'] ); // Polygon description 

	$dml_field4 = sanitize_text_field( $_POST['dml_field4'] ); // Image Lınk FıeldName
	$dml_value4 = esc_html( $_POST['dml_value4'] ); // Imge Link Field Value
	$dml_field5 = sanitize_text_field( $_POST['dml_field5'] ); // Video Field Name
	$dml_value5 = sanitize_text_field( $_POST['dml_value5'] ); // Video Field Value
	$dml_field6 = sanitize_text_field( $_POST['dml_field6'] ); // Link Text FieldName
	$dml_value6 = sanitize_text_field( $_POST['dml_value6'] ); // Link Text FieldValue
	$dml_field7 = sanitize_text_field( $_POST['dml_field7'] ); // Link URL FieldName
	$dml_value7 = esc_html( $_POST['dml_value7'] ); // LinkURL FieldValue
	$dml_field8 = sanitize_text_field( $_POST['dml_field8'] ); // PolygonLat field
	$dml_value8 = sanitize_text_field( $_POST['dml_value8'] ); // PolygonLat value
	$dml_field9 = sanitize_text_field( $_POST['dml_field9'] ); // PolygonLng field
	$dml_value9 = sanitize_text_field( $_POST['dml_value9'] ); // PolygonLng value
	$dml_field10 = sanitize_text_field( $_POST['dml_field10'] ); // PolygonLng radius field
	$dml_value10 = sanitize_text_field( $_POST['dml_value10'] ); // PolygonLng radius value

	$dml_field_num = absint( $_POST['dml_field_num'] );

	if ( isset( $dml_page_link ) && isset( $dml_post_id ) && isset( $dml_field1 ) && isset( $dml_value1 ) && isset( $dml_field2 ) && isset( $dml_value2 ) && isset( $dml_field3 ) && isset( $dml_value3 ) && isset( $dml_field4 ) && isset( $dml_value4 ) && isset( $dml_field5 ) && isset( $dml_value5 ) && isset( $dml_field6 ) && isset( $dml_value6 ) && isset( $dml_field7 ) && isset( $dml_value7 ) && isset( $dml_field8 ) && isset( $dml_value8 ) && isset( $dml_field9 ) && isset( $dml_value9 ) && isset( $dml_field10 ) && isset( $dml_value10 ) && isset( $dml_field_num ) ) {
		try {
			$iconData = array(
				'dml_post_id' => $dml_post_id,
				'dml_field1' => $dml_field1,
				'dml_value1' => $dml_value1,
				'dml_field2' => $dml_field2,
				'dml_value2' => $dml_value2,
				'dml_field3' => $dml_field3,
				'dml_value3' => $dml_value3,
				'dml_field4' => $dml_field4,
				'dml_value4' => $dml_value4,
				'dml_field5' => $dml_field5,
				'dml_value5' => $dml_value5,
				'dml_field6' => $dml_field6,
				'dml_value6' => $dml_value6,
				'dml_field7' => $dml_field7,
				'dml_value7' => $dml_value7,
				'dml_field8' => $dml_field8,
				'dml_value8' => $dml_value8,
				'dml_field9' => $dml_field9,
				'dml_value9' => $dml_value9,
				'dml_field10' => $dml_field10,
				'dml_value10' => $dml_value10,
				'dml_field_num' => $dml_field_num,
			);
			
			$mySaveStatus = dml_update_fields($iconData);
			
			if( $mySaveStatus == 1 ):
				$result = dml_get_map();
			else:
				$result['status'] = 2;
				$result['message'] = "Settings of the circle could not be saved.";
			endif;
	
		} catch ( Exception $e ) {
			$result['message'] = "Error: " . $e->getMessage();
		}	
	}
	return (array)$result;
} 

/* 7. HELPERS */
// 7.1 - Turns return value into JSON format
function dml_return_json( $php_array ) {
	
	// encode result as json string
	$json_result = json_encode( $php_array );
	
	// return result
	die( $json_result );
	
	// stop all other processing 
	exit;
	
}
// 7.2 - Check WP version
function dml_check_wp_version() {
	
	$needle = "/plugins.php";
	$dmlLinkSearch = dml_search_link_string($needle);

	if ( $dmlLinkSearch == 1 && is_plugin_active('dml-easy-map/dmlmap.php') ):
	
		// get the wp version
		$wp_version = get_bloginfo('version');
		
		// tested vesions
		if ($wp_version < 4.6) {
			// get notice html
			$notice = dml_get_admin_notice('DML Easy Map plugin has not been tested in your version of WordPress. <a href="http://codex.wordpress.org/Upgrading_WordPress">Please update!</a>. It still may work though...','error');
			
			// echo the notice html
			echo( $notice );
		}
	
	endif;
}
// 7.3 - Returns html formatted for WP admin notices
function dml_get_admin_notice( $message, $class ) {
	
	// setup our return variable
	$output = '';
	
	try {
		
		// create output html
		$output = '
		 <div class="'. $class .'">
		    <p>'. $message .'</p>
		</div>
		';
	    
	} catch( Exception $e ) {
		
		// php error
		
	}
	
	// return output
	return $output;
	
}
// 7.4 - Checks admin URL whether valid for PLUGIN or not
function dml_search_link_string($needle){
	$current_url = $_SERVER['REQUEST_URI'];
	$result = 0;
	
	if( strpos( $current_url, $needle ) !== false ) {
		$result = 1;
	}
	return $result;
}
// 7.5 - Checks the layer data 
function dml_check_layer_data ( $myLayerData ) {
	$dmlLayerDataResult = '0';
	if ( empty($myLayerData) ) {
		$dmlLayerDataResult = '0_0_0';
	} else {
		$dmlLayerDataResult = $myLayerData;
	}
	return $dmlLayerDataResult;
}
// 7.6 - Checks the infowindow data 
function dml_check_infowindow_data ( $myInfoWindowData ) {
	$myResult = '.';
	if ( empty($myInfoWindowData) ) {
		$myResult = '.';
	} else {
		$myResult = $myInfoWindowData;
	}
	return $myResult;
}

/* 8. ACTIVATION, DEACTIVATION AND DELETING OF PLUGIN */
// 8.1 - Run functions for plugin uninstalls
function dml_uninstall_plugin(){
	dml_remove_post_data();
}
// 8.2 - Removes post_data on uninstall 
function dml_remove_post_data (){
		
	// get WP's wpdb class
	global $wpdb;
	
	// setup return variable
	$data_removed = false;
	
	try {
		
		// get our custom table name
		$table_name = $wpdb->prefix . "posts";
		
		// set up custom post types array
		$custom_post_types = array(
			'dml_location'
		);
		
		// remove data from the posts db table where post types are equal to our custom post types
		$data_removed = $wpdb->query(
			$wpdb->prepare( 
				"
					DELETE FROM $table_name 
					WHERE post_type = %s
				", 
				$custom_post_types[0]
			) 
		);
		
		// get the table names for postmet and posts with the correct prefix
		$table_name_1 = $wpdb->prefix . "postmeta";
		$table_name_2 = $wpdb->prefix . "posts";
		
		// delete orphaned meta data
		$wpdb->query(
			$wpdb->prepare( 
				"
				DELETE pm
				FROM $table_name_1 pm
				LEFT JOIN $table_name_2 wp ON wp.ID = pm.post_id
				WHERE wp.ID IS NULL
				"
			) 
		);
		
		
		
	} catch( Exception $e ) {
		
		// php error
		
	}
	
	// return result
	return $data_removed;
	
}
// 8.3 - Hides shortcodes when plugin deactivated
function dml_deactivate_plugin(){
	global $wpdb;
    $table_name = $wpdb->prefix . 'posts';
    $wpdb->query( "UPDATE $table_name SET post_content = replace(post_content, '[dml_emap]', '' )" );
}


/* 9. ADMIN PAGES */
// 9.1 - Dashboard admin page
function dml_dashboard_admin_page() {
	
	$output = '
		<div class="wrap">
			
			<h2>DML Google Map</h2>
			
			<p>Build Google Maps for pages and posts. You will find the active map list attached below. Firstly, add the shortcode <img src="' . plugins_url('/icons/shortcode.png',__FILE__) . '" alt="DML Google Map shortcode" /> on a page or post, then select the map from the list.
			
			</p> 
			<hr />
			<div class="row">
				<div class="col-md-10 col-sm-12">
			
			<script>
				function clear_Admin_Php_Div() {
					document.getElementById("dmlAdminPhpContentDiv").innerHTML = "";
				}
			</script>

			<div id="dmlAdminPhpContentDiv">
			';
			
			$output .= dml_list_admin_maps();

			$output .= '</div>
			
			</div>
				<div class="col-md-2 col-sm-12" style="border-left: solid 1px silver;">
					<h3>PRO Version</h3>
					<p>
						Buy PRO version to unlock more features...
					</p>
					<a href="https://codecanyon.net/item/dml-easy-google-map-plugin/19225851" target="blank" class="btn btn-success">I want to BUY NOW!</a>
					
					<h3>Quick Links</h3>
					<ul>
						<a href="http://googlemap.webmountain.net/wordpress/index.php" target="blank">
							<li>Plugin page</li>
						</a>
						<a href="http://googlemap.webmountain.net/documentation/wordpress/documentation.html" target="blank">
							<li>Documentation</li>
						</a>
						<a href="http://www.webmountain.net/open-ticket/" target="blank">
							<li>Support</li>
						</a>
					</ul>
					
					<h3>Videos</h3>
					<ul>
						<a href="http://www.webmountain.net/editable-polygon-google-map/" target="blank">
							<li>Editable Polygon</li>
						</a>
						<a href="https://www.youtube.com/watch?v=yuKjKSDrcdU" target="blank">
							<li>Selecting Custom Markers</li>
						</a>
						<a href="https://www.youtube.com/watch?v=BQooGmQoHwk" target="blank">
							<li>Calculating Driving Time</li>
						</a>
						<a href="https://www.youtube.com/channel/UCCWbdTM4qWrTvaGydnqhpqA" target="blank">
							<li>All Videos...</li>
						</a>
					</ul>
				</div>
			</div>
		</div>';
	
	echo $output;

}
// 9.2 - Creates list of the maps
function dml_list_admin_maps(){
		
		$args = array(
			'post_type'		=>	'dml_location',
			'numberposts' 	=> -1,
			'orderby'       => 'ID',
           	'order'         => 'ASC',
			'meta_key' 		=> 'dml_record_type',
			'meta_query' 	=> array(
			   
			        'key' => 'dml_record_type',
			        'value' => 'M',  // or whatever it is you're using here
			        'compare' => '=',
			  
			),
		);
	
		$my_query = new WP_Query($args);

		if ($my_query->have_posts()) : 
			$output = '<form name="" method="post" onsubmit="clear_Admin_Php_Div()"><select id="dml_map_list" name="dml_map_list"><option value="0">Select a map</option>';
			
			while ($my_query->have_posts()) : $my_query->the_post(); 
				
				$output .= '<option value="'. get_the_content() .'">' . get_the_content() . '</option>';    
			endwhile;

			$output .= '</form>
				<input type="submit" id="dmlAdminRemoveMap" value="Remove Map" style="display:none;" />
				<input type="submit" id="dmlAdminGoMap" value="Go To Page" style="display:none;"/>
				<input type="submit" id="dmlAdminHidePolygones" value="Hide Polygons"style="display:none;"/>
				<input type="submit" id="dmlAdminAddressSubmit" style="display:none;" value="Show on the Map" />
				
				
				<div id="dmlAdminAdressDiv" style="display:none;">
				<input type="text" id="dmlAdminAddressInput" style="min-width: 100%;" placeholder="Enter a valid address and click on the SHOW ON THE MAP button" /></div>
				</form>
				<br />
				<div id="dmlAdminSelectedLink" style="display:none;"></div>';
			$output .= dml_form_shortcode();
		else:

			$output .= '<br /><div>You haven not created any map yet. <br />To create a new one, add shortcode on any page and activate map by entering Google API Code. </div>';

		endif;

	return $output;

}


/* 10. SETTINGS */


/* 11. MISCELLANEOUS */