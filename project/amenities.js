export default function buildMap(containerEl, done) {
  const kmlDataPath =
      'https://raw.githubusercontent.com/weilu/cs5346/master/project/data/geo/kml/';

  var kml = indexKmlData(kmlDataPath);
  var geoData = null;
  var map = new google.maps.Map(containerEl);

  var geoXml = new geoXML3.parser({
    map: map,
    singleInfoWindow: true,
    afterParse: function(data) {
      geoData = data;

      var currentBounds = map.getBounds();
      if (!currentBounds) currentBounds = new google.maps.LatLngBounds();

      // Display in-progress hdb information
      geoDoc = geoData[kml.ref['soonhdb']];
      if (!geoDoc || !geoDoc.placemarks) return;

      for (var i = 0; i < geoDoc.placemarks.length; i++) {
        var placemark = geoDoc.placemarks[i];

        if (placemark.polygon) {
          placemark.polygon.setOptions(polyStyle().nromal);

          setHoverHDB(placemark.polygon, i);
          setClickHDB(geoDoc, placemark.polygon, i);
        }
      }

      // Set handler for every marker
      for (var g = 0; g < geoData.length; g++) {
        if (g === kml.ref['soonhdb']) continue;  // Skip hdb

        var geoDoc = geoData[g];
        if (!geoDoc || !geoDoc.placemarks) return;

        for (var i = 0; i < geoDoc.placemarks.length; i++) {
          var placemark = geoDoc.placemarks[i];

          if (placemark.marker) {
            setHoverAmenities(placemark.marker, i);

            placemark.marker.setMap(null);
          } else if (placemark.polygon) {
            placemark.polygon.setOptions({fillOpacity: 0.0});
          }
        }
      }

      if (done != null) {
        done()
      }

      zoomRegion('SERANGOON');
    }
  });
  geoXml.parse(kml.data);

  // Show all the amenities
  var showAmenities =
      function() {
    for (var g = 0; g < geoData.length; g++) {
      if (g === kml.ref['soonhdb']) continue;  // Skip hdb

      var geoDoc = geoData[g];
      if (!geoDoc || !geoDoc.placemarks) return;

      for (var i = 0; i < geoDoc.placemarks.length; i++) {
        var placemark = geoDoc.placemarks[i];

        if (placemark.marker) {
          placemark.marker.setMap(map);
        }
      }
    }
  }

  // Hide all the amenities
  var hideAmenities =
      function() {
    // Set handler for every marker
    for (var g = 0; g < geoData.length; g++) {
      if (g === kml.ref['soonhdb']) continue;  // Skip hdb

      var geoDoc = geoData[g];
      if (!geoDoc || !geoDoc.placemarks) return;

      for (var i = 0; i < geoDoc.placemarks.length; i++) {
        var placemark = geoDoc.placemarks[i];

        if (placemark.marker) {
          placemark.marker.setMap(null);
        }
      }
    }
  }

  var zoomRegion =
      function(name) {
    var geoDoc = geoData[kml.ref['planningboundary']];

    for (var i = 0; i < geoDoc.placemarks.length; i++) {
      var placemark = geoDoc.placemarks[i];
      if (placemark.polygon && placemark.name === name) {
        map.fitBounds(placemark.polygon.bounds);
        break;
      }
    }
  }

  return {show: showAmenities, hide: hideAmenities, zoom: zoomRegion};
}

// TODO: Create sidebar with distance from amenities
window.initMap =
    function() {
  return buildMap(document.getElementById('map'))
}

function indexKmlData(path) {
  var kmlRef = {};
  var kmlData = [];

  var id = 0;
  ['soonhdb', 'aquaticsg', 'childcare', 'clinics', 'communityclubs',
   'firestation', 'gymsg', 'kindergarten', 'libraries', 'marketfood', 'mrtexit',
   'museums', 'parks', 'pharmacy', 'playsg', 'police', 'sportsg',
   'planningboundary']
      .forEach((kmlFile) => {
        kmlData.push(path + kmlFile + '.kml');
        kmlRef[kmlFile] = id++;
      });
  return {ref: kmlRef, data: kmlData};
}

function
polyStyle() {
  return {
    normal: {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity: 0.3},
        hover: {
          fillColor: '#FFFF00',
          strokeColor: '#000000',
          fillOpacity: 0.9,
          strokeWidth: 10
        },
        click: {
          fillColor: '#0000FF',
          strokeColor: '#000000',
          fillOpacity: 0.9,
          strokeWidth: 10
        }
  }
}

function
markerStyle() {
  return {
    normal: {}, hover: {}, click: {}
  }
}

function setClickHDB(geoDoc, poly, id) {
  google.maps.event.addListener(poly, 'leftclick', function(event) {
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();

    for (var i = 0; i < geoDoc.placemarks.length; i++) {
      var placemark = geoDoc.placemarks[i];
      if (placemark.polygon) {
        placemark.polygon.setOptions(polyStyle().normal);
      }
    }

    // TODO: Center around position

    var rowElem = document.getElementById('row' + id);
    if (rowElem) rowElem.style.backgroundColor = '#FFFA5E';
    if (poly) {
      poly.setOptions(polyStyle().click);
    }

    // Parse nearby amenities
    // Calculate distance

    // Display distance to nearest amenities
  });
}

// TODO: Change to render points per type
function setHoverHDB(poly, id) {
  google.maps.event.addListener(poly, 'mouseover', function() {
    var rowElem = document.getElementById('row' + id);
    if (rowElem) rowElem.style.backgroundColor = '#FFFA5E';
    if (poly) {
      poly.setOptions(polyStyle().hover);
    }
  });
  google.maps.event.addListener(poly, 'mouseout', function() {
    var rowElem = document.getElementById('row' + id);
    if (rowElem) rowElem.style.backgroundColor = '#FFFFFF';
    poly.setOptions(polyStyle().normal);
  });
}

function setHoverAmenities(marker, id) {
  google.maps.event.addListener(marker, 'mouseover', function() {
    var rowElem = document.getElementById('row' + id);
    if (rowElem) rowElem.style.backgroundColor = '#FFFA5E';

    marker.setOptions(markerStyle().hover);

    // TODO: Display data
  });

  google.maps.event.addListener(marker, 'mouseout', function() {
    var rowElem = document.getElementById('row' + id);
    if (rowElem) rowElem.style.backgroundColor = '#FFFFFF';

    marker.setOptions(markerStyle().normal);
  });
}