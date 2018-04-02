const style = require('./style.css');
import {
  json,
  csv
} from 'd3-request';
import {
  select,
  selectAll
} from 'd3-selection';
import {
  geoPath,
  geoEquirectangular,
  geoConicConformal,
  geoStereographic,
  geoAzimuthalEqualArea
} from 'd3-geo';
import {
  zoom
} from 'd3-zoom';
import {
  event
} from 'd3';

const width = 1000;
const height = 425;
const path = geoPath()
  .projection(geoAzimuthalEqualArea());

const getData = callback => {
  const flightData = csv('./data/flightData.csv', csv => {
    const flightArcs = csv.map(row => {
      return {
        type: 'LineString',
        coordinates: [
          [row.source_longitude, row.source_latitude],
          [row.target_longitude, row.target_latitude]
        ]
      };
    });
    callback(flightArcs);
  });
};

const drawMap = arcData => {
  const svg = select('#my-map')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  json('./globe.geo.json', (json) => {
    const countriesGroup = svg
      .call(
        zoom()
        .scaleExtent([1, 10])
        .translateExtent([
          [0, 0],
          [width, height]
        ])
        .on('zoom', () => {
          countriesGroup.attr('transform', event.transform)
        }))
      .append('g')
      .attr('id', 'map');

    countriesGroup
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);

    const countries = countriesGroup
      .selectAll('path')
      .data(json.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('id', (d) => `country ${d.properties.iso_a3}`)
      .attr('class', 'country');

    const pathArcs = countriesGroup.selectAll('.flightarc')
      .data(arcData)
      .enter()
      .append('path')
      .attr('stroke-linecap', 'round')
      .attr('class', 'flightarc')
      .attr('d', path);
  });
};

getData(data => {
  drawMap(data);
});
