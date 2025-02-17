import React, {
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
  ChangeEvent,
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
  getViewportForBounds,
} from "reactflow";
import {
  Download,
  ZoomIn,
  ArrowLeft,
  Save,
  Plus,
  Settings,
  Eye,
  Table,
  Link as LinkIcon,
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
import { TableEditor, TableEditorData, TABLE_COLORS } from "./TableEditor";

// Move these outside the component and memoize the objects
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

interface EdgeData {
  relationship: string;
}

export function ERDViewer() {
  const navigate = useNavigate();
  const { currentView, updateView, views, createView, deleteView } =
    useERDState();

  console.log("[ERDViewer] Component rendered with currentView:", currentView);

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
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false);
  const [newTable, setNewTable] = useState<TableEditorData>({
    name: "",
    displayName: "",
    description: "",
    columns: [{ name: "", type: "", isPrimaryKey: false }],
    color: "#2563eb", // default blue
  });
  const [isCreatingRelation, setIsCreatingRelation] = useState(false);

  const flowRef = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, getViewport } = useReactFlow();

  // Wrap updateView to add logging
  const wrappedUpdateView = useCallback(
    (view) => {
      console.log("[ERDViewer] wrappedUpdateView called with:", view);
      updateView(view);
      console.log("[ERDViewer] wrappedUpdateView completed");
    },
    [updateView]
  );

  // Update nodes and edges when current view changes
  useEffect(() => {
    if (currentView) {
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

  // Add view refresh after table edit
  const handleViewUpdate = useCallback(
    (updatedView: any) => {
      if (!currentView) {
        console.log("[ERDViewer] No current view found");
        return;
      }

      console.log("[ERDViewer] Starting view update with:", updatedView);

      try {
        // Create completely new references for all nodes
        const newNodes = updatedView.data.nodes.map((node) => {
          console.log("[ERDViewer] Processing node:", node);
          const newNode = {
            id: node.id,
            type: "tableNode",
            position: { ...node.position },
            data: { ...node.data },
          };
          console.log("[ERDViewer] Created new node reference:", newNode);
          return newNode;
        });

        console.log("[ERDViewer] All new node references created:", newNodes);

        // Create new references for edges
        const newEdges = updatedView.data.edges.map((edge) => {
          console.log("[ERDViewer] Processing edge:", edge);
          const newEdge = {
            ...edge,
            id: edge.id,
            source: edge.source,
            target: edge.target,
          };
          console.log("[ERDViewer] Created new edge reference:", newEdge);
          return newEdge;
        });

        console.log("[ERDViewer] All new edge references created:", newEdges);

        // Update the view in state
        const finalView = {
          ...updatedView,
          data: {
            ...updatedView.data,
            nodes: newNodes,
            edges: newEdges,
          },
        };

        console.log("[ERDViewer] Final view to be updated:", finalView);
        console.log("[ERDViewer] Calling updateView");
        wrappedUpdateView(finalView);

        console.log("[ERDViewer] Setting nodes in React Flow");
        setNodes(newNodes);
        console.log("[ERDViewer] Setting edges in React Flow");
        setEdges(newEdges);

        // Center view after a short delay
        console.log("[ERDViewer] Scheduling view fit");
        setTimeout(() => {
          console.log("[ERDViewer] Fitting view to content");
          fitView({ padding: 0.2, duration: 200 });
        }, 100);
      } catch (error) {
        console.error("[ERDViewer] Error in handleViewUpdate:", error);
      }
    },
    [currentView, wrappedUpdateView, setNodes, setEdges, fitView]
  );

  // Define nodeTypes with stable reference
  const nodeTypes = useMemo(
    () => ({
      tableNode: (props: any) => (
        <TableNode {...props} onViewUpdate={handleViewUpdate} />
      ),
    }),
    []
  );

  // Update handleAddTable to include displayName
  const handleAddTable = useCallback(() => {
    if (!currentView || !newTable.name.trim()) return;

    const { x: viewX, y: viewY, zoom } = getViewport();
    const { width, height } = flowRef.current?.getBoundingClientRect() || {
      width: 1000,
      height: 800,
    };

    // Calculate position in the center of the current viewport
    const position = {
      x: (width / 2 - viewX) / zoom,
      y: (height / 2 - viewY) / zoom,
    };

    const newNode = {
      id: crypto.randomUUID(),
      type: "tableNode",
      position,
      data: {
        name: newTable.name,
        label: newTable.name,
        displayName: newTable.displayName || newTable.name,
        description: newTable.description,
        color: newTable.color,
        columns: newTable.columns.map((col) => ({
          name: col.name,
          type: col.type,
          constraints: col.isPrimaryKey ? "PRIMARY KEY" : undefined,
        })),
      },
    };

    // Create updated view with new node
    const updatedView = {
      ...currentView,
      data: {
        ...currentView.data,
        nodes: [...currentView.data.nodes, newNode],
      },
    };

    // Use handleViewUpdate to ensure consistent update behavior
    handleViewUpdate(updatedView);

    // Reset form
    setNewTable({
      name: "",
      displayName: "",
      description: "",
      columns: [{ name: "", type: "", isPrimaryKey: false }],
      color: "#2563eb",
    });
    setIsCreateTableOpen(false);
  }, [currentView, newTable, getViewport, handleViewUpdate]);

  // Handle creating relationships between tables
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const newEdge: Edge<EdgeData> = {
        id: `${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: "smoothstep",
        animated: true,
        style: defaultEdgeStyle,
        markerEnd: {
          type: MarkerType.Arrow,
          width: 20,
          height: 20,
          color: "#2563eb",
        },
        data: { relationship: "1:n" },
      };

      setEdges((edges) => addEdge(newEdge, edges));
    },
    [setEdges]
  );

  // Update existing edges to have consistent style
  useEffect(() => {
    if (currentView) {
      const updatedEdges = currentView.data.edges.map((edge) => ({
        ...edge,
        type: "smoothstep",
        animated: true,
        style: defaultEdgeStyle,
        markerEnd: {
          type: MarkerType.Arrow,
          width: 20,
          height: 20,
          color: "#2563eb",
        },
      }));
      setEdges(updatedEdges);
    }
  }, [currentView, setEdges]);

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
          handleViewUpdate(view);
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
            variant="outline"
            size="sm"
            onClick={() => setIsCreateTableOpen(true)}
            className="h-8"
          >
            <Table className="w-4 h-4 mr-2" />
            Add Table
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingRelation(!isCreatingRelation)}
            className={`h-8 ${isCreatingRelation ? "bg-blue-100" : ""}`}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            {isCreatingRelation ? "Cancel Link" : "Link Tables"}
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
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={defaultEdgeOptions}
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

        <Dialog
          open={isCreateTableOpen}
          onOpenChange={(open: boolean) => setIsCreateTableOpen(open)}
        >
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Create New Table</DialogTitle>
              <DialogDescription>
                Add a new table to your ERD. Define its name, description, and
                columns.
              </DialogDescription>
            </DialogHeader>
            <TableEditor
              data={newTable}
              onChange={setNewTable}
              onSave={handleAddTable}
              onCancel={() => setIsCreateTableOpen(false)}
              title="Create New Table"
              saveLabel="Create Table"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
