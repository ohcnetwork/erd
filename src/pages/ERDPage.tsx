import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import { ERDViewer } from "@/components/ERDViewer";
import { useERDState } from "@/hooks/useERDState";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Copy, Check, Download, Upload } from "lucide-react";
import { decodeERDData, encodeERDData } from "@/utils/urlSharing";
import { downloadAsJSON, importFromJSON } from "@/utils/erdExport";
import { ERDView } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ERDPageProps {
  isShared?: boolean;
}

export function ERDPage({ isShared }: ERDPageProps) {
  const { id, data } = useParams<{ id: string; data: string }>();
  const navigate = useNavigate();
  const { views, selectView, currentView } = useERDState();
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState("");
  const [isCopied, setIsCopied] = React.useState(false);
  const [shareError, setShareError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isShared && data) {
      const sharedData = decodeERDData(data);
      if (sharedData) {
        // Create a temporary view for the shared data
        selectView({
          id: "shared",
          name: "Shared ERD",
          description: "Shared ERD diagram",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          starred: false,
          settings: {
            hideTimestamps: false,
            hideMetaFields: false,
            showFields: true,
            ...sharedData.settings,
          },
          data: {
            nodes: sharedData.nodes,
            edges: sharedData.edges,
            hidePrefix: [],
            filter: "",
          },
        });
      } else {
        navigate("/");
      }
    } else if (!isShared && id) {
      const view = views.find((v: ERDView) => v.id === id);
      if (view) {
        selectView(view);
      } else {
        navigate("/");
      }
    }
  }, [id, data, views, selectView, navigate, isShared]);

  const handleShare = React.useCallback(() => {
    try {
      setShareError(null);
      if (!currentView) {
        console.error("No current view available");
        return;
      }

      const shareData = {
        nodes: currentView.data.nodes,
        edges: currentView.data.edges,
        settings: {
          hideTimestamps: currentView.settings.hideTimestamps,
          hideMetaFields: currentView.settings.hideMetaFields,
          showFields: currentView.settings.showFields,
        },
      };

      const encoded = encodeERDData(shareData);
      const url = `${window.location.origin}/share/${encoded}`;
      setShareUrl(url);
      setIsShareDialogOpen(true);
    } catch (error) {
      console.error("Share error:", error);
      setShareError(
        error instanceof Error
          ? error.message
          : "Error sharing diagram. Please try again."
      );
      setIsShareDialogOpen(true);
    }
  }, [currentView]);

  const handleExport = React.useCallback(() => {
    if (!currentView) return;

    downloadAsJSON(
      {
        nodes: currentView.data.nodes,
        edges: currentView.data.edges,
        settings: currentView.settings,
        metadata: {
          name: currentView.name,
          description: currentView.description,
          exportedAt: Date.now(),
          version: "1.0",
        },
      },
      currentView.name
    );
  }, [currentView]);

  const handleImport = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content !== "string") return;

        const importedData = importFromJSON(content);
        if (importedData) {
          selectView({
            id: "imported",
            name: importedData.metadata?.name || "Imported ERD",
            description: importedData.metadata?.description || "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            starred: false,
            settings: importedData.settings || {
              hideTimestamps: false,
              hideMetaFields: false,
              showFields: true,
            },
            data: {
              nodes: importedData.nodes,
              edges: importedData.edges,
              hidePrefix: [],
              filter: "",
            },
          });
        }
      };
      reader.readAsText(file);
    },
    [selectView]
  );

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to ERDs
          </Button>
          {!isShared && (
            <div className="flex items-center space-x-2">
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
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <ReactFlowProvider>
          <ERDViewer />
        </ReactFlowProvider>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share ERD</DialogTitle>
            <DialogDescription>
              {shareError ? (
                <div className="flex items-start space-x-2 text-destructive">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{shareError}</span>
                </div>
              ) : (
                "Copy this URL to share your ERD diagram with others"
              )}
            </DialogDescription>
          </DialogHeader>
          {!shareError && (
            <div className="flex items-center space-x-2">
              <Input value={shareUrl} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {isCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsShareDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
