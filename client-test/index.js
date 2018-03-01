import Renderer from 'webglue/lib/renderer';
import Camera from 'webglue/lib/camera';
import CameraController from 'webglue/lib/contrib/blenderController';

import Transform from 'webglue/lib/transform';
import box from 'webglue/lib/geom/box';

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
let timer = 0;

// Create controller
let camera = new Camera();
let controller = new CameraController(canvas, document, camera);

let transform = new Transform();
transform.rotateY(Math.PI / 4);
let geometry = renderer.geometries.create(box());
let shader = renderer.shaders.create(`
attribute vec3 aPosition;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

void main() {
  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}
`, `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`);

function animate(time) {
  if (prevTime === -1) prevTime = time;
  let delta = (time - prevTime) / 1000;
  prevTime = time;
  timer += delta;

  controller.update(delta);

  renderer.render({
    options: {
      clearColor: new Float32Array([0, 0, 0, 1]),
    },
    geometry: geometry,
    shader: shader,
    uniforms: {
      uModel: transform.get,
      uView: camera.getView,
      uProjection: camera.getProjection,
    },
  });
  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
