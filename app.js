var width = 1000,
  height = 425;

var path = d3.geoPath()
  .projection(d3.geoEquirectangular());

var lineData = [{
  type: 'LineString',
  coordinates: [
    [-0.461941, 51.4706],
    [151.177002, -33.94609833]
  ]
}];

var svg = d3
  .select('#my-map')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

d3.json(
  './globe.geo.json',
  function(json) {
    countriesGroup = svg
      .append('g')
      .attr('id', 'map');

    countriesGroup
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);

    countries = countriesGroup
      .selectAll('path')
      .data(json.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('id', function(d) {
        return 'country' + d.properties.iso_a3;
      })
      .attr('class', 'country');

    var pathArcs = svg.selectAll('.flightarc')
      .data(lineData)
      .enter()
      .append('path')
      .attr('class', 'flightarc')
      .attr('d', path);
  });
