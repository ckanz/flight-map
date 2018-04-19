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
  geoAzimuthalEquidistant,
  geoAzimuthalEqualArea
} from 'd3-geo';
import {
  zoom
} from 'd3-zoom';
import {
  event
} from 'd3';

const width = 1000;
const height = 1000;
var projection = geoAzimuthalEqualArea()
    .scale(150)
    .translate([width / 2, height / 2])
    .rotate([0, 0])
    .clipAngle(180 - 1e-3)
    .precision(0.1);

const path = geoPath()
  .projection(projection);

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

const update = () => {
  selectAll("path")
    //.interrupt().transition()
    //.duration(1000).ease(d3.easeLinear)
    .attr("d", geoPath().projection(projection.rotate([event.x, event.y])));
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
      .on('click', update)
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

    update()
  });
};

getData(data => {
  drawMap(data);
});
