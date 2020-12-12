import * as THREE from 'three';
import {randomRangeFromArray} from './util';

function generateEllipseSegments(centerX, centerY, radiusX, radiusY) {
  // based on https://stackoverflow.com/a/2173084
  const kappa = .55228475, // an approximation of 4*(sqrt(2)-1)/3, used for bezier circles
      cpOffX = radiusX * kappa, // horizontal offset for control point 
      cpOffY = radiusY * kappa, // vertical offset for control point
      maxX = centerX + radiusX,
      maxY = centerY + radiusY,
      minX = centerX - radiusX,
      minY = centerY - radiusY;

  return [
    new CanvasBezierPathSegment(
      centerX, minY,
      minX, centerY - cpOffY,
      centerX - cpOffX, minY
    ),
    new CanvasBezierPathSegment(
      maxX, centerY,
      centerX + cpOffX, minY,
      maxX, centerY - cpOffY
    ),
    new CanvasBezierPathSegment(
      centerX, maxY,
      maxX, centerY + cpOffY,
      centerX + cpOffX, maxY
    ),
    new CanvasBezierPathSegment(
      minX, centerY,
      centerX - cpOffX, maxY,
      minX, centerY + cpOffY
    ),
  ];
}

export function jostleBezierPath(shape, params) { // maybe move this into a 2d util
  let cpOffsetRangeX = params.cpOffsetRangeX;
  let cpOffsetRangeY = params.cpOffsetRangeY;
  let epOffsetRangeX = params.epOffsetRangeX;
  let epOffsetRangeY = params.epOffsetRangeY;
  let cpScaleRange = params.cpScaleRange;
  
  let segs = shape.segments;
  let lastSeg = segs[segs.length-1]; // assumes a closed path
  if (shape.isClosed) {
    lastSeg = null;
  }
  for (let i = 0; i < segs.length; i++) {
    let seg = segs[i];
    
    if (lastSeg) {
      // rotate control points in unison per endpoint -- this should probably be moved into a shape method
      let cpOffsetX = randomRangeFromArray(cpOffsetRangeX);
      let cpOffsetY = randomRangeFromArray(cpOffsetRangeY);
      seg.control1.x += cpOffsetX;
      seg.control1.y += cpOffsetY;
      lastSeg.control2.x -= cpOffsetX; // move this control point the opposite
      lastSeg.control2.y -= cpOffsetY;

      // scale control points in unison per endpoint -- this should probably be moved into a shape method
      let cpScale = randomRangeFromArray(cpScaleRange);
      let xDist = seg.control1.x - lastSeg.endPoint.x;
      let yDist = seg.control1.y - lastSeg.endPoint.y;
      seg.control1.x = lastSeg.endPoint.x + (xDist * cpScale);
      seg.control1.y = lastSeg.endPoint.y + (yDist * cpScale);
      xDist = lastSeg.control2.x - lastSeg.endPoint.x;
      yDist = lastSeg.control2.y - lastSeg.endPoint.y;
      lastSeg.control2.x = lastSeg.endPoint.x + (xDist * cpScale);
      lastSeg.control2.y = lastSeg.endPoint.y + (yDist * cpScale);
    }
    
    // move endpoints + attached control points together -- this should probably be moved into a shape method
    let epOffsetX = randomRangeFromArray(epOffsetRangeX);
    let epOffsetY = randomRangeFromArray(epOffsetRangeY);
    let nextIndex = i+1;
    if (nextIndex >= segs.length) {
      if (shape.isClosed) {
        nextIndex = 0;
      } else {
        break; // next seg doesn't exist -- should just break out of loop now
      }
    }
    let nextSeg = segs[nextIndex];
    seg.endPoint.x += epOffsetX;
    seg.endPoint.y += epOffsetY;
    seg.control2.x += epOffsetX;
    seg.control2.y += epOffsetY;
    nextSeg.control1.x += epOffsetX;
    nextSeg.control1.y += epOffsetY;
    
    lastSeg = seg;
  }
  return shape;
}

export function generateCanvasEllipseShape(centerX, centerY, radiusX, radiusY, rotationRadians=0, drawingOptions={}) {
  let ellipseSegments = generateEllipseSegments(centerX, centerY, radiusX, radiusY);
  let firstPoint = ellipseSegments[ellipseSegments.length-1].endPoint;
  let shape = new CanvasBezierShape(firstPoint, ellipseSegments, Object.assign({
    isClosed : true,
    isStroked : false,
    isFilled : true,
    fillStyle : 'black'
  }, drawingOptions));
  if (rotationRadians) {
    shape.rotateAround(centerX, centerY, rotationRadians);
  }
  return shape;
}

