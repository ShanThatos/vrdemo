import { enforceDefined } from "./Utils";

export const getElement = <T = HTMLElement>(id: string): T => {
    return enforceDefined(document.getElementById(id)) as unknown as T;
};