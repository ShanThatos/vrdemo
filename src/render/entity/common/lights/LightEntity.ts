import { Vec3, Vec4 } from "../../../../../lib/TSM";
import { Nullable } from "../../../../utils/Types";
import { enforceDefined } from "../../../../utils/Utils";
import { Entity } from "../../Entity";

export class LightEntity extends Entity {

    public static DEPTH_TEXTURE_SIZE = 256;

    private _color: Nullable<Vec3> = null;

    constructor(color: Vec3 = new Vec3([1, 1, 1])) {
        super();
        this._color = color.copy();
        this.entityData.set("isLight", true);
    }

    public get lightType(): string { throw new Error("Not implemented"); }
    
    public get lightPosition(): Vec3 { return this.globalTransform.multiplyPt3(new Vec3([0, 0, 0])); }
    public get lightColor(): Vec3 { return enforceDefined(this._color); }
    public get lightInfo(): Vec4 { throw new Error("Not implemented"); }

    // mainly just directional lights -- i think
    public getNumTextures(): number { return 0; }

    // I think point lights can use cube map textures?
    public getNumCubeTextures(): number { return 0; }
}