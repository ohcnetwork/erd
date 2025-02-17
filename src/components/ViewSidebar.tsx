import React, { useState, useMemo, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Eye,
  EyeOff,
  Save,
  Plus,
  Trash2,
  Clock,
  Star,
} from "lucide-react";
import { ERDView } from "@/types";
import { Textarea } from "@/components/ui/textarea";

interface ViewSidebarProps {
  filter: string;
  setFilter: (value: string) => void;
  hidePrefix: string[];
  togglePrefix: (prefix: string) => void;
  onSaveView: () => void;
  currentView: ERDView | null;
  views: ERDView[];
  onViewSelect: (view: ERDView) => void;
  onViewDelete: (viewId: string) => void;
  onCreateView: (name: string, description: string) => void;
}

const COMMON_PREFIXES = [
  { id: "facility", label: "Facility Tables", prefix: "facility_" },
  { id: "django", label: "Django Tables", prefix: "django_" },
  { id: "auth", label: "Auth Tables", prefix: "auth_" },
  { id: "users", label: "User Tables", prefix: "users_" },
  { id: "abdm", label: "ABDM Tables", prefix: "abdm_" },
  { id: "hcx", label: "HCX Tables", prefix: "hcx_" },
];

const SORT_OPTIONS = [
  { id: "recent", label: "Recently Updated", icon: Clock },
  { id: "name", label: "Name", icon: Filter },
  { id: "starred", label: "Starred", icon: Star },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["id"];

export function ViewSidebar({
  filter,
  setFilter,
  hidePrefix,
  togglePrefix,
  onSaveView,
  currentView,
  views = [],
  onViewSelect,
  onViewDelete,
  onCreateView,
}: ViewSidebarProps) {
  const [viewSearch, setViewSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [isCreatingView, setIsCreatingView] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewDescription, setNewViewDescription] = useState("");

  // Filter and sort views
  const filteredViews = useMemo(() => {
    if (!Array.isArray(views)) return [];

    let result = [...views];

    // Apply search filter
    if (viewSearch) {
      const searchLower = viewSearch.toLowerCase();
      result = result.filter(
        (view) =>
          view.name.toLowerCase().includes(searchLower) ||
          view.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    return result.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.updatedAt - a.updatedAt;
        case "name":
          return a.name.localeCompare(b.name);
        case "starred":
          return (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
        default:
          return 0;
      }
    });
  }, [views, viewSearch, sortBy]);

  return (
    <div className="w-80 border-r bg-gray-50/40 h-screen flex flex-col overflow-hidden">
      <div className="p-6 border-b bg-white">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-semibold">ERD Explorer</h2>
            <p className="text-sm text-gray-500">
              {currentView?.name || "Select a view"}
            </p>
          </div>
          {currentView && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSaveView();
              }}
              className="h-8"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="views" className="flex-1 flex flex-col min-h-0">
        <div className="px-6 pt-4">
          <TabsList className="w-full">
            <TabsTrigger value="views" className="flex-1">
              Views
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex-1">
              Filters
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="views" className="flex-1 px-6 pt-4 overflow-hidden">
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Saved Views</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingView(true)}
                className="h-8"
              >
                <Plus className="w-4 h-4 mr-2" />
                New View
              </Button>
            </div>

            {isCreatingView ? (
              <div className="space-y-4 p-4 border rounded-lg bg-white">
                <div className="space-y-2">
                  <Label htmlFor="new-view-name">View Name</Label>
                  <Input
                    id="new-view-name"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    placeholder="e.g., User Management"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-view-desc">Description</Label>
                  <Textarea
                    id="new-view-desc"
                    value={newViewDescription}
                    onChange={(e) => setNewViewDescription(e.target.value)}
                    placeholder="Describe this view..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingView(false);
                      setNewViewName("");
                      setNewViewDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newViewName.trim()) {
                        onCreateView(newViewName, newViewDescription);
                        setIsCreatingView(false);
                        setNewViewName("");
                        setNewViewDescription("");
                      }
                    }}
                    disabled={!newViewName.trim()}
                  >
                    Create View
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Search views..."
                  value={viewSearch}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setViewSearch(e.target.value)
                  }
                  className="w-full"
                />

                <div className="flex gap-2">
                  {SORT_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={sortBy === id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSortBy(id)}
                      className="flex-1"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {label}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>

          <ScrollArea className="h-[calc(100%-130px)]">
            <div className="space-y-2 pr-4">
              {filteredViews.map((view) => (
                <div
                  key={view.id}
                  className={`p-3 rounded-lg border ${
                    currentView?.id === view.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } cursor-pointer group`}
                  onClick={() => onViewSelect(view)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{view.name}</h3>
                        {view.starred && (
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      {view.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {view.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Updated {new Date(view.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {currentView?.id === view.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSaveView();
                          }}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDelete(view.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="filters"
          className="flex-1 px-6 pt-4 overflow-hidden"
        >
          <ScrollArea className="h-full">
            <div className="space-y-6">
              {/* Search Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Search Tables</Label>
                  <Search className="w-4 h-4 text-gray-500" />
                </div>
                <Input
                  placeholder="Type to search..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Filters Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Table Groups</Label>
                  <Filter className="w-4 h-4 text-gray-500" />
                </div>
                <div className="space-y-2">
                  {COMMON_PREFIXES.map(({ id, label, prefix }) => (
                    <Button
                      key={id}
                      variant={
                        hidePrefix.includes(prefix) ? "secondary" : "outline"
                      }
                      className="w-full justify-start"
                      onClick={() => togglePrefix(prefix)}
                    >
                      {hidePrefix.includes(prefix) ? (
                        <EyeOff className="w-4 h-4 mr-2 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2 text-gray-500" />
                      )}
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
