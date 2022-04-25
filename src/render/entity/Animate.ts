import { Nullable } from "../../utils/Types";
import { Entity } from "./Entity";


export class AnimatedEntity extends Entity {

    private _animateFunction: Nullable<AnimateFunction> = null;

    public get animateFunction(): Nullable<AnimateFunction> { return this._animateFunction; }
    public set animateFunction(value: Nullable<AnimateFunction>) { this._animateFunction = value; }

    public updateEntity(dt: number): void {
        if (this.animateFunction !== null)
            this.animateFunction(this, dt);
        super.updateEntity(dt);
    }
}

type AnimateFunction = (ae: AnimatedEntity, dt: number) => void;