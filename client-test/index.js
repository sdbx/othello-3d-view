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

let shader = renderer.shaders.create(
  require('./shader/phong.vert'),
  require('./shader/phong.frag'),
);

let al = loadOBJMTL(renderer, shader,
  require('./geom/othello_al.obj'),
  require('./geom/othello_al.mtl'));

let board = loadOBJMTL(renderer, shader,
  require('./geom/othello_board.obj'),
  require('./geom/othello_board.mtl'));

const easings = {
  linear: t => t,
  easeInQuad: t => t * t, 
  easeOutQuad: t => t * (2 - t), 
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
};

const keyframes = [
  { offset: 0, y: 0.16, rotation: 0 },
  { offset: 1, y: 0.16, rotation: 0 },
  { offset: 1.2, y: 1, rotation: Math.PI / 2, easing: 'easeInQuad' },
  { offset: 1.4, y: 0.16, rotation: Math.PI, easing: 'easeOutQuad' },
  { offset: 2.4, y: 0.16, rotation: Math.PI },
  { offset: 2.6, y: 1, rotation: Math.PI * 3 / 2, easing: 'easeInQuad' },
  { offset: 2.8, y: 0.16, rotation: Math.PI * 2, easing: 'easeOutQuad' },
];

const keyframeTotal = 2.8;

function createTile(x, y) {
  let transform = new MeshTransform();
  transform.setPos([x * 2, 0, y * 2, 0]);
  let alTransform = new MeshTransform();
  alTransform.parent = transform;
  return {
    transform: alTransform,
    passes: [{
      uniforms: {
        uModel: transform.get,
        uNormal: transform.getNormal,
      },
      passes: board,
    }, {
      uniforms: {
        uModel: alTransform.get,
        uNormal: alTransform.getNormal,
      },
      passes: al,
    }],
  };
}

var tiles = [
  createTile(0, 0),
  createTile(0, 1),
  createTile(1, 0),
  createTile(1, 1),
];

function updateTile(time) {
  let offset = (time / 1000) % keyframeTotal;
  let index = keyframes.findIndex(v => v.offset > offset);
  if (index === -1) index = keyframes.length - 1;
  let prevIndex = index - 1;
  if (prevIndex < 0) prevIndex = 0;
  let input = keyframes[index];
  let prevInput = keyframes[prevIndex];
  let xDiff = input.offset - prevInput.offset;
  let xCurrent = (offset - prevInput.offset) / xDiff;
  let easing = easings[input.easing || 'easeInOutQuad'];
  let rotation =
    easing(xCurrent) * (input.rotation - prevInput.rotation) +
    prevInput.rotation;
  let y = easing(xCurrent) * (input.y - prevInput.y) + prevInput.y;
  tiles.forEach(v => {
    v.transform.identity();
    v.transform.position[1] = y;
    v.transform.rotateX(rotation);
  });
}

function animate(time) {
  if (prevTime === -1) prevTime = time;
  let delta = (time - prevTime) / 1000;
  prevTime = time;

  // transform.rotateY(delta * 3);
  controller.update(delta);
  updateTile(time);

  renderer.render({
    options: {
      clearColor: new Float32Array([0.5, 0.5, 0.5, 1]),
      clearDepth: 1,
      cull: gl.BACK,
      depth: gl.LEQUAL,
    },
    uniforms: {
      uView: camera.getView,
      uProjection: camera.getProjection,
      uProjectionView: camera.getPV,
      uPointLight: [{
        position: [0, 5, 0],
        color: '#ffffff',
        intensity: [1, 1, 1, 0.05],
      }],
    },
    passes: tiles,
  });
  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
