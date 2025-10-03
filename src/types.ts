import { Node, Edge } from "reactflow";

export type CSVRow = string[];

export enum DiagramType {
  ERD = "erd",
  ARCHITECTURE = "architecture"
}

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

export interface ArchitectureSettings {
  showDescriptions: boolean;
  showIcons: boolean;
}

export interface ERDView {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  starred: boolean;
  type: DiagramType.ERD;
  settings: TableSettings;
  data: {
    nodes: Node[];
    edges: Edge[];
    hidePrefix: string[];
    filter: string;
  };
}

export interface ArchitectureView {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  starred: boolean;
  type: DiagramType.ARCHITECTURE;
  settings: ArchitectureSettings;
  data: {
    nodes: Node[];
    edges: Edge[];
    filter: string;
  };
}

export type DiagramView = ERDView | ArchitectureView;
