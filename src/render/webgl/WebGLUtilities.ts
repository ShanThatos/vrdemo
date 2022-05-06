import { XRRenderingContext } from "../../utils/Types";
import { enforceDefined } from "../../utils/Utils";

export class WebGLUtilities {

    /**
     * Extends the given WebGL context with unsigned int indices
     * @param ctx the WebGL rendering context to extend
     */
    public static requestIntIndicesExt(ctx: XRRenderingContext): void {
        /* Request unsigned int indices extention */
        const extIndex = ctx.getExtension("OES_element_index_uint");
        if (!extIndex) {
            throw new Error("Your browser does not support 32 bit indices");
        }
    }

    /**
     * Returns the VAO extension back if supported
     * @param ctx the WebGL rendering context to extend
     * @return the VAO extension
     */
    public static requestVAOExt(
        ctx: XRRenderingContext
    ): OES_vertex_array_object {
        /* Request vao extension */
        const extVAO = ctx.getExtension("OES_vertex_array_object");
        if (!extVAO) {
            throw new Error("Your browser does not support the VAO extension.");
        }
        return extVAO;
    }

    public static requestDepthTextureExt(gl: XRRenderingContext): void {
        /* Request depth texture extention */
        const extDepthTexture = gl.getExtension("WEBGL_depth_texture");
        if (!extDepthTexture)
            throw new Error("Your browser does not support the depth texture extension.");
    }

    public static createShader(gl: XRRenderingContext, shaderType: "vertex" | "fragment", shaderCode: string): WebGLShader {
        const shader = enforceDefined(gl.createShader(shaderType === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER));
        gl.shaderSource(shader, shaderCode);
        gl.compileShader(shader);
    
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            console.log(gl.getShaderInfoLog(shader));
    
        return shader;
    }
    
    public static createShaderProgram(gl: XRRenderingContext, vShader: string, fShader: string): WebGLProgram {
        const vertexShader = WebGLUtilities.createShader(gl, "vertex", vShader);
        const fragmentShader = WebGLUtilities.createShader(gl, "fragment", fShader);
    
        const program = enforceDefined(gl.createProgram());
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
    
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            console.log(gl.getProgramInfoLog(program));
    
        return program;
    }
}