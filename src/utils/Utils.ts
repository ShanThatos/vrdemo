

export const vec3ToString = (v: { x: number, y: number, z: number }) => {
    return `(${v.x}, ${v.y}, ${v.z})`;
};

export const enforceDefined = <T>(value: T | undefined | null): T => {
    if (value === undefined || value === null)
        throw new Error("Value is undefined or null");
    return value;
};