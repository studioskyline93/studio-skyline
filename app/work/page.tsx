import { Section } from "@/components/section";
import WorkGrid from "@/components/work-grid";

export default function WorkPage() {
  return (
    <>
      <Section
        kicker="Archive"
        title="Work"
        description="Packaging, print, and production. Click a project to view images."
      />
      <WorkGrid />
    </>
  );
}
