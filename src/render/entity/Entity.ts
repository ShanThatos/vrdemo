import { Mat4 } from "../../../lib/TSM";
import { Nullable } from "../../utils/Types";
import { Transform } from "./Transform";

export class Entity {

    public static extVAO: OES_vertex_array_object;
    public static projectionMatrix: Float32Array = new Float32Array(Mat4.identity.all());
    public static viewMatrix: Float32Array = new Float32Array(Mat4.identity.all());
    public static currentTime: number;
    private static entityIdCounter = 0;

    public readonly id: number = Entity.entityIdCounter++;
    
    private parentEntity: Nullable<Entity> = null;
    private _globalTransform: Mat4 = Mat4.identity.copy();
    private _relativeTransform: Transform = new Transform();
    private _needToUpdateTransform = false;

    private childEntities: Entity[] = [];

    // public entityData: Map<string, any> = new Map<string, any>();

    constructor() {
        this._relativeTransform.bindOnChange(() => this._needToUpdateTransform = true);
    }

    public updateEntity(dt: number): void {
        if (this._needToUpdateTransform)
            this.updateTransforms();
        this.childEntities.forEach(e => e.updateEntity(dt));
    }

    public render(): void {
        this.renderChildren();
    }
    protected renderChildren(): void {
        this.childEntities.forEach(e => e.render());
    }

    public updateTransforms(): void {
        const transform = this.parentEntity ? this.parentEntity._globalTransform.copy() : Mat4.identity.copy();
        this._globalTransform = transform.multiply(this._relativeTransform.getTransformMatrix());
        this.childEntities.forEach(e => e.updateTransforms());
        this._needToUpdateTransform = false;
    }

    public addChildEntity(entity: Entity): void {
        this.childEntities.push(entity);
        entity.parentEntity = this;
    }
    public removeChildEntityById(id: number, complain = true): Entity | null {
        const index = this.childEntities.findIndex(e => e.id === id);
        if (index === -1) {
            if (complain)
                throw new Error(`Entity with id ${id} not found`);
            return null;
        }
        const entity = this.childEntities[index];
        this.childEntities.splice(index, 1);
        entity.parentEntity = null;
        return entity;
    }
    public removeChildEntity(entity: Entity, complain = true): Entity | null {
        return this.removeChildEntityById(entity.id, complain);
    }

    public get globalTransform(): Mat4 {
        if (this._needToUpdateTransform)
            this.updateTransforms();
        return this._globalTransform.copy();
    }
    public get relativeTransform(): Transform { return this._relativeTransform; }
    public set relativeTransform(value: Transform) {
        this._relativeTransform = value;
        this._relativeTransform.bindOnChange(() => this._needToUpdateTransform = true);
        this._needToUpdateTransform = true;
    }

    public get transform(): Transform { return this.relativeTransform; }
    public set transform(value: Transform) { this.relativeTransform = value; }
}