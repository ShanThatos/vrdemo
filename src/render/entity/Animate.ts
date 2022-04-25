import { Entity } from "./Entity";

type AnimateFunction = (e: Entity, dt: number) => void;

export const animateEntity = (entity: Entity, animateFunction: AnimateFunction): Entity => {
    const originalUpdateEntity = entity.updateEntity;
    entity.updateEntity = (dt: number) => {
        animateFunction(entity, dt);
        originalUpdateEntity.call(entity, dt);
    };
    return entity;
};