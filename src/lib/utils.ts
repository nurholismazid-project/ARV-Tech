/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number | string): string {
  const numericValue = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '')) : value;
  if (isNaN(numericValue)) return '0';
  return new Intl.NumberFormat('id-ID').format(numericValue);
}

export function parseNumericValue(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, '')) || 0;
}
