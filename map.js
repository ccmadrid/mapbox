// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

mapboxgl.accessToken = 'pk.eyJ1IjoidGhhdGtpZG1hZHJpZCIsImEiOiJjaXpjZjZ0cnAxZTFvMndwOXo3ZWg2Z2N0In0.HCIp3kw9WfHCc6-1JumvlA';
// This adds the map to your page

var maxBounds = [
    [-140, 5], //Southwest
    [-50, 60]  //Northeast
];

var map = new mapboxgl.Map({
  // container id specified in the HTML
  container: 'map',
  // style URL; replace with custom mapbox link
  style: 'mapbox://styles/mapbox/light-v9',
  // initial position in [long, lat] format
  center: [-97.499,42.929],
  // initial zoom
  zoom: 3.5,
  // minZoom: 3.45,
  maxZoom: 7,
  //It's more usable if using maxBounds instead of minZoom
  maxBounds: maxBounds
});

map.on('load', function(e) {
// Load external geoJSON file
  var teams = 'data/nba.geojson';

  function buildLocationList(data) {
    // Iterate through the list of arenas
    for (i = 0; i < data.features.length; i++) {
      var currentFeature = data.features[i];
      // Shorten data.feature.properties to just `prop` so we're not
      // writing this long form over and over again.
      var prop = currentFeature.properties;
      // Select the listing container in the HTML and append a div
      // with the class 'item' for each store
      var listings = document.getElementById('listings');
      var listing = listings.appendChild(document.createElement('div'));
      listing.className = 'item';
      listing.id = 'listing-' + i;
console.log(listing.id);
      // Create a new link with the class 'title' for each store
      // and fill it with the store address
      var link = listing.appendChild(document.createElement('a'));
      link.href = '#';
      link.className = 'title';
      link.dataPosition = i;
      if(prop.alt){
        link.innerHTML = '<h2 class="arena">' + prop.alt + ' ' + prop.team + '</h2>' + prop.arena;
      }else{
        link.innerHTML = '<h2 class="arena">' + prop.city + ' ' + prop.team + '</h2>' + prop.arena;
      }


      // Create a new div with the class 'details' for each store
      // and fill it with the city and phone number
      var details = listing.appendChild(document.createElement('div'));
      details.innerHTML = prop.address + '<br>' + prop.city;
      if (prop.phone) {
        details.innerHTML += ' &middot; ' + prop.phoneFormatted;
      }

      // Add an event listener for the links in the sidebar listing
      link.addEventListener('click', function(e) {
        // Update the currentFeature to the store associated with the clicked link
        var currentFeature = data.features[this.dataPosition];
        // 1. Fly to the point associated with the clicked link
        flyToStore(currentFeature);
        // 2. Close all other popups and display popup for clicked store
        createPopUp(currentFeature);
        // 3. Highlight listing in sidebar (and remove highlight for all other listings)
        var activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }
        this.parentNode.classList.add('active');
      });
    }
  }


//============================================================================//

  //flies the map to the correct store
  function flyToStore(currentFeature) {
    map.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 6,
      curve: 1
    });
  }

//============================================================================//

  //displays a popup at that point
  function createPopUp(currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    var popup = new mapboxgl.Popup({ closeOnClick: true})
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML('<h3 style="background: ' + currentFeature.properties.c1 + ';">' + currentFeature.properties.arena + '</h3>' +
        '<h4>' + currentFeature.properties.address + '</h4>')
        .addTo(map);
  }

//============================================================================//

  mapboxgl.util.getJSON(teams, function(err, data) {
    // Add external data as source.
    map.addSource('teams', {
        type: 'geojson',
        data: data
    });

    // uses buildLocationList to display the list in the sidebar
    buildLocationList(data);

    // variable storeList is the array of data from .geojson file
    var storeList = map.getSource('teams')._data;

    //Generate markup for each object in the array
    storeList.features.forEach(function(marker, i) {

      // // Create a div element for the marker
      var el = document.createElement('div');
      el.id = "marker-" + i;
      // Add a class called 'marker' to each div
      el.className = 'marker';
      el.innerHTML = '<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><style>.st0{opacity:0.5;fill:#A7A9AC;}</style><ellipse class="st0" cx="28" cy="46.2" rx="12.5" ry="2.2"/><path style="fill: ' + marker.properties.c1 + ';" d="M46.2 21.8c0 11.7-13.3 20.9-17.2 23.4-.6.4-1.5.4-2.1 0-3.8-2.5-17.1-11.7-17.1-23.4C9.8 11.7 17.9 3.5 28 3.5s18.2 8.2 18.2 18.3z"/><path style="fill: ' + marker.properties.c2 + ';" d="M28 5.4c-9.2 0-16.7 7.5-16.7 16.7 0 5.1 2.9 10.5 8.3 15.6 3 2.8 6.2 4.9 7.7 5.8.5.3 1.1.3 1.5 0 1.4-.9 4.7-3 7.7-5.8 5.4-5.1 8.3-10.5 8.3-15.6-.1-9.2-7.6-16.7-16.8-16.7zm15.7 16.3c-4.6 1.6-8.6 2.5-12 3.1-.2-5.5 4.9-12 7.6-13.6 2.6 2.7 4.3 6.4 4.4 10.5zm0 1.1c-.2 3.5-1.8 6.8-3.9 9.6-4.8-1-7.5-3.2-8.1-6.6 3.5-.5 7.4-1.5 12-3zM28.2 6.4c4 .1 7.6 1.6 10.3 4.1-3.2 2.1-8.1 8.8-7.9 14.5-3.1.4-5.7.5-7.9.4-.4-6.1.7-13 5.5-19zm-1.2 0c-4.6 6.1-5.7 12.8-5.2 18.9-2.2-.2-4-.6-5.3-1.1.1-4-.5-8.2-1-11.3v-.2c2.6-3.6 6.7-6 11.5-6.3zM12.3 21.9c0-2.9.9-5.6 2.3-7.9.4 2.8.9 6.4.8 9.9-1.8-.9-2.8-1.7-3.1-2zm3.1 3c-.1 1.7-.4 3.4-.9 4.8-1.1-2-1.9-4.2-2.1-6.5.6.5 1.6 1.2 3 1.7zm-.3 5.9c.7-1.6 1.1-3.5 1.3-5.5 1.4.5 3.3.9 5.5 1.1.7 6.9 3.4 12.8 4.8 15.6-2.8-1.8-8.2-5.9-11.6-11.2zm13.1 11.9c-1-1.7-4.4-8.3-5.3-16.3h1.6c1.8 0 3.9-.1 6.3-.5.4 2.6 2.3 5.9 8.4 7.3-4.1 5.1-9.5 8.6-11 9.5z"/></svg>'

      // By default the image for your custom marker will be anchored
      // by its top left corner. Adjust the position accordingly
      el.style.left = '-28px';
      el.style.top = '-46px';

      // Create the custom markers, set their position, and add to map
      new mapboxgl.Marker(el)
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);

      el.addEventListener('click', function(e) {
        var activeItem = document.getElementsByClassName('active');
        // 1. Fly to the point
        flyToStore(marker);
        // 2. Close all other popups and display popup for clicked store
        createPopUp(marker);
        // 3. Highlight listing in sidebar (and remove highlight for all other listings)
        e.stopPropagation();
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }

        var listing = document.getElementById('listing-' + i);
        listing.classList.add('active');
      });
    });
  }); //
});//endmap
