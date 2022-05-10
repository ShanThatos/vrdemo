import { enforceDefined } from "../../../utils/Utils";
import { RenderEntity } from "../common/RenderEntity";

export const loadCylinder = (options: any): RenderEntity => {
    enforceDefined(options);
    const radius = enforceDefined<number>(options.radius);
    const height = enforceDefined<number>(options.height);
    const segments = enforceDefined<number>(options.segments);

    const indices = [];
    const vertices = [];
    const normals = [];


    // Bottom face
    for (let i = 0; i < segments; i++) {
        const angle = i / segments * Math.PI * 2.0;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        vertices.push([x, -height / 2.0, z]);
        normals.push([0, -1, 0]);
    }

    // top face verts
    for (let i = 0; i < segments; i++) {
        const angle = i / segments * Math.PI * 2.0;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        vertices.push([x, height / 2.0, z]);
        normals.push([0, 1, 0]);
    }

    // cap centers
    const bottomCenter = vertices.length;
    vertices.push([0, -height / 2.0, 0]);
    normals.push([0, -1, 0]);
    const topCenter = vertices.length;
    vertices.push([0, height / 2.0, 0]);
    normals.push([0, 1, 0]);

    // Bottom face
    for (let i = 0; i < segments; i++) {
        const angle = i / segments * Math.PI * 2.0;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        vertices.push([x, -height / 2.0, z]);
        normals.push([x, 0, z]);
    }

    // top face verts
    for (let i = 0; i < segments; i++) {
        const angle = i / segments * Math.PI * 2.0;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        vertices.push([x, height / 2.0, z]);
        normals.push([x, 0, z]);
    }
    
    // bottom face indices
    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        indices.push([i, next, bottomCenter]);
    }
    // top face indices
    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        indices.push([i + segments, topCenter, next + segments]);
    }
    
    // sides
    for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        indices.push([i + 2 * (segments + 1), i + segments + 2 * (segments + 1), next + 2 * (segments + 1)]);
        indices.push([next + segments + 2 * (segments + 1), next + 2 * (segments + 1), i + segments + 2 * (segments + 1)]);
    }

    const entity = new RenderEntity();
    entity.entityData.set("indices", new Uint32Array(indices.flat()));
    entity.entityData.set("vertices", new Float32Array(vertices.flat()));
    entity.entityData.set("normals", new Float32Array(normals.flat()));
    return entity;
};