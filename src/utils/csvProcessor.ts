import { CSVRow, TableInfo, ColumnInfo } from "../types";
import { Node, Edge, MarkerType } from "reactflow";

function groupByTable(data: string[][]): TableInfo[] {
  // Skip header row
  const rows = data.slice(1);
  const tableMap = new Map<string, TableInfo>();

  rows.forEach((row) => {
    // Ensure we have all required columns
    if (row.length < 9) return;

    const [
      tableName,
      columnName,
      position,
      dataType,
      maxLength,
      constraintType,
      refTableSchema,
      refTableName,
      refColumnName,
    ] = row;

    // Skip empty rows or invalid data
    if (!tableName || !columnName) return;

    if (!tableMap.has(tableName)) {
      tableMap.set(tableName, {
        table_name: tableName,
        table_schema: "public",
        columns: [],
      });
    }

    const table = tableMap.get(tableName)!;
    table.columns.push({
      column_name: columnName,
      data_type: dataType,
      constraint_type: constraintType,
      ref_table_schema: refTableSchema,
      ref_table_name: refTableName,
      ref_column_name: refColumnName,
    });
  });

  return Array.from(tableMap.values());
}

function layoutNodes(tables: TableInfo[]): Node[] {
  const HORIZONTAL_SPACING = 500; // Increased from 300
  const VERTICAL_SPACING = 400; // Increased from 250
  const NODES_PER_ROW = 3;

  return tables.map((table, index) => {
    const row = Math.floor(index / NODES_PER_ROW);
    const col = index % NODES_PER_ROW;

    const x = col * HORIZONTAL_SPACING + 100; // Added offset
    const y = row * VERTICAL_SPACING + 100; // Added offset

    return {
      id: table.table_name,
      type: "tableNode",
      position: { x, y },
      data: {
        label: table.table_name,
        columns: table.columns.map((col) => ({
          name: col.column_name,
          type: col.data_type,
          constraints: col.constraint_type,
          cardinality: col.ref_table_name ? "n:1" : undefined,
        })),
      },
    };
  });
}

function createEdges(tables: TableInfo[]): Edge[] {
  const edges: Edge[] = [];
  const processedEdges = new Set<string>();

  tables.forEach((table) => {
    table.columns.forEach((column) => {
      if (column.ref_table_name) {
        const edgeId = `${table.table_name}-${column.ref_table_name}`;
        const reverseEdgeId = `${column.ref_table_name}-${table.table_name}`;

        if (!processedEdges.has(edgeId) && !processedEdges.has(reverseEdgeId)) {
          edges.push({
            id: `${table.table_name}-${column.ref_table_name}`,
            source: table.table_name,
            target: column.ref_table_name,
            type: "smoothstep",
            style: {
              stroke: "#94a3b8",
              strokeWidth: 2,
              opacity: 0.8,
            },
            markerEnd: {
              type: MarkerType.Arrow,
              color: "#94a3b8",
              width: 20,
              height: 20,
            },
            label: `${column.column_name}`,
            labelStyle: {
              fill: "#94a3b8",
              fontWeight: 500,
              fontSize: 12,
            },
          });

          processedEdges.add(edgeId);
        }
      }
    });
  });

  return edges;
}

export function processCSVData(data: string[][]) {
  // Validate data
  if (!Array.isArray(data) || data.length < 2) {
    console.error("Invalid CSV data format");
    return { nodes: [], edges: [] };
  }

  try {
    const tables = groupByTable(data);
    const nodes = layoutNodes(tables);
    const edges = createEdges(tables);
    return { nodes, edges };
  } catch (error) {
    console.error("Error processing CSV data:", error);
    return { nodes: [], edges: [] };
  }
}
