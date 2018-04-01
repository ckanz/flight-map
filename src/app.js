const style = require('./style.css');

const width = 1000,
  height = 425;

const path = d3.geoPath()
  .projection(d3.geoEquirectangular());

const lineData = [{
  type: 'LineString',
  coordinates: [
    [-0.461941, 51.4706],
    [151.177002, -33.94609833]
  ]
}];

const svg = d3
  .select('#my-map')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

d3.json('./globe.geo.json', (json) => {
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
      .attr('id', (d) => `country ${d.properties.iso_a3}`)
      .attr('class', 'country');

    const pathArcs = svg.selectAll('.flightarc')
      .data(lineData)
      .enter()
      .append('path')
      .attr('class', 'flightarc')
      .attr('d', path);
  });
