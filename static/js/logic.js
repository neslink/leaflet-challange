// Import dataset and store the URL for the earthquake data
var Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create a GET request to the query URL using D3
d3.json(Url).then(function(data) {
    createFeatures(data);
});

// Function to create earthquake features
function createFeatures(earthquakeData) {
    // Function to define style of each earthquake marker
    function stylefunc(feature) {
        return {
            radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.6,
            color: "#000",
            stroke: true,
            weight: 0.8
        };
    }
    
    // Create a GeoJSON layer for earthquakes

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place + "</h3><h3>Depth: " + feature.geometry.coordinates[2] +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        },

        // Create layers using the coordinates and apply the defined style

        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, );
        },
        style: stylefunc
    });

    // Generate the map layers
    createMap(earthquakes);
}

// Create the map layers and legends
function createMap(earthquakes) {
    // Generate the base of the map.
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    let grayscale = L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Generate a baseMaps object to hold different base layers
    let baseMaps = {
        "Street Map": streetmap,
        "Satellite": satellite,
        "Grayscale": grayscale
    };

    // Generate an overlayMaps object to hold earthquakes layer.
    let overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Generate map object with options.
    let map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Legend Control
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function() {
        let div = L.DomUtil.create('div', "legend"),
            depths = [0, 1, 10, 30, 50, 70],
            labels = [];

        // Loop through depth ranges and generate colored labels
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
    };

    // Add legend to map
    legend.addTo(map);

    // Add a layer control to the map to switch between base layers and overlays
    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(map);
}

// Assign color of the marker based on earthquake depth
function getColor(depth) {
    switch (true) {
      case depth > 90:
        return "#EA2C2C";
      case depth > 70:
        return "#EA822C";
      case depth > 50:
        return "#EE9C00";
      case depth > 30:
        return "#EECC00";
      case depth > 10:
        return "#D4EE00";
      default:
        return "#98EE00";
    }
}

// Function to determine the radius of the marker based on earthquake magnitude
function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
}
