import { Quat, Vec3 } from "../../lib/TSM";
import type { Scene } from "../Scene";


export const vec3ToString = (v: { x: number, y: number, z: number }) => {
    return `(${v.x}, ${v.y}, ${v.z})`;
};

export const enforceDefined = <T>(value: T | undefined | null): T => {
    if (value === undefined || value === null)
        throw new Error("Value is undefined or null");
    return value;
};

export const align = (from: Vec3, to: Vec3): Quat => {
    const q = new Quat();
    const a = Vec3.cross(from, to);
    q.xyz = a.xyz;
    q.w = Math.sqrt((Math.pow(from.length(), 2)) * (Math.pow(to.length(), 2))) + Vec3.dot(from, to);
    return q.normalize();
};

export const getScene = () => enforceDefined<Scene>((window as any).scene);