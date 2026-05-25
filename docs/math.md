# Math

## Vector2

`src/math/Vector2.js` — immutable-style 2D vector. Arithmetic methods return new instances; `i`-prefixed methods mutate in place.

```js
new Vector2(x, y)
Vector2.zero()
Vector2.one()
Vector2.fromAngle(radians)  // unit vector

// Immutable (return new Vector2)
v.add(v2)    v.sub(v2)    v.scale(s)
v.negate()   v.normalize()
v.lerp(v2, t)

// Mutating (return this)
v.iAdd(v2)   v.iSub(v2)   v.iScale(s)

// Scalars
v.dot(v2)         // number
v.cross(v2)       // z-component of 3D cross
v.length()        // number
v.lengthSq()      // number (faster, avoids sqrt)
v.distanceTo(v2)
v.distanceSqTo(v2)
v.angleTo(v2)     // radians
v.equals(v2, epsilon=1e-6)

// Utility
v.clone()    v.toArray()    v.toString()
```

## AABB

`src/math/AABB.js` — axis-aligned bounding box defined by top-left `(x, y)` and `width/height`.

```js
new AABB(x, y, width, height)
AABB.fromMinMax(minX, minY, maxX, maxY)
AABB.fromCenter(cx, cy, halfW, halfH)

// Derived (read-only getters)
b.minX  b.minY  b.maxX  b.maxY
b.center    // → Vector2
b.halfSize  // → Vector2

// Tests
b.contains(point)        // point is Vector2
b.containsAABB(aabb)
b.intersects(aabb)

// Operations (return new AABB / Vector2)
b.overlap(aabb)    // → Vector2 (penetration) | null
b.union(aabb)      // → new AABB
b.expand(amount)   // → new AABB  (uniform padding)
b.translate(v)     // → new AABB

b.clone()    b.toString()
```
