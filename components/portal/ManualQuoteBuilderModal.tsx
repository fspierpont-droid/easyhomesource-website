'use client';

import { useEffect } from 'react';
import type { Property } from '@/types/property';
import type { SavedQuote } from '@/data/quotesStore';

export type { SavedQuote, SelectedQuoteLineItem } from '@/data/quotesStore';

interface ManualQuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuote: (quote: SavedQuote) => void;
  initialCustomerName?: string;
  initialHomeModel?: string;
  initialPropertyId?: string;
  availableProperties: Property[];
  existingQuote?: SavedQuote | null;
}

/**
 * Compatibility bridge for portal screens that still toggle the retired modal.
 *
 * The former modal maintained its own quote/pricing/delivery implementation and
 * wrote to localStorage before permanent persistence completed. That allowed
 * ghost quotes to appear in the library even when the server rejected them.
 * All quote creation/editing now routes to the single permanent unified builder.
 */
export function ManualQuoteBuilderModal(props: ManualQuoteBuilderModalProps) {
  const { isOpen, onClose, existingQuote } = props;

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const destination = existingQuote?.id
      ? `/quotes/${encodeURIComponent(existingQuote.id)}/edit`
      : '/quotes/new';

    onClose();
    window.location.assign(destination);
  }, [existingQuote?.id, isOpen, onClose]);

  return null;
}
