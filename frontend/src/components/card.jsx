import React from "react";

export const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow p-4 ${className}`}
      {...props} // <- truyền tất cả props, bao gồm onClick
    >
      {children}
    </div>
  );
};
