import renderIf from 'render-if';
// Initialize leaflet.js
const L = require('leaflet');
const util = require('util');
require('leaflet.markercluster');


import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';
import React from 'react';
import PropTypes from 'prop-types';
import * as markers from './markers.js';
import './markers.css';
const isValidCoordinates = require('is-valid-coordinates');
import locations from './testLocations';

const BROWSER_TESTING_ENABLED = false; // flag to enable testing directly in browser
const SHOW_DEBUG_INFORMATION = false;

// used for testing seperately of the react-native applicaiton
const emoji = ['😴', '😄', '😃', '⛔', '🎠', '🚓', '🚇'];
// used for testing seperately of the react-native applicaiton
const animations = ['bounce', 'fade', 'pulse', 'jump', 'waggle', 'spin'];
let updateCounter = 0;
const MESSAGE_PREFIX = 'react-native-webview-leaflet';

let messageCounter = 0;

export default class LeafletReactHTML extends React.Component {
	constructor() {
		super();
		this.map = null;
		this.remote = null;
		this.mapMarkerDictionary = {};
		this.layerMarkerCluster = null;
		this.currentLocationMarker = null;
		this.eventListenersAdded = false;
		this.messageQueue = [];
		this.state = {
			debugMessages: [],
			locations: BROWSER_TESTING_ENABLED ? locations : [],
			readyToSendNextMessage: true
		};
	}

	// print passed information in an html element; useful for debugging
	// since console.log and debug statements won't work in a conventional way
	printElement = (data) => {
		if (SHOW_DEBUG_INFORMATION) {
			let message = '';
			if (typeof data === 'object') {
				message = util.inspect(data, { showHidden: false, depth: null })
			} else if (typeof data === 'string') {
				message = data;
			}
			this.setState({
				debugMessages:
					this.state.debugMessages.concat([message])
			});
			console.log(message)
		}
	};

	componentDidMount = () => {
		this.printElement('leafletReactHTML.js componentDidMount');
		if (document) {
			document.addEventListener('message', this.handleMessage), false;
			this.printElement('using document');
		} else if (window) {
			window.addEventListener('message', this.handleMessage), false;
			this.printElement('using window');
		} else {
			console.log('unable to add event listener');
			return;
		}
		this.eventListenersAdded = true;
		if (BROWSER_TESTING_ENABLED) {
			this.loadMap();
		}
	};

	componentWillUnmount = () => {
		if (document) {
			document.removeEventListener('message', this.handleMessage);
		} else if (window) {
			window.removeEventListener('message', this.handleMessage);
		}
	};

	loadMap = () => {
		this.printElement('loading map');
		if (!this.map) {
			try {
				// set up map
				this.map = L.map('map', {
					center: BROWSER_TESTING_ENABLED ? [37, -76] : [38.889931, -77.009003],
					zoom: 10
				});
				// Initialize the base layer
				var osm_mapnik = L.tileLayer('https://api.mapbox.com/styles/v1/nkmap/cjftto4dl8hq32rqegicxuwjz/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmttYXAiLCJhIjoiY2lwN2VqdDh2MDEzbXN5bm9hODJzZ2NlZSJ9.aVnii-A7yCa632_COjFDMQ', {
					maxZoom: 20,
				}).addTo(this.map);

				// add click event to map
				let that = this;
				this.map.on('click', (e) => {
					// that.printElement(`map clicked ${e.latlng}`);
					that.addMessageToQueue('MAP_CLICKED', {
						coords: e.latlng
					});
				});


				// create the marker layer
				this.layerMarkerCluster = L.markerClusterGroup();
				this.map.addLayer(this.layerMarkerCluster);

				if (BROWSER_TESTING_ENABLED) {
					this.updateMarkers(this.state.locations);
					// this.setUpMarkerAlterationTest();
					// this.addMoveEndListener();
					// this.addZoomEndListener();
					// this.addZoomListener();
					// this.addMoveListener();
					// this.addMoveEndListener();
				}
			} catch (error) {
				this.printElement('ERROR loading map: ', error);
				// send a messaging back indicating the map has been loaded
				this.addMessageToQueue('MAP_LOADED', {
					type: 'error',
					msg: error
				});
			}
			// send a messaging back indicating the map has been loaded
			this.addMessageToQueue('MAP_LOADED', {
				type: 'success'
			});
		}
	};

