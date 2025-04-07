import Map from "ol/Map.js";
import View from "ol/View.js";
import Draw, { createRegularPolygon } from "ol/interaction/Draw.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import { fromLonLat, transform } from "ol/proj";
import { TileJSON } from "ol/source";
import OSM from "ol/source/OSM.js";
import VectorSource from "ol/source/Vector.js";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

const typeSelect = document.getElementById("type");
const resultTxt = document.getElementById("result");

let type = "Polygon";
const source = new VectorSource({ wrapX: false });
const vector = new VectorLayer({
  source: source,
});

let draw = new Draw({
  source: source,
  type: type,
});

addFinishLogic();

function addFinishLogic() {
  draw.on("drawend", (event) => {
    const geometry = event.feature.getGeometry();
    let area;
    if (typeSelect.value === "Circle") {
      area = formatCircleGeometry(geometry);
    } else if (typeSelect.value === "Polygon") {
      area = formatPolygonGeometry(geometry);
    } else if (typeSelect.value === "Square") {
      area = `SQUARE(${ geometry.getCoordinates()})`;
    } else {
      area = geometry.getCoordinates();
    }
    resultTxt.innerHTML = area;

    const purpleStyle = new Style({
      stroke: new Stroke({
        color: "#6610f2",
        width: 4,
      }),
      fill: new Fill({
        color: "rgba(128, 0, 128, 0.1)",
      }),
    });

    event.feature.setStyle(purpleStyle);
    source.clear();
  });
}

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM({ cacheSize: 5000 }),
      visible: false,
      className: "ostm",
    }),
    new TileLayer({
      source: new TileJSON({
        url: `https://api.maptiler.com/tiles/satellite-v2/tiles.json?key=${"1UVdtsti83lTwQos4SOV"}`,
        tileSize: 512,
        crossOrigin: "anonymous",
        cacheSize: 5000,
      }),
      visible: true,
      className: "bingmaps",
    }),
    vector,
  ],
  target: "map",
  view: new View({
    center: fromLonLat([-102.329426, 22.574874]),
    zoom: 4,
  }),
});

function addInteraction() {
  map.addInteraction(draw);
}

typeSelect.onchange = function () {
  let geometryFunction;
  let type = typeSelect.value;
  if (typeSelect.value === "Square") {
    type = "Circle";
    geometryFunction = createRegularPolygon(4);
  }
  map.removeInteraction(draw);
  draw = new Draw({
    source: source,
    type,
    geometryFunction,
  });
  addFinishLogic();
  addInteraction();
};

addInteraction();

function formatCircleGeometry(circle) {
  const center = transform(circle.getCenter(), "EPSG:3857", "EPSG:4326");
  const radius = circle.getRadius();
  return `CIRCLE(${center[1]} ${center[0]},${radius})`;
}

function formatPolygonGeometry(polygon) {
  const coordinates = polygon.getCoordinates()[0];
  const formattedCoords = coordinates
    .map((coord) => {
      coord = transform(coord, "EPSG:3857", "EPSG:4326");
      return `${coord[1]} ${coord[0]}`;
    })
    .join(", ");
  return `POLYGON((${formattedCoords}))`;
}
