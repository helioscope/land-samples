## Goals: ##
more interesting lakes:
- chance of using ellipse shapes for lakes
- slightly more complex lake shapes (may add multiple shapes)
- chance of spawning islands within lakes
simple dead tree generator
basic log generator (note: may need special placement rules to orient to the terrain)
basic stump generator
basic camera-controller (can probably use something from threejs extras/examples)
start hooking up dat.gui to be able to tweak settings live
simple cone-tree generator
fix terrain edges (off by one v heightmap texture?)

## Ideas: ##

transition towards deterministic generators, increasingly parametric (e.g. trunk height, trunk width, trunk color, leaf color, leafball height, leafball-jitter dist, random seed, scale)

export meshes to fbx?

Tree improvements:
- fix trunk overextension?
- tree color variation (ideally, interpolate between a few different colors -- can use THREE.Color.lerp, or define gradient)
- dead tree generator
- simple cone-tree generator

Cloud improvements:
- cloud Y-squash options?
- extra tufts range?

Terrain improvements:
- fix terrain edges (off by one v heightmap texture?)
- chance of using ellipse shapes for lakes
- slightly more complex shapes (may add multiple shapes)
- chance of spawning islands within lakes
- rivers
- mountains
- soft-edged lakes

Water improvements:
- split off code
- add noise to normals for wavy look
- sample terrain-height to add shoreline coloring
- minor height variation
- animation
- explore custom shaders to do above-mentioned things & more fanciness?

Spawn behavior improvements:
- % chance of not spawning DONE (rarely looks good for the clouds or trees, though -- octave-noise-based odds would be better for trees, maybe clouds too)
- grid offset (risk of overlap there, mind)
- sample octaved noise to affect spawn odds
- restricted height range (or at least, height affecting spawn odds)
- restricted slope range
- ability to skip spawn, rather than hiding it afterwards
- spawn Y according to raycast (may be slow)
- split out grid-spawning code

Noise texture improvements:
- add/subtract raw value?
- clamp min/max values?
- apply ramp gradient?
- pass each pixel through custom function?
- split out noise texture code (if using it elsewhere) (is the noise worth separating from the texture anywhere in the near future?)

support random seeding for _all_ random bits (alea, which the simplex noise relies on, looks pretty solid)

start hooking up dat.gui to be able to tweak settings live
- ground colors (this should be pretty easy)
- tree colors (this may be trickier, being a merged mesh?)
- water color (super easy)
- light angle (rough/clumsy xyz pos should be easy)

basic world-bits wrapper? (track/manage the parts that get updated/animated? + high level world-scene components, like "the sun")

basic sun-wrapper? (includes skybox bits (light + textured/vertex-colored inverted sphere? + methods to tweak the sun angle (and get appropriate colorations)))

basic grass generator
basic house generator?

basic editor for placing & editing things on the terrain from a top-down, ortho/2D perspective