	addMessageToQueue = (type, payload) => {
		this.messageQueue.push(
			JSON.stringify({
				messageID: messageCounter++,
				prefix: MESSAGE_PREFIX,
				type,
				payload
			})
		);

		this.printElement(`adding message ${messageCounter} to queue: ${type}`);

		if (this.state.readyToSendNextMessage) {
			this.sendNextMessage();
		}
	};

	sendNextMessage = () => {
		if (this.messageQueue.length > 0) {
			const nextMessage = this.messageQueue.shift();
			this.printElement(`sending message ${nextMessage}`);
			if (document.hasOwnProperty('postMessage')) {
				document.postMessage(nextMessage, '*');
			} else if (window.hasOwnProperty('postMessage')) {
				window.postMessage(nextMessage, '*');
			} else {
				console.log('unable to find postMessage');
			}
			this.setState({ readyToSendNextMessage: false });
		}
	};

	handleMessage = (event) => {
		// this.printElement(`received message ${JSON.stringify(event)}`);
		this.printElement(
			util.inspect(event.data, {
				showHidden: false,
				depth: null
			})
		);

		let msgData;
		try {
			msgData = JSON.parse(event.data);
			if (msgData.hasOwnProperty('prefix') && msgData.prefix === MESSAGE_PREFIX) {
				// this.printElement(msgData);
				switch (msgData.type) {
					// receive an event when the webview is ready
					case 'LOAD_MAP':
						this.printElement('LOAD_MAP event recieved');
						this.loadMap();
						break;
					case 'GET_MAP':
						this.addMessageToQueue('MAP_SENT', { map: this.map })
						break;
					case 'ADD_MOVE_LISTENER':
						this.addMoveListener();
						break;
					case 'ADD_MOVE_END_LISTENER':
						this.addMoveEndListener();
						break;
					case 'ADD_ZOOM_LISTENER':
						this.addZoomListener();
						break;
					case 'ADD_ZOOM_END_LISTENER':
						this.addZoomEndListener();
						break;
					case 'MAP_CENTER_COORD_CHANGE':
						this.printElement('MAP_CENTER_COORD_CHANGE event recieved');
						this.printElement(msgData.payload.mapCenterCoords);
						let that = this;
						this.setState({ mapCenterCoords: msgData.payload.mapCenterCoords }, () => {
							/* that.printElement('center set to:');
							that.printElement(that.state.mapCenterCoords);
							that.printElement('that.map = ');
							that.printElement(that.map); */
							if (msgData.payload.panToLocation === true) {
								that.printElement('panning map');
								that.map.flyTo(that.state.mapCenterCoords);
							} else {
								that.printElement('setting map');
								that.map.setView(that.state.mapCenterCoords);
							}
							that.updateCurrentPostionMarker(that.state.mapCenterCoords);
						});
						break;

					case 'UPDATE_MARKERS':
						// this.printElement('UPDATE_MARKERS event recieved');
						// this.printElement('markers 0: ' + JSON.stringify(msgData));
						this.updateMarkers(msgData.payload.markers);
						break;

					case 'MESSAGE_ACKNOWLEDGED':
						this.setState({ readyToSendNextMessage: true });
						this.sendNextMessage();
						break;

					case 'SET_ZOOM':
						this.map.setZoom(msgData.payload.zoom);
						break;

					case 'SHOW_ZOOM_CONTROLS':
						if (msgData.payload.showZoomControls) {
							this.map.addControl(this.map.zoomControl);
						}
						{
							this.map.removeControl(this.map.zoomControl);
						}
						break;

					default:
						printElement(`leafletReactHTML Error: Unhandled message type received "${msgData.type}"`);
				}
			}
		} catch (err) {
			this.printElement(`leafletReactHTML error: ${err}`);
			return;
		}
	};

