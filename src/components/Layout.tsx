import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Search, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

const pageTitles: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/animals': '动物管理',
  '/adoption': '领养中心',
  '/followup': '回访追踪',
  '/transfer': '跨站调配',
  '/stations': '站点管理',
  '/profile': '个人中心',
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  const getPageTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path)) {
        return title
      }
    }
    return 'TNR救助系统'
  }

  return (
    <div className="flex min-h-screen bg-[#FFFBF5]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#E7E5E4] bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded-lg p-2 hover:bg-[#F5F5F4]"
            >
              <Menu className="h-5 w-5 text-[#57534E]" />
            </button>
            <h1 className="text-xl font-semibold text-[#1C1917]">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                placeholder="搜索..."
                className="w-64 rounded-lg border border-[#E7E5E4] bg-[#FAFAF9] py-2 pl-10 pr-4 text-sm text-[#44403C] placeholder:text-[#A8A29E] focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
            </div>

            <button className="relative rounded-lg p-2 hover:bg-[#F5F5F4]">
              <Bell className="h-5 w-5 text-[#57534E]" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#F97316]" />
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-[#1C1917]">管理员</p>
                <p className="text-xs text-[#78716C]">admin@tnr.org</p>
              </div>
              <img
                src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20avatar%20portrait%20of%20a%20friendly%20female%20veterinarian%20in%20her%2030s%20with%20warm%20smile%20asian%20features&image_size=square"
                alt="用户头像"
                className="h-10 w-10 rounded-full border-2 border-[#F97316] object-cover"
              />
            </div>
          </div>
        </header>

        <main className={cn(
          'flex-1 p-6 transition-all duration-300',
          sidebarCollapsed ? 'md:ml-0' : 'md:ml-0',
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}
