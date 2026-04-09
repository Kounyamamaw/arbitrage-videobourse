import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'ArbitrAge — Dashboard',
  description: 'Comparateur de courtiers et ETF',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  // Ouvert par défaut sur PC (sauf si l'utilisateur a explicitement fermé = cookie 'false')
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <InfobarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {/* page main content */}
            {children}
            {/* page main content ends */}
          </SidebarInset>
          <InfoSidebar side='right' />
        </InfobarProvider>
      </SidebarProvider>
    </KBar>
  );
}
