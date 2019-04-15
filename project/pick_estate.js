export default function buildMap(containerEl) {
  var map = new google.maps.Map(containerEl);

  var filename = 'https://raw.githubusercontent.com/weilu/cs5346/master/project/data/geo/kml/planningboundary.kml';
  var geoXmlDoc = null;

  var highlightOptions = {
    fillColor: '#FFFF00',
    strokeColor: '#000000',
    fillOpacity: 0.9,
    strokeWidth: 10
  };
  var highlightLineOptions = {strokeColor: '#FFFF00', strokeWidth: 10};

  var geoXml = new geoXML3.parser({
    map: map,
    singleInfoWindow: true,
    afterParse: function(doc) {
      var currentBounds = map.getBounds();
      if (!currentBounds) currentBounds = new google.maps.LatLngBounds();
      // Geodata handling goes here, using JSON properties of the doc object
      geoXmlDoc = doc[0];
      if (!geoXmlDoc || !geoXmlDoc.placemarks) return;
      for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
        var placemark = geoXmlDoc.placemarks[i];
        if (placemark.polygon) {
          setHighlightHandler(
              geoXmlDoc, placemark.polygon, i, highlightOptions,
              highlightLineOptions);
        }
        if (placemark.polyline) {
          setHighlightHandler(
              geoXmlDoc, placemark.polyline, i, highlightOptions,
              highlightLineOptions);
        }
      }
    }
  });
  geoXml.parse(filename);

  var highlightRegion = function(name) {
    if (!geoXmlDoc || !geoXmlDoc.placemarks) return;
    for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
      var placemark = geoXmlDoc.placemarks[i];
      var poly;

      if (placemark.polygon) {
        poly = placemark.polygon;
      } else if (placemark.polyline) {
        poly = placemark.polyline;
      }

      if (placemark.name === name) {
        if (poly) {
          var rowElem = document.getElementById('row' + i);
          if (rowElem) rowElem.style.backgroundColor = '#FFFA5E';
          if (geoXmlDoc.placemarks[i].polygon) {
            poly.setOptions(highlightOptions);
          } else if (geoXmlDoc.placemarks[i].polyline) {
            poly.setOptions(highlightLineOptions);
          }
        }
      } else {
        var rowElem = document.getElementById('row' + i);
        if (rowElem) rowElem.style.backgroundColor = '#FFFFFF';
        poly.setOptions(
            {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity: 0.3});
      }
    }
  }

  var zoomRegion = function(name) {
    // TODO
  }

  return {highlight: highlightRegion, zoom: zoomRegion};
}

window.initMap = function() {
  return buildMap(document.getElementById('map'))
}

function setHighlightHandler(
    geoXmlDoc, poly, id, highlightOptions, highlightLineOptions) {
  poly.setOptions(
      {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity: 0.3});

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
