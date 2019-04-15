export default function buildMap(containerEl, done) {
  const kmlDataPath =
      'https://raw.githubusercontent.com/weilu/cs5346/master/project/data/geo/kml/';
  var kmlRef = {};
  var kmlData = [];
  var i = 0;
  ['soonhdb', 'aquaticsg', 'childcare', 'clinics', 'communityclubs',
   'firestation', 'gymsg', 'kindergarten', 'libraries', 'marketfood', 'mrtexit',
   'museums', 'parks', 'pharmacy', 'playsg', 'police', 'sportsg',
   'planningboundary']
      .forEach((kmlFile) => {
        kmlData.push(kmlDataPath + kmlFile + '.kml');
        kmlRef[kmlFile] = i++;
      });
  var highlightOptions = {
    fillColor: '#FFFF00',
    strokeColor: '#000000',
    fillOpacity: 0.9,
    strokeWidth: 10
  };
  var highlightLineOptions = {strokeColor: '#FFFF00', strokeWidth: 10};


  var map = new google.maps.Map(containerEl);
  var geoXmlDocs = null;
  var geoXmlDoc = null;

  var geoXml = new geoXML3.parser({
    map: map,
    singleInfoWindow: true,
    afterParse: function(doc) {
      geoXmlDocs = doc;
      var currentBounds = map.getBounds();
      if (!currentBounds) currentBounds = new google.maps.LatLngBounds();

      // Geodata handling goes here, using JSON properties of the doc object
      geoXmlDoc = doc[0];  // HDB info
      if (!geoXmlDoc || !geoXmlDoc.placemarks) return;
      for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
        var placemark = geoXmlDoc.placemarks[i];
        if (placemark.polygon) {
          placemark.polygon.setOptions(
              {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity: 0.3});
          setHighlightHandler(
              geoXmlDoc, placemark.polygon, i, highlightOptions,
              highlightLineOptions);
        }
      }

      geoXmlDoc = doc[0];  // Should be the hdb info
      if (!geoXmlDoc || !geoXmlDoc.placemarks) return;
      for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
        var placemark = geoXmlDoc.placemarks[i];
        if (placemark.polygon) {
          placemark.polygon.setOptions(
              {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity: 0.3});
          setHighlightHandler(
              geoXmlDoc, placemark.polygon, i, highlightOptions,
              highlightLineOptions);
        }
      }

      for (var g = 1; g < doc.length; g++) {
        var geoDoc = doc[g];
        if (!geoDoc || !geoDoc.placemarks) return;
        for (var i = 0; i < geoDoc.placemarks.length; i++) {
          var placemark = geoDoc.placemarks[i];
          if (placemark.marker) {
            placemark.marker.setMap(null);
          }
          if (placemark.polygon) {
            placemark.polygon.setOptions({fillOpacity: 0.0});
          }
        }
      }

      if (done != null) {
        done()
      }

      zoomRegion('BISHAN');
    }
  });
  geoXml.parse(kmlData);

  function showAmenities(name, type) {
    // TODO: Somehow parse HDB data?

    // TODO: Zoom into region
  }

  function onClick() {
    // TODO: Somehow parse HDB data?

    // TODO: Zoom into region
  }

  var zoomRegion =
      function(name, type) {
    var geoDoc = geoXmlDocs[kmlRef['planningboundary']];

    for (var i = 0; i < geoDoc.placemarks.length; i++) {
      var placemark = geoDoc.placemarks[i];
      if (placemark.polygon && placemark.name === name) {
        map.fitBounds(placemark.polygon.bounds);
        break;
      }
    }
  }

  return {show: showAmenities, click: onClick, zoom: zoomRegion};
}

// TODO: Create sidebar with distance from amenities
window.initMap =
    function() {
  return buildMap(document.getElementById('map'))
}

// TODO: Change to render points per type
function setHighlightHandler(
    geoXmlDoc, poly, id, highlightOptions, highlightLineOptions) {
  google.maps.event.addListener(poly, 'mouseover', function() {
    var rowElem = document.getElementById('row' + id);
    if (rowElem) rowElem.style.backgroundColor = '#FFFA5E';
    if (geoXmlDoc.placemarks[id].polygon) {
      poly.setOptions(highlightOptions);
    } else if (geoXmlDoc.placemarks[id].polyline) {
      poly.setOptions(highlightLineOptions);
    }
  });
  google.maps.event.addListener(poly, 'mouseout', function() {
    var rowElem = document.getElementById('row' + id);
    if (rowElem) rowElem.style.backgroundColor = '#FFFFFF';
    poly.setOptions(
        {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity: 0.3});
  });
}
