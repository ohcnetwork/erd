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

interface ComponentEdit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface ArchitectureBulkEditProps {
  nodes?: Node[];
  onUpdate?: (nodes: Node[]) => void;
}

export function ArchitectureBulkEdit({ nodes = [], onUpdate }: ArchitectureBulkEditProps = {}) {
  const { currentView, updateView } = useERDState();
  const [bulkText, setBulkText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const generateBulkText = () => {
    // Use props nodes if available, otherwise fallback to currentView
    const nodesToUse = nodes.length > 0 ? nodes : (currentView?.data.nodes || []);
    
    const components = nodesToUse.map((node: Node) => ({
      id: node.id,
      title: node.data.title || "",
      description: node.data.description || "",
      icon: node.data.icon || "Server",
      color: node.data.color || "#2563eb",
    }));
    return JSON.stringify(components, null, 2);
  };

  const handleOpen = () => {
    setBulkText(generateBulkText());
    setIsOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentView) return;

    try {
      const parsedComponents: ComponentEdit[] = JSON.parse(bulkText);
      const nodesToUse = nodes.length > 0 ? nodes : (currentView?.data.nodes || []);

      // Create new node references to force a re-render
      const updatedNodes = nodesToUse.map((node: Node) => {
        const componentEdit = parsedComponents.find((c) => c.id === node.id);
        if (componentEdit) {
          return {
            ...node,
            data: {
              ...node.data,
              title: componentEdit.title,
              description: componentEdit.description,
              icon: componentEdit.icon,
              color: componentEdit.color,
            },
            position: { ...node.position }, // Create new position reference
          };
        }
        return {
          ...node,
          data: { ...node.data },
          position: { ...node.position },
        };
      });

      // Use onUpdate callback if provided, otherwise update through context
      if (onUpdate) {
        onUpdate(updatedNodes);
      } else {
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
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating components:", error);
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
          title="Bulk Edit Components"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Components
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[800px]">
        <SheetHeader>
          <SheetTitle>Bulk Edit Architecture Components</SheetTitle>
          <SheetDescription>
            Edit component titles, descriptions, icons, and colors in bulk using JSON format.
            Each component has id, title, description, icon, and color fields.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4 flex-1">
          <Textarea
            value={bulkText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBulkText(e.target.value)
            }
            className="min-h-[500px] font-mono text-sm"
            placeholder="Loading components..."
          />
        </div>
        <SheetFooter className="mt-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Components</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}