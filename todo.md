
Tree improvements:
- fix trunk overextension?
- tree color variation (ideally, interpolate between a few different colors -- can use THREE.Color.lerp, or define gradient)

Cloud improvements:
- cloud Y-squash options?
- extra tufts range?

Terrain improvements:
- fix terrain edges (off by one v heightmap texture?)
- slightly more complex lakes (may add multiple circles)
- chance of spawning islands within lakes

Water improvements:
- split off code
- add noise to normals for wavy look
- sample terrain-height to add shoreline coloring
- minor height variation
- animation
- explore custom shaders to do above-mentioned things & more fanciness?

Spawn behavior improvements:
- % chance of not spawning DONE
- grid offset (risk of overlap there, mind)
- sample octaved noise to affect spawn odds
- restricted height range (or at least, height affecting spawn odds)
- restricted slope range
- ability to skip spawn, rather than hiding it afterwards
- split out grid-spawning code

Noise texture improvements:
- add/subtract raw value?
- clamp min/max values?
- apply ramp gradient?
- pass each pixel through custom function?
- split out noise texture code (if using it elsewhere) (is the noise worth separating from the texture anywhere in the near future?)

support random seeding for _all_ random bits (requires another RNG? doesn't the simplex noise lib come with one?)

start hooking up dat.gui to be able to tweak settings live

basic world-bits wrapper? (track/manage the parts that get updated/animated? + high level world-scene components, like "the sun")

basic sun-wrapper? (includes skybox bits (light + textured/vertex-colored inverted sphere? + methods to tweak the sun angle (and get appropriate colorations)))
basic camera-controller?

basic grass generator
basic house generator?
basic water-level

basic editor for placing & editing things on the terrain from a top-down, ortho/2D perspective