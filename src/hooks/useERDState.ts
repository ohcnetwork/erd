import { useState, useCallback, useEffect } from "react";
import { ERDView } from "@/types";
import { Node, Edge } from "reactflow";
import Papa from "papaparse";
import { processCSVData } from "@/utils/csvProcessor";

interface ERDState {
  csvData: string[][];
  currentView: ERDView | null;
  views: ERDView[];
}

export function useERDState() {
  // Initialize state from localStorage
  const [state, setState] = useState<ERDState>(() => {
    const saved = localStorage.getItem("erdState");
    return saved
      ? JSON.parse(saved)
      : {
          csvData: [],
          currentView: null,
          views: [],
        };
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("erdState", JSON.stringify(state));
  }, [state]);

  const createView = useCallback(
    (
      name: string,
      nodes: Node[],
      edges: Edge[],
      currentState?: {
        filter: string;
        hidePrefix: string[];
        description?: string;
      }
    ) => {
      const newView: ERDView = {
        id: crypto.randomUUID(),
        name,
        description: currentState?.description ?? "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        starred: false,
        settings: {
          hideTimestamps: false,
          hideMetaFields: false,
          showFields: false,
        },
        data: {
          nodes: [...nodes],
          edges: [...edges],
          hidePrefix: [...(currentState?.hidePrefix ?? [])],
          filter: currentState?.filter ?? "",
        },
      };

      setState((prev) => ({
        ...prev,
        views: [...prev.views, newView],
        currentView: newView,
      }));

      return newView;
    },
    []
  );

  const updateView = useCallback((updatedView: ERDView) => {
    setState((prev) => {
      const newViews = prev.views.map((view) =>
        view.id === updatedView.id ? updatedView : view
      );
      return {
        ...prev,
        views: newViews,
        currentView: updatedView,
      };
    });
  }, []);

  const deleteView = useCallback((viewId: string) => {
    setState((prev) => ({
      ...prev,
      views: prev.views.filter((view) => view.id !== viewId),
      currentView: prev.currentView?.id === viewId ? null : prev.currentView,
    }));
  }, []);

  const selectView = useCallback((view: ERDView | null) => {
    setState((prev) => ({
      ...prev,
      currentView: view,
    }));
  }, []);

  const setCsvData = useCallback((data: string[][]) => {
    setState((prev) => ({
      ...prev,
      csvData: data,
    }));
  }, []);

  const handleFileUpload = useCallback(
    (file: File) => {
      Papa.parse<string[]>(file, {
        complete: (results) => {
          const data = results.data;
          setCsvData(data);

          const { nodes, edges } = processCSVData(data);
          const viewName = file.name.replace(".csv", "");
          createView(viewName, nodes, edges);
        },
        skipEmptyLines: true,
      });
    },
    [setCsvData, createView]
  );

  return {
    ...state,
    createView,
    updateView,
    deleteView,
    selectView,
    setCsvData,
    handleFileUpload,
  };
}
