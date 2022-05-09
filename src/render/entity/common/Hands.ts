import { Mat4, Vec3 } from "../../../../lib/TSM";
import { getScene } from "../../../Scene";
import { enforceDefined } from "../../../utils/Utils";
import { Entity } from "../Entity";
import { loadSolid } from "../solids/Solids";
import { RenderEntity, useAlbedo, useFlag } from "./RenderEntity";


export const JOINT_NAMES = [

    "wrist",                             //   0

    "thumb-metacarpal",                  //   1
    "thumb-phalanx-proximal",            //   2
    "thumb-phalanx-distal",              //   3
    "thumb-tip",                         //   4

    "index-finger-metacarpal",           //   5
    "index-finger-phalanx-proximal",     //   6
    "index-finger-phalanx-intermediate", //   7
    "index-finger-phalanx-distal",       //   8
    "index-finger-tip",                  //   9

    "middle-finger-metacarpal",          //  10
    "middle-finger-phalanx-proximal",    //  11
    "middle-finger-phalanx-intermediate",//  12
    "middle-finger-phalanx-distal",      //  13
    "middle-finger-tip",                 //  14

    "ring-finger-metacarpal",            //  15
    "ring-finger-phalanx-proximal",      //  16
    "ring-finger-phalanx-intermediate",  //  17
    "ring-finger-phalanx-distal",        //  18
    "ring-finger-tip",                   //  19

    "pinky-finger-metacarpal",           //  20
    "pinky-finger-phalanx-proximal",     //  21
    "pinky-finger-phalanx-intermediate", //  22
    "pinky-finger-phalanx-distal",       //  23
    "pinky-finger-tip"                   //  24
];

export const getJointIndex = (name: string): number => {
    return enforceDefined(JOINT_NAMES.indexOf(name));
};


export class Hands extends Entity {

    private handNames = ["left", "right"];
    private handPoses = [new Float32Array(16 * 25), new Float32Array(16 * 25)];
    private handRadii = [new Float32Array(25), new Float32Array(25)];

    private handEntities = [new Entity(), new Entity()];
    private handJoints: Array<Array<RenderEntity>> = [[], []];

    constructor() {
        super();

        const handScale = Vec3.one.copy().scale(.01);
        for (let hi = 0; hi < 2; hi++) {
            this.handEntities[hi].transform.scale = Vec3.one.copy().scale(.01);
            for (let i = 0; i < 25; i++) {
                const joint = loadSolid("cube");
                joint.entityData.set("hand", this.handNames[hi]);
                joint.entityData.set("joint", JOINT_NAMES[i]);
                // joint.transform.scale = Vec3.one.copy().scale(.01);
                useAlbedo(joint, [.7, .7, 1, 1]);
                useFlag(joint, "lighting");
                this.handEntities[hi].addChildEntity(joint);
                this.handJoints[hi][i] = joint;
            }
            this.addChildEntity(this.handEntities[hi]);
        }
    }

    public getHand(hand: string): Entity {
        return this.handEntities[this.handNames.indexOf(hand)];
    }
    
    public updateEntity(dt: number): void {
        this.updateHand();
        super.updateEntity(dt);
    }

    public updateHand(): void {
        const scene = getScene();
        const xrsession = scene.xrsession;
        const frame = enforceDefined(scene.frame);
        const frameany = frame as any;
        const referenceSpace = scene.referenceSpace;
        for (const inputSource of xrsession.inputSources) {
            if (inputSource.hand) {
                const handany = inputSource.hand as any;
                const handIndex = this.handNames.indexOf(inputSource.handedness);
                if (handIndex === -1)
                    throw new Error(`Unrecognized handedness: ${inputSource.handedness}`);
                
                frameany.fillPoses(handany.values(), referenceSpace, this.handPoses[handIndex]);
                frameany.fillJointRadii(handany.values(), this.handRadii[handIndex]);

                const handBase = this.handEntities[handIndex];
                
                for (let i = 0; i < 25; i++) {
                    const joint = this.handJoints[handIndex][i];
                    const mat = new Mat4(Array.from(this.handPoses[handIndex].subarray(i * 16, i * 16 + 16)));
                    const pos = mat.multiplyPt3(Vec3.zero);
                    const rot = mat.toMat3().toQuat().inverse();
                    if (i == 0)
                        handBase.transform.position = mat.multiplyPt3(Vec3.zero);
                    
                    joint.transform.position = pos.copy().subtract(handBase.transform.position);
                    joint.transform.rotation = rot;
                    // joint.transform.scale = Vec3.one.copy().scale(this.handRadii[handIndex][i]);
                }
            } else {
                throw new Error("No hands :(");
            }
        }
    }
}
