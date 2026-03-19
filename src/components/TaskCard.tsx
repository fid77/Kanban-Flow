import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical } from "lucide-react";
import { Task } from "../types";
import { useState } from "react";

interface Props {
  task: Task;
  deleteTask: (id: string) => void;
  updateTask: (id: string, content: string) => void;
  key?: string;
}

export default function TaskCard({ task, deleteTask, updateTask }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-white p-4 min-h-[100px] items-center flex text-left rounded-xl border-2 border-emerald-500 cursor-grab relative"
      />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white p-4 min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-emerald-500 cursor-grab relative shadow-sm border border-black/5"
      >
        <textarea
          className="h-[90%] w-full resize-none border-none rounded bg-transparent text-zinc-800 focus:outline-none text-sm"
          value={task.content}
          autoFocus
          placeholder="Task content here"
          onBlur={toggleEditMode}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              toggleEditMode();
            }
          }}
          onChange={(e) => updateTask(task.id, e.target.value)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={toggleEditMode}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
      className="bg-white p-4 min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-emerald-500 cursor-grab relative group shadow-sm border border-black/5"
    >
      <div
        {...attributes}
        {...listeners}
        className="mr-2 text-zinc-400 hover:text-zinc-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={20} />
      </div>
      <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap text-zinc-800 text-sm">
        {task.content}
      </p>

      {mouseIsOver && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="stroke-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-zinc-100 transition-all"
        >
          <Trash2 size={18} className="text-zinc-400 hover:text-red-500" />
        </button>
      )}
    </div>
  );
}
