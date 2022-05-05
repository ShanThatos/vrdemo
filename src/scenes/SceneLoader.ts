import { Entity } from "../render/entity/Entity";
import { enforceDefined } from "../utils/Utils";
import LightsScene from "./LightsScene";
import LightsScene2 from "./LightsScene2";

export interface SceneLoader {
    name: string,
    displayName: string,
    load: () => Entity
}

export const ALL_SCENES = [LightsScene, LightsScene2] as Array<SceneLoader>;

export const findScene = (name: string): SceneLoader => {
    return enforceDefined(ALL_SCENES.find(s => s.name === name));
};