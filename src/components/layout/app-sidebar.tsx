'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { navItems } from '@/config/nav-config';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import { NavItem } from '@/types';

const SECTIONS = [
  { label: "Outils",       items: ["Vue d'ensemble"] },
  { label: 'Courtiers',    items: ['Courtiers'] },
  { label: 'Actifs',       items: ['Actifs'] },
  { label: 'Intelligence', items: ['Conseiller IA'] },
];

function SubItem({ subItem, pathname }: { subItem: NavItem; pathname: string }) {
  if (subItem.items && subItem.items.length > 0) {
    return (
      <SidebarMenuSubItem>
        <Collapsible defaultOpen={true} className='group/sub'>
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton className='cursor-pointer'>
              <span>{subItem.title}</span>
              <IconChevronRight className='ml-auto h-3 w-3 transition-transform duration-200 group-data-[state=open]/sub:rotate-90' />
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className='ml-3 border-l border-border pl-2 mt-0.5 flex flex-col gap-0.5'>
              {subItem.items.map((leaf) => (
                <SidebarMenuSubItem key={leaf.title}>
                  <SidebarMenuSubButton isActive={false} className='opacity-40 cursor-default text-[11px]'>
                    <span>{leaf.title}</span>
                    <span className='ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground'>Bientôt</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuSubItem>
    );
  }

  const isComingSoon = subItem.url === '#';
  return (
    <SidebarMenuSubItem>
      {isComingSoon ? (
        <SidebarMenuSubButton isActive={false} className='opacity-40 cursor-default'>
          <span>{subItem.title}</span>
          <span className='ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground'>Bientôt</span>
        </SidebarMenuSubButton>
      ) : (
        <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
          <Link href={subItem.url}><span>{subItem.title}</span></Link>
        </SidebarMenuSubButton>
      )}
    </SidebarMenuSubItem>
  );
}

function CollapsibleNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const { state, isMobile } = useSidebar();
  const router = useRouter();
  const Icon = item.icon ? Icons[item.icon] : Icons.logo;
  const isCollapsed = state === 'collapsed' && !isMobile;

  const isActive =
    item.items?.some((sub) =>
      (sub.url !== '#' && pathname === sub.url) ||
      sub.items?.some((leaf) => leaf.url !== '#' && pathname === leaf.url)
    ) ||
    (item.url !== '#' && pathname.startsWith(item.url));

  // First navigable child (for collapsed click-through)
  const firstUrl = item.items?.find((s) => s.url !== '#')?.url;

  // In collapsed mode (desktop only): clicking navigates to first child instead of toggling
  if (isCollapsed && firstUrl) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={item.title}
          isActive={!!isActive}
          onClick={() => router.push(firstUrl)}
        >
          {item.icon && <Icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // On mobile and desktop expanded: show full collapsible
  // Actifs est fermé par défaut, les autres restent ouverts
  return (
    <Collapsible asChild defaultOpen={item.title !== 'Actifs'} className='group/collapsible'>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={!!isActive}>
            {item.icon && <Icon />}
            <span>{item.title}</span>
            <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SubItem key={subItem.title} subItem={subItem} pathname={pathname} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='group-data-[collapsible=icon]:pt-4'>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {SECTIONS.map((section) => {
          const sectionItems = navItems.filter((item) => section.items.includes(item.title));
          if (sectionItems.length === 0) return null;

          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarMenu>
                {sectionItems.map((item) => {
                  const Icon = item.icon ? Icons[item.icon] : Icons.logo;

                  if (item.items && item.items.length > 0) {
                    return <CollapsibleNavItem key={item.title} item={item} pathname={pathname} />;
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                        <Link href={item.url}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
