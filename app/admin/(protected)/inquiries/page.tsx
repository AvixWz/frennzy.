import { InquiriesManager } from "@/components/admin/inquiries-manager";
import { listInquiries } from "@/lib/services/admin-service";

export default async function AdminInquiriesPage() {
  const inquiries = await listInquiries();
  return <InquiriesManager initialInquiries={JSON.parse(JSON.stringify(inquiries))} />;
}