	addZoomListener = () => {
		const that = this;
		this.map.on('zoom', (e) => {
			// that.printElement(`zoom`);
			that.addMessageToQueue('ZOOM', {
				center: that.map.getCenter(),
				bounds: that.map.getBounds()
			});
		});
	}
	addMoveListener = () => {
		const that = this;
		this.map.on('move', (e) => {
			// that.printElement(`move`);
			that.addMessageToQueue('MOVE', {
				center: that.map.getCenter(),
				bounds: that.map.getBounds()
			});
		});
	}
	addZoomEndListener = () => {
		const that = this;
		this.map.on('zoomend', (e) => {
			// that.printElement(`zoomend`);
			that.addMessageToQueue('ZOOM_END', {
				center: that.map.getCenter(),
				bounds: that.map.getBounds()
			});
		});
	}
	addMoveEndListener = () => {
		const that = this;
		this.map.on('moveend', (e) => {
			// that.printElement(`moveend`);
			that.addMessageToQueue('MOVE_END', {
				center: that.map.getCenter(),
				bounds: that.map.getBounds()
			});
		});

	}

	updateCurrentPostionMarker = (currentPos) => {
		// this.printElement(`leafletReactHTML: currentPos: ${currentPos}`);
		if (this.currentLocationMarker) {
			this.currentLocationMarker.removeFrom(this.map);
		}
		this.currentLocationMarker = L.marker(currentPos, {
			icon: this.getIcon('❤️', {
				name: 'beat',
				duration: 0.25,
				delay: 0,
				interationCount: 'infinite',
				direction: 'alternate'
			})
		});
		this.currentLocationMarker.addTo(this.map);
	};

	getAnimatedHTMLString = (icon, animation) => {
		return `<div class='animationContainer' style="
			animation-name: ${animation.name ? animation.name : 'bounce'}; 
			animation-duration: ${animation.duration ? animation.duration : 1}s ;
			animation-delay: ${animation.delay ? animation.delay : 0}s;
			animation-direction: ${animation.direction ? animation.direction : 'normal'};
			animation-iteration-count: ${animation.interationCount ? animation.interationCount : 'infinite'}">
			<div style='font-size: 36px; marginLeft: -50%; marginTop: -50%;'>
			${icon}
			</div>
			</div>`;
	};

	getIcon = (icon, animation) => {
		// this.printElement(icon);
		// print animated markers
		if (animation) {
			return L.divIcon({
				className: 'clearMarkerContainer',
				html: this.getAnimatedHTMLString(icon, animation)
			});
		} else {
			// print non animated markers
			return L.divIcon({
				className: 'clearMarkerContainer',
				html: `<div style='font-size: 36px; marginLeft: -50%; marginTop: -50%;'>
				${icon}
				</div>`
			});
		}
	};

	/*******************************
   *
   * TODO: removing the layer of map markers does not work
   * need to maintain reference to each marker, and individually update it
   * by having it call getIcon with the updated date to get a new icon
   */
	updateMarkers = (markerInfos) => {
		// this.printElement(`in updateMarkers: ${updateCounter++}`);
		// this.printElement(markerInfos[0]);

		// take the markers that were sent and check to see if thy are already in the dictionary
		// if not, create new marker; then add to map layer and dictionary
		// if so, update it's dictionary item
		if (markerInfos) {
			try {
				markerInfos.forEach((markerInfo) => {
					if (this.mapMarkerDictionary.hasOwnProperty(markerInfo.id)) {
						this.updateMarker(this.mapMarkerDictionary[markerInfo.id], markerInfo);
					} else {
						let newMarker = this.createNewMarker(markerInfo);
						// this.printElement(`adding markerInfo:`);
						// this.printElement(newMarker);

						this.addMarkerToMakerLayer(newMarker);
					}
				});
				// this.printElement(this.mapMarkerDictionary);
			} catch (error) {
				this.printElement(`Error in updateMarkers ${error}`);
			}
		}
	};

