import { Entity } from "../../Entity";
import { loadSolid } from "../../solids/Solids";
import { RenderEntity } from "../RenderEntity";


export class Piano extends Entity {
    
    private numOctaves = 4;
    private keysContainers = new Entity();
    private whiteKeys: Array<Entity> = [];

    constructor() {
        super();

        for (let octave = 0; octave < this.numOctaves; octave++) {
            for (let wi = 0; wi < 8; wi++) {
                const key = loadSolid("cube");

            }
        }
    }
}

export class PianoWhiteKey extends Entity {

    private key: RenderEntity;

    constructor() {
        super();
        const key = this.key = loadSolid("cube");
        
    }
}