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

    const cube = loadSolid("cube");
    cube.transform.position = new Vec3([0, 1, -1]);
    cube.transform.scale = Vec3.one.copy().scale(0.5);
    useAlbedo(cube, [1, 1, 1, 1]);
    useFlag(cube, "lighting");
    animateEntity(cube, simpleRotationAnimation());
    root.addChildEntity(cube);

    const floor = loadSolid("cube");
    floor.transform.scale = new Vec3([100, 1, 100]);
    floor.transform.position = new Vec3([0, -0.5, 0]);
    useAlbedo(floor, [.8, .8, .8, 1]);
    useFlag(floor, "lighting");
    root.addChildEntity(floor);

    root.addChildEntity(new AmbientLight(new Vec3([1, 1, 1]).scale(0.1)));
    
    const redPointLight = new PointLight({ color: new Vec3([1, 0, 0]) });
    redPointLight.transform.position = new Vec3([4, 5, 4]);
    animateEntity(redPointLight, (e, time, _dt) => {
        const mul = (Math.sin(time / 2)) * 2;
        e.transform.position = new Vec3([mul * 4, 5, mul * 4]);
    });
    root.addChildEntity(redPointLight);

    const bluePointLight = new PointLight({ color: new Vec3([0, 0, 1]) });
    bluePointLight.transform.position = new Vec3([-4, 5, 4]);
    animateEntity(bluePointLight, (e, time, _dt) => {
        const mul = (Math.sin(time / 2)) * 2;
        e.transform.position = new Vec3([mul * -4, 5, mul * 4]);
    });
    root.addChildEntity(bluePointLight);

    const greenPointLight = new PointLight({ color: new Vec3([0, 1, 0]) });
    greenPointLight.transform.position = new Vec3([0, 5, -3]);
    animateEntity(greenPointLight, (e, time, _dt) => {
        const mul = (Math.sin(time / 2)) * 2;
        e.transform.position = new Vec3([0, 5, mul * -4]);
    });
    root.addChildEntity(greenPointLight);

    const dirLight = new DirectionalLight({ direction: new Vec3([-1, -1, 1]), intensity: 0.2 });
    root.addChildEntity(dirLight);

    return root;
};

export default {
    name: "lights",
    displayName: "Lights Demo",
    load: setupScene
};