export class CanvasBezierShape {
  constructor(startPoint=null, segments=[],options) {
    options = Object.assign({}, {
      isClosed : true,
      isStroked : true,
      isFilled : true,
      strokeStyle : 'red',
      strokeWidth : 1,
      fillStyle : 'black'
    }, options);
    this.startPoint = startPoint || new THREE.Vector2();
    this.segments = segments;
    this.isClosed = options.isClosed;
    this.isStroked = options.isStroked;
    this.isFilled = options.isFilled;
    this.strokeStyle = options.strokeStyle;
    this.strokeWidth = options.strokeWidth;
    this.fillStyle = options.fillStyle;
  }
  clone() {
    let startPoint = this.startPoint;
    let segments = _.map(this.segments, (seg) => {return seg.clone()});
    let options = {
      isClosed : this.isClosed,
      isStroked : this.isStroked,
      isFilled : this.isFilled,
      strokeStyle : this.strokeStyle,
      strokeWidth : this.strokeWidth,
      fillStyle : this.fillStyle
    };
      
    return new CanvasBezierShape(startPoint, segments, options);
  }
  addPathToCanvas(ctx) {
    const segments = this.segments;
    let startPoint = this.startPoint;
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    for (let i = 0; i < segments.length; i++) {
      segments[i].addPathToCanvas(ctx);
    }
  }
  drawToCanvas(ctx) {
    this.addPathToCanvas(ctx);
    if (this.isStroked) {
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.strokeWidth;
      ctx.stroke();
    }
    if (this.isFilled) {
      ctx.fillStyle = this.fillStyle;
      ctx.fill();
    }
  }
  drawDebug(ctx, pointSize=4) {
    const segments = this.segments;

    ctx.fillStyle = ctx.strokeStyle ='rgba(255,0,0,0.3)';

    let lastP = segments[segments.length - 1].endPoint;
    for (let i = 0; i < segments.length; i++) {
      let seg = segments[i];
      let cp1 = seg.control1;
      let cp2 = seg.control2;
      let p = seg.endPoint;
      let pointRadius = pointSize*0.5;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, pointRadius, 0, 2 * Math.PI);
      ctx.fill()

      ctx.beginPath();
      ctx.rect(cp1.x-pointRadius, cp1.y-pointRadius, pointRadius*2, pointRadius*2);
      ctx.stroke();

      ctx.beginPath();
      ctx.rect(cp2.x-pointRadius, cp2.y-pointRadius, pointRadius*2, pointRadius*2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(lastP.x, lastP.y)
      ctx.lineTo(cp1.x, cp1.y);
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(cp2.x, cp2.y);
      ctx.stroke();

      lastP = seg.endPoint;
    }
  }
  rotateAround(center, angle) {
    const segments = this.segments;
    for (let i = 0; i < segments.length; i++) {
      segments[i].rotateAround(center, angle);
    }
  }
  translate(dist) {
    const segments = this.segments;
    for (let i = 0; i < segments.length; i++) {
      segments[i].translate(dist);
    }
  }
  scale(amount) {
    const segments = this.segments;
    for (let i = 0; i < segments.length; i++) {
      segments[i].scale(amount);
    }
  }
}

export class CanvasBezierPathSegment {
  constructor(x,y, cp1x,cp1y, cp2x,cp2y) {
    this.endPoint = new THREE.Vector2(x,y);
    this.control1 = new THREE.Vector2(cp1x,cp1y); // stretches from the previous point in the path
    this.control2 = new THREE.Vector2(cp2x,cp2y); // stretches to the endpoint
  }
  clone() {
    return new CanvasBezierPathSegment(this.endPoint.x, this.endPoint.y, this.control1.x, this.control1.y, this.control2.x, this.control2.y);
  }
  addPathToCanvas(ctx) {
    let cp1 = this.control1;
    let cp2 = this.control2;
    let p = this.endPoint;
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y);
  }
  drawDebug(ctx, pointSize=4) {
    let cp1 = this.control1;
    let cp2 = this.control2;
    let p = this.endPoint;
    let pointRadius = pointSize*0.5;
    
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, pointRadius, 0, 2 * Math.PI);
    ctx.fill()

    ctx.beginPath();
    ctx.rect(cp1.x-pointRadius, cp1.y-pointRadius, pointRadius*2, pointRadius*2);
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(cp2.x-pointRadius, cp2.y-pointRadius, pointRadius*2, pointRadius*2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cp1.x, cp1.y);
    ctx.lineTo(cp2.x, cp2.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  rotateAround(center, angle) {
    this.endPoint.rotateAround(center, angle);
    this.control1.rotateAround(center, angle);
    this.control2.rotateAround(center, angle);
  }
  translate(dist) {
    this.endPoint.add(dist);
    this.control1.add(dist);
    this.control2.add(dist);
  }
  scale(amount) {
    this.endPoint.multiplyScalar(amount);
    this.control1.multiplyScalar(amount);
    this.control2.multiplyScalar(amount);
  }
}
