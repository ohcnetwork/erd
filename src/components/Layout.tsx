import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ViewList } from "./ViewList";
import { ViewSettings } from "./ViewSettings";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="w-80 border-r bg-gray-50/40 p-4 flex flex-col">
        <Tabs defaultValue="views" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="views">Views</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="views" className="flex-1">
            <ViewList />
          </TabsContent>
          <TabsContent value="settings" className="flex-1">
            <ViewSettings />
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
