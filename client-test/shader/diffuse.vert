#version 100

struct Material {
  lowp vec3 ambient;
  lowp vec3 diffuse;
  lowp vec3 specular;

  #ifdef USE_ENVIRONMENT_MAP
    lowp vec4 reflectivity;
  #endif
  lowp float shininess;
};

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uProjectionView;
uniform mat4 uView;
uniform mat4 uModel;

uniform Material uMaterial;

varying lowp vec3 vColor;

void main(void) {
  gl_Position = uProjectionView * uModel * vec4(aPosition, 1.0);
  vColor = uMaterial.diffuse + uMaterial.ambient;
}