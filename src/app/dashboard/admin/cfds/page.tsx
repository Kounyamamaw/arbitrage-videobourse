"use client";
import PageContainer from '@/components/layout/page-container';
import { AssetAdminPage } from '@/features/admin/components/AssetAdminPage';

export default function Page() {
  return (
    <PageContainer>
      <AssetAdminPage assetType="cfds" label="CFD" supabaseTable="cfds" />
    </PageContainer>
  );
}
