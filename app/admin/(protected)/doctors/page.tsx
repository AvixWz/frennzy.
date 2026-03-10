import { DoctorsManager } from "@/components/admin/doctors-manager";
import { listDoctors, listReferenceData } from "@/lib/services/admin-service";

export default async function AdminDoctorsPage() {
  const [doctors, reference] = await Promise.all([listDoctors(), listReferenceData()]);
  return (
    <DoctorsManager
      initialDoctors={JSON.parse(JSON.stringify(doctors))}
      hospitals={reference.hospitals}
      treatments={reference.treatments}
    />
  );
}
