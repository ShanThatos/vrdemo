import { Vec3 } from "../../../../../lib/TSM";
import { Hand } from "./Hand";
import { Entity } from "../../Entity";
import { JOINT_NAMES } from "./HandUtils";

export class RecursiveHands extends Entity {
    private hands: Array<Hand> = [];
    constructor() {
        super();
        for (let i = 0; i < 12; i++) {
            this.hands[i] = new Hand(i % 2);
            this.addChildEntity(this.hands[i]);
        }
        for (let i = 2; i < 12; i++) {
            this.hands[i].transform.applyScale(new Vec3([0.5, 0.5, 0.5]));
            this.hands[i].transform.translate(this.hands[i].getJointPosition("wrist").copy());
        }
    }
    
    public updateEntity(dt: number): void {
        for (let i = 0; i < 12; i++) {
            this.hands[i].updateHand();
        }
        for (let i = 2; i < 12; i++) {
            const jointInd = Math.floor(i / 2) * 5 - 1;
            this.hands[i].transform.position = this.hands[i].getJointPosition(JOINT_NAMES[jointInd]).copy().subtract(this.hands[i].getJointPosition("wrist").copy().scale(0.5));
        }
        super.updateEntity(dt);
    }
}
