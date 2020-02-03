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
  geoSatellite,
  geoOrthographic,
  geoEquirectangular,
  geoConicConformal,
  geoAzimuthalEqualArea,
  geoStereographic
} from 'd3-geo';
import {
  geoAiry,
  geoAitoff,
}  from 'd3-geo-projection';
import {
  zoom
} from 'd3-zoom';
import {
  event,
  drag,
  mouse
} from 'd3';
import {
  scaleLinear
} from 'd3-scale';

const width = window.screen.availWidth || 1000;
const height = window.screen.availHeight || 1000;
const mapRadius = height / 3;
const projection = geoOrthographic()
  .scale(mapRadius)
  .translate([width / 2, height / 2])
  .rotate([0, 0])
  .precision(0.5);

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

const rotateXScale = scaleLinear().range([-180, 180]).domain([0, width]);
const rotateYScale = scaleLinear().range([0, 180]).domain([0, height]);
let latestRotation = [0, 0];

const updateRotation = () => {
  projection.rotate([rotateXScale(event.x), 0]);
  selectAll("path").attr("d", path);
};

const setNewRotation = () => { latestRotation = [rotateXScale(event.x), 0] }

const autoRotate = () => {
  latestRotation[0] += 0.5;
  projection.rotate(latestRotation);
  selectAll("path").attr("d", path);
};

const getNewAtmosphereRadius = () => (mapRadius / 20) + (Math.random() * (mapRadius / 100))

const flicker = () => {
  document.getElementById('atmosphere-offset').setAttribute('dx', getNewAtmosphereRadius())
};

const drawMap = arcData => {
  json('./globe.geo.json', (json) => {
    const countriesGroup = select('#flightmap')
      /*
      .call(
        drag()
          .on("drag", updateRotation)
          .on("end", setNewRotation)
      )
      */
      .call(
        zoom()
        .scaleExtent([1, 10])
        .translateExtent([
          [0, 0],
          [width, height]
        ])
        .on('zoom', () => {
          countriesGroup.attr('transform', event.transform)
        })
      )
      .append('g')
      .attr('id', 'map');

    countriesGroup
      .append('circle')
      .attr('id', 'atmoshpere')
      .attr('filter', 'url(#atmosphere-glow)')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', mapRadius);

    countriesGroup
      .append('circle')
      .attr('id', 'ocean')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', mapRadius);

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
      .attr('filter', 'url(#path-glow)')
      .attr('d', path);

    setInterval(() => {
      autoRotate();
      flicker();
    }, 33);
  });
};

getData(data => {
  drawMap(data);
});
