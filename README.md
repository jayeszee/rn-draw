# rn-expo-draw
React native draw tool for expo applications using svg based on @szimek's signaturepad https://github.com/szimek/signature_pad

## Installation
Make sure you follow the proper guidelines on https://expo.io to set up your react native application with expo sdk.

Install with `npm install -S rn-expo-draw`

## How to use
```
import RNDraw from 'rn-expo-draw'
  
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
Non-expo version
