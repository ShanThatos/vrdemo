import { Quat, Vec3 } from "../../../../../lib/TSM";
import { Entity } from "../../Entity";
import { loadSolid } from "../../solids/Solids";
import { Hands } from "../hands/Hands";
import { RenderEntity, useAlbedo } from "../RenderEntity";
import { Piano as ToneJSPiano } from "@tonejs/piano";
import { Nullable } from "../../../../utils/Types";
import { enforceDefined } from "../../../../utils/Utils";
import { JOINT_NAMES } from "../hands/HandUtils";


export class Piano extends Entity {
    
    public static tonejsPiano: Nullable<ToneJSPiano> = null;
    public static currentKeys = new Set<string>();

    private lowOctave = 1;
    private highOctave = 6;
    private numKeysPerOctave = 7;
    private keysContainer = new Entity();
    private whiteKeys: Array<PianoWhiteKey> = [];
    private blackKeys: Array<PianoBlackKey> = [];

    public keyX = .033; // width of the piano keys
    public keyZ = 0.15; // length of the piano keys
    public keyY = 0.02;
    public bodyXOffset = 0.033;
    public bottomY = 0.04;
    public bottomZOffset = 0.05;
    public backY = 0.10;
    public backZ = 0.033;
    public sideX = 0.033;
    public sideY = 0.07;

    constructor() {
        super();
        this.keysContainer.transform.translate(new Vec3([0, 0, -5 * .03 / 2]));

        const whiteKeyNames = ["C", "D", "E", "F", "G", "A", "B"];
        const BLACK_KEY_WI = [0, 1, 3, 4, 5];
        const numOctaves = this.highOctave - this.lowOctave + 1;
        for (let octave = this.lowOctave, i = 0; octave <= this.highOctave; octave++) {
            for (let wi = 0; wi < this.numKeysPerOctave; wi++, i++) {
                const x = (((i + 0.5) / (numOctaves * this.numKeysPerOctave)) - 0.5) * (this.keyX * numOctaves * this.numKeysPerOctave);

                const wkey = new PianoWhiteKey(whiteKeyNames[wi] + octave);
                wkey.transform.applyScale(Vec3.one.copy().scale(.03));
                wkey.transform.translate(new Vec3([x, 0, 0]));
                this.whiteKeys.push(wkey);
                this.keysContainer.addChildEntity(wkey);

                if (BLACK_KEY_WI.includes(wi)) {
                    const bkey = new PianoBlackKey(whiteKeyNames[wi] + "#" + octave);
                    bkey.transform.applyScale(new Vec3([.02, .02, .025]));
                    bkey.transform.translate(new Vec3([x + .015, .015, 0]));
                    this.blackKeys.push(bkey);
                    this.keysContainer.addChildEntity(bkey);
                }
            }
        }

        this.addChildEntity(this.keysContainer);

        const bodyX = this.sideX * 2.0 + (this.keyX * numOctaves * this.numKeysPerOctave);

        const bottom = loadSolid("cube");
        useAlbedo(bottom, [0.0, 0.0, 0.0, 1.0]);
        bottom.transform.applyScale(new Vec3([bodyX, this.bottomY, this.keyZ + this.bottomZOffset]));
        bottom.transform.translate(new Vec3([0, (- this.keyY - this.bottomY) / 2.0 , 0]));
        this.addChildEntity(bottom);

        const back = loadSolid("cube");
        useAlbedo(back, [0.0, 0.0, 0.0, 1.0]);
        back.transform.applyScale(new Vec3([bodyX, this.backY, this.backZ]));
        back.transform.translate(new Vec3([0, (- this.keyY) / 2.0 - this.bottomY + this.backY / 2.0, -this.keyZ / 2.0 - this.backZ / 2.0]));
        this.addChildEntity(back);
        
        // Left side
        const left = loadSolid("cube");
        useAlbedo(left, [0.0, 0.0, 0.0, 1.0]);
        left.transform.applyScale(new Vec3([this.sideX, this.sideY, this.keyZ + this.bottomZOffset]));
        left.transform.translate(new Vec3([-bodyX / 2.0 + this.sideX / 2.0, (- this.keyY) / 2.0 - this.bottomY + this.sideY / 2.0, 0]));
        this.addChildEntity(left);

        // Right side
        const right = loadSolid("cube");
        useAlbedo(right, [0.0, 0.0, 0.0, 1.0]);
        right.transform.applyScale(new Vec3([this.sideX, this.sideY, this.keyZ + this.bottomZOffset]));
        right.transform.translate(new Vec3([bodyX / 2.0 - this.sideX / 2.0, (- this.keyY) / 2.0 - this.bottomY + this.sideY / 2.0, 0]));
        this.addChildEntity(right);

    }
}

export class PianoKey extends Entity {

    private keyName: string;
    protected keyBase!: RenderEntity;

    constructor(keyName: string) {
        super();
        this.keyName = keyName;
    }

