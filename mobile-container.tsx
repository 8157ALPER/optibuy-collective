import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="max-w-sm mx-auto bg-white dark:bg-gray-900 shadow-2xl min-h-screen relative overflow-hidden transition-colors duration-300">
      {children}
    </div>
  );
}
