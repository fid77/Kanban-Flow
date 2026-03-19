import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Column, Task } from "./types";
import KanbanColumn from "./components/KanbanColumn";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./components/TaskCard";
import { motion } from "motion/react";

const defaultCols: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "doing", title: "In Progress" },
  { id: "done", title: "Done" },
];

export default function App() {
  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem("kanban-columns");
    return saved ? JSON.parse(saved) : defaultCols;
  });
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("kanban-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  useEffect(() => {
    localStorage.setItem("kanban-columns", JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <div className="min-h-screen w-full bg-zinc-100 overflow-x-auto overflow-y-hidden p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Kanban Flow</h1>
            <p className="text-zinc-500 text-sm mt-1">Organize your projects with ease.</p>
          </div>
          <button
            onClick={createNewColumn}
            className="h-[50px] w-[200px] cursor-pointer rounded-xl bg-emerald-600 border-2 border-emerald-700 p-4 ring-emerald-500 hover:bg-emerald-700 transition-all flex gap-2 items-center justify-center text-white font-semibold shadow-lg shadow-emerald-900/10"
          >
            <Plus size={20} />
            Add Column
          </button>
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <div className="flex gap-6">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              ))}
            </SortableContext>
          </div>

          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <KanbanColumn
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                />
              )}
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </motion.div>
    </div>
  );

  function updateTask(id: string, content: string) {
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });

    setTasks(newTasks);
  }

  function updateColumn(id: string, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  }

  function createTask(columnId: string) {
    const newTask: Task = {
      id: Math.floor(Math.random() * 10001).toString(),
      columnId,
      content: `New task ${tasks.length + 1}`,
      createdAt: Date.now(),
    };

    setTasks([...tasks, newTask]);
  }

  function deleteTask(id: string) {
    const newTasks = tasks.filter((task) => task.id !== id);
    setTasks(newTasks);
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: Math.floor(Math.random() * 10001).toString(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columnToAdd]);
  }

  function deleteColumn(id: string) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Dropping a Task over a Column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId as string;
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}
