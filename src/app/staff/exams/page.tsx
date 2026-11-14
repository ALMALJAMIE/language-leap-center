"use client";

import { useState } from "react";
import { useRole } from "@/lib/roles";
import { StaffShell } from "@/components/staff/StaffShell";
import { Tabs } from "@/components/teaching/ui";
import { ExamsTab } from "./ExamsTab";
import { BankTab } from "./BankTab";
import { MarkingTab } from "./MarkingTab";

type Tab = "exams" | "bank" | "marking";

export default function ExamsPage() {
  return (
    <StaffShell page="/staff/exams/" title="Exams & Question Bank" subtitle="Unit tests, final exams and the placement test — build them from the question bank, open them for learners, and mark written answers">
      <Exams />
    </StaffShell>
  );
}

function Exams() {
  const role = useRole((s) => s.role);
  const [tab, setTab] = useState<Tab>(role === "teacher" ? "marking" : "exams");
  return (
    <>
      <Tabs value={tab} onChange={setTab} items={[{ id: "exams", label: "Exams" }, { id: "bank", label: "Question bank" }, { id: "marking", label: "Marking" }]} />
      {tab === "exams" && <ExamsTab />}
      {tab === "bank" && <BankTab />}
      {tab === "marking" && <MarkingTab />}
    </>
  );
}
