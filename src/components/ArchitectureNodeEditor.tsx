import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ArchitectureNodeData {
  title: string;
  description: string;
  icon: string;
  color: string;
}

const ARCHITECTURE_ICONS = [
  { value: "Server", label: "Server 🖥️", emoji: "🖥️" },
  { value: "Database", label: "Database 🗄️", emoji: "🗄️" },
  { value: "Cloud", label: "Cloud ☁️", emoji: "☁️" },
  { value: "Mobile", label: "Mobile 📱", emoji: "📱" },
  { value: "Web", label: "Web 🌐", emoji: "🌐" },
  { value: "API", label: "API 🔌", emoji: "🔌" },
  { value: "Security", label: "Security 🔒", emoji: "🔒" },
  { value: "Analytics", label: "Analytics 📊", emoji: "📊" },
  { value: "Storage", label: "Storage 💾", emoji: "💾" },
  { value: "Network", label: "Network 🌐", emoji: "🌐" },
];

const ARCHITECTURE_COLORS = [
  "#2563eb", // Blue
  "#dc2626", // Red
  "#059669", // Green
  "#d97706", // Orange
  "#7c3aed", // Purple
  "#0891b2", // Cyan
  "#be185d", // Pink
  "#4338ca", // Indigo
  "#65a30d", // Lime
  "#374151", // Gray
];

interface ArchitectureNodeEditorProps {
  data: ArchitectureNodeData;
  onChange: (data: ArchitectureNodeData) => void;
  onSave: (data: ArchitectureNodeData) => void;
  onCancel: () => void;
}

export function ArchitectureNodeEditor({
  data,
  onChange,
  onSave,
  onCancel,
}: ArchitectureNodeEditorProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Component title..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Component description..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Select
          value={data.icon}
          onValueChange={(value) => onChange({ ...data, icon: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ARCHITECTURE_ICONS.map((icon) => (
              <SelectItem key={icon.value} value={icon.value}>
                <span className="flex items-center gap-2">
                  <span>{icon.emoji}</span>
                  <span>{icon.value}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {ARCHITECTURE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                data.color === color ? "border-gray-400" : "border-gray-200"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onChange({ ...data, color })}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}