import { XRRenderingContext } from "../../../utils/Types";
import { Entity } from "../Entity";
import { LightEntity } from "./lights/LightEntity";

export class BaseEntity extends Entity {

    public lights: LightEntity[] = [];

    constructor() {
        super();
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

        // const totalNumCubeTextures = this.lights.map(l => l.getNumCubeTextures()).reduce((a, b) => a + b, 0);
        // {
        //     const totalNumTextures = this.lights.map(l => l.getNumTextures()).reduce((a, b) => a + b, 0);

        //     const texture = gl.createTexture();
        //     gl.activeTexture(gl.TEXTURE1);
        //     gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
        //     gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //     gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        //     gl.texImage3D(
        //         gl.TEXTURE_2D_ARRAY,
        //         0, 
        //         gl.DEPTH_COMPONENT,
        //         LightEntity.DEPTH_TEXTURE_SIZE, 
        //         LightEntity.DEPTH_TEXTURE_SIZE * totalNumTextures,
        //         totalNumTextures,
        //         0,
        //         gl.DEPTH_COMPONENT, 
        //         gl.UNSIGNED_INT,
        //         null
        //     );
        //     const framebuffers = [];
        //     for (let i = 0; i < totalNumTextures; i++) {
        //         const framebuffer = gl.createFramebuffer();
        //         gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        //         gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, texture, 0, i);
        //         framebuffers.push(framebuffer);
        //     }
        // }
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