import PageContainer from "@/components/layout/page-container";
import { OffresAdminClient } from "@/features/admin/components/OffresAdminClient";

export const metadata = { title: "Offres — Admin ArbitrAge" };

export default function AdminOffresPage() {
  return (
    <PageContainer scrollable>
      <OffresAdminClient />
    </PageContainer>
  );
}
