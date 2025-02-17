import { useState, useCallback, useEffect } from "react";
import { ERDView } from "@/types";

export function useViews() {
  const [views, setViews] = useState<ERDView[]>(() => {
    const saved = localStorage.getItem("erdViews");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentView, setCurrentView] = useState<ERDView | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  useEffect(() => {
    localStorage.setItem("erdViews", JSON.stringify(views));
  }, [views]);

  const createView = useCallback((name: string) => {
    const newView: ERDView = {
      id: crypto.randomUUID(),
      name,
      description: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        hideTimestamps: false,
        hideMetaFields: false,
      },
      data: {
        nodes: [],
        edges: [],
        hidePrefix: [],
        filter: "",
      },
    };

    setViews((prev) => [...prev, newView]);
    setCurrentView(newView);
    setIsCreating(false);
    setNewViewName("");
  }, []);

  const updateView = useCallback((updatedView: ERDView) => {
    setViews((prev) =>
      prev.map((view) =>
        view.id === updatedView.id
          ? { ...updatedView, updatedAt: Date.now() }
          : view
      )
    );
    setCurrentView(updatedView);
  }, []);

  const deleteView = useCallback(
    (viewId: string) => {
      setViews((prev) => prev.filter((view) => view.id !== viewId));
      if (currentView?.id === viewId) {
        setCurrentView(null);
      }
    },
    [currentView]
  );

  const selectView = useCallback((view: ERDView) => {
    setCurrentView(view);
  }, []);

  return {
    views,
    currentView,
    createView,
    updateView,
    deleteView,
    selectView,
    isCreating,
    setIsCreating,
    newViewName,
    setNewViewName,
  };
}
