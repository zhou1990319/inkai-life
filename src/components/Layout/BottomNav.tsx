import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, User } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/explore', label: 'Community', icon: Users },
  { path: '/create', label: 'Inspire', icon: BookOpen },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0B0E]/95 backdrop-blur-md border-t border-[#2A2A36] md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                isActive ? 'text-[#CFAF6E]' : 'text-[#6B6B78] hover:text-[#B0B0B8]'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#CFAF6E]' : 'text-[#6B6B78]'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-[#CFAF6E] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
