import { Entity } from "../render/entity/Entity";
import { enforceDefined } from "../utils/Utils";
import LightsScene from "./LightsScene";

export interface SceneLoader {
    name: string,
    load: () => Entity
}

const ALL_SCENES = [LightsScene] as Array<SceneLoader>;

export const findScene = (name: string): SceneLoader => {
    return enforceDefined(ALL_SCENES.find(s => s.name === name));
};