
#define NUM_LIGHTS 5

uniform vec3 lightPositions[NUM_LIGHTS];
uniform vec3 lightColors[NUM_LIGHTS];
uniform vec4 lightInfos[NUM_LIGHTS];

vec3 lighting(vec3 viewPos, vec3 position, vec3 normal, vec3 color) {
    vec3 allLight = vec3(0);

    for (int i = 0; i < NUM_LIGHTS; i++) {
        vec3 lightPosition = lightPositions[i];
        vec3 lightColor = lightColors[i];
        vec4 lightInfo = lightInfos[i];

        if (lightInfo[0] == 1.0) {
            // ambient light
            allLight += lightColor;
        } else if (lightInfo[0] == 2.0) {
            // directional light
            vec3 lightDir = normalize(lightInfo.yzw);
            float diff = max(-dot(normal, lightDir), 0.0);
            allLight += lightColor * diff;
            float spec = 0.2 * pow(max(dot(normalize(viewPos - position), reflect(lightDir, normal)), 0.0), 32.0);
            allLight += lightColor * spec;
        } else if (lightInfo[0] == 3.0) {
            // point light
            float cf = lightInfo[1];
            float lf = lightInfo[2];
            float qf = lightInfo[3];
            vec3 lightDir = position - lightPosition;
            float dist = length(lightDir);
            lightDir = normalize(lightDir);
            float atten = min(1.0 / (cf + dist * (lf + qf * dist)), 1.0);
            float diff = max(-dot(normal, lightDir), 0.0);
            allLight += lightColor * diff * atten;
            float spec = 0.2 * pow(max(dot(normalize(viewPos - position), reflect(lightDir, normal)), 0.0), 32.0);
            allLight += lightColor * spec * atten;
        }
    }

    return color * allLight;
}