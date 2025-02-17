import React, { useState } from "react";
import { Clock, Plus, Save, Trash2 } from "lucide-react";
import { ERDView } from "../types";
import { useReactFlow } from "reactflow";

interface ViewManagerProps {
  currentView: ERDView | null;
  onViewSelect: (view: ERDView) => void;
  onViewDelete: (viewId: string) => void;
  hidePrefix: string[];
  filter: string;
}

export function ViewManager({
  currentView,
  onViewSelect,
  onViewDelete,
  hidePrefix,
  filter,
}: ViewManagerProps) {
  const [views, setViews] = useState<ERDView[]>(() => {
    const saved = localStorage.getItem("erdViews");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const { getNodes, getEdges, getZoom, getViewport } = useReactFlow();

  const saveView = (name: string) => {
    const newView: ERDView = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      data: {
        nodes: getNodes(),
        edges: getEdges(),
        hidePrefix,
        filter,
        zoom: getZoom(),
        position: getViewport(),
      },
    };

    const updatedViews = [...views, newView];
    setViews(updatedViews);
    localStorage.setItem("erdViews", JSON.stringify(updatedViews));
    setIsCreating(false);
    setNewViewName("");
  };

  const deleteView = (viewId: string) => {
    const updatedViews = views.filter((v) => v.id !== viewId);
    setViews(updatedViews);
    localStorage.setItem("erdViews", JSON.stringify(updatedViews));
    onViewDelete(viewId);
  };

  return (
    <div className="absolute right-4 top-4 z-10 bg-white rounded-lg shadow-md w-64">
      <div className="p-4 border-b">
        <h3 className="font-medium text-gray-900">Saved Views</h3>
      </div>

      <div className="p-2 max-h-[60vh] overflow-y-auto">
        {views.map((view) => (
          <div
            key={view.id}
            className={`p-2 rounded-md hover:bg-gray-50 cursor-pointer flex items-center justify-between group ${
              currentView?.id === view.id ? "bg-blue-50" : ""
            }`}
            onClick={() => onViewSelect(view)}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{view.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteView(view.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ))}

        {isCreating ? (
          <div className="p-2">
            <input
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="View name..."
              className="w-full px-2 py-1 border rounded text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && newViewName) {
                  saveView(newViewName);
                }
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-md flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New View</span>
          </button>
        )}
      </div>

      {currentView && (
        <div className="p-2 border-t">
          <button
            onClick={() => saveView(currentView.name)}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm flex items-center justify-center space-x-2 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            <span>Update Current View</span>
          </button>
        </div>
      )}
    </div>
  );
}
