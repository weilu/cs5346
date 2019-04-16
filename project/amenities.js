export default function buildMap(containerEl, done) {
  var highlightOptions = {
    fillColor: '#FFFF00',
    strokeColor: '#000000',
    fillOpacity: 0.9,
    strokeWidth: 10
  };
  var highlightLineOptions = {strokeColor: '#FFFF00', strokeWidth: 10};

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

      for (var g = 0; g < geoDoc.placemarks.length; g++) {
        var placemark = geoDoc.placemarks[g];

        if (placemark.polygon) {
          placemark.polygon.setOptions(
              {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity: 0.3});

          setHoverHandler(
              geoDoc, placemark.polygon, g, highlightOptions,
              highlightLineOptions);
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
            setClickHandler(geoDoc, placemark.marker, i);

            placemark.marker.setMap(null);
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
setClickHandler() {
  // TODO: Somehow parse HDB data?

  // TODO: Zoom into region
}

// TODO: Change to render points per type
function setHoverHandler(
    geoDoc, poly, id, highlightOptions, highlightLineOptions) {
  google.maps.event.addListener(poly, 'mouseover', function() {
    var rowElem = document.getElementById('row' + id);
    if (rowElem) rowElem.style.backgroundColor = '#FFFA5E';
    if (geoDoc.placemarks[id].polygon) {
      marker.setOptions(highlightOptions);
    } else if (geoDoc.placemarks[id].polyline) {
      marker.setOptions(highlightLineOptions);
    }
  });
  google.maps.event.addListener(poly, 'mouseout', function() {
    var rowElem = document.getElementById('row' + id);
    if (rowElem) rowElem.style.backgroundColor = '#FFFFFF';
    poly.setOptions(
        {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity: 0.3});
  });
}
