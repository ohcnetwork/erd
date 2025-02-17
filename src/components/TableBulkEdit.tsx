import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useERDState } from "@/hooks/useERDState";
import { Node } from "reactflow";

interface TableEdit {
  id: string;
  displayName: string;
  description: string;
}

export function TableBulkEdit() {
  const { currentView, updateView } = useERDState();
  const [bulkText, setBulkText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const generateBulkText = () => {
    if (!currentView) return "";

    const tables = currentView.data.nodes.map((node: Node) => ({
      id: node.id,
      displayName: node.data.displayName || node.data.label,
      description: node.data.description || "",
    }));
    return JSON.stringify(tables, null, 2);
  };

  const handleOpen = () => {
    setBulkText(generateBulkText());
    setIsOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentView) return;

    try {
      const parsedTables: TableEdit[] = JSON.parse(bulkText);

      // Create new node references to force a re-render
      const updatedNodes = currentView.data.nodes.map((node: Node) => {
        const tableEdit = parsedTables.find((t) => t.id === node.id);
        if (tableEdit) {
          return {
            ...node,
            data: {
              ...node.data,
              columns: [...node.data.columns], // Create new array reference
              displayName: tableEdit.displayName,
              description: tableEdit.description,
            },
            position: { ...node.position }, // Create new position reference
          };
        }
        return {
          ...node,
          data: { ...node.data, columns: [...node.data.columns] },
          position: { ...node.position },
        };
      });

      const updatedView = {
        ...currentView,
        data: {
          ...currentView.data,
          nodes: updatedNodes,
          edges: [...currentView.data.edges], // Create new edges array reference
        },
        updatedAt: Date.now(),
      };

      updateView(updatedView);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating tables:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpen}
          className="h-8"
          title="Bulk Edit Tables"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Tables
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[800px]">
        <SheetHeader>
          <SheetTitle>Bulk Edit Tables</SheetTitle>
          <SheetDescription>
            Edit table display names and descriptions in bulk using JSON format.
            Each table has an ID, displayName, and description field.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4 flex-1">
          <Textarea
            value={bulkText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBulkText(e.target.value)
            }
            className="min-h-[500px] font-mono text-sm"
            placeholder="Loading tables..."
          />
        </div>
        <SheetFooter className="mt-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Tables</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
