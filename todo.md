## Goals: ##

blur shapes (e.g. for lakes) before adding them? use a separate canvas for the shapes, then (e.g.) `canvas.style.filter = "blur(3px)"` to enable the filter?

cluster-spawn of flower, grass, or rock fields in diorama (use bitmap as stamp/mask, rather than just using the grid-spawn?) (bundle geometry into a single mesh?)

basic rivers in ground-generator
- bezier path, draw, nudge (control?) points, draw again, repeat a few times (note: probably want to always nudge relative to original cp positions, so we don't end up with them walking away & not getting a proper furrow established)
(could use the same trick for the lakes & islands, come to think, to make them a bit less aggressive in their silhouettes)

convert to parametric (& deterministic) generators (+ use MeshGenerator)
- groundmaker
-- pass options dict to finalizeMesh to skip the verticesNeedUpdate & generate normals bits, also to indicate other material? incorporate this into the MeshGenerator?

define editor as its own separate thing, whose activation pauses the diorama scene (updates and rendering)?
- add human figure stand-in (maybe just a cone + ball, about 2m tall)? PASS for now
- editor can be opened for a generator or for a given mesh KINDA DONE (code-wise -- the in-diorama raycasting is still to be tested)
- editor can be overlayed in corner?

make 'seed' parameter added by default -- no need to define it every time?
revise all angle parameters to use degrees (and just multiply to get radians)

setup groundmaker for dat.gui handling

in-diorama raycasting for selecting meshes (to open the editor) is still to be tested

pick between dat.gui, tweakpane, other alternatives CURRENTLY LEANING TOWARDS DAT.GUI FOR NOW
- dat.gui's docs are down & it hasn't seen much dev attention, but it works well, has been around for years, and has a nice drag up/down feature for dialing in numbers without resorting to ranges (which kinda restrict you to stay within said ranges). I think I'll run with this for now, but consider switching later
- tweakpane's docs, design, & api are lovely, and it seems to be actively developed right now, but it's fairly young and lacks dat.gui's drag up/down feature (it still supports sliders via ranges, though). 
- quicksettings seems pretty solid, but is not under active development and the design is a bit utilitarian
- guify i didn't really get around to investigating very far, but it apparently offers an "interval" input (i.e. set min & max on one input) and logarithmic slider which might be useful.
- https://gist.github.com/SMUsamaShah/71d5ac6849cdc0bffff4c19329e9d0bb might have other options worth examining
- also, of course, i could roll my own


stick param for extrusion & cross-section subdivisions (larger sticks will look less like planks)
stick param for adding one or two branch offshoot stubs, like dead trees have
rock param for embedding into the ground (y-offset range)
rock param for mossiness range & color? (just interpolate between base color + moss color)

tiny lump generator
mushroom generator
bush generator? (will these just end up looking like the rocks but green?)
fallen tree generator (takes base point & tip point, so tilt can (more or less) match the ground)
lillypad generator
house generator?

known issues:
- the current use of dat.gui to edit arrays (including ranges) ends up editing all usage of those arrays, since those are passed as references FIXED
  - this probably only affects spawning new meshes from that generator
  - NOTE: THE FIX IS BADLY OPTIMIZED. Definitely cloning more than necessary. It might be better to just deep-clone when copying params to the editor.
- finalizeMesh has some redundant code now, and seems to have conceptual overlap with MeshGenerator's makeMesh method (while still having its own rigid assumptions)


denser groundcover
add water spawns (long stalks, large fallen branch, rocks)
camera controls improvements:
- auto-rotate until camera control is used, then wait N seconds of no control before moving again, slowly building speed
increase contrast between stem & grass colors & ground color
presets for different kinds of dioramas (trees: natural, all dead, heavily deforested, slightly used, everything)
fix terrain edges (off by one v heightmap texture?) DONE
extend terrain below (to make a dirt-cube of sorts) DONE
extend water below (to make a water-cube of sorts) DONE
slightly more complex lake shapes DONE (bezier-curve-based ellipsoids are jostled) 
lakes from multiple shapes within one tight region?
prevent spawn overlap (e.g. for ground-cover + trees) (save vector2 + radius for each object, separated into layers?)
basic fallen-tree generator (note: may need special placement rules to orient to the terrain)?
butterfly generator
simple cone-tree generator

## Ideas: ##

export meshes? 
obj is supposedly unity-supported: https://github.com/mrdoob/three.js/blob/master/examples/js/exporters/OBJExporter.js
collada supposedly is too: https://github.com/mrdoob/three.js/blob/master/examples/js/exporters/ColladaExporter.js
other three.js exporters: https://github.com/mrdoob/three.js/tree/master/examples/js/exporters
unity docs: https://docs.unity3d.com/Manual/3D-formats.html#Exported3DFiles

Ground-cover improvements:
- grass blades (2-sided triangles -- maybe these should be handled separately, to combine into one mesh while still observing ground height)
- floating flower hints (low, colorful triangles, roughly parallel to ground -- could double for fallen leaves, & low ground plants -- maybe should handle like grass)
- mushroom generator
- dung generator
- pine-cone generator

Tree improvements:
- simple cone-tree generator
- tree color variation (ideally, interpolate between a few different colors -- can use THREE.Color.lerp with a color array (use adjacent colors), or define gradient)

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
- islands / cluster smaller spawns around/within range of a larger spawn

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

basic fence generator? (posts? stacked rocks?)

basic editor for placing & editing things on the terrain from a top-down, ortho/2D perspective
