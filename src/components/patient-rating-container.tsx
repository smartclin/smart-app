import db from '@/db';
import { getSession } from '@/lib/auth';

import { RatingList } from './rating-list';

export const PatientRatingContainer = async ({ id }: { id?: string }) => {
  const session = await getSession();
  const userId = session?.user.id;

  const data = await db.rating.findMany({
    take: 10,
    where: { patientId: id ? id : (userId ?? 'N/A') },
    include: { patient: { select: { lastName: true, firstName: true } } },
    orderBy: { createdAt: 'desc' }
  });

  if (!data) return null; // Though `findMany` always returns an array, empty or not

  // FIX: Map over the data to transform 'comment: null' to 'comment: undefined'
  const transformedData = data.map(rating => ({
    ...rating,
    // Explicitly check if comment is null and convert to undefined
    comment: rating.comment === null ? undefined : rating.comment
  }));

  return (
    <div>
      {/* FIX: Pass the transformedData to RatingList */}
      <RatingList data={transformedData} />
    </div>
  );
};
