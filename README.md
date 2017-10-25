# React Native Draw
React native draw tool using react-native-svg.

# Installation

First install react-native-svg and follow the directions to properly set it up:
https://github.com/react-native-community/react-native-svg

Install rn-draw with `npm install -S rn-draw`  or  `yarn add rn-draw`

### Expo Applications
Make sure you follow the proper guidelines on https://expo.io to set up your react native application with expo sdk.

Install rn-draw with `npm install -S rn-draw`  or  `yarn add rn-draw`

NOTE: if you are using expo version <= 21 use `npm install -S rn-expo-draw@0.0.4`  or  `yarn add rn-expo-draw@0.0.4`

# How to use
```
import RNDraw from 'rn-draw'
  
<RNDraw
  containerStyle={{backgroundColor: 'rgba(0,0,0,0.01)'}}
  rewind={(undo) => {this._undo = undo}
  color={'#000000'}
  strokeWidth={4}
/>
```

### Props
**containerStyle** [Object] - style for the container of the draw component.

**rewind** [Func] - a function for passing the draw component's undo functionality

**color** [String] - string representation of pen color (defaults to '#000000')

**strokeWidth** [Number] - width of pen strokes (defaults to 4)
  
## Work in progress

Smoothing out pen strokes (curves) 

