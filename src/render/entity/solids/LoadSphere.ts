import { Vec3 } from "../../../../lib/TSM";
import { enforceDefined } from "../../../utils/Utils";
import { RenderEntity } from "../common/RenderEntity";

export const loadSphere = (options: any): RenderEntity => {
    if (!options) options = { segments: 5 };
    enforceDefined(options);
    const segments = enforceDefined<number>(options.segments);

    const indices: Array<Array<number>> = [];
    const vertices: Array<Array<number>> = [];
    const normals: Array<Array<number>> = [];


    const allFaces = [
        (s: number, i: number, j: number) => [i, s, j],     // top
        (s: number, i: number, j: number) => [-i, -s, j],   // bottom
        (s: number, i: number, j: number) => [s, -i, j],
        (s: number, i: number, j: number) => [-s, i, j],
        (s: number, i: number, j: number) => [-i, j, s],
        (s: number, i: number, j: number) => [i, j, -s],
    ];

    allFaces.forEach(side => {
        const ind = vertices.length;
        for (let i = -segments; i <= segments; i++) {
            for (let j = -segments; j <= segments; j++) {
                const x = side(segments, i, j);
                const cubeLoc = new Vec3([x[0], x[1], x[2]]);
                cubeLoc.normalize();
                const vert = cubeLoc.copy().scale(.5);
                vertices.push(vert.xyz);
                normals.push(cubeLoc.xyz);
            }
        }
        for (let i = -segments; i < segments; i++) {
            for (let j = -segments; j < segments; j++) {
                const ind1 = ind + (i + segments) * (2 * segments + 1) + (j + segments);
                const ind2 = ind + (i + segments) * (2 * segments + 1) + ((j + 1) + segments);
                const ind3 = ind + ((i + 1) + segments) * (2 * segments + 1) + (j + segments);
                const ind4 = ind + ((i + 1) + segments) * (2 * segments + 1) + ((j + 1) + segments);
                indices.push([ind1, ind2, ind3]);
                indices.push([ind4, ind3, ind2]);
            }
        }
    });

    const entity = new RenderEntity();
    entity.entityData.set("indices", new Uint32Array(indices.flat()));
    entity.entityData.set("vertices", new Float32Array(vertices.flat()));
    entity.entityData.set("normals", new Float32Array(normals.flat()));
    return entity;
};