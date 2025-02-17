import React from "react";
import { Link } from "react-router-dom";
import { Upload, Plus } from "lucide-react";
import { useERDState } from "@/hooks/useERDState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function HomePage() {
  const { views, deleteView, handleFileUpload } = useERDState();

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Database ERD Explorer</h1>
          <label>
            <input
              type="file"
              accept=".csv"
              onChange={onFileSelect}
              className="hidden"
            />
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Import New Schema
            </Button>
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {views.map((view) => (
            <Link to={`/erd/${view.id}`} key={view.id}>
              <Card className="hover:border-blue-500 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{view.name}</CardTitle>
                  <CardDescription>
                    Created {new Date(view.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {view.description || "No description"}
                  </p>
                  <div className="mt-4 text-sm text-gray-400">
                    {view.data.nodes.length} tables, {view.data.edges.length}{" "}
                    relationships
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          <label>
            <input
              type="file"
              accept=".csv"
              onChange={onFileSelect}
              className="hidden"
            />
            <Card className="border-dashed cursor-pointer hover:border-blue-500 transition-colors">
              <CardContent className="flex flex-col items-center justify-center h-[200px]">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-600">Upload new database schema</p>
              </CardContent>
            </Card>
          </label>
        </div>
      </div>
    </div>
  );
}
