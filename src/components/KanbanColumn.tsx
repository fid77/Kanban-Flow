import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2 } from "lucide-react";
import { Column, Task } from "../types";
import { useMemo, useState } from "react";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  deleteColumn: (id: string) => void;
  updateColumn: (id: string, title: string) => void;
  tasks: Task[];
  createTask: (columnId: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, content: string) => void;
  key?: string;
}

export default function KanbanColumn({
  column,
  deleteColumn,
  updateColumn,
  tasks,
  createTask,
  deleteTask,
  updateTask,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-zinc-100 opacity-40 w-[350px] h-[500px] max-h-[500px] rounded-2xl border-2 border-emerald-500 flex flex-col"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-zinc-50 w-[350px] h-[700px] max-h-[700px] rounded-2xl flex flex-col border border-black/5 shadow-sm"
    >
      {/* Column Header */}
      <div
        {...attributes}
        {...listeners}
        onClick={() => setEditMode(true)}
        className="text-md h-[60px] cursor-grab rounded-t-2xl p-4 font-semibold border-b border-black/5 flex items-center justify-between bg-white"
      >
        <div className="flex gap-2 items-center">
          <div className="flex justify-center items-center bg-zinc-100 px-2 py-1 text-xs rounded-full text-zinc-600">
            {tasks.length}
          </div>
          {!editMode && <span className="text-zinc-800">{column.title}</span>}
          {editMode && (
            <input
              className="bg-zinc-100 focus:border-emerald-500 border rounded outline-none px-2 py-1 text-sm font-normal"
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => setEditMode(false)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteColumn(column.id);
          }}
          className="stroke-zinc-500 hover:bg-zinc-100 p-2 rounded-lg transition-colors"
        >
          <Trash2 size={18} className="text-zinc-400 hover:text-red-500" />
        </button>
      </div>

      {/* Column Tasks */}
      <div className="flex flex-grow flex-col gap-4 p-4 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>

      {/* Column Footer */}
      <button
        className="flex gap-2 items-center border-t border-black/5 p-4 hover:bg-zinc-100 hover:text-emerald-600 active:bg-zinc-200 rounded-b-2xl transition-all text-zinc-500 font-medium"
        onClick={() => createTask(column.id)}
      >
        <Plus size={20} />
        Add Task
      </button>
    </div>
  );
}
