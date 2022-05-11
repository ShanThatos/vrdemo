import { Vec3 } from "../../lib/TSM";
import { RecursiveHands } from "../render/entity/common/hands/RecursiveHands";
import { AmbientLight } from "../render/entity/common/lights/AmbientLight";
import { DirectionalLight } from "../render/entity/common/lights/DirectionalLight";
import { PointLight } from "../render/entity/common/lights/PointLight";
import { useAlbedo, useFlag } from "../render/entity/common/RenderEntity";
import { Entity } from "../render/entity/Entity";
import { loadSolid } from "../render/entity/solids/Solids";

const setupScene = (): Entity => {
    const root = new Entity();

    const floor = loadSolid("cube");
    floor.transform.scale = new Vec3([100, 1, 100]);
    floor.transform.position = new Vec3([0, -0.5, 0]);
    useAlbedo(floor, [.8, .8, .8, 1]);
    useFlag(floor, "lighting");
    root.addChildEntity(floor);

    root.addChildEntity(new AmbientLight(new Vec3([1, 1, 1]).scale(0.1)));

    const pointLight = new PointLight({ color: new Vec3([1, 1, 1]) });
    pointLight.transform.position = new Vec3([0, 5, 0]);
    root.addChildEntity(pointLight);
    
    const dirLight = new DirectionalLight({ direction: new Vec3([-1, -1, 1]), intensity: 0.5 });
    root.addChildEntity(dirLight);

    root.addChildEntity(new RecursiveHands(1));
    // root.addChildEntity(new Hand(1));

    return root;
};

export default {
    name: "RecursiveHands",
    displayName: "Recursive Hands",
    load: setupScene
};