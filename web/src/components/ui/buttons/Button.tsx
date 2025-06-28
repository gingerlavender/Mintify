import React, { MouseEventHandler } from "react";

export interface ButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <button className="task-button" onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};

export default Button;
