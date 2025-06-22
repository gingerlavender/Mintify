import React from "react";
import { ButtonProps } from "@/app/types/button";

const BaseButton: React.FC<ButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <button className="task-button" onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};

export default BaseButton;
