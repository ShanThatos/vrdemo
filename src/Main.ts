import type { XRFrame, XRReferenceSpace, XRWebGLLayer } from "webxr";
import { getScene, Scene } from "./Scene";
import { ALL_SCENES, findScene } from "./scenes/SceneLoader";
import { getElement } from "./utils/DomUtils";
import type { XRRenderingContext } from "./utils/Types";
import { enforceDefined } from "./utils/Utils";

const windowany = window as any;

const startXRSession = async () => {

    const baseCanvas = getElement<HTMLCanvasElement>("glCanvas");

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

    const xrsession = await xr.requestSession("immersive-vr", { requiredFeatures: ["local-floor"], optionalFeatures: ["hand-tracking"] });
    xrsession.addEventListener("end", () => {
        console.log("Session ended");
        baseCanvas.style.display = "none";
    });

    const tgl = baseCanvas.getContext("webgl", { xrCompatible: true });
    if (!tgl) throw new Error("No WebGL support");
    
    const gl = tgl as XRRenderingContext;

    xrsession.updateRenderState({
        baseLayer: new windowany.XRWebGLLayer(xrsession, gl),
        depthFar: 100,
        depthNear: .001,
    });

    const referenceSpace = (await xrsession.requestReferenceSpace("local-floor")) as XRReferenceSpace;

    const scene = windowany.scene = new Scene();
    scene.gl = gl;
    scene.xrsession = xrsession;
    scene.referenceSpace = referenceSpace;
    
    baseCanvas.style.display = "block";
    xrsession.requestAnimationFrame(firstFrame);
};

const firstFrame = (_time: number, _frame: XRFrame) => {
    const scene = getScene();
    const gllayer = scene.xrsession.renderState.baseLayer as XRWebGLLayer;
    scene.screenFramebuffer = gllayer.framebuffer;
    scene.setup();
    scene.xrsession.requestAnimationFrame(drawFrame);
};

const drawFrame = (time: number, frame: XRFrame) => {
    try {
        const scene = getScene();
        const gl = scene.gl;
        scene.frame = frame;
        scene.update(time / 1000.0);
        scene.xrsession.requestAnimationFrame(drawFrame);

        const pose = frame.getViewerPose(scene.referenceSpace);

        if (pose) {
            const gllayer = scene.xrsession.renderState.baseLayer as XRWebGLLayer;

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
                scene.renderXRViewScene(view);
            }
        } else {
            console.log("Tracking lost");
        }
    } catch (err) {
        handleError(err);
    }
};

const init = () => {
    startXRSession().catch(handleError);
};

const setupScenesDropdown = () => {
    const demoNameElement = getElement("demoName");
    const scenesDropdown = getElement("scenesDropdown");
    scenesDropdown.innerHTML = "";
    for (const sc of ALL_SCENES) {
        const aEl = document.createElement("a");
        aEl.classList.add("sceneDropdownItem", "dropdown-item");
        aEl.setAttribute("scene", sc.name);
        aEl.innerHTML = sc.displayName;
        aEl.addEventListener("click", (e: MouseEvent) => {
            const sceneInfo = findScene(enforceDefined((e.currentTarget as HTMLElement).getAttribute("scene")));
            demoNameElement.innerHTML = sceneInfo.displayName;
            Scene.selectedSceneName = sceneInfo.name;
        });
        const liEl = document.createElement("li");
        liEl.appendChild(aEl);
        scenesDropdown.appendChild(liEl);
    }
    demoNameElement.innerHTML = ALL_SCENES[0].displayName;
};

window.onload = () => {
    setupScenesDropdown();
    getElement("startButton").addEventListener("click", init);
};

const handleError = (err: any) => {
    const scene = getScene();
    console.log(err);
    appendStatusMessage(err);
    scene.xrsession.end();
};

export const appendStatusMessage = (message: string) => {
    const statusElementContainer = getElement("statusContainer");
    const statusElement = getElement("statusMessage");
    statusElementContainer.style.display = "block";
    statusElement.innerHTML += "<br/>" + message;
};
