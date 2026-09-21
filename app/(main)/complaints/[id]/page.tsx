import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComplaintDetailView } from "@/components/complaints/complaint-detail-view";
import { getPublicComplaint } from "@/lib/complaints/api";
import {
  complaintCategoryLabel,
  formatComplaintPublicId,
  stripHtmlTags,
} from "@/lib/complaints/display";
import { assertComplaintsEnabled } from "@/lib/complaints/flags";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!/^[0-9]+$/.test(id)) {
    return { title: "Complaint not found" };
  }

  const data = await getPublicComplaint(id);
  if (!data) {
    return { title: "Complaint not found" };
  }

  const title = stripHtmlTags(data.complaint.title ?? "Complaint");
  const casino = data.casino?.name ?? "Casino";
  const category = complaintCategoryLabel(data.complaint.category);

  return {
    title: `${formatComplaintPublicId(id)} · ${title}`,
    description: `${category} dispute against ${casino} on FairGambling Resolution.`,
    alternates: {
      canonical: `https://www.fairgambling.com/complaints/${id}`,
    },
  };
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  assertComplaintsEnabled();

  const { id } = await params;
  if (!/^[0-9]+$/.test(id)) notFound();

  const data = await getPublicComplaint(id);
  if (!data) notFound();

  return <ComplaintDetailView data={data} />;
}
