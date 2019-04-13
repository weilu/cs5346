import district from './district.js'
import housingType from './housing_type.js'

var map;
var src = '/data/geo/kml/planningboundary.kml';
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(-19.257753, 146.823688),
    zoom: 3,
    mapTypeId: 'terrain'
  });
  var kmlLayer = new google.maps.KmlLayer(
      src, {suppressInfoWindows: true, preserveViewport: false, map: map});
  kmlLayer.addListener('click', function(event) {
    var content = event.featureData.infoWindowHtml;
    var testimonial = document.getElementById('capture');
    testimonial.innerHTML = content;
  });
}