import PageContainer from '@/components/layout/page-container';
import { AffiliationsClient } from '@/features/admin/components/AffiliationsClient';

export const metadata = { title: 'Affiliations — Admin' };

export default function AffiliationsPage() {
  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Liens d&apos;affiliation</h2>
        <AffiliationsClient />
      </div>
    </PageContainer>
  );
}
