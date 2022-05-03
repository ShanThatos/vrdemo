precision mediump float;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 transform;
uniform mat3 normalTransform;

attribute vec3 a_vertex;
attribute vec3 a_normal;

varying vec3 v_position;
varying vec3 v_normal;

void main() {
    v_position = (transform * vec4(a_vertex, 1.0)).xyz;
    v_normal = normalize(normalTransform * a_normal);
    gl_Position = projection * view * transform * vec4(a_vertex, 1.0);
}