import QuoteBuilderCatalogAuthority from '@/components/portal/QuoteBuilderCatalogAuthority';

type EditQuoteParams = Promise<{ id: string }>;

export default async function EditQuotePage({ params }: { params: EditQuoteParams }) {
  const { id } = await params;
  return <QuoteBuilderCatalogAuthority quoteId={id} />;
}
