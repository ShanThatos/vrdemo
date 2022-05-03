import { Quat, Vec3 } from "../../../lib/TSM";
import { Entity } from "./Entity";

type AnimateFunction = (e: Entity, time: number, dt: number) => void;

export const animateEntity = (entity: Entity, animateFunction: AnimateFunction): Entity => {
    const originalUpdateEntity = entity.updateEntity;
    entity.updateEntity = (dt: number) => {
        animateFunction(entity, Entity.currentTime, dt);
        originalUpdateEntity.call(entity, dt);
    };
    return entity;
};

export const simpleRotationAnimation = ({v = Vec3.up, speed = 1} = {}) => {
    return (entity: Entity, _time: number, dt: number) => {
        entity.transform.rotate(Quat.fromAxisAngle(v, speed * dt));
    };
};