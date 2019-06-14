import simplify from "./simplify";

const d3 = require("d3-shape");
const defaultLineGenerator = d3.line()
  .x(function(d) { return d.x; })
  .y(function(d) { return d.y; })
  .curve(d3.curveCatmullRom.alpha(0.5));

export default class Pen {
  constructor(strokes) {
    this.strokes = strokes || [];
    this._offsetX = 0;
    this._offsetY = 0;
  }

  addStroke(points) {
    if (points.length > 0) {
      this.strokes.push(points);
    }
  }

  rewindStroke() {
    if (this.strokes.length < 1) { return; }
    this.strokes.pop();
  }

  setOffset(options) {
    if (!options) { return; }
    this._offsetX = options.x;
    this._offsetY = options.y;
  }

  pointsToSvg(points, tolerance = 1, lineGenerator = null, highQuality = true) {
    let offsetX = this._offsetX;
    let offsetY = this._offsetY;
    if (points.length > 0) {
      let simplifiedPathPoints = simplify(points, tolerance, highQuality);
      /*       var path = `M ${points[0].x},${points[0].y}`
            simplified.forEach((point) => {
              path = path + ` L ${point.x},${point.y}`
            }); */
      // var path = `M ${points[0].x},${points[0].y}`
      if (lineGenerator && typeof lineGenerator === "function") {
        return lineGenerator(simplifiedPathPoints);
      }
      return defaultLineGenerator(simplifiedPathPoints);
    } else {
      return '';
    }
  }

  clear = () => {
    this.strokes = [];
  }

  copy() {
    // error  'Reaction' is not defined  no-undef
    return new Reaction(this.strokes.slice());
  }
}
