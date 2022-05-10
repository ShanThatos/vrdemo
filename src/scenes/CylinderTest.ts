import { Vec3 } from "../../lib/TSM";
import { animateEntity, simpleRotationAnimation } from "../render/entity/Animate";
import { Entity } from "../render/entity/Entity";
import { useAlbedo, useFlag } from "../render/entity/common/RenderEntity";
import { loadSolid } from "../render/entity/solids/Solids";
import { AmbientLight } from "../render/entity/common/lights/AmbientLight";
import { DirectionalLight } from "../render/entity/common/lights/DirectionalLight";
import { PointLight } from "../render/entity/common/lights/PointLight";

const setupScene = (): Entity => {
    const root = new Entity();

    const e = new Entity();
    
    const cube = loadSolid("cube");
    cube.transform.scale = Vec3.one.copy().scale(.5);
    useAlbedo(cube, [1, 1, 1, 1]);
    useFlag(cube, "lighting");
    e.addChildEntity(cube);

    const sphere = loadSolid("sphere");
    sphere.useMatrixTransform();
    sphere.transform.translate(new Vec3([1, 1, 1]));
    sphere.transform.applyScale(Vec3.one.copy().scale(.5)); 
    useAlbedo(sphere, [1, 1, 1, 1]);
    useFlag(sphere, "lighting");
    cube.addChildEntity(sphere);

    animateEntity(e, simpleRotationAnimation());
    e.transform.applyScale(Vec3.one.copy().scale(.5));
    root.addChildEntity(e);

    


    const cylinder = loadSolid("sphere", { segments: 4 });
    cylinder.transform.position = new Vec3([0, 1, -1]);
    cylinder.transform.scale = Vec3.one.copy().scale(0.5);
    useAlbedo(cylinder, [1, 1, 1, 1]);
    useFlag(cylinder, "lighting");
    animateEntity(cylinder, simpleRotationAnimation());
    root.addChildEntity(cylinder);
    
    root.addChildEntity(new AmbientLight(new Vec3([1, 1, 1]).scale(0.1)));

    const pointLight = new PointLight({ color: new Vec3([1, 1, 1]) });
    pointLight.transform.position = new Vec3([0, 5, 0]);
    root.addChildEntity(pointLight);
    
    const dirLight = new DirectionalLight({ direction: new Vec3([-1, -1, 1]), intensity: 0.5 });
    root.addChildEntity(dirLight);

    return root;
};

export default {
    name: "Cylinder",
    displayName: "Cylinder Demo",
    load: setupScene
};