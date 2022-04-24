precision mediump float;

uniform mat4 projection;
uniform mat4 view;

attribute vec3 vertex;

void main() {
    gl_Position = projection * view * vec4(vertex, 1.0);
}