	updateMarker = (marker, markerInfo) => {
		try {
			// this.printElement(`updateMarker ${marker.getElement()}`);
			// remove this marker
			marker.removeFrom(this.layerMarkerCluster);
			// create a new marker with correct properties
			let newMarker = this.createNewMarker(markerInfo);
			this.addMarkerToMakerLayer(newMarker);
		} catch (error) {
			this.printElement(`Error updating marker ${error}`);
		}
	};

	createNewMarker = (markerInfo) => {
		// validate the marker
		// id and coords are required
		// this.printElement(`creating new marker`)
		// this.printElement(markerInfo);
		if (
			!markerInfo.hasOwnProperty('id') ||
			!markerInfo.hasOwnProperty('coords') ||
			!isValidCoordinates(markerInfo.coords[1], markerInfo.coords[0])
		) {
			console.log(
				`Invalid map marker received.
         Map markers require an id value and and valid lat/long coordinates value`
			);
			return;
		}
		try {
			let mapMarker = L.marker(markerInfo.coords, {
				icon: this.getIcon(
					markerInfo.hasOwnProperty('icon') ? markerInfo.icon : '📍',
					markerInfo.hasOwnProperty('animation') ? markerInfo.animation : null
				),
				id: markerInfo.id ? markerInfo.id : null
			});
			/* this.printElement(`new mapMarker`);
			this.printElement(mapMarker); */
			// bind a click event to this marker with the marker id
			// click event is for use by the parent of this html file's
			// WebView
			let that = this;
			mapMarker.on('click', (e) => {
				// const markerID = this.options.id;
				that.printElement(`leafletReactHTML: marker clicked ${markerInfo.id}`);
				that.addMessageToQueue('MARKER_CLICKED', {
					id: markerInfo.id
				});
			});

			// create a dictionary to access the mapMarkers by ID
			this.mapMarkerDictionary[markerInfo.id] = mapMarker;

			return mapMarker;
		} catch (error) {
			this.printElement(`error creating maker: ${error}`);
		}
	};

	addMarkerToMakerLayer = (marker) => {
		// this.printElement(`adding marker: ${marker}`);
		try {
			marker.addTo(this.layerMarkerCluster);
		} catch (error) {
			this.printElement(`error adding maker to layer: ${error}`);
		}
	};

	render = () => {
		return (
			<div
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
					display: 'flex',
					flexDirection: 'column'
				}}
				ref={(component) => {
					this.webComponent = component;
				}}
			>
				<div
					style={{
						position: 'relative',
						flex: 1
					}}
					id="map"
				/>
				{renderIf(SHOW_DEBUG_INFORMATION)(
					<div
						style={{
							backgroundColor: 'orange',
							maxHeight: 200,
							overflow: 'auto',
							padding: 5
						}}
						id="messages"
					>
						<ul>
							{this.state.debugMessages.map((message, index) => {
								return (<li key={index}>{message}</li>)
							})}
						</ul>
					</div>
				)}
			</div>
		);
	};

	setUpMarkerAlterationTest = () => {
		setInterval(this.updateMarkerSpeed.bind(this), 5000);
	};

	updateMarkerSpeed = () => {
		console.log('altering markers');
		let updatedLocations = this.state.locations.map((location) => {
			if (!location.animation) {
				return location;
			}
			let updatedLocation = Object.assign({}, location, {
				animation: Object.assign({}, location.animation, {
					duration: location.animation.duration + 0.5
				})
			});
			return updatedLocation;
		});
		this.setState({ locations: updatedLocations });
		this.updateMarkers(this.state.locations);
	};
}