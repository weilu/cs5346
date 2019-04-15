export default function buildMap(containerEl, done) {
  const kmlDataPath =
      'https://raw.githubusercontent.com/weilu/cs5346/master/project/data/geo/kml/';
  var kmlData = [];
  ['soonhdb.kml'  //,
                  //  'aquaticsg.kml',
                  //  'childcare.kml',
                  //  'clinics.kml',
                  //  'communityclubs.kml',
                  //  'firestation.kml',
                  //  'gymsg.kml',
                  //  'kindergarten.kml',
                  //  'libraries.kml',
                  //  'marketfood.kml',
                  //  'mrtexit.kml',
                  //  'museums.kml',
                  //  'parks.kml',
                  //  'pharmacy.kml',
                  //  'playsg.kml',
                  //  'police.kml',
                  //  'sportsg.kml',
  ].forEach((kmlFile) => {
    kmlData.push(kmlDataPath + kmlFile);
  });

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
      // // Geodata handling goes here, using JSON properties of the doc object
      // geoXmlDoc = doc[0];
      // if (!geoXmlDoc || !geoXmlDoc.placemarks) return;
      // for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
      //   var placemark = geoXmlDoc.placemarks[i];
      //   if (placemark.polygon) {
      //     placemark.polygon.setOptions(
      //         {fillColor: '#0000FF', strokeColor: '#0000FF', fillOpacity:
      //         0.3});
      //     if (!disableMouseOverHighlight) {
      //       setHighlightHandler(
      //           geoXmlDoc, placemark.polygon, i, highlightOptions,
      //           highlightLineOptions);
      //     }
      //   }
      // }

      if (done != null) {
        done()
      }
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
    // TODO
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
