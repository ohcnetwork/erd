import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import { ERDViewer } from "@/components/ERDViewer";
import { useERDState } from "@/hooks/useERDState";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function ERDPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { views, selectView } = useERDState();

  React.useEffect(() => {
    const view = views.find((v) => v.id === id);
    if (view) {
      selectView(view);
    } else {
      navigate("/");
    }
  }, [id, views, selectView, navigate]);

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to ERDs
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <ReactFlowProvider>
          <ERDViewer />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
