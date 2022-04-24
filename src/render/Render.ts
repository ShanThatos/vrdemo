import type { XRView } from "webxr";
import { XRRenderingContext } from "../utils/Types";
import { enforceDefined } from "../utils/Utils";
import FS_red from "./shaders/defaults/FS_red.glsl?raw";
import VS_verts from "./shaders/defaults/VS_verts.glsl?raw";

export const renderScene = (gl: WebGLRenderingContext, view: XRView) => {
    // console.log(`${view.eye} eye position: ${vec3ToString(view.transform.position)}`);

    const projMatrix = view.projectionMatrix;
    const viewMatrix = view.transform.inverse.matrix;

    // console.log("Projection matrix:", projMatrix);
    // console.log("View matrix:", viewMatrix);

    const program = enforceDefined(setupScene(gl));

    gl.useProgram(program);

    const uProj = gl.getUniformLocation(program, "projection");
    const uView = gl.getUniformLocation(program, "view");

    gl.uniformMatrix4fv(uProj, false, projMatrix);
    // gl.uniformMatrix4fv(uProj, false, new Float32Array(Mat4.identity.all()));
    gl.uniformMatrix4fv(uView, false, viewMatrix);
    // gl.uniformMatrix4fv(uView, false, new Mat4(Array.from(viewMatrix.values())).inverse().all());


    const attrVertex = gl.getAttribLocation(program, "vertex");
    gl.enableVertexAttribArray(attrVertex);
    gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 0, 0);


    gl.drawArrays(gl.TRIANGLES, 0, 6);
};

let setupDone = false;
let program: WebGLProgram;
const setupScene = (gl: XRRenderingContext) => {
    if (setupDone) return program;

    // let program;
    {
        const vs = enforceDefined(gl.createShader(gl.VERTEX_SHADER));
        gl.shaderSource(vs, VS_verts);
        gl.compileShader(vs);

        const fs = enforceDefined(gl.createShader(gl.FRAGMENT_SHADER));
        gl.shaderSource(fs, FS_red);
        gl.compileShader(fs);

        program = enforceDefined(gl.createProgram());
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
            console.log(gl.getShaderInfoLog(vs));
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
            console.log(gl.getShaderInfoLog(fs));
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            console.log(gl.getProgramInfoLog(program));
    }

    const bf = enforceDefined(gl.createBuffer());
    gl.bindBuffer(gl.ARRAY_BUFFER, bf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        [-.5, -.5, 0], [-.5, .5, 0], [.5, .5, 0],
        [-.5, -.5, 0], [.5, .5, 0], [.5, -.5, 0]
    ].flat(1).map(x => 2 * x)), gl.STATIC_DRAW);

    setupDone = true;
    return program;
};
