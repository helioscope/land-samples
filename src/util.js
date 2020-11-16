export function randomRange(min, max) {
  const range = max - min;
  return (Math.random() * range) + min;
}

// const map = (val, smin, smax, emin, emax) => {
//   // map(
//   //   Math.random(),
//   //   0,1,
//   //   -0.2,0.2
//   // )
//   erange = (emax-emin) // .02 - -.02 (.04)
//   srange = (smax-smin) // 1-0 (1)
//   return erange * (val-smin)/srange + emin
// }
//randomly displace the x,y,z coords by the `per` value
export function jitterVertices(geometry, maxDistance){
  _.each(geometry.vertices, (v) => {
    v.x += randomRange(-maxDistance, maxDistance),
    v.y += randomRange(-maxDistance, maxDistance),
    v.z += randomRange(-maxDistance, maxDistance)
  });
}

export function mushBottom(geometry, bottomY) {
  geometry.vertices.forEach((v) => {
    v.y = Math.max(v.y, bottomY)
  });
}