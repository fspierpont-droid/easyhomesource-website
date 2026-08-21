import QuoteBuilderUnified from '@/components/portal/QuoteBuilderUnified';

export default function EditQuotePage({ params }: { params: { id: string } }) {
  return <QuoteBuilderUnified quoteId={params.id} />;
}
