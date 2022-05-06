import { Entity } from "../render/entity/Entity";
import { enforceDefined } from "../utils/Utils";
import LightsScene from "./LightsScene";
import HandsScene from "./HandsScene";

export interface SceneLoader {
    name: string,
    displayName: string,
    load: () => Entity
}

export const ALL_SCENES = [LightsScene, HandsScene] as Array<SceneLoader>;

export const findScene = (name: string): SceneLoader => {
    return enforceDefined(ALL_SCENES.find(s => s.name === name));
};