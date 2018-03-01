import Renderer from 'webglue/lib/renderer';
import Camera from 'webglue/lib/camera';
import CameraController from 'webglue/lib/contrib/blenderController';

import MeshTransform from 'webglue/lib/meshTransform';
import box from 'webglue/lib/geom/box';
import calcNormals from 'webglue/lib/geom/calcNormals';

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';
let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

window.addEventListener('resize', () => {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
});

let gl = canvas.getContext('webgl', { antialias: true }) ||
  canvas.getContext('experimental-webgl');
let renderer = new Renderer(gl);

let prevTime = -1;

// Create controller
let camera = new Camera();
let controller = new CameraController(canvas, document, camera);

let transform = new MeshTransform();
transform.rotateY(Math.PI / 4);
let geometry = renderer.geometries.create(calcNormals(box()));
let shader = renderer.shaders.create(`
#version 100

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormal;

varying lowp vec3 vColor;

void main(void) {
  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
  lowp vec3 normalDir = normalize(
    (uView * vec4(uNormal * aNormal, 0.0)).xyz);
  vColor = normalDir * 0.5 + vec3(0.5, 0.5, 0.5);
}
`, `
varying lowp vec3 vColor;

void main() {
  gl_FragColor = vec4(vColor, 1.0);
}
`);

function animate(time) {
  if (prevTime === -1) prevTime = time;
  let delta = (time - prevTime) / 1000;
  prevTime = time;

  transform.rotateY(delta * 3);
  controller.update(delta);

  renderer.render({
    options: {
      clearColor: new Float32Array([0, 0, 0, 1]),
      clearDepth: 1,
      cull: gl.BACK,
      depth: gl.LEQUAL,
    },
    geometry: geometry,
    shader: shader,
    uniforms: {
      uModel: transform.get,
      uNormal: transform.getNormal,
      uView: camera.getView,
      uProjection: camera.getProjection,
    },
  });
  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
