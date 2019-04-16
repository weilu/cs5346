export default function buildMap(containerEl, done) {
  var kml = indexKmlData();
  var geoData = null;
  var map = new google.maps.Map(containerEl);
  var info = new google.maps.InfoWindow();
  var selection = {};

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
          placemark.polygon.setOptions(style().normal);

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

          if (placemark.polygon) {
            placemark.polygon.setOptions(style().hide);
          } else if (placemark.marker) {
            setHoverAmenities(placemark.marker, i);

            placemark.marker.setOptions({icon: kml.icon[g]})
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

  var setClickHDB = function(map, geoDoc, hdb, info) {
    map.addListener(hdb, 'click', function(event) {
      hideAmenities();
      // info.close();
      hdb.setOptions(style().normal);

      map.fitBounds(selection.region.bounds);
      selection.block = null;
    });

    google.maps.event.addListener(hdb, 'click', function(event) {
      if (selection.block) selection.block.setOptions(style().normal);
      map.fitBounds(selection.region.bounds);

      selection.block = hdb;

      for (var i = 0; i < geoDoc.placemarks.length; i++) {
        var placemark = geoDoc.placemarks[i];
        if (placemark.hdbgon) {
          placemark.hdbgon.setOptions(style().normal);
        }
      }

      if (hdb) {
        hdb.setOptions(style().click);
      }

      map.setCenter(hdb.bounds.getCenter());

      var report = showAmenities(hdb);

      console.log(report);

      // Display distance to nearest amenities
      // info.setContent(report);
      // info.setPosition(hdb.bounds.getCenter());
      // info.open(map);
    });
  };

  var setHoverHDB = function(hdb) {
    google.maps.event.addListener(hdb, 'mouseover', function() {
      if (hdb && selection.block !== hdb) {
        hdb.setOptions(style().hover);
      }
    });
    google.maps.event.addListener(hdb, 'mouseout', function() {
      if (selection.block !== hdb) hdb.setOptions(style().normal);
    });
  };

  var setHoverAmenities = function(marker, id) {
    google.maps.event.addListener(marker, 'mouseover', function() {
      var rowElem = document.getElementById('row' + id);
      if (rowElem) rowElem.style.backgroundColor = '#FFFA5E';

      info.setContent(marker.title);
      info.open(map, marker);
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
      var rowElem = document.getElementById('row' + id);
      if (rowElem) rowElem.style.backgroundColor = '#FFFFFF';

      info.close()
    });
  };

  // Show all the amenities
  var showAmenities =
      function(hdb) {
    const DENSITY = 3;

    hideAmenities();

    var report = [];
    var bounds = hdb.bounds;

    for (var g = 0; g < geoData.length; g++) {
      if (g === kml.ref['soonhdb']) continue;  // Skip hdb

      var geoDoc = geoData[g];
      if (!geoDoc || !geoDoc.placemarks) return;

      var distance = [];

      for (var i = 0; i < geoDoc.placemarks.length; i++) {
        var placemark = geoDoc.placemarks[i];

        if (placemark.marker) {
          distance.push({
            dist: calcDistance(
                bounds.getCenter(), placemark.marker.getPosition()),
            id: i
          });
        }
      }

      distance = distance.sort(function(a, b) {
        return a.dist - b.dist;
      });

      for (var i = 0; i < DENSITY; i++) {
        if (i >= distance.length) break;

        var placemark = geoDoc.placemarks[distance[i].id];
        placemark.marker.setMap(map);

        bounds.extend(placemark.marker.position);

        if (i === 0)
          report.push(placemark.marker.title + ': ' + distance[i].dist + 'm');
      }
    }
    map.fitBounds(bounds);

    showSidebar(report);

    return report.join('<br>');
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

        selection.region = placemark.polygon;

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
  ['soonhdb', 'childcare', 'clinics', 'communityclubs', 'firestation', 'gymsg',
   'kindergarten', 'libraries', 'marketfood', 'mrtexit', 'parks', 'pharmacy',
   'playsg', 'police', 'sportsg', 'planningboundary']
      .forEach((kmlFile) => {
        kmlData.push(kmlDataPath + 'kml/' + kmlFile + '.kml');
        kmlIcon.push(kmlDataPath + 'icon/' + kmlFile + '.png');
        kmlRef[kmlFile] = id++;
      });
  return {ref: kmlRef, data: kmlData, icon: kmlIcon};
}

function
style() {
  return {
    normal: {fillColor: '#FF8800', fillOpacity: 0.7},
        hover: {fillColor: '#FFFFFF', fillOpacity: 0.9},
        click: {fillColor: '#0088FF', fillOpacity: 0.9},
        hide: {fillOpacity: 0.0}
  }
}

function calcDistance(p1, p2) {
  return google.maps.geometry.spherical.computeDistanceBetween(p1, p2).toFixed(
      2);
}

function showSidebar(report) {
  var sidebarHtml =
      '<table><tr><td><a href="javascript:showAll();">Show All</a></td></tr>';
  for (let i = 0; i < report.length; i++) {
    const row = report[i];
    sidebarHtml += '<tr id="row' + i + '" >' + row + '</td></tr>';
  }
  sidebarHtml += '</table>';
  document.getElementById('sidebar').innerHTML = sidebarHtml;
}
