import { Mat4 } from "../../../lib/TSM";
import { Nullable } from "../../utils/Types";
import type { BaseEntity } from "./common/BaseEntity";
import { MatTransform, Transform } from "./Transform";

export class Entity {

    public static extVAO: OES_vertex_array_object;
    public static projectionMatrix: Float32Array = new Float32Array(Mat4.identity.all());
    public static viewMatrix: Float32Array = new Float32Array(Mat4.identity.all());
    public static viewPos: Float32Array = new Float32Array([0, 0, 0]);
    private static entityIdCounter = 0;

    public readonly id: number = Entity.entityIdCounter++;
    
    private parentEntity: Nullable<Entity> = null;
    private _globalTransform: Mat4 = Mat4.identity.copy();
    private _relativeTransform: Transform = new Transform();
    public _needToUpdateTransform = false;

    public childEntities: Entity[] = [];

    public entityData: Map<string, any> = new Map<string, any>();

    constructor() {
        this._relativeTransform.bindOnChange(() => this._needToUpdateTransform = true);
    }

    public setup(gl: RenderingContext): void {
        this.childEntities.forEach(e => e.setup(gl));
    }

    public updateEntity(dt: number): void {
        if (this._needToUpdateTransform)
            this.updateTransforms();
        this.childEntities.forEach(e => e.updateEntity(dt));
    }

    public render(): void {
        this.childEntities.forEach(e => e.render());
    }

    public getBaseEntity(): BaseEntity {
        if (this.entityData.get("isBaseEntity"))
            return this as any as BaseEntity;
        if (this.parentEntity)
            return this.parentEntity.getBaseEntity();
        throw new Error("No base entity found");
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

    public updateTransforms(): void {
        const parentTransform = this.parentEntity ? this.parentEntity.globalTransform.copy() : Mat4.identity.copy();
        this._globalTransform = parentTransform.multiply(this._relativeTransform.getTransformMatrix());
        this._needToUpdateTransform = false;
        this.childEntities.forEach(e => e.updateTransforms());
    }

    public useMatrixTransform(): MatTransform {
        const mat = new MatTransform();
        this.transform = mat;
        return mat;
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