    private minX = 0;
    private maxX = 0;
    private minY = 0;
    private maxY = 0;
    private minZ = 0;
    private maxZ = 0;
    private computedBounds = false;
    public updateEntity(dt: number): void {
        super.updateEntity(dt);

        if (!this.computedBounds) {
            this.computedBounds = true;
            const verts = this.keyBase.entityData.get("vertices");
            for (let i = 0; i < verts.length / 3; i++) {
                const x = verts[i * 3];
                const y = verts[i * 3 + 1];
                const z = verts[i * 3 + 2];

                const wp = this.keyBase.globalTransform.multiplyPt3(new Vec3([x, y, z]));

                if (i == 0) {
                    this.minX = this.maxX = wp.x;
                    this.minY = this.maxY = wp.y;
                    this.minZ = this.maxZ = wp.z;
                }
                this.minX = Math.min(this.minX, wp.x);
                this.maxX = Math.max(this.maxX, wp.x);
                this.minY = Math.min(this.minY, wp.y);
                this.maxY = Math.max(this.maxY, wp.y);
                this.minZ = Math.min(this.minZ, wp.z);
                this.maxZ = Math.max(this.maxZ, wp.z);
            }
        }

        if (Hands.globalHandsEntity) {
            const piano = enforceDefined(Piano.tonejsPiano);
            const hands = Hands.globalHandsEntity;
            let playKey = false;
            for (const hand of ["left", "right"]) {
                for (const joint of JOINT_NAMES) {
                    if (!joint.endsWith("tip")) continue;
                    
                    const fingerTip = hands.getJointPosition(hand as ("left" | "right"), joint);
                    const [fx, fy, fz] = fingerTip.xyz;

                    if (fx >= this.minX && fx <= this.maxX && fy >= this.minY && fy <= this.maxY && fz >= this.minZ && fz <= this.maxZ) {
                        playKey = true;
                    }
                }
            }

            if (playKey !== Piano.currentKeys.has(this.keyName)) {
                if (playKey) {
                    Piano.currentKeys.add(this.keyName);
                    piano.keyDown({ note: this.keyName});
                    this._onKeyDown();
                } else {
                    Piano.currentKeys.delete(this.keyName);
                    piano.keyUp({ note: this.keyName, time: "+1" });
                    this._onKeyUp();
                }
            }
        }
        this.updateAngle(dt);
    }

    private currentAngle = 0;
    private maxAngle = 5;
    private speed = 100;
    private updateAngle(dt: number): void {
        if (Piano.currentKeys.has(this.keyName)) {
            const newAngle = Math.min(this.currentAngle + this.speed * dt, this.maxAngle);
            if (newAngle !== this.currentAngle) {
                this.currentAngle = newAngle;
                this.transform.rotation = Quat.fromAxisAngle(Vec3.right, this.currentAngle / 180 * Math.PI);
            }
        } else {
            const newAngle = Math.max(this.currentAngle - this.speed * dt, 0);
            if (newAngle !== this.currentAngle) {
                this.currentAngle = newAngle;
                this.transform.rotation = Quat.fromAxisAngle(Vec3.right, this.currentAngle / 180 * Math.PI);
            }
        }
    }

    public _onKeyDown(): void {
        // 
    }

    public _onKeyUp(): void {
        // 
    }
}

export class PianoWhiteKey extends PianoKey {
    private keyTop: RenderEntity;

    constructor(keyName: string) {
        super(keyName);

        this.keyBase = loadSolid("cube");
        this.keyTop = loadSolid("cube");
        const keyBase = this.keyBase;
        const keyTop = this.keyTop;

        keyBase.useMatrixTransform();
        keyTop.useMatrixTransform();

        const keyLength = 5;
        keyBase.transform.applyScale((new Vec3([1, 1, keyLength])));
        keyBase.transform.translate(new Vec3([0, 0, keyLength / 2]));
        keyTop.transform.applyScale((new Vec3([1.05, 0.02, keyLength + .05])));
        keyTop.transform.translate((new Vec3([0, 0.5, keyLength / 2])));

        useAlbedo(keyTop, [1, 1, 1, 1]);
        this.addChildEntity(keyTop);

        useAlbedo(keyBase, [.3, .3, .3, 1]);
        this.addChildEntity(keyBase);
    }

    public _onKeyDown(): void {
        super._onKeyDown();
        useAlbedo(this.keyBase, [.3, .3, .7, 1]);
        useAlbedo(this.keyTop, [.7, .7, 1, 1]);
    }

    public _onKeyUp(): void {
        super._onKeyUp();
        useAlbedo(this.keyBase, [.3, .3, .3, 1]);
        useAlbedo(this.keyTop, [1, 1, 1, 1]);
    }
}

export class PianoBlackKey extends PianoKey {

    constructor(keyName: string) {
        super(keyName);

        this.keyBase = loadSolid("cube");
        const keyBase = this.keyBase;

        keyBase.useMatrixTransform();
        
        const keyLength = 4;
        keyBase.transform.applyScale((new Vec3([1, .8, keyLength])));
        keyBase.transform.translate(new Vec3([0, 0, keyLength / 2]));

        useAlbedo(keyBase, [.1, .1, .1, 1]);
        this.addChildEntity(keyBase);
    }

    public _onKeyDown(): void {
        super._onKeyDown();
        useAlbedo(this.keyBase, [.3, .3, .7, 1]);
    }

    public _onKeyUp(): void {
        super._onKeyUp();
        useAlbedo(this.keyBase, [.1, .1, .1, 1]);
    }
}