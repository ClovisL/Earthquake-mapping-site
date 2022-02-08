var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><h3>Magnitude: " + feature.properties.mag + "</h3>" +
      "</h3><hr><h3>Depth (km): " + feature.geometry.coordinates[2] + "</h3>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
        return new L.CircleMarker(latlng, {
            radius: feature.properties.mag * 8,
            color: "black",
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            fillOpacity: 1,
            weight: 1
        });
    },
    onEachFeature: onEachFeature
  });
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Function to determine marker color
function chooseColor(value) {
    if (value > -10 && value <= 10 || value == '-10-10') {
        return "#15FF00"
    } else if (value > 10 && value <= 30 || value == '10-30') {
        return "#FFFB00"
    } else if (value > 30 && value <= 50 || value == '30-50') {
        return "#FFE000"
    } else if (value > 50 && value <= 70 || value == '50-70') {
        return "#FFB500"
    } else if (value > 70 && value <= 90 || value == '70-90') {
        return "#FF9A00"
    } else {
        return "#FF0000"
    }
}

// Function to create the map
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [35, -100],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add a legend
  var legend = L.control({position: 'bottomright'})
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend')
        var categories = ['-10-10','10-30','30-50','50-70', '70-90', '90+']
        div.innerHTML = "Depth (km)"
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML += '<i style="background:' + chooseColor(categories[i]) + '"></i> ' + (categories[i] + '<br>');
            }
            return div;
        };
    legend.addTo(myMap);
  
  // Add a textbox for description
  L.Control.textbox = L.Control.extend({
		onAdd: function(map) {
			
		var text = L.DomUtil.create('div');
		text.id = "info_text";
		text.innerHTML = "<strong>This site takes information from a GEOJSON file from USGS for all earthquakes that happened for the day, and maps it out.</strong>"
		return text;
		},

		onRemove: function(map) {
			// Nothing to do here
		}
	});
	L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
	L.control.textbox({ position: 'bottomleft' }).addTo(map);
  
}
