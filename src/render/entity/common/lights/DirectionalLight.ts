import { Vec3, Vec4 } from "../../../../../lib/TSM";
import { Nullable } from "../../../../utils/Types";
import { enforceDefined } from "../../../../utils/Utils";
import { LightEntity } from "./LightEntity";


export class DirectionalLight extends LightEntity {

    private _direction: Nullable<Vec3> = null;
    // private depthTexture: Nullable<WebGLTexture> = null;
    // private depthFrameBuffer: Nullable<WebGLFramebuffer> = null;

    // private rp: Nullable<RenderPass> = null;

    constructor({ direction = new Vec3([0, -1, 0]), intensity = 1, color = new Vec3([1, 1, 1]) } = {}) {
        super(color.copy().scale(intensity));
        this._direction = direction.copy();
        this._direction.normalize();
    }

    // public setup(gl: XRRenderingContext): void {
    //     const depthTexture = this.depthTexture = gl.createTexture();
    //     const depthTextureSize = 512;
    //     gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    //     gl.texImage2D(
    //         gl.TEXTURE_2D,      // target
    //         0,                  // mip level
    //         gl.DEPTH_COMPONENT, // internal format
    //         depthTextureSize,   // width
    //         depthTextureSize,   // height
    //         0,                  // border
    //         gl.DEPTH_COMPONENT, // format
    //         gl.UNSIGNED_INT,    // type
    //         null                // data
    //     );
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //     const depthFramebuffer = this.depthFrameBuffer = gl.createFramebuffer();
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    //     gl.framebufferTexture2D(
    //         gl.FRAMEBUFFER,       // target
    //         gl.DEPTH_ATTACHMENT,  // attachment point
    //         gl.TEXTURE_2D,        // texture target
    //         depthTexture,         // texture
    //         0                     // mip level
    //     );
        
    //     // {
    //     //     // Could possibly exclude this
    //     //     // https://webglfundamentals.org/webgl/lessons/webgl-shadows.html#attachment-combinations
    //     //     // create a color texture of the same size as the depth texture
    //     //     const unusedTexture = gl.createTexture();
    //     //     gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
    //     //     gl.texImage2D(
    //     //         gl.TEXTURE_2D,
    //     //         0,
    //     //         gl.RGBA,
    //     //         depthTextureSize,
    //     //         depthTextureSize,
    //     //         0,
    //     //         gl.RGBA,
    //     //         gl.UNSIGNED_BYTE,
    //     //         null,
    //     //     );
    //     //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //     //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    //     //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //     //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            
    //     //     // attach it to the framebuffer
    //     //     gl.framebufferTexture2D(
    //     //         gl.FRAMEBUFFER,        // target
    //     //         gl.COLOR_ATTACHMENT0,  // attachment point
    //     //         gl.TEXTURE_2D,         // texture target
    //     //         unusedTexture,         // texture
    //     //         0                      // mip level
    //     //     );
    //     // }

    //     gl.bindFramebuffer(gl.FRAMEBUFFER, this.getBaseEntity().scene.getCanvasFramebuffer());

    //     const vshader = `
    //         attribute vec3 a_vertex;
    //         varying vec2 v_texcoord;

    //         void main() {
    //             gl_Position = vec4(a_vertex.xy, 0.0, 1.0);
    //             v_texcoord = a_vertex.xy * 0.5 + 0.5;
    //         }    
    //     `;
    //     const fshader = `
    //         precision mediump float;
    //         varying vec2 v_texcoord;
    //         uniform sampler2D u_sampler;
    //         void main() {
    //             float n = .001;
    //             float f = 100.0;

    //             // gl_FragColor = vec4(v_texcoord, 0, 1);
    //             float depth = texture2D(u_sampler, v_texcoord).r;
                
    //             float grey = (2.0 * n) / (f + n - depth*(f-n));
                
    //             gl_FragColor = vec4(grey, grey, grey, 1);
    //         }
    //     `;

    //     this.rp = new RenderPass(Entity.extVAO, gl, vshader, fshader);
        
    //     const indices = new Uint32Array([0, 1, 2, 2, 3, 0]);
    //     const vertices = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]);
    //     this.rp.setIndexBufferData(indices);
    //     this.rp.addAttribute("a_vertex",
    //         3, gl.FLOAT, false, 
    //         3 * Float32Array.BYTES_PER_ELEMENT, 
    //         0, undefined, vertices
    //     );

    //     this.rp.setDrawData(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
    //     this.rp.addTexture(enforceDefined(this.depthTexture));
    //     this.rp.setup();

    //     super.setup(gl);
    // }

    // public updateEntity(dt: number): void {
    //     this.renderShadowMaps();
    //     super.updateEntity(dt);
    // }

    // public renderShadowMaps(): void {
    //     const gl = this.getBaseEntity().scene.getRenderingContext();
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFrameBuffer);
    //     gl.viewport(0, 0, 512, 512);
    //     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //     gl.cullFace(gl.FRONT);

    //     // gl.enable(gl.DEPTH_TEST);
    //     // gl.depthFunc(gl.LEQUAL);

    //     this.ignorerender = true;
    //     // this.getBaseEntity().scene.renderScene()
    //     this.getBaseEntity().render();
    //     this.ignorerender = false;

    //     gl.cullFace(gl.BACK);
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // }

    // private ignorerender = false;
    // public render(): void {
    //     if (this.ignorerender) return;
    //     enforceDefined(this.rp).draw();
    // }

    public get lightType(): string { return "directional"; }
    public get lightInfo(): Vec4 {
        const dir = this.globalTransform.multiplyVec3(enforceDefined(this._direction));
        return new Vec4([2, ...dir.xyz]);
    }

    public getNumTextures(): number { return 1; }
}