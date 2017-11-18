# React Native Draw
React native draw tool using react-native-svg.

[![rn-draw.gif](https://s1.gifyu.com/images/rn-draw.gif)](https://gifyu.com/image/pLIr)

# Installation

First install react-native-svg and follow the directions to properly set it up:
https://github.com/react-native-community/react-native-svg

Install rn-draw with `npm install -S rn-draw`  or  `yarn add rn-draw`

### Expo Applications
Make sure you follow the proper guidelines on https://expo.io to set up your react native application with expo sdk.

Install rn-draw with `npm install -S rn-draw`  or  `yarn add rn-draw`

### Compatibility
expo version <= 21 or react native <= 48 w/ react 16 alpha 12 --- rn-draw@0.0.4

expo version = 22 or react native = 49 w/ react 16 beta 5 --- >= rn-draw@0.0.5



# How to use
```
import RNDraw from 'rn-draw'
  
<RNDraw
  containerStyle={{backgroundColor: 'rgba(0,0,0,0.01)'}}
  rewind={(undo) => {this._undo = undo}
  clear={(clear) => {this._clear = clear}
  color={'#000000'}
  strokeWidth={4}
/>
```

### Props
**containerStyle** [Object] - style for the container of the draw component.

**color** [String] - string representation of pen color (defaults to '#000000')

**strokeWidth** [Number] - width of pen strokes (defaults to 4)

**rewind** [Func] - a function for passing the draw component's undo functionality

**clear** [Func] - a function for passing the draw component's clear functionality
  
## Work in progress

Smoothing out pen strokes (curves) 

Image backgrounds

Optimizations in pointer

