import type { XRFrame, XRReferenceSpace, XRSession, XRView } from "webxr";
import { Mat4, Vec3 } from "../lib/TSM";
import { BaseEntity } from "./render/entity/common/BaseEntity";
import { Entity } from "./render/entity/Entity";
import { WebGLUtilities } from "./render/webgl/WebGLUtilities";
import { ALL_SCENES, findScene } from "./scenes/SceneLoader";
import { Nullable, XRRenderingContext } from "./utils/Types";
import { enforceDefined } from "./utils/Utils";

export class Scene {
    public static selectedSceneName = ALL_SCENES[0].name;

    private _gl: Nullable<XRRenderingContext> = null;
    private _xrsession: Nullable<XRSession> = null;
    private _frame: Nullable<XRFrame> = null;
    private _referenceSpace: Nullable<XRReferenceSpace> = null;
    private _screenFramebuffer: Nullable<WebGLFramebuffer> = null;
    private _baseEntity: Nullable<BaseEntity> = null;

    public prevUpdateTime = 0;
    public currentTime = 0;

    public setup() {
        const sceneLoader = findScene(Scene.selectedSceneName);
        const baseEntity = this._baseEntity = new BaseEntity();
        const gl = this.gl;
        WebGLUtilities.requestIntIndicesExt(gl);
        Entity.extVAO = WebGLUtilities.requestVAOExt(gl);
        WebGLUtilities.requestDepthTextureExt(gl);

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

    public update(time: number) {
        if (this.prevUpdateTime === 0) {
            this.prevUpdateTime = time;
            return;
        }

        const dt = (time - this.prevUpdateTime);
        this.prevUpdateTime = time;

        this.currentTime = time;
        this.baseEntity.updateEntity(dt);
    }


    public get gl(): XRRenderingContext {
        return enforceDefined(this._gl);
    }
    public set gl(value: XRRenderingContext) {
        this._gl = value;
    }
    public get screenFramebuffer(): WebGLFramebuffer {
        return enforceDefined(this._screenFramebuffer);
    }
    public set screenFramebuffer(value: WebGLFramebuffer) {
        this._screenFramebuffer = value;
    }
    public get xrsession(): XRSession {
        return enforceDefined(this._xrsession);
    }
    public set xrsession(value: XRSession) {
        this._xrsession = value;
    }
    public get frame(): XRFrame {
        return enforceDefined(this._frame);
    }
    public set frame(value: XRFrame) {
        this._frame = value;
    }
    public get referenceSpace(): XRReferenceSpace {
        return enforceDefined(this._referenceSpace);
    }
    public set referenceSpace(value: XRReferenceSpace) {
        this._referenceSpace = value;
    }
    public get baseEntity(): BaseEntity {
        return enforceDefined(this._baseEntity);
    }
}