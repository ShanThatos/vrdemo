import { Mat4, Quat, Vec3 } from "../../../lib/TSM";
import { EmptyFunction, Nullable } from "../../utils/Types";

export class Transform {
    public static readonly identity = new Transform();

    private _position: Vec3 = Vec3.zero.copy();
    private _scale: Vec3 = Vec3.one.copy();
    private _rotation: Quat = Quat.identity.copy();
    private _onChange: Nullable<EmptyFunction> = null;

    public bindOnChange(callback: EmptyFunction) {
        this._onChange = callback;
    }

    protected tryOnChange() {
        if (this._onChange !== null)
            this._onChange();
    }

    public getTransformMatrix(): Mat4 {
        const T = Mat4.identity.copy().translate(this._position);
        const R = this._rotation.toMat4();
        const S = Mat4.identity.copy().scale(this._scale);
        return T.multiply(R).multiply(S);
    }

    public get position() { return this._position.copy(); }
    public set position(value: Vec3) {
        this._position = value.copy();
        this.tryOnChange();
    }
    public get scale() { return this._scale.copy(); }
    public set scale(value: Vec3) {
        this._scale = value.copy();
        this.tryOnChange();
    }
    public get rotation() { return this._rotation.copy(); }
    public set rotation(value: Quat) {
        this._rotation = value.copy();
        this.tryOnChange();
    }

    public translate(v: Vec3) {
        this._position.add(v);
        this.tryOnChange();
    }
    public rotate(q: Quat) {
        this.rotation = q.copy().multiply(this.rotation);
    }
    public applyScale(v: Vec3) {
        this._scale.multiply(v);
        this.tryOnChange();
    }

    public copy(): Transform {
        const result = new Transform();
        result.position = this.position.copy();
        result.scale = this.scale.copy();
        result.rotation = this.rotation.copy();
        return result;
    }

    public static interpolate(a: Transform, b: Transform, t: number): Transform {
        const result = new Transform();
        result.position = Vec3.lerp(a.position, b.position, t);
        result.scale = Vec3.lerp(a.scale, b.scale, t);
        result.rotation = Quat.slerp(a.rotation, b.rotation, t);
        return result;
    }
}

// This is terrible OOP but basically this class just ignores the components of the parent entity
export class MatTransform extends Transform {
    private _matrix: Mat4 = Mat4.identity.copy();

    public get matrix() { return this._matrix.copy(); }
    public set matrix(value: Mat4) {
        this._matrix = value.copy();
        this.tryOnChange();
    }

    public getTransformMatrix(): Mat4 {
        return this._matrix.copy();
    }


    public get position() { throw new Error("uh oh1"); }
    public set position(_value: Vec3) { throw new Error("uh oh2"); }
    public get scale() { throw new Error("uh oh3"); }
    public set scale(_value: Vec3) { throw new Error("uh oh4"); }
    public get rotation() { throw new Error("uh oh5"); }
    public set rotation(_value: Quat) { throw new Error("uh oh6"); }

    public translate(v: Vec3) {
        this._matrix = Mat4.identity.copy().translate(v).multiply(this._matrix);
        this.tryOnChange();
    }
    public rotate(q: Quat) {
        this._matrix = q.toMat4().multiply(this._matrix);
        this.tryOnChange();
    }
    public applyScale(v: Vec3) {
        this._matrix = Mat4.identity.copy().scale(v).multiply(this._matrix);
        this.tryOnChange();
    }
    public applyTransform(m: Mat4) {
        this._matrix = m.copy().multiply(this._matrix);
    }

    public copy(): Transform {
        const result = new MatTransform();
        result.matrix = this._matrix.copy();
        return result;
    }
}