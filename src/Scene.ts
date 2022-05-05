import type { XRView } from "webxr";
import { Mat4, Vec3 } from "../lib/TSM";
import { Entity } from "./render/entity/Entity";
import { BaseEntity } from "./render/entity/common/BaseEntity";
import { WebGLUtilities } from "./render/webgl/WebGLUtilities";
import { SceneLoader } from "./scenes/SceneLoader";
import { XRRenderingContext } from "./utils/Types";

// const baseEntity = new BaseEntity();

// export const setupScene = (gl: XRRenderingContext) => {
//     WebGLUtilities.requestIntIndicesExt(gl);
//     Entity.extVAO = WebGLUtilities.requestVAOExt(gl);

//     const cube = loadSolid("cube");
//     cube.transform.position = new Vec3([0, 1, 0]);
//     useAlbedo(cube, [1, 1, 1, 1]);
//     useFlag(cube, "lighting");
//     animateEntity(cube, simpleRotationAnimation({ speed: 2 }));
//     baseEntity.addChildEntity(cube);

//     const floor = loadSolid("cube");
//     floor.transform.scale = new Vec3([100, 1, 100]);
//     floor.transform.position = new Vec3([0, -0.5, 0]);
//     useAlbedo(floor, [.8, .8, .8, 1]);
//     useFlag(floor, "lighting");
//     baseEntity.addChildEntity(floor);

//     baseEntity.addChildEntity(new AmbientLightEntity(new Vec3([1, 1, 1]).scale(0.1)));
    
//     const redPointLight = new PointLightEntity({ color: new Vec3([1, 0, 0]) });
//     redPointLight.transform.position = new Vec3([4, 5, 4]);
//     animateEntity(redPointLight, (e, time, _dt) => {
//         const mul = (Math.sin(time / 2)) * 2;
//         e.transform.position = new Vec3([mul * 4, 5, mul * 4]);
//     });
//     baseEntity.addChildEntity(redPointLight);

//     const bluePointLight = new PointLightEntity({ color: new Vec3([0, 0, 1]) });
//     bluePointLight.transform.position = new Vec3([-4, 5, 4]);
//     animateEntity(bluePointLight, (e, time, _dt) => {
//         const mul = (Math.sin(time / 2)) * 2;
//         e.transform.position = new Vec3([mul * -4, 5, mul * 4]);
//     });
//     baseEntity.addChildEntity(bluePointLight);

//     const greenPointLight = new PointLightEntity({ color: new Vec3([0, 1, 0]) });
//     greenPointLight.transform.position = new Vec3([0, 5, -3]);
//     animateEntity(greenPointLight, (e, time, _dt) => {
//         const mul = (Math.sin(time / 2)) * 2;
//         e.transform.position = new Vec3([0, 5, mul * -4]);
//     });
//     baseEntity.addChildEntity(greenPointLight);

//     const dirLight = new DirectionalLightEntity({ direction: new Vec3([-1, -1, 1]), intensity: 0.2 });
//     baseEntity.addChildEntity(dirLight);

//     baseEntity.setup(gl);
// };

export class Scene {

    private gl: XRRenderingContext;

    public currentTime = 0;
    public baseEntity: BaseEntity;

    constructor(gl: XRRenderingContext) {
        this.gl = gl;
        this.baseEntity = new BaseEntity(this);
    }

    public setup(sceneLoader: SceneLoader) {
        const gl = this.gl;
        WebGLUtilities.requestIntIndicesExt(gl);
        Entity.extVAO = WebGLUtilities.requestVAOExt(gl);

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
}