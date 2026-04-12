import React from "react";

type QuickActionCardProps = {
  Icon: React.ElementType;
  title: string;
  description?: string;
};

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  Icon,
  title,
  description,
}) => {
  return (
    <div className="flex items-start gap-3 bg-white p-4 border border-gray-100 cursor-pointer rounded-md shadow-sm">
      <Icon className="w-6 h-6 text-blue-500 mt-1" />

      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

export default QuickActionCard;