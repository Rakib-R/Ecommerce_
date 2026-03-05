
import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const SidebarMenu = ({ title, children }: Props) => {
  return (
    <div className="block bg-black">
      <h3 className="text-xs font-semibold py-2 uppercase text-gray-400 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
};

export default SidebarMenu;