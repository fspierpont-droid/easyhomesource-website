import QuoteBuilderCatalogAuthority from '@/components/portal/QuoteBuilderCatalogAuthority';

export default function EditQuotePage({ params }: { params: { id: string } }) {
  return <QuoteBuilderCatalogAuthority quoteId={params.id} />;
}
