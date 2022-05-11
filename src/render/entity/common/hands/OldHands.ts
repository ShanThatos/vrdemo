import { Vec3, Mat4 } from "../../../../../lib/TSM";
import { align, enforceDefined, getScene } from "../../../../utils/Utils";
import { Entity } from "../../Entity";
import { loadSolid } from "../../solids/Solids";
import { MatTransform } from "../../Transform";
import { RenderEntity, useAlbedo, useFlag } from "../RenderEntity";
import { JOINT_NAMES } from "./HandUtils";

export class OldHands extends Entity {

    private handNames = ["left", "right"];
    private handPoses = [new Float32Array(16 * 25), new Float32Array(16 * 25)];
    private handRadii = [new Float32Array(25), new Float32Array(25)];

    private handJoints: Array<Array<RenderEntity>> = [[], []];
    private handBones: Array<Array<RenderEntity>> = [[], []];

    constructor() {
        super();

        for (let hi = 0; hi < 2; hi++) {
            for (let i = 0; i < 25; i++) {
                const joint = loadSolid("cube");
                joint.entityData.set("hand", this.handNames[hi]);
                joint.entityData.set("joint", JOINT_NAMES[i]);
                useAlbedo(joint, [.7, .7, 1, 1]);
                useFlag(joint, "lighting");
                this.handJoints[hi][i] = joint;
                this.addChildEntity(joint);
            }
            
            for (let i = 0; i < 24; i++) {
                const bone = loadSolid("cube");
                useAlbedo(bone, [1, .7, .7, 1]);
                useFlag(bone, "lighting");
                this.handBones[hi][i] = bone;
                this.addChildEntity(bone);
            }
        }
    }
    
    public updateEntity(dt: number): void {
        this.updateHands();
        super.updateEntity(dt);
    }

    public updateHands(): void {
        const scene = getScene();
        const frameany = enforceDefined(scene.frame) as any;
        for (const inputSource of scene.xrsession.inputSources) {
            if (inputSource.hand) {
                const handany = inputSource.hand as any;
                const handIndex = this.handNames.indexOf(inputSource.handedness);
                if (handIndex === -1)
                    throw new Error(`Unrecognized handedness: ${inputSource.handedness}`);
                
                frameany.fillPoses(handany.values(), scene.referenceSpace, this.handPoses[handIndex]);
                frameany.fillJointRadii(handany.values(), this.handRadii[handIndex]);

                
                for (let i = 0; i < 25; i++) {
                    const joint = this.handJoints[handIndex][i];
                    const transform = new MatTransform();
                    joint.transform = transform;
                    transform.applyScale(Vec3.one.copy().scale(this.handRadii[handIndex][i] * 1.2));
                    transform.applyTransform(new Mat4(Array.from(this.handPoses[handIndex].subarray(i * 16, i * 16 + 16))));
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
                    const bone = this.handBones[handIndex][i];
                    const joint1Loc = Array.from(this.handPoses[handIndex].subarray(joint1 * 16, joint1 * 16 + 16));
                    const joint2Loc = Array.from(this.handPoses[handIndex].subarray(joint2 * 16, joint2 * 16 + 16));
    
                    const m1 = new Mat4(joint1Loc);
                    const m2 = new Mat4(joint2Loc);
                    const p1 = m1.multiplyPt3(Vec3.zero);
                    const p2 = m2.multiplyPt3(Vec3.zero);
                    const rotation = align(Vec3.up, p2.copy().subtract(p1));
    
                    const middlePos = p1.copy().add(p2).scale(.5);
    
                    const transform = new MatTransform();
                    bone.transform = transform;
                    const boneLen = Vec3.distance(p1, p2);
                    const boneWidth = this.handRadii[handIndex][joint1];
                    transform.applyScale(new Vec3([boneWidth, boneLen, boneWidth]));
                    transform.rotate(rotation);
                    transform.translate(middlePos);
                });

            } else {
                throw new Error("No hands :(");
            }
        }
    }
}
