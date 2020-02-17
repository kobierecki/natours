/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1IjoibDNtdXJyIiwiYSI6ImNrNnFmOWd4eDAwYXAzbHM0MnlwNmFpaHgifQ.k6SOCO2vPse5HF53VEYcrg';
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/l3murr/ck6qfru83233m1iphgk99oisn',
	scrollZoom: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
	// add marker
	const el = document.createElement('div');
	el.className = 'marker';

	new mapboxgl.Marker({
		element: el,
		anchor: 'bottom'
	}).setLngLat(loc.coordinates).addTo(map);

	new mapboxgl.Popup({
		offset: 30
	}).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);

	bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
	padding: {
		top: 200,
		bottom: 150,
		left: 100,
		right: 100
	}
});