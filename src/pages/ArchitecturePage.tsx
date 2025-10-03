import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import { ArchitectureViewer } from "@/components/ArchitectureViewer";
import { useERDState } from "@/hooks/useERDState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Copy, Check, Download, Upload } from "lucide-react";
import { DiagramType } from "@/types";

interface ArchitecturePageProps {
  isShared?: boolean;
}

export function ArchitecturePage({ isShared }: ArchitecturePageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { views, selectView, currentView, updateView } = useERDState();

  React.useEffect(() => {
    if (id && !isShared) {
      const view = views.find((v) => v.id === id && v.type === DiagramType.ARCHITECTURE);
      if (view) {
        selectView(view);
      } else {
        // If view not found, redirect to home
        navigate("/");
      }
    }
  }, [id, views, selectView, navigate, isShared]);

  if (!currentView || currentView.type !== DiagramType.ARCHITECTURE) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Architecture diagram not found</h2>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Diagrams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Diagrams
          </Button>
          {!isShared && (
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <ReactFlowProvider>
          <ArchitectureViewer 
            currentView={currentView} 
            updateView={updateView}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}