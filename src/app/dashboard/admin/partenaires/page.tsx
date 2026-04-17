import PageContainer from '@/components/layout/page-container';
import { AddPartnerClient } from '@/features/admin/components/AddPartnerClient';

export const metadata = { title: 'Intermédiaires — Admin' };

export default function PartenairesPage() {
  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-4 max-w-full overflow-x-hidden">
        <h2 className="text-2xl font-bold tracking-tight">Gestion des intermédiaires</h2>
        <AddPartnerClient />
      </div>
    </PageContainer>
  );
}
