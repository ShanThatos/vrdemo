import { Mat4, Vec3 } from "../../../../../lib/TSM";
import { align, enforceDefined, getScene } from "../../../../utils/Utils";
import { Entity } from "../../Entity";
import { loadSolid } from "../../solids/Solids";
import { MatTransform } from "../../Transform";
import { RenderEntity, useAlbedo, useFlag } from "../RenderEntity";
import { JOINT_NAMES } from "./HandUtils";

export class Hand extends Entity {

    private handNames = ["left", "right"];
    private handPoses = new Float32Array(16 * 25);
    private handRadii = new Float32Array(25);

    private handJoints: Array<RenderEntity> = [];
    private handBones: Array<RenderEntity> = [];

    private hand: number;

    constructor(hand : number) {
        super();
        this.hand = hand;

        for (let i = 0; i < 25; i++) {
            const joint = loadSolid("sphere", { segments: 1 });
            joint.entityData.set("hand", this.handNames[this.hand]);
            joint.entityData.set("joint", JOINT_NAMES[i]);
            joint.transform.scale = Vec3.zero.copy();
            useAlbedo(joint, [1, .7, .7, 1]);
            useFlag(joint, "lighting");
            this.handJoints[i] = joint;
            this.addChildEntity(joint);
        }
        
        for (let i = 0; i < 24; i++) {
            const bone = loadSolid("cylinder", { radius: 0.7, height: 1, segments: 10});
            bone.transform.scale = Vec3.zero.copy();
            useAlbedo(bone, [.7, .7, 1, 1]);
            useFlag(bone, "lighting");
            this.handBones[i] = bone;
            this.addChildEntity(bone);
        }
    }

    public updateHand(): void {
        const scene = getScene();
        const frameany = enforceDefined(scene.frame) as any;
        for (const inputSource of scene.xrsession.inputSources) {
            if (inputSource.hand) {
                const handany = inputSource.hand as any;
                const handIndex = this.handNames.indexOf(inputSource.handedness);
                if (handIndex === -1)
                    throw new Error(`Unrecognized handedness: ${inputSource.handedness}`);
                // Get data for correct hand
                if (handIndex != this.hand) continue;
                
                frameany.fillPoses(handany.values(), scene.referenceSpace, this.handPoses);
                frameany.fillJointRadii(handany.values(), this.handRadii);

                
                for (let i = 0; i < 25; i++) {
                    const joint = this.handJoints[i];
                    const transform = new MatTransform();
                    joint.transform = transform;
                    transform.applyScale(Vec3.one.copy().scale(1.2 * this.handRadii[i]));
                    transform.applyTransform(new Mat4(Array.from(this.handPoses.subarray(i * 16, i * 16 + 16))));
                }

                // Make bones
                const bones = [];
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 4; j++) {
                        bones.push([i * 5 + j, i * 5 + j + 1]);
                    }
                }
                for (let i = 1; i <= 4; i++) {
                    bones.push([0, i * 5]);
                }
                // Place bones
                bones.forEach((element, i) => {
                    const joint1 = element[0];
                    const joint2 = element[1];
                    const bone = this.handBones[i];
                    const joint1Loc = Array.from(this.handPoses.subarray(joint1 * 16, joint1 * 16 + 16));
                    const joint2Loc = Array.from(this.handPoses.subarray(joint2 * 16, joint2 * 16 + 16));
    
                    const m1 = new Mat4(joint1Loc);
                    const m2 = new Mat4(joint2Loc);
                    const p1 = m1.multiplyPt3(Vec3.zero);
                    const p2 = m2.multiplyPt3(Vec3.zero);
                    const rotation = align(Vec3.up, p2.copy().subtract(p1));
    
                    const middlePos = p1.copy().add(p2).scale(.5);
    
                    const transform = new MatTransform();
                    bone.transform = transform;
                    const boneLen = Vec3.distance(p1, p2);
                    let boneWidth = this.handRadii[joint1];
                    if (!(JOINT_NAMES[joint1].includes("metacarpal") || JOINT_NAMES[joint1].includes("wrist"))) {
                        boneWidth *= 1.2;
                    }
                    transform.applyScale(new Vec3([boneWidth, boneLen, boneWidth]));
                    transform.rotate(rotation);
                    transform.translate(middlePos);
                });
            }
        }
    }

    public getJointPosition(joint: string): Vec3 {
        const ji = JOINT_NAMES.indexOf(joint);
        if (ji === -1)
            throw new Error(`Unknown joint: ${joint}`);
        return new Mat4(Array.from(this.handPoses.subarray(ji * 16, ji * 16 + 16))).multiplyPt3(Vec3.zero);
    }
}
