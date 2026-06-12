
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Cat,
  Heart,
  Calendar,
  ArrowLeftRight,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  PawPrint,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/animals', label: '动物管理', icon: Cat },
  { path: '/adoption', label: '领养中心', icon: Heart },
  { path: '/followup', label: '回访追踪', icon: Calendar },
  { path: '/transfer', label: '跨站调配', icon: ArrowLeftRight },
  { path: '/stations', label: '站点管理', icon: Building2 },
  { path: '/profile', label: '个人中心', icon: User },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <aside
      className={cn(
        'flex h-screen flex-col bg-[#1C1917] text-[#FFFBF5] transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-[#292524] px-4">
        <div className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F97316]">
            <PawPrint className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold">TNR救助系统</span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="rounded p-1 hover:bg-[#292524]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="absolute right-0 translate-x-1/2 top-20 rounded-full border-2 border-[#1C1917] bg-[#F97316] p-1 shadow-lg"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname.startsWith(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                isActive
                  ? 'bg-[#F97316] text-white'
                  : 'hover:bg-[#292524]',
                collapsed && 'justify-center',
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
