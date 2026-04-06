import PageContainer from '@/components/layout/page-container';
import { ConseillerIAClient } from '@/features/conseiller-ia/components/ConseillerIAClient';

export const metadata = { title: 'Conseiller IA — ArbitrAge' };

export default function ConseillerIAPage() {
  return (
    <PageContainer>
      <ConseillerIAClient />
    </PageContainer>
  );
}
