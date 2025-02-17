import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Plus, Import } from "lucide-react";
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
import { ERDView } from "@/types";

interface ImportDialogData {
  file: File;
  importedData?: any;
  type: "json" | "csv";
}

export function HomePage() {
  const { views, createView, handleFileUpload } = useERDState();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogData, setDialogData] = React.useState<ImportDialogData | null>(
    null
  );
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleCreateBlank = () => {
    const id = uuidv4();
    createView("New ERD", [], [], {
      description: "",
      filter: "",
      hidePrefix: [],
    });
    navigate(`/erd/${id}`);
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
        setName(importedData.metadata?.name || "Imported ERD");
        setDescription(importedData.metadata?.description || "");
        setDialogData({ file, importedData, type: "json" });
        setIsDialogOpen(true);
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset file input
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setName(file.name.replace(".csv", ""));
    setDescription("");
    setDialogData({ file, type: "csv" });
    setIsDialogOpen(true);
    e.target.value = ""; // Reset file input
  };

  const handleDialogConfirm = () => {
    if (!dialogData) return;

    if (dialogData.type === "json" && dialogData.importedData) {
      const id = uuidv4();
      createView(
        name,
        dialogData.importedData.nodes,
        dialogData.importedData.edges,
        {
          description,
          filter: "",
          hidePrefix: [],
        }
      );
      navigate(`/erd/${id}`);
    } else if (dialogData.type === "csv") {
      handleFileUpload(dialogData.file);
    }

    setIsDialogOpen(false);
    setDialogData(null);
    setName("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Database ERD Explorer</h1>
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
            <Button variant="default" onClick={handleCreateBlank}>
              <Plus className="w-4 h-4 mr-2" />
              New Blank ERD
            </Button>
          </div>
        </div>

        {views.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <CardTitle>No ERDs Yet</CardTitle>
              <CardDescription>
                Create a new ERD by importing a database schema or start from
                scratch
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Import className="w-4 h-4 mr-2" />
                Import ERD
              </Button>
              <Button variant="default" onClick={handleCreateBlank}>
                <Plus className="w-4 h-4 mr-2" />
                New Blank ERD
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {views.map((view: ERDView) => (
              <Link key={view.id} to={`/erd/${view.id}`}>
                <Card className="hover:border-primary transition-colors">
                  <CardHeader>
                    <CardTitle>{view.name}</CardTitle>
                    <CardDescription>
                      {view.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500">
                      {view.data.nodes.length} tables
                      {" · "}
                      {new Date(view.updatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Save {dialogData?.type === "csv" ? "Schema" : "ERD"}
              </DialogTitle>
              <DialogDescription>
                Enter a name and description for your{" "}
                {dialogData?.type === "csv" ? "schema" : "ERD"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setDialogData(null);
                  setName("");
                  setDescription("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleDialogConfirm} disabled={!name.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
