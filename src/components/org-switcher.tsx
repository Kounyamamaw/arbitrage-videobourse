'use client';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export function OrgSwitcher() {
  const { state, isMobile } = useSidebar();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const logoSrc = isDark ? '/comparatif/logos/logo-dark.svg' : '/comparatif/logos/logo-light.svg';
  const isExpanded = state === 'expanded' || isMobile;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {isExpanded ? (
          <div className='flex flex-col gap-1 w-full px-1 py-1'>
            <div className='flex items-center gap-2 w-full'>
              <SidebarMenuButton size='lg' asChild className='h-auto flex-1 py-1 min-w-0'>
                <Link href='/dashboard/overview'>
                  <img src={logoSrc} alt='ArbitrAge'
                    className='h-8 w-auto max-w-[140px] object-contain object-left'
                  />
                </Link>
              </SidebarMenuButton>
              <a href='https://videobourse.fr' rel='noopener noreferrer'
                className='flex shrink-0 items-center rounded-md p-1.5 opacity-70 transition-opacity hover:opacity-100' title='VideoBourse.fr'>
                <img src='/comparatif/logos/videobourse.svg' alt='VideoBourse' className='h-7 w-7 object-contain' />
              </a>
            </div>
            <div className='px-2'>
              <span className='rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'>
                Bêta
              </span>
            </div>
          </div>
        ) : (
          <SidebarMenuButton size='lg' asChild className='h-auto py-2 flex items-center justify-center'>
            <Link href='/dashboard/overview'>
              <img src='/comparatif/favicon.svg' alt='ArbitrAge'
                className='h-7 w-7 object-contain'
              />
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}