import type { XRView } from "webxr";
import { Vec3 } from "../../lib/TSM";
import { XRRenderingContext } from "../utils/Types";
import { animateEntity, simpleRotationAnimation } from "./entity/Animate";
import { BaseEntity, Entity } from "./entity/Entity";
import { AmbientLightEntity, DirectionalLightEntity, PointLightEntity } from "./entity/LightEntity";
import { useAlbedo, useFlag } from "./entity/RenderEntity";
import { loadSolid } from "./entity/solids/Solids";
import { WebGLUtilities } from "./webgl/WebGLUtilities";

const baseEntity = new BaseEntity();

export const setupScene = (gl: XRRenderingContext) => {
    WebGLUtilities.requestIntIndicesExt(gl);
    Entity.extVAO = WebGLUtilities.requestVAOExt(gl);

    const cube = loadSolid("cube");
    cube.transform.position = new Vec3([0, 1, 0]);
    useAlbedo(cube, [1, 1, 1, 1]);
    useFlag(cube, "lighting");
    animateEntity(cube, simpleRotationAnimation({ speed: 2 }));
    baseEntity.addChildEntity(cube);

    const floor = loadSolid("cube");
    floor.transform.scale = new Vec3([100, 1, 100]);
    useAlbedo(floor, [.8, .8, .8, 1]);
    useFlag(floor, "lighting");
    baseEntity.addChildEntity(floor);

    baseEntity.addChildEntity(new AmbientLightEntity(new Vec3([1, 1, 1]).scale(0.1)));
    
    const redPointLight = new PointLightEntity({ color: new Vec3([1, 0, 0]) });
    redPointLight.transform.position = new Vec3([4, 5, 4]);
    animateEntity(redPointLight, (e, time, _dt) => {
        const mul = (Math.sin(time / 2)) * 2;
        e.transform.position = new Vec3([mul * 4, 5, mul * 4]);
    });
    baseEntity.addChildEntity(redPointLight);

    const bluePointLight = new PointLightEntity({ color: new Vec3([0, 0, 1]) });
    bluePointLight.transform.position = new Vec3([-4, 5, 4]);
    animateEntity(bluePointLight, (e, time, _dt) => {
        const mul = (Math.sin(time / 2)) * 2;
        e.transform.position = new Vec3([mul * -4, 5, mul * 4]);
    });
    baseEntity.addChildEntity(bluePointLight);

    const greenPointLight = new PointLightEntity({ color: new Vec3([0, 1, 0]) });
    greenPointLight.transform.position = new Vec3([0, 5, -3]);
    animateEntity(greenPointLight, (e, time, _dt) => {
        const mul = (Math.sin(time / 2)) * 2;
        e.transform.position = new Vec3([0, 5, mul * -4]);
    });
    baseEntity.addChildEntity(greenPointLight);

    const dirLight = new DirectionalLightEntity({ direction: new Vec3([-1, -1, 1]), intensity: 0.2 });
    baseEntity.addChildEntity(dirLight);

    baseEntity.setup(gl);
};

export const renderScene = (_gl: WebGLRenderingContext, view: XRView) => {
    Entity.projectionMatrix = view.projectionMatrix;
    Entity.viewMatrix = view.transform.inverse.matrix;
    Entity.viewPos = new Float32Array([view.transform.position.x, view.transform.position.y, view.transform.position.z]);

    baseEntity.render();
};

export const updateScene = (time: number, dt: number) => {
    Entity.currentTime = time;
    baseEntity.updateEntity(dt);
};