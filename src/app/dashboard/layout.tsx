import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ChatbotWidgetWrapper } from '@/components/layout/ChatbotWidgetWrapper'; // ← AJOUTER
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Arbitrage by VideoBourse',
  description: 'Comparez courtiers, néobanques, brokers CFD et plateformes crypto en France. Frais, scores et avis indépendants sur 40+ intermédiaires.',
  // Pas de noindex global — chaque page définit ses propres robots
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <InfobarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {children}
          </SidebarInset>
          <InfoSidebar side='right' />
          <ChatbotWidgetWrapper /> {/* ← AJOUTER */}
        </InfobarProvider>
      </SidebarProvider>
    </KBar>
  );
}