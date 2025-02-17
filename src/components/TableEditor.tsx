import React, { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface TableEditorData {
  name: string;
  displayName: string;
  description: string;
  columns: {
    name: string;
    type: string;
    isPrimaryKey: boolean;
  }[];
  color?: string;
}

export const TABLE_COLORS = [
  "#2563eb", // blue
  "#dc2626", // red
  "#16a34a", // green
  "#9333ea", // purple
  "#ea580c", // orange
  "#0891b2", // cyan
  "#4f46e5", // indigo
  "#db2777", // pink
];

interface TableEditorProps {
  data: TableEditorData;
  onChange: (data: TableEditorData) => void;
  onSave: () => void;
  onCancel: () => void;
  title?: string;
  saveLabel?: string;
}

export function TableEditor({
  data,
  onChange,
  onSave,
  onCancel,
  title = "Edit Table",
  saveLabel = "Save",
}: TableEditorProps) {
  // Ensure data has all required fields with defaults
  const safeData = {
    name: data.name || "",
    displayName: data.displayName || data.name || "",
    description: data.description || "",
    color: data.color || "#2563eb",
    columns: data.columns?.map((col) => ({
      name: col.name || "",
      type: col.type || "",
      isPrimaryKey: col.isPrimaryKey || false,
    })) || [{ name: "", type: "", isPrimaryKey: false }],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[2fr,2fr,1fr] gap-4">
        <div className="space-y-2">
          <Label htmlFor="tableName">Table Name</Label>
          <Input
            id="tableName"
            value={safeData.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({
                ...safeData,
                name: e.target.value,
                displayName: safeData.displayName || e.target.value,
              })
            }
            placeholder="Enter table name..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={safeData.displayName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ ...safeData, displayName: e.target.value })
            }
            placeholder="Enter display name..."
          />
        </div>
        <div className="space-y-2">
          <Label>Table Color</Label>
          <div className="flex gap-2 flex-wrap">
            {TABLE_COLORS.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full transition-all ${
                  safeData.color === color
                    ? "ring-2 ring-offset-2 ring-black"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onChange({ ...safeData, color })}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tableDescription">Description</Label>
        <Textarea
          id="tableDescription"
          value={safeData.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            onChange({ ...safeData, description: e.target.value })
          }
          placeholder="Enter table description..."
          className="min-h-[100px]"
        />
      </div>
      <div className="space-y-2">
        <Label>Columns</Label>
        <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-lg p-4">
          {safeData.columns.map((column, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Input
                placeholder="Column name"
                value={column.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newColumns = [...safeData.columns];
                  newColumns[index] = {
                    ...newColumns[index],
                    name: e.target.value,
                  };
                  onChange({ ...safeData, columns: newColumns });
                }}
                className="flex-[2]"
              />
              <Input
                placeholder="Data type"
                value={column.type}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newColumns = [...safeData.columns];
                  newColumns[index] = {
                    ...newColumns[index],
                    type: e.target.value,
                  };
                  onChange({ ...safeData, columns: newColumns });
                }}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newColumns = [...safeData.columns];
                  newColumns[index] = {
                    ...newColumns[index],
                    isPrimaryKey: !newColumns[index].isPrimaryKey,
                  };
                  onChange({ ...safeData, columns: newColumns });
                }}
                className={`w-12 ${column.isPrimaryKey ? "bg-yellow-100" : ""}`}
              >
                PK
              </Button>
              {safeData.columns.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newColumns = safeData.columns.filter(
                      (_, i) => i !== index
                    );
                    onChange({ ...safeData, columns: newColumns });
                  }}
                  className="w-8"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onChange({
                ...safeData,
                columns: [
                  ...safeData.columns,
                  { name: "", type: "", isPrimaryKey: false },
                ],
              });
            }}
          >
            Add Column
          </Button>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!safeData.name.trim()}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
