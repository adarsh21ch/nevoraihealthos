import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/tips")({
  component: AdminTips,
});

function AdminTips() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Tips</h1>
        <Button className="bg-ink text-white rounded-xl h-12 px-6">
          <Plus className="mr-2 h-4 w-4" /> Add Tip
        </Button>
      </div>
      <Card className="p-8 text-center text-slate-500 border-dashed rounded-[2rem]">
        Tips management content will be migrated here.
      </Card>
    </div>
  );
}
