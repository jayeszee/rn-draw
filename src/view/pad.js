import React from 'react'
import {
  View,
  PanResponder,
  StyleSheet,
  Platform
} from 'react-native'
import {Svg} from '../config'
const {
  G, 
  Surface, 
  Path
} = Svg
import Pen from '../tools/pen'
import Point from '../tools/point'
const {OS} = Platform
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
    }

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: (evt, gs) => this.onResponderGrant(evt, gs),
      onPanResponderMove: (evt, gs) => this.onResponderMove(evt, gs),
      onPanResponderRelease: (evt, gs) => this.onResponderRelease(evt, gs)
    })
    const rewind = props.rewind || function (){}
    const clear = props.clear || function (){}
    this._clientEvents = {
      rewind: rewind(this.rewind),
      clear: clear(this.clear),
    }
    
  }

  rewind = () => {
    if (this.state.currentPoints.length > 0 || this.state.previousStrokes.length < 1) return
    let strokes = this.state.previousStrokes
    strokes.pop()

    this.state.pen.rewindStroke()
    
    this.setState({
      previousStrokes: [...strokes],
      currentPoints: [],
      tracker: this.state.tracker - 1,
    })
  }

  clear = () => {
    this.setState({
      previousStrokes: [],
      currentPoints: [],
      newStroke: [],
      tracker: 0,
    })
    this.state.pen.clear()
  }

  onTouch(evt) {
    let x, y, timestamp
    [x, y, timestamp] = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp]
    let newPoint = new Point(x, y, timestamp)
    let newCurrentPoints = this.state.currentPoints
    newCurrentPoints.push(newPoint)

    this.setState({
      previousStrokes: this.state.previousStrokes,
      currentPoints: newCurrentPoints,
      tracker: this.state.tracker
    })
  }

  onResponderGrant(evt) {
    this.onTouch(evt);
  }

  onResponderMove(evt) {
    this.onTouch(evt);
  }

  onResponderRelease() {
    let strokes = this.state.previousStrokes
    if (this.state.currentPoints.length < 1) return
    let newElement = (
      <Path
        key={this.state.tracker}
        d={this.state.pen.pointsToSvg(this.state.currentPoints)}
        stroke={this.props.color || '#000000'}
        strokeWidth={this.props.strokeWidth || 4}
        fill="none"
      />
    )

    this.state.pen.addStroke(this.state.currentPoints)
    
    this.setState({
      previousStrokes: [...this.state.previousStrokes, newElement],
      currentPoints: [],
      tracker: this.state.tracker + 1,
    })
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
        ]}>
        <View style={styles.svgContainer} {...this._panResponder.panHandlers}>
          <Svg style={styles.drawSurface}>
            <G>
              {this.state.previousStrokes}
              <Path
                key={this.state.tracker}
                d={this.state.pen.pointsToSvg(this.state.currentPoints)}
                stroke={this.props.color || "#000000"}
                strokeWidth={this.props.strokeWidth || 4}
                fill="none"
              />
            </G>
          </Svg>

          {this.props.children}
        </View>
      </View>
    )
  }
}

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
})
