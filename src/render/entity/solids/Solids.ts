import { enforceDefined } from "../../../utils/Utils";
import { RenderEntity } from "../common/RenderEntity";
import CUBE from "./data/Cube.json";

const SOLIDS_ARR = [CUBE];
const SOLIDS_MAP = new Map<string, Solid>(SOLIDS_ARR.map(s => [s.name.toLowerCase(), s]));

type Solid = {
    name: string,
    indices: number[][],
    vertices: number[][], 
    normals?: number[][]
};

export const loadSolid = (name: string, options?: any): RenderEntity => {
    if (SOLIDS_MAP.has(name)) {
        const solid = enforceDefined(SOLIDS_MAP.get(name));
        const entity = new RenderEntity();
        entity.entityData.set("indices", new Uint32Array(solid.indices.flat()));
        entity.entityData.set("vertices", new Float32Array(solid.vertices.flat()));
        if (solid.normals)
            entity.entityData.set("normals", new Float32Array(solid.normals.flat()));
        return entity;
    } else if (name === "cylinder") {
        return loadCylinder(options);
    } else
        throw new Error(`Solid ${name} not found`);
};


const loadCylinder = (options: any): RenderEntity => {
    enforceDefined(options);
    const segments = enforceDefined(options.segments);
    
    throw new Error("Not implemented");
};