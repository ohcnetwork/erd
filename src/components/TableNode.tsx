import React, { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import { useERDState } from "@/hooks/useERDState";
import { Edit2 } from "lucide-react";
import { TableEditor, TableEditorData } from "./TableEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ColumnProps {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

const Column = memo(
  ({ name, type, isPrimaryKey, isForeignKey }: ColumnProps) => (
    <div className="px-3 py-2 border-b last:border-b-0 border-gray-200 flex justify-between items-center hover:bg-gray-50">
      <span className="flex items-center gap-2">
        {isPrimaryKey && (
          <span
            className="text-yellow-500 text-sm font-mono"
            title="Primary Key"
          >
            PK
          </span>
        )}
        {isForeignKey && (
          <span className="text-blue-500 text-sm font-mono" title="Foreign Key">
            FK
          </span>
        )}
        <span
          className={`font-medium ${
            isPrimaryKey
              ? "text-yellow-700"
              : isForeignKey
              ? "text-blue-700"
              : ""
          }`}
        >
          {name}
        </span>
      </span>
      <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
        {type}
      </span>
    </div>
  )
);

Column.displayName = "Column";

interface TableData {
  name: string;
  label: string;
  displayName?: string;
  description?: string;
  color?: string;
  columns: {
    name: string;
    type: string;
    constraints?: string;
    cardinality?: string;
  }[];
}

interface TableNodeProps {
  data: TableData;
  id: string;
  onViewUpdate?: (view: any) => void;
}

export const TableNode = memo(({ data, id, onViewUpdate }: TableNodeProps) => {
  const { currentView, updateView } = useERDState();
  const showFields = currentView?.settings?.showFields;
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<TableEditorData>({
    name: data.name || data.label || "",
    displayName: data.displayName || data.name || data.label || "",
    description: data.description || "",
    color: data.color || "#2563eb",
    columns: data.columns.map((col) => ({
      name: col.name || "",
      type: col.type || "",
      isPrimaryKey: col.constraints?.includes("PRIMARY KEY") || false,
    })),
  });

  const handleSave = () => {
    if (!currentView) {
      console.log("[TableNode] No current view found");
      return;
    }

    console.log("[TableNode] Starting save with editData:", editData);
    console.log("[TableNode] Current view nodes:", currentView.data.nodes);

    // Create updated node with new data
    const updatedNodes = currentView.data.nodes.map((node) => {
      if (node.id === id) {
        console.log("[TableNode] Found node to update:", node);
        // Create a completely new node object to force React Flow to update
        const updatedNode = {
          id: node.id,
          type: "tableNode",
          position: { ...node.position }, // Create new position reference
          data: {
            name: editData.name,
            label: editData.name,
            displayName: editData.displayName,
            description: editData.description,
            color: editData.color,
            columns: editData.columns.map((col) => ({
              name: col.name,
              type: col.type,
              constraints: col.isPrimaryKey ? "PRIMARY KEY" : undefined,
            })),
          },
        };
        console.log("[TableNode] Created updated node:", updatedNode);
        return updatedNode;
      }
      return { ...node, data: { ...node.data } }; // Create new references for other nodes too
    });

    console.log("[TableNode] All nodes after update:", updatedNodes);

    // Create updated view with new nodes
    const updatedView = {
      ...currentView,
      updatedAt: Date.now(),
      data: {
        ...currentView.data,
        nodes: updatedNodes,
      },
    };

    console.log("[TableNode] Created updated view:", updatedView);

    // Close dialog and update view
    setIsEditing(false);
    console.log("[TableNode] Dialog closed, about to update view");

    // Update view after a short delay to ensure dialog state is updated
    setTimeout(() => {
      console.log("[TableNode] Calling updateView with data:", updatedView);
      try {
        if (onViewUpdate) {
          console.log("[TableNode] Using onViewUpdate handler");
          onViewUpdate(updatedView);
        } else {
          console.log("[TableNode] Using direct updateView");
          updateView(updatedView);
        }
        console.log("[TableNode] updateView call completed");
      } catch (error) {
        console.error("[TableNode] Error in updateView:", error);
      }
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[400px]">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="border-b border-gray-200 rounded-lg max-w-md">
        <div
          className="cursor-pointer group"
          onClick={() => setIsEditing(true)}
        >
          <div
            className="flex items-center justify-between mb-2 px-4 pt-2 rounded-t-lg"
            style={{ backgroundColor: data.color || "#2563eb" }}
          >
            <h3 className="font-bold text-white text-3xl mb-2">
              {data.displayName || data.name || data.label}
            </h3>
            <Edit2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-gray-900 text-2xl px-4 py-4">{data.description}</p>
        </div>
      </div>
      {showFields && (
        <div className="px-4 py-2">
          {data.columns.map((column, index) => (
            <div
              key={column.name}
              className={`py-2 text-sm ${
                index !== data.columns.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {column.constraints?.includes("PRIMARY KEY") && (
                    <span className="text-yellow-500 text-sm font-mono">
                      PK
                    </span>
                  )}
                  <span className="text-gray-700 font-medium">
                    {column.name}
                  </span>
                  {column.cardinality && (
                    <span className="text-xs text-blue-600 font-semibold">
                      {column.cardinality}
                    </span>
                  )}
                </div>
                <span className="text-gray-500 text-xs bg-gray-50 px-2 py-1 rounded">
                  {column.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Modify the table's properties and columns.
            </DialogDescription>
          </DialogHeader>
          <TableEditor
            data={editData}
            onChange={setEditData}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
});

TableNode.displayName = "TableNode";
