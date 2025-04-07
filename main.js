import Map from "ol/Map.js";
import View from "ol/View.js";
import Draw from "ol/interaction/Draw.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import { transform } from "ol/proj";
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
    if (draw.type_ === "Circle") {
      area = formatCircleGeometry(geometry);
    } else if (draw.type_ === "Polygon") {
      area = formatPolygonGeometry(geometry);
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
    center: [-11000000, 4600000],
    zoom: 4,
  }),
});

function addInteraction() {
  map.addInteraction(draw);
}

typeSelect.onchange = function () {
  map.removeInteraction(draw);
  draw = new Draw({
    source: source,
    type: typeSelect.value,
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
