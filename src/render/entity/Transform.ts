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

    private tryOnChange() {
        if (this._onChange !== null)
            this._onChange();
    }

    public getTransformMatrix(): Mat4 {
        const T = Mat4.identity.copy().translate(this.position);
        const R = this.rotation.toMat4();
        const S = Mat4.identity.copy().scale(this.scale);
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
    public rotate(q: Quat) {
        this.rotation = q.copy().multiply(this.rotation);
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