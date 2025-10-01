import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Plus, Import, Network, Database } from "lucide-react";
import { useERDState } from "@/hooks/useERDState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { importFromJSON } from "@/utils/erdExport";
import { v4 as uuidv4 } from "uuid";
import { DiagramView, DiagramType } from "@/types";

interface ImportDialogData {
  file: File;
  importedData?: any;
  type: "json" | "csv";
}

interface CreateDialogData {
  type: DiagramType;
  name: string;
  description: string;
}

export function HomePage() {
  const { views, createView, handleFileUpload } = useERDState();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [importDialogData, setImportDialogData] = React.useState<ImportDialogData | null>(
    null
  );
  const [createDialogData, setCreateDialogData] = React.useState<CreateDialogData>({
    type: DiagramType.ERD,
    name: "",
    description: "",
  });

  const handleCreateBlank = (type: DiagramType) => {
    setCreateDialogData({
      type,
      name: type === DiagramType.ERD ? "New ERD" : "New Architecture Diagram",
      description: "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content !== "string") return;

      const importedData = importFromJSON(content);
      if (importedData) {
        setCreateDialogData({
          type: DiagramType.ERD,
          name: importedData.metadata?.name || "Imported ERD",
          description: importedData.metadata?.description || "",
        });
        setImportDialogData({ file, importedData, type: "json" });
        setIsImportDialogOpen(true);
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset file input
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCreateDialogData({
      type: DiagramType.ERD,
      name: file.name.replace(".csv", ""),
      description: "",
    });
    setImportDialogData({ file, type: "csv" });
    setIsImportDialogOpen(true);
    e.target.value = ""; // Reset file input
  };

  const handleImportDialogConfirm = () => {
    if (!importDialogData) return;

    if (importDialogData.type === "json" && importDialogData.importedData) {
      const id = uuidv4();
      createView(
        createDialogData.name,
        importDialogData.importedData.nodes,
        importDialogData.importedData.edges,
        {
          description: createDialogData.description,
          filter: "",
          hidePrefix: [],
        }
      );
      navigate(`/erd/${id}`);
    } else if (importDialogData.type === "csv") {
      handleFileUpload(importDialogData.file);
    }

    setIsImportDialogOpen(false);
    setImportDialogData(null);
    setCreateDialogData({ type: DiagramType.ERD, name: "", description: "" });
  };

  const handleCreateDialogConfirm = () => {
    let newView;
    if (createDialogData.type === DiagramType.ERD) {
      newView = createView(createDialogData.name, [], [], {
        description: createDialogData.description,
        filter: "",
        hidePrefix: [],
      }, DiagramType.ERD);
      navigate(`/erd/${newView.id}`);
    } else {
      // Handle architecture diagram creation
      newView = createView(createDialogData.name, [], [], {
        description: createDialogData.description,
        filter: "",
      }, DiagramType.ARCHITECTURE);
      navigate(`/architecture/${newView.id}`);
    }

    setIsCreateDialogOpen(false);
    setCreateDialogData({ type: DiagramType.ERD, name: "", description: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Diagram Explorer</h1>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Import className="w-4 h-4 mr-2" />
              Import ERD
            </Button>
            <input
              type="file"
              ref={csvInputRef}
              onChange={handleCSVUpload}
              accept=".csv"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => csvInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Schema
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleCreateBlank(DiagramType.ERD)}
            >
              <Database className="w-4 h-4 mr-2" />
              New ERD
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleCreateBlank(DiagramType.ARCHITECTURE)}
            >
              <Network className="w-4 h-4 mr-2" />
              New Architecture
            </Button>
          </div>
        </div>

        {views.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-dashed hover:border-primary transition-colors cursor-pointer" onClick={() => handleCreateBlank(DiagramType.ERD)}>
              <CardHeader className="text-center">
                <Database className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                <CardTitle>Create ER Diagram</CardTitle>
                <CardDescription>
                  Design database relationships with tables, columns, and foreign keys
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  New ERD
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-dashed hover:border-primary transition-colors cursor-pointer" onClick={() => handleCreateBlank(DiagramType.ARCHITECTURE)}>
              <CardHeader className="text-center">
                <Network className="w-12 h-12 mx-auto mb-2 text-green-600" />
                <CardTitle>Create Architecture Diagram</CardTitle>
                <CardDescription>
                  Design system architecture with components, services, and connections
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button variant="outline">
                  <Network className="w-4 h-4 mr-2" />
                  New Architecture
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {views.map((view: DiagramView) => {
              const isERD = view.type === DiagramType.ERD;
              const linkPath = isERD ? `/erd/${view.id}` : `/architecture/${view.id}`;
              
              return (
                <Link key={view.id} to={linkPath}>
                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {isERD ? (
                          <Database className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Network className="w-5 h-5 text-green-600" />
                        )}
                        <CardTitle className="text-lg">{view.name}</CardTitle>
                      </div>
                      <CardDescription>
                        {view.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500">
                        {view.data.nodes.length} {isERD ? "tables" : "components"}
                        {" · "}
                        {new Date(view.updatedAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
            
            {/* Add New Diagram Cards */}
            <Card 
              className="border-dashed hover:border-primary transition-colors cursor-pointer opacity-60 hover:opacity-100" 
              onClick={() => handleCreateBlank(DiagramType.ERD)}
            >
              <CardHeader className="text-center">
                <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <CardTitle className="text-base">New ER Diagram</CardTitle>
              </CardHeader>
            </Card>
            
            <Card 
              className="border-dashed hover:border-primary transition-colors cursor-pointer opacity-60 hover:opacity-100" 
              onClick={() => handleCreateBlank(DiagramType.ARCHITECTURE)}
            >
              <CardHeader className="text-center">
                <Network className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <CardTitle className="text-base">New Architecture</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Save {importDialogData?.type === "csv" ? "Schema" : "ERD"}
              </DialogTitle>
              <DialogDescription>
                Enter a name and description for your{" "}
                {importDialogData?.type === "csv" ? "schema" : "ERD"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={createDialogData.name}
                  onChange={(e) => setCreateDialogData({ ...createDialogData, name: e.target.value })}
                  placeholder="Enter a name..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createDialogData.description}
                  onChange={(e) => setCreateDialogData({ ...createDialogData, description: e.target.value })}
                  placeholder="Enter a description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportDialogData(null);
                  setCreateDialogData({ type: DiagramType.ERD, name: "", description: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleImportDialogConfirm} disabled={!createDialogData.name.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Create New {createDialogData.type === DiagramType.ERD ? "ER Diagram" : "Architecture Diagram"}
              </DialogTitle>
              <DialogDescription>
                Enter a name and description for your diagram
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  value={createDialogData.name}
                  onChange={(e) => setCreateDialogData({ ...createDialogData, name: e.target.value })}
                  placeholder="Enter diagram name..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  value={createDialogData.description}
                  onChange={(e) => setCreateDialogData({ ...createDialogData, description: e.target.value })}
                  placeholder="Enter diagram description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setCreateDialogData({ type: DiagramType.ERD, name: "", description: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateDialogConfirm} disabled={!createDialogData.name.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
