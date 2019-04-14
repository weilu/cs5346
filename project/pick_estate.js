
var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(1.351616, 103.808053),
    zoom: 12,
    mapTypeId: 'terrain'
  });

  loadKML(
      'https://raw.githubusercontent.com/weilu/cs5346/julwrites/maps/project/data/geo/kml/planningboundary.kml');
}

function loadKML(src) {
  var kmlLayer = new google.maps.KmlLayer(
      src, {suppressInfoWindows: true, preserveViewport: false});

  kmlLayer.setMap(map);

  kmlLayer.addListener('click', function(event) {
    var content = event.featureData.infoWindowHtml;
    var testimonial = document.getElementById('capture');
    testimonial.innerHTML = content;
  });
}