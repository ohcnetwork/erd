import { Node, Edge } from "reactflow";

export type CSVRow = string[];

export interface ColumnInfo {
  column_name: string;
  data_type: string;
  constraint_type: string | null;
  ref_table_schema: string | null;
  ref_table_name: string | null;
  ref_column_name: string | null;
}

export interface TableInfo {
  table_name: string;
  table_schema: string;
  columns: ColumnInfo[];
}

export interface TableSettings {
  hideTimestamps: boolean;
  hideMetaFields: boolean;
  showFields: boolean; // Global setting to show/hide fields
}

export interface ERDView {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  starred: boolean;
  settings: TableSettings;
  data: {
    nodes: Node[];
    edges: Edge[];
    hidePrefix: string[];
    filter: string;
  };
}
