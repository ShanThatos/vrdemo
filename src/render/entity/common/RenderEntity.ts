import { Nullable, XRRenderingContext } from "../../../utils/Types";
import { enforceDefined } from "../../../utils/Utils";
import { VS_verts, FS_generic } from "../../shaders/shaders";
import { RenderPass } from "../../webgl/RenderPass";
import { Entity } from "../Entity";



export class RenderEntity extends Entity {

    private rp: Nullable<RenderPass> = null;
    private options: RenderEntitySetupOptions = { vShader: VS_verts, fShader: FS_generic };

    public setRenderOptions(options: RenderEntitySetupOptions): void {
        this.options = { ...this.options, ...options };
    }

    public setup(gl: XRRenderingContext): void {
        super.setup(gl);

        const vShader = enforceDefined(this.options.vShader);
        const fShader = enforceDefined(this.options.fShader);

        this.rp = new RenderPass(Entity.extVAO, gl, vShader, fShader);

        const indices = enforceDefined<Uint32Array>(this.entityData.get("indices"));
        const vertices = enforceDefined<Float32Array>(this.entityData.get("vertices"));

        this.rp.setIndexBufferData(indices);
        this.rp.addAttribute("a_vertex",
            3, gl.FLOAT, false, 
            3 * Float32Array.BYTES_PER_ELEMENT, 
            0, undefined, vertices
        );

        if (this.entityData.has("normals")) {
            const normals = enforceDefined<Float32Array>(this.entityData.get("normals"));
            this.rp.addAttribute("a_normal",
                3, gl.FLOAT, false,
                3 * Float32Array.BYTES_PER_ELEMENT,
                0, undefined, normals
            );
        }

        this.rp.addUniform("projection", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
            gl.uniformMatrix4fv(loc, false, Entity.projectionMatrix);
        });
        this.rp.addUniform("view", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
            gl.uniformMatrix4fv(loc, false, Entity.viewMatrix);
        });
        this.rp.addUniform("viewPos", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
            gl.uniform3fv(loc, Entity.viewPos);
        });
        this.rp.addUniform("transform", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
            gl.uniformMatrix4fv(loc, false, this.globalTransform.all());
        });
        this.rp.addUniform("normalTransform", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
            gl.uniformMatrix3fv(loc, false, this.globalTransform.copy().inverse().transpose().toMat3().all());
        });

        if (this.entityData.has("flags")) {
            this.rp.addUniform("flags", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
                gl.uniform1iv(loc, new Int32Array(this.entityData.get("flags") as number[]));
            });
        }

        if (this.entityData.has("albedo") && hasFlag(this, "albedo")) {
            this.rp.addUniform("albedo", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
                gl.uniform4fv(loc, new Float32Array(this.entityData.get("albedo")));
            });
        }

        if (hasFlag(this, "lighting")) {
            this.rp.addUniform("lightPositions", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
                gl.uniform3fv(loc, this.getBaseEntity().getLightPositions());
            });
            this.rp.addUniform("lightColors", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
                gl.uniform3fv(loc, this.getBaseEntity().getLightColors());
            });
            this.rp.addUniform("lightInfos", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
                gl.uniform4fv(loc, this.getBaseEntity().getLightInfos());
            });
        }

        this.rp.setDrawData(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
        this.rp.setup();
    }

    public render(): void {
        if (this.rp === null)
            throw new Error("Entity not setup");
        this.rp.draw();
        super.render();
    }

    public get renderPass(): RenderPass { return enforceDefined(this.rp); }
}

interface RenderEntitySetupOptions {
    vShader?: string,
    fShader?: string
}




const FLAG_NAMES = ["albedo", "lighting"];
export const useFlag = (entity: RenderEntity, flag: string, value = true): void => {
    if (!entity.entityData.has("flags"))
        entity.entityData.set("flags", new Array<number>(FLAG_NAMES.length).fill(0));
    const i = FLAG_NAMES.indexOf(flag);
    if (i === -1)
        throw new Error(`Invalid RenderEntity flag ${flag}`);
    entity.entityData.get("flags")[i] = value ? 1 : 0;
};
export const hasFlag = (entity: RenderEntity, flag: string): boolean => {
    const flags = entity.entityData.get("flags");
    if (!flags) return false;
    const i = FLAG_NAMES.indexOf(flag);
    if (i === -1)
        throw new Error(`Invalid RenderEntity flag ${flag}`);
    return flags[i] === 1;
};

export const useAlbedo = (entity: RenderEntity, color: number[]) => {
    useFlag(entity, "albedo");
    entity.entityData.set("albedo", color);
};