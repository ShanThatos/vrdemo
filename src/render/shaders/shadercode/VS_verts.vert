precision mediump float;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 transform;

attribute vec3 vertex;

void main() {
    gl_Position = projection * view * transform * vec4(vertex, 1.0);
}