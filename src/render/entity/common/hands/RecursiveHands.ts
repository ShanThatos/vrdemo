import { Vec3 } from "../../../../../lib/TSM";
import { Hand } from "./Hand";
import { Entity } from "../../Entity";
import { MatTransform } from "../../Transform";

export class RecursiveHands extends Entity {
    private hands: Array<Hand> = [];
    constructor(level: number) {
        super();
        this.hands[0] = new Hand(0);
        this.hands[1] = new Hand(1);
        this.addChildEntity(this.hands[0]);
        this.addChildEntity(this.hands[1]);
        // TODO: Properly recurse + recenter hands
        if (level != 0) {
            for (let i = 0; i < 2; i++) {
                this.hands[i + 2] = new Hand(i);
                this.hands[i + 2].transform = new MatTransform();
                // this.hands[i + 2].transform.translate(this.hands[i + 2].getJointPosition("wrist").copy().negate());
                // this.hands[i + 2].transform.applyScale(new Vec3([0.5, 0.5, 0.5]));
                this.hands[i + 2].transform.translate(new Vec3([0, 0, -0.2]));
                this.addChildEntity(this.hands[i + 2]);
            }
        }
    }
    
    public updateEntity(dt: number): void {
        for (let i = 0; i < 4; i++) this.hands[i].updateHand();
        super.updateEntity(dt);
    }
}
