
uniform vec4 albedo;

mediump vec4 mixAlbedo(mediump vec4 color) {
    return mix(color, albedo, 1.0 - color.a);
}