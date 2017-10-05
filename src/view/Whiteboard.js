import React from 'react'
import {
  View,
  PanResponder,
  StyleSheet,
} from 'react-native'
import {Svg} from 'expo'
const {
  G, 
  Surface, 
  Path
} = Svg
import Pen from '../tools/pen'
import Point from '../tools/point'
// import Bezier from '../tools/bezier'

export default class Whiteboard extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      tracker: 0,
      currentPoints: [],
      previousStrokes: [],
      newStroke: [],
      pen: new Pen(),
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: (evt, gs) => this.onResponderGrant(evt, gs),
      onPanResponderMove: (evt, gs) => this.onResponderMove(evt, gs),
      onPanResponderRelease: (evt, gs) => this.onResponderRelease(evt, gs)
    });
  }

  onTouch(evt) {
    let [x, y, timestamp] = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp]
    let newPoint = new Point(x, y, timestamp)
    let newCurrentPoints = this.state.currentPoints
    newCurrentPoints.push(newPoint)

    this.setState({
      previousStrokes: this.state.previousStrokes,
      currentPoints: newCurrentPoints,
      tracker: this.state.tracker
    });
  }

  onResponderGrant(evt) {
    this.onTouch(evt);
  }

  onResponderMove(evt) {
    this.onTouch(evt);
  }

  onResponderRelease() {
    let strokes = this.state.previousStrokes;
    if (this.state.currentPoints.length > 0) {
      strokes.push(
        <Path
          key={this.state.tracker}
          d={this.state.pen.pointsToSvg(this.state.currentPoints)}
          stroke="#000000"
          strokeWidth={4}
          fill="none"
        />
      );
    }

    this.state.pen.addStroke(this.state.currentPoints);

    this.setState({
      previousStrokes: strokes,
      currentPoints: [],
      tracker: this.state.tracker + 1,
    });
  }

  _onLayoutContainer = (e) => {
    this.state.pen.setOffset(e.nativeEvent.layout);
  }

  render() {
    return (
      <View
        onLayout={this._onLayoutContainer}
        style={[
          styles.drawContainer,
          this.props.containerStyle,
          {width: this.props.width, height: this.props.height}
        ]}>
        <View {...this._panResponder.panHandlers}>
          <Svg style={styles.drawSurface} width={this.props.width} height={this.props.height}>
            <G>
              {this.state.previousStrokes}
              <Path
                key={this.state.tracker}
                d={this.state.pen.pointsToSvg(this.state.currentPoints)}
                stroke="#000000"
                strokeWidth={4}
                fill="none"
              />
            </G>
          </Svg>

          {this.props.children}
        </View>
      </View>
    );
  }
}

let styles = StyleSheet.create({
  drawContainer: {
  },
  drawSurface: {
    backgroundColor: 'transparent',
  },
});
