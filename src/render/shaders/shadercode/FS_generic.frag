precision mediump float;

uniform vec3 viewPos;

uniform int flags[2];
// 0 - use albedo
// 1 - use lighting

varying vec3 v_position;
varying vec3 v_normal;

#include snippets/mixAlbedo.glsl
#include snippets/lighting.glsl

void main() {
    vec4 color = vec4(0);
    vec3 normal = normalize(v_normal);

    if (flags[0] != 0)
        color = mixAlbedo(color);
    if (flags[1] != 0) {
        float a = color.a;
        color = vec4(lighting(viewPos, v_position, normal, color.xyz), a);
    }

    gl_FragColor = color;
}

