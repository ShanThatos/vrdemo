import type { XRFrame, XRReferenceSpace, XRSession, XRWebGLLayer } from "webxr";
import { renderScene } from "./render/Render";
import type { XRRenderingContext } from "./utils/Types";


const windowany = window as any;

let xrsession: XRSession;
let baseCanvas: HTMLCanvasElement;
let gl: XRRenderingContext;
let referenceSpace: XRReferenceSpace;

const start = async () => {
    let txr;
    {
        txr = windowany.navigator.xr;
        if (!txr)
            txr = new windowany.WebXRPolyfill();
    }
    const xr = txr;

    const isImmersiveVR = await xr.isSessionSupported("immersive-vr");

    if (!isImmersiveVR) {
        console.log("No immersive-vr support");
        alert("No immersive-vr support");
        return;
    }

    xrsession = await xr.requestSession("immersive-vr", { requiredFeatures: ["local"] });
    xrsession.addEventListener("end", () => {
        alert("XR Session has ended");
    });

    baseCanvas = document.getElementById("glCanvas") as HTMLCanvasElement;
    const tgl = baseCanvas.getContext("webgl", { xrCompatible: true });
    if (!tgl) {
        console.log("No WebGL support");
        alert("No WebGL support");
        return;
    }
    gl = tgl as XRRenderingContext;

    xrsession.updateRenderState({
        baseLayer: new windowany.XRWebGLLayer(xrsession, gl),
        depthFar: 40,
        depthNear: .1,
    });

    referenceSpace = (await xrsession.requestReferenceSpace("local")) as XRReferenceSpace;

    xrsession.requestAnimationFrame(drawFrame);
};

// TODO const drawFrame = (time: number, frame: XRFrame) => {
const drawFrame = (_time: number, frame: XRFrame) => {
    // TODO physicsUpdate(time);
    physicsUpdate();
    xrsession.requestAnimationFrame(drawFrame);

    const pose = frame.getViewerPose(referenceSpace);

    if (pose) {
        const gllayer = xrsession.renderState.baseLayer as XRWebGLLayer;

        gl.bindFramebuffer(gl.FRAMEBUFFER, gllayer.framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (const view of pose.views) {
            const vp = gllayer.getViewport(view);
            gl.viewport(vp.x, vp.y, vp.width, vp.height);
            renderScene(gl, view);
        }
    } else {
        console.log("Tracking lost");
    }
};

// TODO const physicsUpdate = (time: number) => {
const physicsUpdate = () => {
    // physics update
};

start();
export { };