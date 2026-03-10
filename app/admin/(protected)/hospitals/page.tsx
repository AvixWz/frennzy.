import { HospitalsManager } from "@/components/admin/hospitals-manager";
import { listHospitals, listReferenceData } from "@/lib/services/admin-service";

export default async function AdminHospitalsPage() {
  const [hospitals, reference] = await Promise.all([listHospitals(), listReferenceData()]);
  return <HospitalsManager initialHospitals={JSON.parse(JSON.stringify(hospitals))} treatments={reference.treatments} />;
}
