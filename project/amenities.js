export default function buildMap(containerEl, done) {
  var kml = indexKmlData();
  var geoData = null;
  var map = new google.maps.Map(containerEl);
  var info = new google.maps.InfoWindow();

  var geoXml = new geoXML3.parser({
    map: map,
    singleInfoWindow: true,
    suppressInfoWindows: true,
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

          setHoverHDB(placemark.polygon);
          setClickHDB(map, geoDoc, placemark.polygon, info);
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

            placemark.marker.setOptions({icon: kml.icon[g]})
            placemark.marker.setMap(null);
          } else if (placemark.polygon) {
            placemark.polygon.setOptions(polyStyle().hide);
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

  var setClickHDB = function(map, geoDoc, poly, info) {
    google.maps.event.addListener(map, 'click', function(event) {
      console.log('Click event away from poly');
      hideAmenities();
    });

    google.maps.event.addListener(poly, 'click', function(event) {
      var lat = event.latLng.lat();
      var lng = event.latLng.lng();
      map.setCenter(new google.maps.LatLng(lat, lng));

      for (var i = 0; i < geoDoc.placemarks.length; i++) {
        var placemark = geoDoc.placemarks[i];
        if (placemark.polygon) {
          placemark.polygon.setOptions(polyStyle().normal);
        }
      }

      if (poly) {
        poly.setOptions(polyStyle().click);
      }

      showAmenities();

      // Parse nearby amenities
      // Calculate distance

      // Display distance to nearest amenities
      info.setContent('TODO: Add amenities distances');
      info.setPosition(poly.bounds.getCenter());
      info.open(map);
    });
  };

  // TODO: Change to render points per type
  var setHoverHDB = function(poly) {
    google.maps.event.addListener(poly, 'mouseover', function() {
      console.log('Mouseover Polygon');
      if (poly) {
        poly.setOptions(polyStyle().hover);
      }
    });
    google.maps.event.addListener(poly, 'mouseout', function() {
      console.log('Mouseoff Polygon');
      poly.setOptions(polyStyle().normal);
    });
  };

  var setHoverAmenities = function(marker, id) {
    google.maps.event.addListener(marker, 'mouseover', function() {
      var rowElem = document.getElementById('row' + id);
      if (rowElem) rowElem.style.backgroundColor = '#FFFA5E';

      info.setContent('TODO: Add amenities description');
      info.setPosition(marker.getCenter());
      info.open(map);
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
      var rowElem = document.getElementById('row' + id);
      if (rowElem) rowElem.style.backgroundColor = '#FFFFFF';

      info.close();
    });
  };

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

function
indexKmlData() {
  const kmlDataPath =
      'https://raw.githubusercontent.com/weilu/cs5346/master/project/data/geo/';

  var kmlRef = {};
  var kmlData = [];
  var kmlIcon = [];

  var id = 0;
  ['soonhdb', 'aquaticsg', 'childcare', 'clinics', 'communityclubs',
   'firestation', 'gymsg', 'kindergarten', 'libraries', 'marketfood', 'mrtexit',
   'museums', 'parks', 'pharmacy', 'playsg', 'police', 'sportsg',
   'planningboundary']
      .forEach((kmlFile) => {
        kmlData.push(kmlDataPath + 'kml/' + kmlFile + '.kml');
        kmlData.push(kmlDataPath + 'icon/' + kmlFile + '.png');
        kmlRef[kmlFile] = id++;
      });
  return {ref: kmlRef, data: kmlData, icon: kmlIcon};
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
        },
        hide: {fillOpacity: 0.0}
  }
}