$( document ).ready(function() {
  // Handler for .ready() called.
  var urlAddress = getUrlVar("address");
  var urlLat = getUrlVar("lat");
  var urlLong = getUrlVar("long");
  console.log(urlAddress);
  console.log(urlLat);
  console.log(urlLong);
  if(urlAddress && urlAddress != '') {
    updateMarker({'address': urlAddress});
    console.log("address is not empty");
  } else if (urlLat && urlLat != '' && urlLong && urlLong != '') {
    updateMarker({'lat': urlLat, 'long': urlLong});
    console.log("lat and long are not empty");
  }
});