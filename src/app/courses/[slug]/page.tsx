import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses, getCourse } from "@/data/courses";
import { CourseDetail } from "./CourseDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = getCourse((await params).slug);
  return { title: c?.title ?? "Course", description: c?.description };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getCourse(slug)) notFound();
  return <CourseDetail slug={slug} />;
}
