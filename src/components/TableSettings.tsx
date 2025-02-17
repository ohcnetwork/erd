import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ERDView } from "@/types";
import { Node } from "reactflow";

interface TableNode extends Node {
  data: {
    label: string;
    columns: {
      name: string;
      type: string;
      constraints?: string;
    }[];
  };
}

interface TableSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ERDView | null;
  onUpdateView: (view: ERDView) => void;
}

export function TableSettings({
  isOpen,
  onClose,
  currentView,
  onUpdateView,
}: TableSettingsProps) {
  if (!currentView || !currentView.data.nodes) return null;

  const handleFieldToggle = (tableId: string, fieldName: string) => {
    const currentHiddenFields = currentView.settings.hiddenFields || {};
    const hiddenFields = currentHiddenFields[tableId] || [];

    const newHiddenFields = hiddenFields.includes(fieldName)
      ? hiddenFields.filter((f: string) => f !== fieldName)
      : [...hiddenFields, fieldName];

    const updatedView = {
      ...currentView,
      settings: {
        ...currentView.settings,
        hiddenFields: {
          ...currentHiddenFields,
          [tableId]: newHiddenFields,
        },
      },
    };

    onUpdateView(updatedView);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Table Field Settings</DialogTitle>
          <DialogDescription>
            Configure which fields to show or hide in each table
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {(currentView.data.nodes as TableNode[]).map((node) => {
              if (!node.data?.columns) return null;

              const hiddenFields =
                currentView.settings.hiddenFields?.[node.id] || [];

              return (
                <div key={node.id} className="space-y-2">
                  <Label className="text-base font-semibold">
                    {node.data.label}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-4">
                    {node.data.columns.map((column) => (
                      <div
                        key={column.name}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`${node.id}-${column.name}`}
                          checked={!hiddenFields.includes(column.name)}
                          onCheckedChange={() =>
                            handleFieldToggle(node.id, column.name)
                          }
                        />
                        <Label
                          htmlFor={`${node.id}-${column.name}`}
                          className="text-sm"
                        >
                          {column.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
