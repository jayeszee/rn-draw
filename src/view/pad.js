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

import humps from 'humps'

const {OS} = Platform
// import Bezier from '../tools/bezier'

export const convertStrokesToSvg = (strokes, layout={}) => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" version="1.1">
      <g>
        ${strokes.map(e => {
          return `<${e.type.toLowerCase()} ${Object.keys(e.attributes).map(a => {
            return `${humps.decamelize(a, {separator: '-'})}="${e.attributes[a]}"`
          }).join(' ')}/>`
        }).join('\n')}
      </g>
    </svg>
  `
}

export default class Whiteboard extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      currentPoints: [],
      previousStrokes: this.props.strokes || [],
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

  componentWillReceiveProps(newProps) {
    if(this.props.strokes && newProps.strokes && JSON.stringify(this.props.strokes) !== JSON.stringify(newProps.strokes)){
      this.setState({
        previousStrokes: newProps.strokes,
        newStroke: [],
      });
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
    }, () => {
      this._onChangeStrokes([...strokes]);
    })
  }

  clear = () => {
    this.setState({
      previousStrokes: [],
      currentPoints: [],
      newStroke: [],
    }, () => {
      this._onChangeStrokes([]);
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

    let points = this.state.currentPoints;
    if(points.length === 1){
      let p = points[0];
      let distance = parseInt(Math.sqrt((this.props.strokeWidth || 4))/2);
      points.push(new Point(p.x + distance, p.y + distance, p.time));
    }

    let newElement =  {
      type: 'Path',
      attributes: {
        d: this.state.pen.pointsToSvg(points),
        stroke: (this.props.color || '#000000'),
        strokeWidth: (this.props.strokeWidth || 4),
        fill: "none",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    }

    this.state.pen.addStroke(points)
    
    this.setState({
      previousStrokes: [...this.state.previousStrokes, newElement],
      currentPoints: [],
    }, () => {
      this._onChangeStrokes(this.state.previousStrokes);
    })
  }

  _onChangeStrokes = (strokes) => {
    if(this.props.onChangeStrokes){
      this.props.onChangeStrokes(strokes);
    }
  }

  _onLayoutContainer = (e) => {
    this.state.pen.setOffset(e.nativeEvent.layout);
    this._layout = e.nativeEvent.layout;
  }

  _renderSvgElement = (e, tracker) => {
    if(e.type === 'Path'){
      return <Path {...e.attributes} key={tracker}/>
    }

    return null
  }

  exportToSVG = () => {
    const strokes = [...this.state.previousStrokes];
    return convertStrokesToSvg(strokes, this._layout);
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
              {this.state.previousStrokes.map((stroke, index) => {
                return this._renderSvgElement(stroke, index)
              })}
              <Path
                key={this.state.previousStrokes.length}
                d={this.state.pen.pointsToSvg(this.state.currentPoints)}
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
