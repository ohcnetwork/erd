import React, {
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";
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
  addEdge,
  Connection,
  Edge,
  Node,
} from "reactflow";
import {
  Download,
  ArrowLeft,
  Save,
  Plus,
  Eye,
  Link as LinkIcon,
} from "lucide-react";
import { toPng } from "html-to-image";
import { ArchitectureNode } from "./ArchitectureNode";
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
import { ArchitectureNodeData } from "./ArchitectureNodeEditor";

const defaultEdgeStyle = {
  stroke: "#2563eb",
  strokeWidth: 2,
};

const defaultEdgeOptions = {
  type: "smoothstep",
  style: defaultEdgeStyle,
  animated: true,
  markerEnd: {
    type: MarkerType.Arrow,
    width: 20,
    height: 20,
    color: "#2563eb",
  },
} as const;

interface ArchitectureViewerProps {
  currentView: any;
  updateView: (view: any) => void;
}

export function ArchitectureViewer({ currentView, updateView }: ArchitectureViewerProps) {
  const navigate = useNavigate();
  const flowRef = useRef<HTMLDivElement>(null);
  const { fitView, getViewport } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(
    currentView?.data.nodes ?? []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    currentView?.data.edges ?? []
  );
  const [filter, setFilter] = useState(currentView?.data.filter ?? "");
  const [isCreateViewOpen, setIsCreateViewOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewDescription, setNewViewDescription] = useState("");
  const [isCreateComponentOpen, setIsCreateComponentOpen] = useState(false);
  const [newComponent, setNewComponent] = useState<ArchitectureNodeData>({
    title: "",
    description: "",
    icon: "Server",
    color: "#2563eb",
  });

  // Update nodes and edges when currentView changes
  useEffect(() => {
    if (currentView) {
      setNodes(currentView.data.nodes);
      setEdges(currentView.data.edges);
      setFilter(currentView.data.filter);
    }
  }, [currentView, setNodes, setEdges]);

  const handleViewUpdate = useCallback(
    (updateData: { nodeId: string; data: any }) => {
      if (!currentView) return;

      const updatedNodes = nodes.map((node) => {
        if (node.id === updateData.nodeId) {
          return {
            ...node,
            data: updateData.data,
          };
        }
        return node;
      });

      const updatedView = {
        ...currentView,
        updatedAt: Date.now(),
        data: {
          ...currentView.data,
          nodes: updatedNodes,
        },
      };

      setNodes(updatedNodes);
      updateView(updatedView);
    },
    [currentView, nodes, updateView, setNodes]
  );

  const handleAddComponent = useCallback(() => {
    if (!currentView || !newComponent.title.trim()) return;

    const { x: viewX, y: viewY, zoom } = getViewport();
    const { width, height } = flowRef.current?.getBoundingClientRect() || {
      width: 1000,
      height: 800,
    };

    const position = {
      x: (width / 2 - viewX) / zoom,
      y: (height / 2 - viewY) / zoom,
    };

    const newNode = {
      id: crypto.randomUUID(),
      type: "architectureNode",
      position,
      data: {
        title: newComponent.title,
        description: newComponent.description,
        icon: newComponent.icon,
        color: newComponent.color,
      },
    };

    const updatedNodes = [...nodes, newNode];
    const updatedView = {
      ...currentView,
      updatedAt: Date.now(),
      data: {
        ...currentView.data,
        nodes: updatedNodes,
      },
    };

    setNodes(updatedNodes);
    updateView(updatedView);
    setIsCreateComponentOpen(false);
    setNewComponent({
      title: "",
      description: "",
      icon: "Server",
      color: "#2563eb",
    });
  }, [currentView, newComponent, getViewport, nodes, updateView, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: crypto.randomUUID(),
        type: "smoothstep",
        animated: true,
        style: defaultEdgeStyle,
        markerEnd: {
          type: MarkerType.Arrow,
          width: 20,
          height: 20,
          color: "#2563eb",
        },
      };

      setEdges((edges) => addEdge(newEdge, edges));
    },
    [setEdges]
  );

  const nodeTypes = useMemo(
    () => ({
      architectureNode: (props: any) => (
        <ArchitectureNode {...props} onViewUpdate={handleViewUpdate} />
      ),
    }),
    [handleViewUpdate]
  );

  const downloadPNG = useCallback(() => {
    if (!flowRef.current) return;

    toPng(flowRef.current, {
      backgroundColor: "#ffffff",
      filter: (node) => {
        const className = node.className ?? "";
        return !className.includes("controls");
      },
    }).then((dataUrl) => {
      const a = document.createElement("a");
      a.setAttribute("download", "architecture-diagram.png");
      a.setAttribute("href", dataUrl);
      a.click();
    });
  }, []);

  return (
    <div className="flex h-screen">
      <ViewSidebar
        filter={filter}
        onFilterChange={setFilter}
        currentView={currentView}
        onCreateView={() => setIsCreateViewOpen(true)}
      />

      <div className="flex-1">
        <div ref={flowRef} className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />

            <Panel position="top-left">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Diagrams
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateComponentOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Component
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadPNG}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Create View Dialog */}
      <Dialog open={isCreateViewOpen} onOpenChange={setIsCreateViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New View</DialogTitle>
            <DialogDescription>
              Save the current state as a new view
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">Name</Label>
              <Input
                id="view-name"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="Enter view name..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="view-description">Description</Label>
              <Textarea
                id="view-description"
                value={newViewDescription}
                onChange={(e) => setNewViewDescription(e.target.value)}
                placeholder="Enter view description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateViewOpen(false);
                setNewViewName("");
                setNewViewDescription("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle create view logic here
                setIsCreateViewOpen(false);
                setNewViewName("");
                setNewViewDescription("");
              }}
              disabled={!newViewName.trim()}
            >
              Create View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Component Dialog */}
      <Dialog open={isCreateComponentOpen} onOpenChange={setIsCreateComponentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Architecture Component</DialogTitle>
            <DialogDescription>
              Create a new component for your architecture diagram
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="component-title">Title</Label>
              <Input
                id="component-title"
                value={newComponent.title}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, title: e.target.value })
                }
                placeholder="Component title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="component-description">Description</Label>
              <Textarea
                id="component-description"
                value={newComponent.description}
                onChange={(e) =>
                  setNewComponent({
                    ...newComponent,
                    description: e.target.value,
                  })
                }
                placeholder="Component description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateComponentOpen(false);
                setNewComponent({
                  title: "",
                  description: "",
                  icon: "Server",
                  color: "#2563eb",
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddComponent} disabled={!newComponent.title.trim()}>
              Add Component
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}