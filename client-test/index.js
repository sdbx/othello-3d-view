import Renderer from 'webglue/lib/renderer';
import Camera from 'webglue/lib/camera';
import CameraController from 'webglue/lib/contrib/blenderController';

import loadOBJMTL from './util/loadOBJMTL';
import MeshTransform from 'webglue/lib/meshTransform';

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
// transform.rotateY(Math.PI / 4);
let shader = renderer.shaders.create(
  require('./shader/diffuse.vert'),
  require('./shader/diffuse.frag'),
);

let al = loadOBJMTL(renderer, shader,
  require('./geom/othello_al.obj'),
  require('./geom/othello_al.mtl'));

let board = loadOBJMTL(renderer, shader,
  require('./geom/othello_board.obj'),
  require('./geom/othello_board.mtl'));

function animate(time) {
  if (prevTime === -1) prevTime = time;
  let delta = (time - prevTime) / 1000;
  prevTime = time;

  // transform.rotateY(delta * 3);
  controller.update(delta);

  renderer.render({
    options: {
      clearColor: new Float32Array([0, 0, 0, 1]),
      clearDepth: 1,
      cull: gl.BACK,
      depth: gl.LEQUAL,
    },
    uniforms: {
      uModel: transform.get,
      uNormal: transform.getNormal,
      uView: camera.getView,
      uProjection: camera.getProjection,
      uProjectionView: camera.getPV,
    },
    passes: [al, board],
  });
  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
