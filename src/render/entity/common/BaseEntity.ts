import { Scene } from "../../../Scene";
import { XRRenderingContext } from "../../../utils/Types";
import { Entity } from "../Entity";
import type { LightEntity } from "./LightEntity";

export class BaseEntity extends Entity {

    public scene: Scene;
    public lights: LightEntity[] = [];

    constructor(scene: Scene) {
        super();
        this.scene = scene;
        this.entityData.set("isBaseEntity", true);
    }

    public setup(gl: XRRenderingContext) {
        super.setup(gl);

        const findLightEntities = (entity: Entity) => {
            entity.childEntities.forEach(e => findLightEntities(e));
            if (entity.entityData.get("isLight"))
                this.lights.push(entity as LightEntity);
        };
        findLightEntities(this);
    }

    public getLightPositions(): Float32Array {
        return new Float32Array(this.lights.flatMap(l => l.lightPosition.xyz));
    }
    public getLightColors(): Float32Array {
        return new Float32Array(this.lights.flatMap(l => l.lightColor.xyz));
    }
    public getLightInfos(): Float32Array {
        return new Float32Array(this.lights.flatMap(l => l.lightInfo.xyzw));
    }
}