import { Home, Grid3X3, List, User } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavigationProps {
  userType: 'consumer' | 'seller' | 'business';
}

export default function BottomNavigation({ userType }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();

  const consumerNavItems = [
    { icon: Home, label: "Home", path: "/consumer-dashboard", active: location === "/consumer-dashboard" },
    { icon: Grid3X3, label: "Categories", path: "/categories", active: false },
    { icon: List, label: "My Plans", path: "/my-plans", active: false },
    { icon: User, label: "Profile", path: "/profile", active: false },
  ];

  const sellerNavItems = [
    { icon: Home, label: "Dashboard", path: "/seller-dashboard", active: location === "/seller-dashboard" },
    { icon: Grid3X3, label: "Opportunities", path: "/opportunities", active: false },
    { icon: List, label: "My Offers", path: "/offers", active: false },
    { icon: User, label: "Profile", path: "/seller-profile", active: false },
  ];

  const businessNavItems = [
    { icon: Home, label: "Dashboard", path: "/business-dashboard", active: location === "/business-dashboard" },
    { icon: Grid3X3, label: "RFQs", path: "/rfq-list", active: location === "/rfq-list" },
    { icon: List, label: "Requests", path: "/requests", active: false },
    { icon: User, label: "Company", path: "/company-profile", active: false },
  ];

  const navItems = userType === 'consumer' ? consumerNavItems : 
                   userType === 'seller' ? sellerNavItems : businessNavItems;

  return (
    <div className="bg-white border-t px-4 py-2">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setLocation(item.path)}
            className="py-2 text-center"
          >
            <item.icon 
              className={`mx-auto text-lg mb-1 block ${
                item.active ? 'text-primary' : 'text-neutral-600'
              }`} 
              size={20}
            />
            <span className={`text-xs ${
              item.active ? 'text-primary font-medium' : 'text-neutral-600'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
