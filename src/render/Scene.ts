import type { XRView } from "webxr";
import { Quat, Vec3 } from "../../lib/TSM";
import { XRRenderingContext } from "../utils/Types";
import { animateEntity } from "./entity/Animate";
import { Entity } from "./entity/Entity";
import { RenderEntity } from "./entity/RenderEntity";
import { WebGLUtilities } from "./webgl/WebGLUtilities";

const baseEntity = new Entity();

export const setupScene = (gl: XRRenderingContext) => {
    WebGLUtilities.requestIntIndicesExt(gl);
    Entity.extVAO = WebGLUtilities.requestVAOExt(gl);

    const square = new RenderEntity();
    square.setDrawData(
        [0, 1, 2, 2, 3, 0], 
        [
            new Vec3([-1, 0, -1]), 
            new Vec3([1, 0, -1]),
            new Vec3([1, 0, 1]),
            new Vec3([-1, 0, 1])
        ]
    );
    square.transform.position = new Vec3([1, .5, 1]);
    square.setupRenderPass(gl);

    animateEntity(square, (e: Entity, dt: number) => {
        e.transform.scale = Vec3.one.copy().scale((Math.sin(Entity.currentTime) * .5 + .5) * .5 + .5);
        e.transform.rotation = Quat.fromAxisAngle(new Vec3([0, 1, 0]), dt).multiply(square.transform.rotation);
    });

    baseEntity.addChildEntity(square);
};

export const renderScene = (_gl: WebGLRenderingContext, view: XRView) => {
    Entity.projectionMatrix = view.projectionMatrix;
    Entity.viewMatrix = view.transform.inverse.matrix;

    baseEntity.render();

    // const program = setupScene(gl);

    // gl.useProgram(program);

    // const uProj = gl.getUniformLocation(program, "projection");
    // const uView = gl.getUniformLocation(program, "view");

    // gl.uniformMatrix4fv(uProj, false, projMatrix);
    // // gl.uniformMatrix4fv(uProj, false, new Float32Array(Mat4.identity.all()));
    // gl.uniformMatrix4fv(uView, false, viewMatrix);
    // // gl.uniformMatrix4fv(uView, false, new Mat4(Array.from(viewMatrix.values())).inverse().all());


    // const attrVertex = gl.getAttribLocation(program, "vertex");
    // gl.enableVertexAttribArray(attrVertex);
    // gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 0, 0);


    // gl.drawArrays(gl.TRIANGLES, 0, 6);
};

export const updateScene = (time: number, dt: number) => {
    Entity.currentTime = time;
    baseEntity.updateEntity(dt);
};

// let setupDone = false;
// let program: WebGLProgram;
// const setupScene = (gl: XRRenderingContext) => {
//     if (setupDone) return program;

//     program = WebGLUtilities.createShaderProgram(gl, VS_verts, FS_red);

//     const bf = enforceDefined(gl.createBuffer());
//     gl.bindBuffer(gl.ARRAY_BUFFER, bf);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
//         [-.5, -.5, -1], [-.5, .5, -1], [.5, .5, -1],
//         [-.5, -.5, -1], [.5, .5, -1], [.5, -.5, -1]
//     ].flat(1)), gl.STATIC_DRAW);

//     setupDone = true;
//     return program;
// };
