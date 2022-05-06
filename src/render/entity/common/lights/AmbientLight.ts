import { Vec4 } from "../../../../../lib/TSM";
import { LightEntity } from "./LightEntity";

export class AmbientLight extends LightEntity {
    public get lightType(): string { return "ambient"; }
    public get lightInfo(): Vec4 { return new Vec4([1, 0, 0, 0]); }
}