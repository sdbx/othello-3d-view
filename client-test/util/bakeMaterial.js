export default function bakeMaterial(material, shader) {
  return {
    shader,
    uniforms: {
      uMaterial: {
        ambient: material.ambient.map((v, i) => v * material.diffuse[i]),
        diffuse: material.diffuse,
        specular: material.specular,
        shininess: material.shininess,
        reflectivity: material.model === 3 ? new Float32Array([
          material.specular[0], material.specular[1], material.specular[2], 1,
        ]) : '#00000000',
      },
    },
  };
}
