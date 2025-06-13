import React from "react";
import { ButtonProps } from "@/app/types/button.types";

const BaseButton: React.FC<ButtonProps> = ({ text }) => {
  return <button className="task-button">{text}</button>;
};

export default BaseButton;
