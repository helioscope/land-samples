## Goals: ##
generate additional ground-cover DONE
- flowers DONE
- weedy grasses DONE?
- rocks DONE
- sticks (sticking into/out of the ground a bit is probably ok) DONE
experiment with groundcover optimization
denser groundcover
camera controls improvements:
- auto-rotate until camera control is used, then wait N seconds of no control before moving again, slowly building speed
- hotkey to reset/recenter (to undo significant panning)
- better initial camera position
increase contrast between stem & grass colors & ground color
presets for different kinds of dioramas (trees: natural, all dead, heavily deforested, slightly used, everything)
start hooking up dat.gui to be able to tweak settings live (especially useful for experimenting with colors)
fix terrain edges (off by one v heightmap texture?)
extend terrain below (to make a dirt-cube of sorts)
extend water below (to make a water-cube of sorts)
slightly more complex lake shapes (may add multiple shapes within one tight region)
prevent spawn overlap (e.g. for ground-cover + trees) (save vector2 + radius for each object, separated into layers?)
basic fallen-tree generator (note: may need special placement rules to orient to the terrain)?
butterfly generator
simple cone-tree generator

## Ideas: ##

transition towards deterministic generators, increasingly parametric (e.g. trunk height, trunk width, trunk color, leaf color, leafball height, leafball-jitter dist, random seed, scale)

export meshes? 
obj is supposedly unity-supported: https://github.com/mrdoob/three.js/blob/master/examples/js/exporters/OBJExporter.js
collada supposedly is too: https://github.com/mrdoob/three.js/blob/master/examples/js/exporters/ColladaExporter.js
other three.js exporters: https://github.com/mrdoob/three.js/tree/master/examples/js/exporters
unity docs: https://docs.unity3d.com/Manual/3D-formats.html#Exported3DFiles

Ground-cover improvements:
- grass blades (2-sided triangles -- maybe these should be handled separately, to combine into one mesh while still observing ground height)
- floating flower hints (low, colorful triangles, roughly parallel to ground -- could double for fallen leaves, & low ground plants -- maybe should handle like grass)

Tree improvements:
- fix trunk overextension?
- tree color variation (ideally, interpolate between a few different colors -- can use THREE.Color.lerp, or define gradient)
- dead tree generator DONE
- simple cone-tree generator

Cloud improvements:
- cloud Y-squash options?
- extra tufts range?
- animation?

Terrain improvements:
- fix terrain edges (off by one v heightmap texture?)
- chance of using different shapes for lakes?
- slightly more complex shapes (may add multiple shapes)
- improved island shapes
- improved island spawn bounds
- rivers
- mountains
- soft-edged lakes
- color variation

Water improvements:
- split off code
- color variation
- add noise to normals for wavy look
- sample terrain-height to add shoreline coloring
- minor height variation
- animation
- explore custom shaders to do above-mentioned things & more fanciness?

Spawn behavior improvements:
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

support random seeding for _all_ random bits (alea, which the simplex noise relies on, looks pretty solid)

start hooking up dat.gui to be able to tweak settings live
- ground colors (this should be pretty easy)
- tree colors (this may be trickier, being a merged mesh?)
- water color (super easy)
- light angle (rough/clumsy xyz pos should be easy)

basic world-bits wrapper? (track/manage the parts that get updated/animated? + high level world-scene components, like "the sun")

basic sun-wrapper? (includes skybox bits (light + textured/vertex-colored inverted sphere? + methods to tweak the sun angle (and get appropriate colorations)))

basic house generator?

basic editor for placing & editing things on the terrain from a top-down, ortho/2D perspective