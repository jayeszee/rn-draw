# react native draw
React native draw tool for expo applications using svg based on @szimek's signaturepad https://github.com/szimek/signature_pad

## Installation

First install react-native-svg and follow the directions to properly set it up:
https://github.com/react-native-community/react-native-svg

Install rn-draw with `npm install -S rn-draw` or `yarn add rn-draw`

### Expo Applications
Make sure you follow the proper guidelines on https://expo.io to set up your react native application with expo sdk.

Install rn-draw with `npm install -S rn-draw` or `yarn add rn-draw`

NOTE: if you are using expo version <= 21 use `npm install -S rn-expo-draw@0.0.4` or `yarn add rn-expo-draw@0.0.4`

## How to use
```
import RNDraw from 'rn-draw'
  
<RNDraw
  containerStyle={{backgroundColor: 'rgba(0,0,0,0.01)'}}
  
/>
```



#### Props
**containerStyle** [Object] - style for the container of the draw component.

**rewind** [func] - a function for passing the draw component's undo functionality.
 Example:
  ```
 <RNDraw rewind={(undo) => {this._undo = undo} />
  ```
  
## Work in progress
Pen color 

Stroke width 

Smoothing out pen strokes (curves) 

