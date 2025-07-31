"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Zap,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Building2,
  Receipt,
  Battery,
  Upload,
  TestTube,
  ChevronDown,
  ChevronRight,
  Factory,
  ScrollText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Unidades Consumidoras",
    href: "/consumer-units",
    icon: Building2,
  },
  {
    name: "Usinas de Energia",
    href: "/power-plants",
    icon: Factory,
  },
  {
    name: "Cofre Energético",
    href: "/energy-vault",
    icon: Battery,
    children: [
      {
        name: "Visualizar Cofre",
        href: "/energy-vault",
        icon: Battery,
      },
      {
        name: "Upload PDF",
        href: "/energy-vault/upload",
        icon: Upload,
      },
      {
        name: "Testar Extração",
        href: "/energy-vault/test",
        icon: TestTube,
      },
    ],
  },
  {
    name: "Contratos",
    href: "/contracts",
    icon: ScrollText,
  },
  {
    name: "Faturas",
    href: "/invoices",
    icon: Receipt,
  },
  {
    name: "Financeiro",
    href: "/financial",
    icon: DollarSign,
  },
  {
    name: "CRM",
    href: "/crm",
    icon: Users,
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>(["Cofre Energético"])

  const toggleItem = (name: string) => {
    setOpenItems((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-100">
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-semibold text-gray-800">Moara Gestão</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const hasChildren = item.children && item.children.length > 0
          const isItemOpen = openItems.includes(item.name)

          if (hasChildren) {
            return (
              <Collapsible key={item.name} open={isItemOpen} onOpenChange={() => toggleItem(item.name)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between text-left font-normal text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
                      isActive(item.href) && "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {isItemOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-6">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start font-normal text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
                          isActive(child.href) && "bg-blue-50 text-blue-700 border-r-2 border-blue-600",
                        )}
                      >
                        <child.icon className="h-4 w-4 mr-3" />
                        <span className="font-medium">{child.name}</span>
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
                  isActive(item.href) && "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
