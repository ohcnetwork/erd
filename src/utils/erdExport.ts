import { Node, Edge } from "reactflow";

export interface ERDData {
  nodes: Node[];
  edges: Edge[];
  settings?: {
    hideTimestamps?: boolean;
    hideMetaFields?: boolean;
    showFields?: boolean;
  };
  metadata?: {
    name?: string;
    description?: string;
    exportedAt: number;
    version: string;
  };
}

export function exportToJSON(data: ERDData): string {
  const exportData: ERDData = {
    ...data,
    metadata: {
      exportedAt: Date.now(),
      version: "1.0",
      name: data.metadata?.name,
      description: data.metadata?.description,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

export function downloadAsJSON(
  data: ERDData,
  filename: string = "erd-diagram"
): void {
  const json = exportToJSON(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromJSON(jsonString: string): ERDData | null {
  try {
    const data = JSON.parse(jsonString) as ERDData;

    // Validate the imported data
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      throw new Error("Invalid ERD data: missing nodes or edges");
    }

    // Ensure all required node properties exist
    data.nodes.forEach((node) => {
      if (
        !node.id ||
        !node.position ||
        !node.data?.label ||
        !Array.isArray(node.data.columns)
      ) {
        throw new Error("Invalid node data structure");
      }
    });

    // Ensure all required edge properties exist
    data.edges.forEach((edge) => {
      if (!edge.id || !edge.source || !edge.target) {
        throw new Error("Invalid edge data structure");
      }
    });

    return {
      nodes: data.nodes,
      edges: data.edges,
      settings: data.settings,
      metadata: {
        ...data.metadata,
        importedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Failed to import ERD data:", error);
    return null;
  }
}
