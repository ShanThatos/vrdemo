import { Entity } from "../render/entity/Entity";
import { enforceDefined } from "../utils/Utils";
import LightsScene from "./LightsScene";
import HandsScene1 from "./HandsScene1";
import HandsScene2 from "./HandsScene2";
import RecursiveHands from "./RecursiveHandsScene";
import CylinderTest from "./CylinderTest";
import PianoScene from "./PianoScene";

export interface SceneLoader {
    name: string,
    displayName: string,
    load: () => Entity
}

export const ALL_SCENES = [RecursiveHands, PianoScene, CylinderTest, HandsScene1, HandsScene2, LightsScene] as Array<SceneLoader>;

export const findScene = (name: string): SceneLoader => {
    return enforceDefined(ALL_SCENES.find(s => s.name === name));
};