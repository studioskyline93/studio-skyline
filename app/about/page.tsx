import { Section } from "@/components/section";
import AboutContentBlock from "@/components/about-content";

export default function AboutPage() {
  return (
    <>
      <Section
        kicker="Studio"
        title="About"
        description="A premium print + packaging studio focused on detail, consistency, and production-ready execution."
      />

      <AboutContentBlock />
    </>
  );
}
