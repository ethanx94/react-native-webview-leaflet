# React Native Webview Leaflet - Non Expo
## A Leaflet map component with no native code for React Native apps.
### Differences from upstream
This fork is to avoid Expo as there are no hooks into Universal Windows applications. This adds many extra platforms at the cost of a slight amount of additional platform specific logic.

### Why use this?
This component is useful if you want to display emojis on a map and animate them using CSS

### Why not use this?
This component may not be useful if you expect your users to tap on the map quickly since there is a bug in React Native that prevents the map from responding to multiple taps that occure less than ~1.5 seconds apart.  Also, this component does not support custom CSS animations.  However, I'll happily accept pull requests to add new animations.  See below for more detail.

[![npm](https://img.shields.io/npm/v/react-native-webview-leaflet.svg)](https://www.npmjs.com/package/react-native-webview-leaflet)
[![npm](https://img.shields.io/npm/dm/react-native-webview-leaflet.svg)](https://www.npmjs.com/package/react-native-webview-leaflet)
[![npm](https://img.shields.io/npm/dt/react-native-webview-leaflet.svg)](https://www.npmjs.com/package/react-native-webview-leaflet)
[![npm](https://img.shields.io/npm/l/react-native-webview-leaflet.svg)](https://github.com/react-native-component/react-native-webview-leaflet/blob/master/LICENSE)

![Image](https://thumbs.gfycat.com/CraftyKnobbyApe-size_restricted.gif)

## Try it in Expo
![QR Code](https://github.com/reggie3/react-native-webview-leaflet/blob/master/expo-qr-code.png)

[Link to Expo Project Page](https://expo.io/@reggie3/react-native-webview-leaflet)

## Installation
Install using npm or yarn like this: 
~~~
npm install --save react-native-webview-leaflet
~~~
or
~~~
yarn add react-native-webview-leaflet
~~~

## Usage
and import like so
~~~
import WebViewLeaflet from 'react-native-webview-leaflet';
~~~


Add the following component to your code with optional callback functions for leaflet.js map events.
~~~~
 <WebViewLeaflet
  mapCenterCoords={this.state.coords}
  locations={this.state.locations}
  onMapClicked={this.onMapClicked}
  onMarkerClicked={this.onMarkerClicked}
  onWebViewReady={this.onWebViewReady}
  panToLocation={false}
  zoom={5}
  showZoomControls={false}
  onZoomLevelsChange={this.onZoomLevelsChange}
  onResize={this.onResize}
  onUnload={this.onUnload}
  onViewReset={this.onViewReset}
  onLoad={this.onLoad}
  onZoomStart={this.onZoomStart}
  onMoveStart={this.onMoveStart}
  onZoom={this.onZoom}
  onMove={this.onMove}
  onZoomEnd={this.onZoomEnd}
  onMoveEnd={this.onMoveEnd}
/>
~~~~
|
This component accepts the following props:


| Name                   | Required      | Description |
| ---------------------- | ------------- | ----------- |
|mapCenterCoords| no | The center of the map in an array fo the form [latitude, longitude] |
|onMapClicked| no | a function that will be called when the map is tapped.  It will receive the location of the tap in an array of the form [latitude, longitude]
|onMarkerClicked| no | a function that will be called when a marker is tapped.  It will receive the ID of the marker as shown in the location.id object below. |
|onWebViewReady| no | a function that is called when the map is ready for display.  For example, it can be used to hide an activity indicator  |
|locations| no | see below |
|zoom| no | initial map zoom level. "Lower zoom levels means that the map shows entire continents, while higher zoom levels means that the map can show details of a city." (source: leaflet website)|
|showMapAttribution|no|Removes the attribution link from the map to prevent the user from inadvertently clicking on it.  This value defaults to true.  Remember to give proper credit by displaying attribution information somewhere in you application.  The standard OSM attribution is OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>|

Additonally, there are several optional props that allow you to fire a callback function in response to leaflet's 11 "Map state change events".  The prop corresponding to each event is shown in the above sample.  More information on map state change events can be found [here](http://leafletjs.com/reference-1.3.0.html#map-event).

Each of these callbacks will receive an object containing the maps bounds, center, and zoom level in the following format:
~~~
{
  bounds:{
    _northEast:{lat: 36.961963124877656, lng: -75.99380493164064}
    _southWest:{lat: 36.590171021747466, lng: -76.55960083007814}
  },
  center:{lat: 36.7762924811868, lng: -76.27670288085939},
  zoom:10
}
~~~

### Marker Locations
The locations property expects an array of objects with the following format:
~~~
{
  id: Math.floor(Math.random() * 1000),   // The ID attached to the marker. It will be returned when onMarkerClicked is called
  coords: [37.06452161, -75.67364786],    // Latitude and Longitude of the marker
  icon: emoji[Math.floor(Math.random() * emoji.length)],  // text that will be displayed as the marker 

  // The child objec, "animation", controls the optional animation that will be attached to the marker.
  // See below for a list of available animations
  animation: {
    name: animations[Math.floor(Math.random() * animations.length)],
    duration: Math.floor(Math.random() * 3) + 1,
    delay: Math.floor(Math.random()) * 0.5,
    interationCount
  }
}
~~~

### Available Animations
Animations for "bounce", "fade", "pulse", "jump", "waggle", "spin", and "beat" cane be specified in the animation.name property of an individual location. 

### Animation Information
Animations are kept in the file [markers.css](https://github.com/reggie3/react-native-webview-leaflet/blob/master/web/markers.css)  They are just keyframe animations like this:
~~~
@keyframes spin {
  50% {
    transform: rotateZ(-20deg);
    animation-timing-function: ease;
  }
  100% {
    transform: rotateZ(360deg);
  }
}
~~~

### Format for the Object Received by onMove, onMoveEnd, onZoom, and onZoomEnd Callback Functions
~~~
{
  center: {lat, lng},
  bounds: {
    _northEast: {lat, lng},
    _southWest: {lat, lng},
  }
}
~~~

## Changelog
## 0.3.0
* Added props for each leaflet map state change event (resize, load, move, etc.)
## 0.2.7
* Added inital set of tests
## 0.2.6
* Added props for zoom, zoomEnd, move, and moveEnd listeners.
## 0.2.0 
* Removed requirement to download JavaScript files from GitHub in order for the package to work.  JavaScript files are now inline with the HTML which enables the package to work without an Internet connection.
* Added getMapCallback
## 0.0.86 
* Added ability to set map zoom level on initial render
## 0.0.85 
* First version suitable for install using npm or yarn


## LICENSE

MIT
