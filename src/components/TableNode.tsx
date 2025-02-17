import React, { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import { useERDState } from "@/hooks/useERDState";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit2, Check } from "lucide-react";

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
  label: string;
  displayName?: string;
  description?: string;
  columns: {
    name: string;
    type: string;
    constraints?: string;
    cardinality?: string;
  }[];
}

export const TableNode = memo(
  ({ data, id }: { data: TableData; id: string }) => {
    const { currentView, updateView } = useERDState();
    const showFields = currentView?.settings?.showFields;
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(
      data.displayName || data.label
    );
    const [description, setDescription] = useState(
      data.description ||
        "A User is an abstract entity that comprises of Credentials and Roles for an Actor to access a functionality of the Platform."
    );

    const handleSave = () => {
      if (!currentView) return;

      const updatedNodes = currentView.data.nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              displayName,
              description,
            },
          };
        }
        return node;
      });

      updateView({
        ...currentView,
        data: {
          ...currentView.data,
          nodes: updatedNodes,
        },
      });

      setIsEditing(false);
    };

    const getCardinalityDisplay = (cardinality?: string) => {
      if (!cardinality) return "";
      switch (cardinality) {
        case "1:1":
          return "1";
        case "1:n":
          return "∞";
        case "n:1":
          return "1";
        case "n:n":
          return "∞";
        default:
          return cardinality;
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[400px]">
        <Handle type="target" position={Position.Top} className="w-2 h-2" />
        <div className="border-b border-gray-200 rounded-lg max-w-md">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                className="bg-white"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="bg-white text-sm"
                rows={2}
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSave}>
                  <Check className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="cursor-pointer group"
              onClick={() => setIsEditing(true)}
            >
              <div className="flex items-center justify-between mb-2 px-4 pt-2 bg-blue-700 rounded-t-lg">
                <h3 className="font-bold text-white text-3xl mb-2">
                  {displayName || data.label}
                </h3>
                <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className=" text-gray-900 text-2xl px-4 py-4">{description}</p>
            </div>
          )}
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
      </div>
    );
  }
);

TableNode.displayName = "TableNode";
