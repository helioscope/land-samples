"finish" terrain generator
  - need to add rough terrain colors DONE (but too rough, honestly)
  - need to randomize seed each time generating DONE
  - need to get rough height at position DONE

re-add terrain details (spawning on ground, roughly per height) DONE

rough water plane with transparency

fix trunk overextension?
cloud Y-squash options?
cloud extra tufts?
diorama/world code separated out DONE
fix terrain edges (off by one v heightmap texture?)
smoother height coloring
tree color variation (ideally, interpolate between colors)
support random seeding for all other random bits (requires another RNG? doesn't the simplex noise lib come with one?)
start hooking up dat.gui to be able to tweak settings live

basic world-bits wrapper? (track/manage the parts that get updated/animated? + high level world-scene components, like "the sun")

basic cloud generator DONE
basic noise-terrain generator DONE
basic sun-wrapper (includes skybox bits (light + textured/vertex-colored inverted sphere? + methods to tweak the sun angle (and get appropriate colorations)))
basic camera-controller?

basic tree generator DONE
basic grass generator
basic house generator
basic water-level

basic editor for placing & editing things on the terrain from a top-down, ortho/2D perspective