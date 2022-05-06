import type { XRFrame, XRReferenceSpace, XRSession, XRView } from "webxr";
import { Mat4, Vec3 } from "../lib/TSM";
import { Entity } from "./render/entity/Entity";
import { BaseEntity } from "./render/entity/common/BaseEntity";
import { WebGLUtilities } from "./render/webgl/WebGLUtilities";
import { SceneLoader } from "./scenes/SceneLoader";
import { Nullable, XRRenderingContext } from "./utils/Types";

export class Scene {

    private gl: XRRenderingContext;
    private canvasFramebuffer: WebGLFramebuffer;
    private xrsession: XRSession;
    public frame: Nullable<XRFrame> = null;
    public referenceSpace: Nullable<XRReferenceSpace> = null;

    public currentTime = 0;
    public baseEntity: BaseEntity;

    constructor(gl: XRRenderingContext, canvasFramebuffer: WebGLFramebuffer, xrsession: XRSession, referenceSpace: XRReferenceSpace) {
        this.gl = gl;
        this.canvasFramebuffer = canvasFramebuffer;
        this.baseEntity = new BaseEntity(this);
        this.xrsession = xrsession;
        this.referenceSpace = referenceSpace;
    }

    public setup(sceneLoader: SceneLoader) {
        const gl = this.gl;
        WebGLUtilities.requestIntIndicesExt(gl);
        Entity.extVAO = WebGLUtilities.requestVAOExt(gl);
        WebGLUtilities.requestDepthTextureExt(gl);

        const baseEntity = this.baseEntity;
        baseEntity.addChildEntity(sceneLoader.load());
        baseEntity.setup(gl);
    }

    public renderXRViewScene(view: XRView) {
        this.renderScene(view.projectionMatrix, view.transform.inverse.matrix);
    }

    public renderScene(projectionMatrix: Float32Array, viewMatrix: Float32Array) {
        Entity.projectionMatrix = projectionMatrix;
        Entity.viewMatrix = viewMatrix;
        Entity.viewPos = new Float32Array(new Mat4(Array.from(viewMatrix)).multiplyPt3(Vec3.zero).xyz);

        this.baseEntity.render();
    }

    private prevUpdateTime = 0;
    public update(time: number) {
        if (this.prevUpdateTime === 0) {
            this.prevUpdateTime = time;
            return;
        }

        const dt = (time - this.prevUpdateTime);
        this.prevUpdateTime = time;

        Entity.currentTime = time;
        this.baseEntity.updateEntity(dt);
    }

    // Made this a method so it can be overrided (possibly for shadow maps?)
    public getRenderingContext(): XRRenderingContext {
        return this.gl;
    }
    public getCanvasFramebuffer(): WebGLFramebuffer {
        return this.canvasFramebuffer;
    }
    public getXRSession(): XRSession {
        return this.xrsession;
    }
}