import loadOBJ from 'webglue/lib/loader/obj';
import loadMTL from 'webglue/lib/loader/mtl';
import channelGeom from 'webglue/lib/geom/channel';
import bakeMesh from 'webglue/lib/util/bakeMesh';
import bakeMaterial from './bakeMaterial';

export default function loadOBJMTL(renderer, shader, obj, mtl) {
  var geometry = renderer.geometries.create(channelGeom(
    loadOBJ(obj, true, true),
  ));
  let materials = loadMTL(mtl);
  let bakedMaterials = {};
  for (let key in materials) {
    bakedMaterials[key] = bakeMaterial(materials[key], shader);
  }
  return bakeMesh(geometry, bakedMaterials);
}
