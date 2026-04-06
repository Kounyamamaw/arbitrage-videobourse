"use client";
import PageContainer from '@/components/layout/page-container';
import { AssetAdminPage } from '@/features/admin/components/AssetAdminPage';

export default function Page() {
  return (
    <PageContainer>
      <AssetAdminPage assetType="actions" label="Actions" supabaseTable="actions" />
    </PageContainer>
  );
}
