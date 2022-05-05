import type { XRFrame, XRReferenceSpace, XRSession, XRWebGLLayer } from "webxr";
import { Scene } from "./Scene";
import { ALL_SCENES, findScene } from "./scenes/SceneLoader";
import { getElement } from "./utils/DomUtils";
import type { XRRenderingContext } from "./utils/Types";
import { enforceDefined } from "./utils/Utils";

const windowany = window as any;
const baseCanvas = getElement<HTMLCanvasElement>("glCanvas");
const statusElementContainer = getElement("statusContainer");
const statusElement = getElement("statusMessage");
const demoNameElement = getElement("demoName");
const scenesDropdown = getElement("scenesDropdown");

const XR_SESSION_TYPE = "local-floor";
let xrsession: XRSession;
let gl: XRRenderingContext;
let referenceSpace: XRReferenceSpace;
let selectedSceneName: string;
let scene: Scene;

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

    xrsession = await xr.requestSession("immersive-vr", { requiredFeatures: [XR_SESSION_TYPE] });
    xrsession.addEventListener("end", () => {
        console.log("Session ended");
        baseCanvas.style.display = "none";
    });

    const tgl = baseCanvas.getContext("webgl", { xrCompatible: true });
    if (!tgl) throw new Error("No WebGL support");
    
    gl = tgl as XRRenderingContext;
    scene = new Scene(gl);
    scene.setup(findScene(selectedSceneName));

    xrsession.updateRenderState({
        baseLayer: new windowany.XRWebGLLayer(xrsession, gl),
        depthFar: 100,
        depthNear: .001,
    });

    referenceSpace = (await xrsession.requestReferenceSpace(XR_SESSION_TYPE)) as XRReferenceSpace;

    baseCanvas.style.display = "block";
    xrsession.requestAnimationFrame(drawFrame);
};

const drawFrame = (time: number, frame: XRFrame) => {
    try {
        scene.update(time / 1000.0);
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
                scene.renderXRViewScene(view);
            }
        } else {
            console.log("Tracking lost");
        }
    } catch (err) {
        displayError(err);
    }
};

export const init = () => {
    startXRSession().catch(displayError);
};

const setupScenesDropdown = () => {
    scenesDropdown.innerHTML = "";
    for (const scene of ALL_SCENES) {
        const aEl = document.createElement("a");
        aEl.classList.add("sceneDropdownItem", "dropdown-item");
        aEl.setAttribute("scene", scene.name);
        aEl.innerHTML = scene.displayName;
        aEl.addEventListener("click", (e: MouseEvent) => {
            const scene = findScene(enforceDefined((e.currentTarget as HTMLElement).getAttribute("scene")));
            demoNameElement.innerHTML = scene.displayName;
            selectedSceneName = scene.name;
        });
        const liEl = document.createElement("li");
        liEl.appendChild(aEl);
        scenesDropdown.appendChild(liEl);
    }
    selectedSceneName = ALL_SCENES[0].name;
    demoNameElement.innerHTML = ALL_SCENES[0].displayName;
};

window.onload = () => {
    setupScenesDropdown();
    getElement("startButton").addEventListener("click", init);
};

const displayError = (err: any) => {
    console.log(err);
    statusElementContainer.style.display = "block";
    statusElement.innerHTML += err + "<br/>";
    xrsession.end();
};