import React from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Upload, Trash2, Star } from "lucide-react";
import { ERDView } from "@/types";

interface ViewListProps {
  views: ERDView[];
  onSelect: (view: ERDView) => void;
  onDelete: (viewId: string) => void;
  onUploadNew: () => void;
}

export function ViewList({
  views,
  onSelect,
  onDelete,
  onUploadNew,
}: ViewListProps) {
  return (
    <div className="grid gap-6">
      <Card className="border-dashed cursor-pointer hover:border-blue-500 transition-colors">
        <CardContent
          className="flex flex-col items-center justify-center h-40"
          onClick={onUploadNew}
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-600">Upload new database schema</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {views.map((view) => (
          <Card
            key={view.id}
            className="cursor-pointer hover:border-blue-500 transition-colors group"
            onClick={() => onSelect(view)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {view.name}
                    {view.starred && (
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Created {new Date(view.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(view.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 line-clamp-2">
                {view.description || "No description"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
