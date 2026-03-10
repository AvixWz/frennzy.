import { TreatmentsManager } from "@/components/admin/treatments-manager";
import { listReferenceData, listTreatments } from "@/lib/services/admin-service";

export default async function AdminTreatmentsPage() {
  const [treatments, reference] = await Promise.all([listTreatments(), listReferenceData()]);
  return (
    <TreatmentsManager
      initialTreatments={JSON.parse(JSON.stringify(treatments))}
      doctors={reference.doctors}
      hospitals={reference.hospitals}
    />
  );
}
