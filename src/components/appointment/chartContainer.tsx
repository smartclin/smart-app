import { trpc } from '@/trpc/server'

import BloodPressureChart from './bloodPressureChart'
import { HeartRateChart } from './heartRateChart'

export default async function ChartContainer({ id }: { id: string }) {
  const { data, average, heartRateData, averageHeartRate } =
    await trpc.vitalSigns.getVitalSignData(id.toString())

  return (
    <>
      <BloodPressureChart
        average={average}
        data={data}
      />
      <HeartRateChart
        average={averageHeartRate}
        data={heartRateData}
      />
    </>
  )
}
