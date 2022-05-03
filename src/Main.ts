import type { XRFrame, XRReferenceSpace, XRSession, XRWebGLLayer } from "webxr";
import { renderScene, setupScene, updateScene } from "./render/Scene";
import { getElement } from "./utils/DomUtils";
import type { XRRenderingContext } from "./utils/Types";

const windowany = window as any;
const statusElement = getElement("statusMessage");

let xrsession: XRSession;
let baseCanvas: HTMLCanvasElement;
let gl: XRRenderingContext;
let referenceSpace: XRReferenceSpace;

const startXRSession = async () => {
    let txr;
    {
        txr = windowany.navigator.xr;
        if (!txr) {
            alert("WebXR not supported, using polyfill");
            txr = new windowany.WebXRPolyfill();
        }
    }
    const xr = txr;

    const isImmersiveVR = await xr.isSessionSupported("immersive-vr");

    if (!isImmersiveVR) throw new Error("No immersive-vr support");

    xrsession = await xr.requestSession("immersive-vr", { requiredFeatures: ["local"] });
    xrsession.addEventListener("end", () => {
        alert("XR Session has ended");
    });

    baseCanvas = getElement<HTMLCanvasElement>("glCanvas");
    const tgl = baseCanvas.getContext("webgl", { xrCompatible: true });
    if (!tgl) throw new Error("No WebGL support");
    
    gl = tgl as XRRenderingContext;

    xrsession.updateRenderState({
        baseLayer: new windowany.XRWebGLLayer(xrsession, gl),
        depthFar: 100,
        depthNear: .1,
    });

    referenceSpace = (await xrsession.requestReferenceSpace("local")) as XRReferenceSpace;

    setupScene(gl);

    xrsession.requestAnimationFrame(drawFrame);
};

const drawFrame = (time: number, frame: XRFrame) => {
    physicsUpdate(time);
    xrsession.requestAnimationFrame(drawFrame);

    const pose = frame.getViewerPose(referenceSpace);

    if (pose) {
        const gllayer = xrsession.renderState.baseLayer as XRWebGLLayer;

        gl.bindFramebuffer(gl.FRAMEBUFFER, gllayer.framebuffer);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.enable(gl.DEPTH_TEST);

        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);

        for (const view of pose.views) {
            const vp = gllayer.getViewport(view);
            gl.viewport(vp.x, vp.y, vp.width, vp.height);
            renderScene(gl, view);
        }
    } else {
        console.log("Tracking lost");
    }
};

let prevUpdateTime = 0;
const physicsUpdate = (time: number) => {
    if (prevUpdateTime === 0) {
        prevUpdateTime = time;
        return;
    }

    const delta = (time - prevUpdateTime) / 1000.0;
    prevUpdateTime = time;

    updateScene(time / 1000.0, delta);
};


export const init = () => {
    startXRSession()
        .catch(err => {
            console.log(err);
            statusElement.innerHTML += err;
        });
};

window.onload = () => {
    getElement("startButton").addEventListener("click", init);
};