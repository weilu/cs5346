
var map;
var filename =
    'https://raw.githubusercontent.com/weilu/cs5346/julwrites/maps/project/data/geo/kml/planningboundary.kml';
var kmlLayer;
var geoXml = null;
var geoXmlDoc = null;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(1.351616, 103.808053),
    zoom: 12,
    mapTypeId: 'terrain'
  });

  geoXml = new geoXML3.parser(
      {map: map, singleInfoWindow: true, afterParse: mountGeo});
  geoXml.parse(filename);
}

function mountGeo(doc) {
  var currentBounds = map.getBounds();
  if (!currentBounds) currentBounds = new google.maps.LatLngBounds();
  // Geodata handling goes here, using JSON properties of the doc object
  geoXmlDoc = doc[0];
  if (!geoXmlDoc || !geoXmlDoc.placemarks) return;
  for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
    var placemark = geoXmlDoc.placemarks[i];
    if (placemark.polygon) {
      var normalStyle = {
        strokeColor: placemark.polygon.get('strokeColor'),
        strokeWeight: placemark.polygon.get('strokeWeight'),
        strokeOpacity: placemark.polygon.get('strokeOpacity'),
        fillColor: placemark.polygon.get('fillColor'),
        fillOpacity: placemark.polygon.get('fillOpacity')
      };
      placemark.polygon.normalStyle = normalStyle;

      setHighlightHandler(placemark.polygon, i);
    }
    if (placemark.polyline) {
      var normalStyle = {
        strokeColor: placemark.polyline.get('strokeColor'),
        strokeWeight: placemark.polyline.get('strokeWeight'),
        strokeOpacity: placemark.polyline.get('strokeOpacity')
      };
      placemark.polyline.normalStyle = normalStyle;

      setHighlightHandler(placemark.polyline, i);
    }
  }
}

// KML Layer Utils
var highlightOptions = {
  fillColor: '#FFFF00',
  strokeColor: '#000000',
  fillOpacity: 0.9,
  strokeWidth: 10
};
var highlightLineOptions = {strokeColor: '#FFFF00', strokeWidth: 10};

function kmlHighlightPoly(pm) {
  for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
    var placemark = geoXmlDoc.placemarks[i];
    if (i == pm) {
      if (placemark.polygon) placemark.polygon.setOptions(highlightOptions);
      if (placemark.polyline)
        placemark.polyline.setOptions(highlightLineOptions);
    } else {
      if (placemark.polygon)
        placemark.polygon.setOptions(placemark.polygon.normalStyle);
      if (placemark.polyline)
        placemark.polyline.setOptions(placemark.polyline.normalStyle);
    }
  }
}

function setHighlightHandler(poly, polynum) {
  poly.setOptions(
      {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity: 0.3});

  google.maps.event.addListener(poly, 'mouseover', function() {
    var rowElem = document.getElementById('row' + polynum);
    if (rowElem) rowElem.style.backgroundColor = '#FFFA5E';
    if (geoXmlDoc.placemarks[polynum].polygon) {
      poly.setOptions(highlightOptions);
    } else if (geoXmlDoc.placemarks[polynum].polyline) {
      poly.setOptions(highlightLineOptions);
    }
  });
  google.maps.event.addListener(poly, 'mouseout', function() {
    var rowElem = document.getElementById('row' + polynum);
    if (rowElem) rowElem.style.backgroundColor = '#FFFFFF';
    poly.setOptions(
        {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity: 0.3});
  });
}