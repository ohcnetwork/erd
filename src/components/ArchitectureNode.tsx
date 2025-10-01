import React, { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import { Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArchitectureNodeEditor, ArchitectureNodeData } from "./ArchitectureNodeEditor";

interface ArchitectureNodeProps {
  data: {
    title: string;
    description: string;
    icon: string;
    color?: string;
  };
  id: string;
  onViewUpdate?: (view: any) => void;
}

export const ArchitectureNode = memo(({ data, id, onViewUpdate }: ArchitectureNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ArchitectureNodeData>({
    title: data.title || "",
    description: data.description || "",
    icon: data.icon || "Server",
    color: data.color || "#2563eb",
  });

  const handleSave = (updatedData: ArchitectureNodeData) => {
    if (onViewUpdate) {
      onViewUpdate({
        nodeId: id,
        data: {
          title: updatedData.title,
          description: updatedData.description,
          icon: updatedData.icon,
          color: updatedData.color,
        },
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="group relative">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      
      <div
        className="min-w-[200px] max-w-[300px] bg-white border-2 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        style={{ borderColor: data.color || "#2563eb" }}
        onClick={() => setIsEditing(true)}
      >
        <div
          className="flex items-center justify-between px-4 py-3 rounded-t-lg"
          style={{ backgroundColor: data.color || "#2563eb" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white text-lg">
              {data.icon === "Server" && "🖥️"}
              {data.icon === "Database" && "🗄️"}
              {data.icon === "Cloud" && "☁️"}
              {data.icon === "Mobile" && "📱"}
              {data.icon === "Web" && "🌐"}
              {data.icon === "API" && "🔌"}
              {data.icon === "Security" && "🔒"}
              {data.icon === "Analytics" && "📊"}
              {data.icon === "Storage" && "💾"}
              {data.icon === "Network" && "🌐"}
            </div>
            <h3 className="font-bold text-white text-lg">
              {data.title || "Component"}
            </h3>
          </div>
          <Edit2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="px-4 py-3">
          <p className="text-gray-700 text-sm leading-relaxed">
            {data.description || "Add a description..."}
          </p>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Architecture Component</DialogTitle>
          </DialogHeader>
          <ArchitectureNodeEditor
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

ArchitectureNode.displayName = "ArchitectureNode";