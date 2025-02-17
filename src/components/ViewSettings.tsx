import React from "react";
import { useViews } from "@/hooks/useViews";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InputChangeEvent, TextareaChangeEvent } from "@/types/events";

export function ViewSettings() {
  const { currentView, updateView } = useViews();

  if (!currentView) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a view to edit its settings
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>View Settings</CardTitle>
          <CardDescription>Customize how the ERD is displayed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>View Name</Label>
            <Input
              value={currentView.name}
              onChange={(e: InputChangeEvent) =>
                updateView({
                  ...currentView,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={currentView.description || ""}
              onChange={(e: TextareaChangeEvent) =>
                updateView({
                  ...currentView,
                  description: e.target.value,
                })
              }
              placeholder="Add a description for this view..."
            />
          </div>

          <div className="space-y-4">
            <Label>Display Settings</Label>

            <div className="flex items-center justify-between">
              <Label htmlFor="hide-timestamps">Hide Timestamp Fields</Label>
              <Switch
                id="hide-timestamps"
                checked={currentView.settings?.hideTimestamps}
                onCheckedChange={(checked) =>
                  updateView({
                    ...currentView,
                    settings: {
                      ...currentView.settings,
                      hideTimestamps: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hide-meta">Hide Meta Fields</Label>
              <Switch
                id="hide-meta"
                checked={currentView.settings?.hideMetaFields}
                onCheckedChange={(checked) =>
                  updateView({
                    ...currentView,
                    settings: {
                      ...currentView.settings,
                      hideMetaFields: checked,
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
