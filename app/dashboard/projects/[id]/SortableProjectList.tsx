"use client";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useEffect, useState } from "react";

type ProjectItem = {
  history_id: string;
  history: {
    id: string;
    title: string | null;
    created_at: string;
  } | null;
};

export function SortableProjectList({
  projectId,
  items,
}: {
  projectId: string;
  items: ProjectItem[];
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const [localItems, setLocalItems] = useState<ProjectItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalItems((current) => {
      const oldIndex = current.findIndex((i) => i.history_id === active.id);
      const newIndex = current.findIndex((i) => i.history_id === over.id);
      if (oldIndex === -1 || newIndex === -1) return current;

      const reordered = [...current];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      // 🔁 Persist new order
      void fetch("/dashboard/api/projects/reorder", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          items: reordered.map((i, index) => ({
            history_id: i.history_id,
            sort_order: index,
          })),
        }),
      });

      return reordered;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localItems.map((i) => i.history_id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {localItems.map((item) => (
            <SortableRow key={item.history_id} item={item} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/* -------------------------------------------------------
   SORTABLE ROW (WITH DRAG HANDLE)
------------------------------------------------------- */

function SortableRow({ item }: { item: ProjectItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id: item.history_id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const h = item.history;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
        flex items-center justify-between
        bg-slate-900 border border-slate-800
        rounded-lg p-4
        touch-none select-none
      "
    >
      {/* Clickable content */}
      <Link
        href={`/dashboard/history/${item.history_id}`}
        draggable={false}
        className="flex flex-col flex-1 pr-4"
      >
        <span className="text-slate-100 font-medium">
          {h?.title ?? "Untitled copy"}
        </span>
        <span className="text-xs text-slate-500">
          {h?.created_at
            ? new Date(h.created_at).toLocaleString("en-US")
            : "Unknown date"}
        </span>
      </Link>

      {/* Drag handle */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="
          cursor-grab active:cursor-grabbing
          text-slate-400 hover:text-slate-200
          flex items-center justify-center
          w-8 h-8
        "
        title="Drag to reorder"
      >
        ≡
      </div>
    </div>
  );
}
