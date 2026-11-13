import {z} from 'zod';
import type {Place} from './model';

const periodSchema=z.object({label:z.string(),hours:z.string()});
export const publishedHoursSchema=z.object({
  status:z.enum(['published','partial','calendar','unconfirmed']),
  periods:z.array(periodSchema),
  source:z.string().url(),
  checked_on:z.string().optional(),
  note:z.string().optional(),
});
export type PublishedHours=z.infer<typeof publishedHoursSchema>;
export function getPublishedHours(place:Pick<Place,'opening_hours'|'external_url'>):PublishedHours{
  const raw=place.opening_hours;
  const parsed=publishedHoursSchema.safeParse(raw&&typeof raw==='object'&&!Array.isArray(raw)?raw.published:undefined);
  if(parsed.success)return parsed.data;
  return {status:'unconfirmed',periods:[],source:place.external_url??'https://www.esmadrid.com'};
}