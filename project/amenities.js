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
          placemark.polygon.setOptions(style().nromal);

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

  var setClickHDB = function(map, geoDoc, region, info) {
    map.addListener('click', function(event) {
      hideAmenities(region);
      info.close();
    });

    google.maps.event.addListener(region, 'click', function(event) {
      var lat = event.latLng.lat();
      var lng = event.latLng.lng();
      var latlng = new google.maps.LatLng(lat, lng);
      map.setCenter(latlng);

      for (var i = 0; i < geoDoc.placemarks.length; i++) {
        var placemark = geoDoc.placemarks[i];
        if (placemark.regiongon) {
          placemark.regiongon.setOptions(style().normal);
        }
      }

      if (region) {
        region.setOptions(style().click);
      }

      var report = showAmenities(latlng);

      // Display distance to nearest amenities
      info.setContent(report);
      info.setPosition(region.bounds.getCenter());
      info.open(map);
    });
  };

  // TODO: Change to render points per type
  var setHoverHDB = function(hdb) {
    google.maps.event.addListener(hdb, 'mouseover', function() {
      console.log('Mouseover Polygon');
      if (hdb) {
        hdb.setOptions(style().hover);
      }
    });
    google.maps.event.addListener(hdb, 'mouseout', function() {
      console.log('Mouseoff Polygon');
      hdb.setOptions(style().normal);
    });
  };

  var setHoverAmenities = function(marker, id) {
    var content;
    var position;

    google.maps.event.addListener(marker, 'mouseover', function() {
      var rowElem = document.getElementById('row' + id);
      if (rowElem) rowElem.style.backgroundColor = '#FFFA5E';

      content = info.getContent();
      position = info.getPosition();

      info.setContent('TODO: Add amenities description');
      info.open(map, marker);
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
      var rowElem = document.getElementById('row' + id);
      if (rowElem) rowElem.style.backgroundColor = '#FFFFFF';

      info.setContent(content);
      info.setPosition(position);
    });
  };

  // Show all the amenities
  var showAmenities =
      function(latlng) {
    const DENSITY = 5;

    var bounds = new google.maps.LatLngBounds();

    for (var g = 0; g < geoData.length; g++) {
      if (g === kml.ref['soonhdb']) continue;  // Skip hdb

      var geoDoc = geoData[g];
      if (!geoDoc || !geoDoc.placemarks) return;

      var distance = [];

      for (var i = 0; i < geoDoc.placemarks.length; i++) {
        var placemark = geoDoc.placemarks[i];

        if (placemark.marker) {
          distance.push(
              {dist: calcDistance(latlng, placemark.marker.position), id: i});
        }
      }

      distance.sort(function(a, b) {
        return a.dist < b.dist;
      });

      for (var i = 0; i < DENSITY; i++) {
        var placemark = geoDoc.placemarks[distance[i].id];
        placemark.marker.setMap(map);

        bounds.extend(placemark.marker.position);
      }
    }

    return 'TODO: Add amenities distances';
  }

  // Hide all the amenities
  var hideAmenities =
      function(region) {
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

    map.fitBounds(region.bounds);
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
        kmlIcon.push(kmlDataPath + 'icon/' + kmlFile + '.png');
        kmlRef[kmlFile] = id++;
      });
  return {ref: kmlRef, data: kmlData, icon: kmlIcon};
}

function
style() {
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

function calcDistance(p1, p2) {
  return google.maps.geometry.spherical.computeDistanceBetween(p1, p2).toFixed(
      2);
}
