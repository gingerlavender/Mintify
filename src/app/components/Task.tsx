"use client";

import { TaskProps } from "../types/task.types";
import { useTaskType } from "../hooks/useTaskType";

const Task: React.FC<TaskProps> = ({ taskType }) => {
  const { text, ButtonComponent } = useTaskType(taskType);

  return (
    <div className="flex flex-col md:flex-row md:justify-between font-[Inter] font-[200] text-xl rounded-3xl last:my-8 mt-8 items-center bg-green-800 p-8 shadow-xl shadow-green-950 w-[80%] text-center">
      <span>{text}</span>
      <ButtonComponent />
    </div>
  );
};

export default Task;
