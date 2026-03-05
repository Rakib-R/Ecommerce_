import Link from "next/link";
import { ReactNode } from "react";

interface SidebarItemProps {
  icon: ReactNode;
  title: string;
  isActive: boolean;
  href: string;
}

const SidebarItem = ({ icon, title, isActive, href }: SidebarItemProps) => {
  return (
    <Link href={href} className=" block group">
      <div
        className={`
          flex gap-3 items-center w-full min-h-[48px] px-4 mb-4 rounded-xl transition-all duration-200
          ${isActive 
            ? "bg-blue-50 text-blue-600 shadow-sm scale-[0.98]" 
            : "text-gray-200 hover:bg-gray-100 hover:text-gray-900"}
        `}
      >
        {/* Icon Container */}
        <div className={`text-xl ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-900"}`}>
          {icon}
        </div>

        {/* Title */}
        <h5 className={`font-medium text-sm ${isActive ? "font-semibold" : ""}`}>
          {title}
        </h5>
      </div>
    </Link>
  );
};

export default SidebarItem;