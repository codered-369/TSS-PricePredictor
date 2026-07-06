import PredictorClient from './PredictorClient';
import { getPersistedData } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const data = await getPersistedData();
  
  return <PredictorClient initialData={data} />;
}
