import { Vec3, Vec4 } from "../../../lib/TSM";
import { Nullable } from "../../utils/Types";
import { enforceDefined } from "../../utils/Utils";
import { Entity } from "./Entity";

export class LightEntity extends Entity {

    private _color: Nullable<Vec3> = null;

    constructor(color: Vec3 = new Vec3([1, 1, 1])) {
        super();
        this._color = color.copy();
    }

    public _onAdd(): void {
        super._onAdd();
        enforceDefined(this.baseEntity).lights.push(this);
    }

    public _onRemove(): void {
        const be = enforceDefined(this.baseEntity);
        be.lights.splice(be.lights.findIndex(e => e.id === this.id), 1);
        super._onRemove();
    }

    public get lightPosition(): Vec3 { return this.globalTransform.multiplyPt3(new Vec3([0, 0, 0])); }
    public get lightColor(): Vec3 { return enforceDefined(this._color); }
    public get lightInfo(): Vec4 { throw new Error("Not implemented"); }
}

export class AmbientLightEntity extends LightEntity {
    public get lightInfo(): Vec4 { return new Vec4([1, 0, 0, 0]); }
}

export class DirectionalLightEntity extends LightEntity {

    private _direction: Nullable<Vec3> = null;

    constructor({ direction = new Vec3([0, -1, 0]), intensity = 1, color = new Vec3([1, 1, 1]) } = {}) {
        super(color.copy().scale(intensity));
        this._direction = direction.copy();
        this._direction.normalize();
    }
    public get lightInfo(): Vec4 {
        const dir = this.globalTransform.multiplyVec3(enforceDefined(this._direction));
        return new Vec4([2, ...dir.xyz]);
    }
}

export class PointLightEntity extends LightEntity {
    
    private _attenuation: Nullable<Vec3> = null;

    constructor({ radius = 5, intensity = 2, color = new Vec3([1, 1, 1]) } = {}) {
        super(color);
        this._attenuation = new Vec3([1, 2 / radius, 1 / (radius * radius)]).scale(1 / intensity);
    }
    public get lightInfo(): Vec4 { return new Vec4([3, ...enforceDefined(this._attenuation).xyz]); }
}