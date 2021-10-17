# About Land-Samples

Generates low-poly 3D woodland/wetland dioramas. Created for ProcJam 2020.

The starting point for this was a set of tutorials written by Josh Marinacci, covering procedural generation of meshes in three.js for [trees](https://medium.com/@joshmarinacci/procedural-geometry-trees-896cc06f54ce), [clouds](https://blog.mozvr.com/procedural-geometry-low-poly-clouds/), and [terrain](https://blog.mozvr.com/low-poly-style-terrain-generation/). 

Some features I have added:
- bezier-shape-based lakes & rivers to terrain generation
- edges for terrain & water (to make both look like 3D cross-sections when viewed from the side)
- rocks, flowers, sticks, dead trees, etc.
- a sky-sphere

Bundles are generated with webpack, using webpack-dev-server for local dev.

This requires [node](https://nodejs.dev/). Once you've installed it, you can run `npm install` from the root to install the other dependencies. After that, you can run the usual `npm start` to run the app in the development mode ([http://localhost:1234](http://localhost:1234) by default) or `npm run build` to bundle the app for distribution.