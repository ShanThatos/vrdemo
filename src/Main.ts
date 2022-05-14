import type { XRFrame, XRReferenceSpace, XRWebGLLayer } from "webxr";
import { Piano } from "./render/entity/common/piano/Piano";
import { Piano as ToneJSPiano } from "@tonejs/piano";
import { Scene } from "./Scene";
import { ALL_SCENES, findScene } from "./scenes/SceneLoader";
import { getElement } from "./utils/DomUtils";
import type { XRRenderingContext } from "./utils/Types";
import { getScene, enforceDefined } from "./utils/Utils";
import * as Tone from "tone";

window.onload = () => {
    // Setting up the dropdown menus and click events
    setupPage();
};

const windowany = window as any;
const startButton = getElement("startButton");

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
        startButton.removeAttribute("disabled");
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

    // Sets up the first frame callback
    xrsession.requestAnimationFrame(firstFrame);
};

const firstFrame = (_time: number, _frame: XRFrame) => {
    try {
        const scene = getScene();
        const gllayer = scene.xrsession.renderState.baseLayer as XRWebGLLayer;
        scene.screenFramebuffer = gllayer.framebuffer;
        scene.setup();

        // Sets up the next frame callback
        scene.xrsession.requestAnimationFrame(drawFrame);
    } catch (err) {
        handleError(err);
    }
};

const drawFrame = (time: number, frame: XRFrame) => {
    try {
        time /= 1000.0;
        const scene = getScene();
        const gl = scene.gl;
        scene.frame = frame;

        // Physics update for all entities in the scene tree
        if (time - scene.prevUpdateTime > .016)
            scene.update(time);

        // Requests the next frame
        scene.xrsession.requestAnimationFrame(drawFrame);

        const pose = frame.getViewerPose(scene.referenceSpace);

        if (pose) {
            const gllayer = scene.xrsession.renderState.baseLayer as XRWebGLLayer;

            gl.bindFramebuffer(gl.FRAMEBUFFER, gllayer.framebuffer);
            gl.clearColor(.8, .8, 1, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.frontFace(gl.CCW);
            gl.cullFace(gl.BACK);

            for (const view of pose.views) {
                const vp = gllayer.getViewport(view);
                gl.viewport(vp.x, vp.y, vp.width, vp.height);
                
                // Render all entities within the scene tree
                scene.renderXRViewScene(view);
            }
        } else {
            console.log("Tracking lost");
        }
    } catch (err) {
        handleError(err);
    }
};

// Load's up ToneJS if necessary and starts the XR session. 
const init = () => {
    startButton.setAttribute("disabled", "");
    if (Scene.selectedSceneName.includes("piano")) {
        Tone.start().then(() => {
            Piano.tonejsPiano = new ToneJSPiano({
                velocities: 5
            });
            Piano.tonejsPiano.toDestination();
            Piano.tonejsPiano.load();
        });
    }
    startXRSession().catch(handleError);
};

const setupPage = () => {
    const demoNameElement = getElement("demoName");
    const scenesDropdown = getElement("scenesDropdown");
    scenesDropdown.innerHTML = "";
    for (const sc of ALL_SCENES) {
        const aEl = document.createElement("a");
        aEl.classList.add("sceneDropdownItem", "dropdown-item", "darkButton");
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

    // Call the init function when the start button is clicked
    startButton.addEventListener("click", init);

    getElement("mainContainer").classList.remove("d-none");
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
