import React from "react";
import { ButtonProps } from "@/app/types/button.types";

const BaseButton: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button className="task-button" onClick={onClick}>
      {text}
    </button>
  );
};

export default BaseButton;
