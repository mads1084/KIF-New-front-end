import { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

interface CollapsibleMenuProps {
  title: string;
  children: React.ReactNode;
}

const CollapsibleMenu: React.FC<CollapsibleMenuProps> = ({
  title,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
      >
        <span className="font-medium">{title}</span>
        {isOpen ? (
          <FaChevronDown className="w-4 h-4 text-white/50" />
        ) : (
          <FaChevronRight className="w-4 h-4 text-white/50" />
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="p-3 pl-6">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleMenu;
