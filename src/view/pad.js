import PropTypes from 'prop-types';
import React from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import humps from 'humps';
import Svg, { G, Path } from 'react-native-svg';
import Pen from '../tools/pen';
import Point from '../tools/point';

export const convertStrokesToSvg = (strokes, layout = {}) => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" version="1.1">
      <g>
        ${strokes.map(e => {
    return `<${e.type.toLowerCase()} ${Object.keys(e.attributes).map(a => {
      return `${humps.decamelize(a, { separator: '-' })}="${e.attributes[a]}"`;
    }).join(' ')}/>`;
  }).join('\n')}
      </g>
    </svg>
  `;
};

/* Styling */
let styles = StyleSheet.create({
  drawContainer: {
    flex: 1,
    display: 'flex',
  },
  svgContainer: {
    flex: 1,
  },
  drawSurface: {
    flex: 1,
  },
});

export default class DrawPad extends React.Component {

  static propTypes = {
    drawActive: PropTypes.bool,

    strokes: PropTypes.array,
    strokeWidth: PropTypes.number,

    editOpacity: PropTypes.number,
    simplifyTolerance: PropTypes.number,
    color: PropTypes.string,
    containerStyle: PropTypes.any,
    lineGenerator: PropTypes.func,

    onChangeStrokes: PropTypes.func,
    onRewind: PropTypes.func,
    onClear: PropTypes.func,
  }
  /**************************************************/
  static defaultProps = {
    drawActive: true,
    strokes: null,
    strokeWidth: 4,
    editOpacity: 0.7,
    simplifyTolerance: 1,
    color: "#000000",
    containerStyle: null,
    lineGenerator: null,

    onChangeStrokes: () => { },
    onRewind: () => { },
    onClear: () => { },
  }
  /**************************************************/
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentPoints: [],
      previousStrokes: this.props.strokes || [],
      newStroke: [],
      pen: new Pen(),
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: (evt, gs) => this.onResponderGrant(evt, gs),
      onPanResponderMove: (evt, gs) => this.onResponderMove(evt, gs),
      onPanResponderRelease: (evt, gs) => this.onResponderRelease(evt, gs),
    });
  }
  /****************************************************************************************************/
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.previousStrokes !== nextState.previousStrokes) { return true; }
    if (this.state.currentPoints !== nextState.currentPoints) { return true; }
    if (this.state.newStroke !== nextState.newStroke) { return true; }
    return false;
  }
  /**************************************************/
  componentWillReceiveProps(newProps) {
    if (this.props.strokes !== newProps.strokes) {
      if (newProps.strokes !== this.state.previousStrokes) {
        this.setState({
          currentPoints: this.currentPoints || [],
          previousStrokes: newProps.strokes,
          newStroke: [],
        });
      }
    }
  }
  /****************************************************************************************************/
  rewind = () => {
    let currentPoints = this.currentPoints || this.state.currentPoints;
    if (currentPoints.length > 0 || this.state.previousStrokes.length < 1) {
      return;
    }
    let strokes = this.state.previousStrokes;
    strokes.pop();

    this.state.pen.rewindStroke();
    this.currentPoints = [];
    this.setState({
      previousStrokes: [...strokes],
      currentPoints: [],
    }, () => {
      this._onChangeStrokes([...strokes]);

      if (this.props.onRewind) {
        this.props.onRewind();
      }
    });
  }
  /**************************************************/
  clear = () => {
    this.setState({
      previousStrokes: [],
      currentPoints: [],
      newStroke: [],
    }, () => {
      this.currentPoints = [];
      this._onChangeStrokes([]);

      if (this.props.onClear) {
        this.props.onClear();
      }
    });

    this.state.pen.clear();
  }
  /**************************************************/
  exportToSVG = () => {
    const strokes = [...this.state.previousStrokes];
    return convertStrokesToSvg(strokes, this._layout);
  }
  /**************************************************/
  updateStrokes = (data = {}) => {
    requestAnimationFrame(() => {
      this.setState({ ...data });
    });
  }
  /****************************************************************************************************/
  onTouch = (evt) => {

    if (!this.props.drawActive) {
      return;
    }

    let x, y, timestamp;
    [x, y, timestamp] = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp];

    let newPoint = new Point(x, y, timestamp);
    let newCurrentPoints = (this.currentPoints || this.state.currentPoints).slice();
    newCurrentPoints.push(newPoint);

    this.currentPoints = newCurrentPoints;

    this.updateStrokes({
      currentPoints: newCurrentPoints,
    });
  }
  /**************************************************/
  onResponderGrant(evt) {
    this.onTouch(evt);
  }
  /**************************************************/
  onResponderMove(evt) {
    this.onTouch(evt);
  }
  /**************************************************/
  onResponderRelease() {
    // let strokes = this.state.previousStrokes;
    if (this.state.currentPoints.length < 1) {
      return;
    }

    if (!this.props.drawActive) {
      return;
    }

    let points = this.currentPoints || this.state.currentPoints;
    if (points.length === 1) {
      let p = points[0];
      let distance = parseInt(Math.sqrt((this.props.strokeWidth || 4)) / 2, 10);
      points.push(new Point(p.x + distance, p.y + distance, p.time));
    }

    let newElement = {
      type: 'Path',
      attributes: {
        d: this.state.pen.pointsToSvg(points, this.props.simplifyTolerance, this.props.lineGenerator),
        stroke: (this.props.color || '#000000'),
        strokeWidth: (this.props.strokeWidth || 4),
        fill: "none",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    };

    this.state.pen.addStroke(points);

    this.currentPoints = [];

    InteractionManager.runAfterInteractions(() => {
      this.setState({
        previousStrokes: [...this.state.previousStrokes, newElement],
        currentPoints: this.currentPoints || [],
      }, () => {
        requestAnimationFrame(() => {
          this._onChangeStrokes(this.state.previousStrokes);
        });
      });
    });
  }
  /****************************************************************************************************/
  _onChangeStrokes = (strokes) => {
    if (this.props.onChangeStrokes) {
      requestAnimationFrame(() => {
        this.props.onChangeStrokes(strokes);
      });
    }
  }
  /**************************************************/
  _onLayoutContainer = (e) => {
    this.state.pen.setOffset(e.nativeEvent.layout);
    this._layout = e.nativeEvent.layout;
  }
  /****************************************************************************************************/
  _renderSvgElement = (e, tracker) => {
    if (e.type === 'Path') {
      return <Path {...e.attributes} key={tracker} />;
    }

    return null;
  }
  /**************************************************/
  render() {
    const { previousStrokes = [] } = this.state;

    return (
      <View
        onLayout={this._onLayoutContainer}
        style={[
          styles.drawContainer,
          this.props.containerStyle,
        ]}>
        <View style={styles.svgContainer} {...this._panResponder.panHandlers}>
          <Svg style={styles.drawSurface}>
            <G>
              {previousStrokes.map((stroke, index) => {
                return this._renderSvgElement(stroke, index);
              })}
              <Path
                key={previousStrokes.length}
                fillOpacity={this.props.editOpacity || 0.7}
                strokeOpacity={this.props.editOpacity || 0.7}
                d={this.state.pen.pointsToSvg(this.state.currentPoints, this.props.simplifyTolerance, this.props.lineGenerator, false)}
                stroke={this.props.color || "#000000"}
                strokeWidth={this.props.strokeWidth || 4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>
          </Svg>
          {this.props.children}
        </View>
      </View>
    );
  }
  /****************************************************************************************************/
}
