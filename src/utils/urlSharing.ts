import { Node, Edge } from "reactflow";
import { pack, unpack } from "msgpackr";
import { fromByteArray, toByteArray } from "base64-js";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";

interface SharedERDData {
  nodes: Node[];
  edges: Edge[];
  settings?: {
    hideTimestamps?: boolean;
    hideMetaFields?: boolean;
    showFields?: boolean;
  };
}

// Super minimal data structure
interface MinNode {
  i: string; // id
  x: number; // x position
  y: number; // y position
  l: string; // label
  c: string; // compressed columns
}

interface MinEdge {
  s: string; // source
  t: string; // target
}

interface MinData {
  n: MinNode[];
  e: MinEdge[];
  s?: string; // compressed settings
}

function compressColumns(columns: any[]): string {
  // Convert columns to minimal format: name|type|constraints,name|type|constraints,...
  return columns
    .map(
      (col) =>
        `${col.name}|${col.type}${col.constraints ? "|" + col.constraints : ""}`
    )
    .join(",");
}

function decompressColumns(compressed: string): any[] {
  if (!compressed) return [];
  return compressed.split(",").map((col) => {
    const [name, type, constraints] = col.split("|");
    return {
      name,
      type,
      ...(constraints ? { constraints } : {}),
    };
  });
}

// Optimize the data before encoding to reduce size
function optimizeERDData(data: SharedERDData): MinData {
  const optimizedNodes = data.nodes.map((node) => ({
    i: node.id,
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    l: node.data.label,
    c: compressColumns(node.data.columns),
  }));

  const optimizedEdges = data.edges.map((edge) => ({
    s: edge.source,
    t: edge.target,
  }));

  // Only include settings if they differ from defaults
  const defaultSettings = {
    hideTimestamps: false,
    hideMetaFields: false,
    showFields: true,
  };
  const settingsStr =
    data.settings &&
    (data.settings.hideTimestamps !== defaultSettings.hideTimestamps ||
      data.settings.hideMetaFields !== defaultSettings.hideMetaFields ||
      data.settings.showFields !== defaultSettings.showFields)
      ? JSON.stringify({
          ht: data.settings.hideTimestamps,
          hm: data.settings.hideMetaFields,
          sf: data.settings.showFields,
        })
      : undefined;

  return {
    n: optimizedNodes,
    e: optimizedEdges,
    ...(settingsStr ? { s: settingsStr } : {}),
  };
}

// Restore the optimized data to its original format
function restoreERDData(optimized: MinData): SharedERDData {
  const nodes = optimized.n.map((node) => ({
    id: node.i,
    position: { x: node.x, y: node.y },
    type: "tableNode",
    data: {
      label: node.l,
      columns: decompressColumns(node.c),
    },
  }));

  const edges = optimized.e.map((edge) => ({
    id: `${edge.s}-${edge.t}`,
    source: edge.s,
    target: edge.t,
    type: "default",
    markerEnd: { type: "arrow" },
  }));

  const settings = optimized.s ? JSON.parse(optimized.s) : undefined;

  return {
    nodes,
    edges,
    ...(settings
      ? {
          settings: {
            hideTimestamps: settings.ht,
            hideMetaFields: settings.hm,
            showFields: settings.sf,
          },
        }
      : {}),
  };
}

export function encodeERDData(data: SharedERDData): string {
  try {
    // First optimize the data structure to minimal form
    const optimized = optimizeERDData(data);

    // Convert to string and super-compress with LZ compression
    const packed = pack(optimized);
    const base64 = fromByteArray(packed);
    const compressed = compressToUTF16(base64);

    // Make URL safe
    return encodeURIComponent(compressed);
  } catch (error) {
    console.error("Failed to encode ERD data:", error);
    throw new Error(
      "Failed to create shareable link. The diagram might be too large."
    );
  }
}

export function decodeERDData(encoded: string): SharedERDData | null {
  try {
    // Decode and decompress
    const compressed = decodeURIComponent(encoded);
    const base64 = decompressFromUTF16(compressed);
    if (!base64) return null;

    const binary = toByteArray(base64);
    const optimized = unpack(binary) as MinData;

    return restoreERDData(optimized);
  } catch (error) {
    console.error("Failed to decode ERD data:", error);
    return null;
  }
}
