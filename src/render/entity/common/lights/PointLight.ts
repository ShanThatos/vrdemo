import { Vec3, Vec4 } from "../../../../../lib/TSM";
import { Nullable } from "../../../../utils/Types";
import { enforceDefined } from "../../../../utils/Utils";
import { LightEntity } from "./LightEntity";


export class PointLight extends LightEntity {
    
    private _attenuation: Nullable<Vec3> = null;

    constructor({ radius = 5, intensity = 2, color = new Vec3([1, 1, 1]) } = {}) {
        super(color);
        this._attenuation = new Vec3([1, 2 / radius, 1 / (radius * radius)]).scale(1 / intensity);
    }
    public get lightType(): string { return "point"; }
    public get lightInfo(): Vec4 { return new Vec4([3, ...enforceDefined(this._attenuation).xyz]); }
}