import { Vec3 } from "../../../lib/TSM";
import { Nullable, XRRenderingContext } from "../../utils/Types";
import { enforceDefined } from "../../utils/Utils";
import { FS_green, VS_verts } from "../shaders/shaders";
import { RenderPass } from "../webgl/RenderPass";
import { Entity } from "./Entity";


export class RenderEntity extends Entity {

    private rp: Nullable<RenderPass> = null;
    private indicesVAO: Nullable<Uint32Array> = null;
    private vertices: Nullable<Float32Array> = null;

    public setDrawData(indices: number[], vertices: Vec3[]): void {
        this.indicesVAO = new Uint32Array(indices);
        this.vertices = new Float32Array(vertices.flatMap(v => v.xyz));
    }

    public setupRenderPass(gl: XRRenderingContext, options: RenderEntitySetupOptions = { vShader: VS_verts, fShader: FS_green }): void {
        this.rp = new RenderPass(Entity.extVAO, gl, options.vShader, options.fShader);

        const indices = enforceDefined(this.indicesVAO);
        const vertices = enforceDefined(this.vertices);

        this.rp.setIndexBufferData(indices);
        this.rp.addAttribute("vertex",
            3, gl.FLOAT, false, 
            3 * Float32Array.BYTES_PER_ELEMENT, 
            0, undefined, vertices
        );

        this.rp.addUniform("projection", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
            gl.uniformMatrix4fv(loc, false, Entity.projectionMatrix);
        });
        this.rp.addUniform("view", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
            gl.uniformMatrix4fv(loc, false, Entity.viewMatrix);
        });
        this.rp.addUniform("transform", (gl: XRRenderingContext, loc: WebGLUniformLocation) => {
            gl.uniformMatrix4fv(loc, false, this.globalTransform.all());
        });

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
    vShader: string,
    fShader: string
}