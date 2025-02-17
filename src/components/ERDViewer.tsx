import React, { useCallback, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  MarkerType,
} from "reactflow";
import {
  Download,
  ZoomIn,
  ArrowLeft,
  Save,
  Plus,
  Settings,
  Eye,
} from "lucide-react";
import { toPng } from "html-to-image";
import { TableNode } from "./TableNode";
import { ViewSidebar } from "./ViewSidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import "reactflow/dist/style.css";
import { useERDState } from "@/hooks/useERDState";
import { TableBulkEdit } from "./TableBulkEdit";

const nodeTypes = {
  tableNode: TableNode,
};

export function ERDViewer() {
  const navigate = useNavigate();
  const { currentView, updateView, views, createView, deleteView } =
    useERDState();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    currentView?.data.nodes ?? []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    currentView?.data.edges ?? []
  );
  const [filter, setFilter] = useState(currentView?.data.filter ?? "");
  const [hidePrefix, setHidePrefix] = useState<string[]>(
    currentView?.data.hidePrefix ?? []
  );
  const [isCreateViewOpen, setIsCreateViewOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewDescription, setNewViewDescription] = useState("");

  const flowRef = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn } = useReactFlow();

  // Update nodes and edges when current view changes
  useEffect(() => {
    if (currentView) {
      console.log("Setting nodes:", currentView.data.nodes); // Debug log
      setNodes(currentView.data.nodes);
      setEdges(currentView.data.edges);
      setFilter(currentView.data.filter ?? "");
      setHidePrefix(currentView.data.hidePrefix ?? []);
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    }
  }, [currentView, setNodes, setEdges, fitView]);

  // Apply filters to nodes and edges
  useEffect(() => {
    if (currentView) {
      let filteredNodes = [...currentView.data.nodes];

      // Apply text filter
      if (filter) {
        const searchLower = filter.toLowerCase();
        filteredNodes = filteredNodes.filter((node) =>
          node.data.label.toLowerCase().includes(searchLower)
        );
      }

      // Apply prefix filters
      if (hidePrefix.length > 0) {
        filteredNodes = filteredNodes.filter(
          (node) =>
            !hidePrefix.some((prefix) => node.data.label.startsWith(prefix))
        );
      }

      // Update edges to only include connections between visible nodes
      const visibleNodeIds = new Set(filteredNodes.map((node) => node.id));
      const filteredEdges = currentView.data.edges.filter(
        (edge) =>
          visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
      );

      setNodes(filteredNodes);
      setEdges(filteredEdges);
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    }
  }, [currentView, filter, hidePrefix, setNodes, setEdges, fitView]);

  // Save changes to the current view
  const saveCurrentView = useCallback(() => {
    if (currentView) {
      const updatedView = {
        ...currentView,
        updatedAt: Date.now(),
        data: {
          ...currentView.data,
          nodes: nodes, // Use current nodes
          edges: edges, // Use current edges
          hidePrefix,
          filter,
        },
      };
      updateView(updatedView);
    }
  }, [currentView, updateView, nodes, edges, hidePrefix, filter]);

  const onDownload = useCallback(() => {
    if (flowRef.current === null) return;

    toPng(flowRef.current, {
      filter: (node) => {
        const className = node.className ?? "";
        return !className.includes("controls");
      },
    }).then((dataUrl) => {
      const a = document.createElement("a");
      a.setAttribute("download", "erd-diagram.png");
      a.setAttribute("href", dataUrl);
      a.click();
    });
  }, []);

  const togglePrefix = useCallback((prefix: string) => {
    setHidePrefix((prev) =>
      prev.includes(prefix)
        ? prev.filter((p) => p !== prefix)
        : [...prev, prefix]
    );
  }, []);

  const handleCreateView = useCallback(
    (name: string, description: string) => {
      if (!name.trim()) return;

      createView(name, nodes, edges, {
        filter,
        hidePrefix,
        description,
      });
    },
    [createView, nodes, edges, filter, hidePrefix]
  );

  // Add types to event handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewViewName(e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewViewDescription(e.target.value);
  };

  return (
    <div className="flex h-screen">
      <ViewSidebar
        filter={filter}
        setFilter={setFilter}
        hidePrefix={hidePrefix}
        togglePrefix={togglePrefix}
        onSaveView={saveCurrentView}
        currentView={currentView}
        views={views}
        onViewSelect={(view) => {
          setNodes(view.data.nodes);
          setEdges(view.data.edges);
          setFilter(view.data.filter ?? "");
          setHidePrefix(view.data.hidePrefix ?? []);
          updateView(view);
        }}
        onViewDelete={deleteView}
        onCreateView={handleCreateView}
      />
      <div className="flex-1 relative" ref={flowRef}>
        <Panel position="top-right" className="space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="h-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to ERDs
          </Button>
          <TableBulkEdit />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateViewOpen(true)}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-2" />
            Save as New View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="h-8"
            title="Download as PNG"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => zoomIn()}
            className="h-8"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (currentView) {
                const updatedView = {
                  ...currentView,
                  settings: {
                    ...currentView.settings,
                    showFields: !currentView.settings.showFields,
                  },
                };
                updateView(updatedView);

                // Force a complete re-render
                const newNodes = nodes.map((node) => ({
                  ...node,
                  data: { ...node.data },
                  position: { ...node.position },
                }));
                setNodes([...newNodes]);
              }
            }}
            className="h-8"
            title={
              currentView?.settings.showFields ? "Hide Fields" : "Show Fields"
            }
          >
            <Eye
              className={`w-4 h-4 mr-2 ${
                currentView?.settings.showFields ? "text-blue-500" : ""
              }`}
            />
            {currentView?.settings.showFields ? "Hide Fields" : "Show Fields"}
          </Button>
        </Panel>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{
            type: "smoothstep",
            style: {
              stroke: "#94a3b8",
              strokeWidth: 2,
              opacity: 0.8,
            },
            markerEnd: {
              type: MarkerType.Arrow,
              color: "#94a3b8",
              width: 20,
              height: 20,
            },
          }}
        >
          <Background color="#aaa" gap={16} />
          <Controls className="controls bg-white shadow-lg rounded-lg" />
          <MiniMap
            className="bg-white shadow-lg rounded-lg"
            nodeColor="#94a3b8"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>

        <Dialog
          open={isCreateViewOpen}
          onOpenChange={(open) => {
            setIsCreateViewOpen(open);
            if (!open) {
              setNewViewName("");
              setNewViewDescription("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as New View</DialogTitle>
              <DialogDescription>
                Create a new view with the current layout and filters
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">View Name</Label>
                <Input
                  id="name"
                  value={newViewName}
                  onChange={handleNameChange}
                  placeholder="e.g., User Management Features"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newViewDescription}
                  onChange={handleDescriptionChange}
                  placeholder="Describe what this view represents..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateViewOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handleCreateView(newViewName, newViewDescription)
                }
                disabled={!newViewName.trim()}
              >
                Create View
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
