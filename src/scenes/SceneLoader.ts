import { Entity } from "../render/entity/Entity";
import { enforceDefined } from "../utils/Utils";
import LightsScene from "./LightsScene";
import HandsScene1 from "./HandsScene1";
import HandsScene2 from "./HandsScene2";
import RecursiveHands from "./RecursiveHandsScene";
import PrimitivesTest from "./PrimitivesTest";
import PianoScene from "./PianoScene";

export interface SceneLoader {
    name: string,
    displayName: string,
    load: () => Entity
}

export const ALL_SCENES = [PrimitivesTest, LightsScene, HandsScene1, HandsScene2, PianoScene, RecursiveHands] as Array<SceneLoader>;

export const findScene = (name: string): SceneLoader => {
    return enforceDefined(ALL_SCENES.find(s => s.name === name));
};