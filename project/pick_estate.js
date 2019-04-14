
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
  sidebarHtml =
      '<table><tr><td><a href="javascript:showAll();">Show All</a></td></tr>';
  //  var sidebarHtml = '<table>';
  geoXmlDoc = doc[0];
  if (!geoXmlDoc || !geoXmlDoc.placemarks) return;
  for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
    // console.log(doc[0].markers[i].title);
    var placemark = geoXmlDoc.placemarks[i];
    if (placemark.polygon) {
      // if (currentBounds.intersects(placemark.polygon.bounds)) {
      //   makeSidebarPolygonEntry(i);
      // }
      var normalStyle = {
        strokeColor: placemark.polygon.get('strokeColor'),
        strokeWeight: placemark.polygon.get('strokeWeight'),
        strokeOpacity: placemark.polygon.get('strokeOpacity'),
        fillColor: placemark.polygon.get('fillColor'),
        fillOpacity: placemark.polygon.get('fillOpacity')
      };
      placemark.polygon.normalStyle = normalStyle;

      highlightPoly(placemark.polygon, i);
    }
    if (placemark.polyline) {
      // if (currentBounds.intersects(placemark.polyline.bounds)) {
      //   makeSidebarPolylineEntry(i);
      // }
      var normalStyle = {
        strokeColor: placemark.polyline.get('strokeColor'),
        strokeWeight: placemark.polyline.get('strokeWeight'),
        strokeOpacity: placemark.polyline.get('strokeOpacity')
      };
      placemark.polyline.normalStyle = normalStyle;

      highlightPoly(placemark.polyline, i);
    }
    // if (placemark.marker) {
    //   if (currentBounds.contains(placemark.marker.getPosition())) {
    //     makeSidebarEntry(i);
    //   }
    // }

    /*    doc[0].markers[i].setVisible(false); */
  }
  // sidebarHtml += '</table>';
  // document.getElementById('sidebar').innerHTML = sidebarHtml;
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

function kmlUnHighlightPoly(pm) {
  for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
    if (i == pm) {
      var placemark = geoXmlDoc.placemarks[i];
      if (placemark.polygon)
        placemark.polygon.setOptions(placemark.polygon.normalStyle);
      if (placemark.polyline)
        placemark.polyline.setOptions(placemark.polyline.normalStyle);
    }
  }
}

function highlightPoly(poly, polynum) {
  //    poly.setOptions({fillColor: "#0000FF", strokeColor: "#0000FF",
  //    fillOpacity: 0.3}) ;
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
    poly.setOptions(poly.normalStyle);
  });
}

function load_kmlLayer() {
  kmlLayer = new google.maps.KmlLayer(filename);
  google.maps.event.addListener(kmlLayer, 'status_changed', function() {
    document.getElementById('kmlstatus').innerHTML =
        'Kml Status:' + kmlLayer.getStatus();
  });
  kmlLayer.setMap(map);
}
function hide_kmlLayer() {
  kmlLayer.setMap(null);
}
function show_kmlLayer() {
  kmlLayer.setMap(map);
}