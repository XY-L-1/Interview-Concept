import type { Fact, PreparationWorkspace } from "./model";
import { roleTemplates } from "./roles";

export function isConfirmedPersonalFact(fact: Fact): boolean {
  return (fact.provenance === "user-confirmed" || fact.provenance === "code-evidence")
    && fact.contribution === "personal"
    && fact.text.trim().length > 0;
}

export function buildPreparation(workspace: PreparationWorkspace) {
  const template = roleTemplates[workspace.context.focus];
  function rank(facts: readonly Fact[]): Fact[] {
    const score = (fact: Fact) => fact.tags.reduce(
      (total, tag) => total + (template.tags.includes(tag.toLowerCase()) ? 1 : 0),
      0,
    );
    return facts.toSorted((a, b) => score(b) - score(a));
  }
  const confirmed = rank(workspace.profile.facts.filter(isConfirmedPersonalFact));
  const opening = workspace.profile.displayName.trim()
    ? `Hi, I'm ${workspace.profile.displayName.trim()}.`
    : "Hello, thank you for speaking with me.";
  const roleTitle = workspace.context.roleTitle.trim();
  const company = workspace.context.company.trim();
  const opportunity = roleTitle ? `the ${roleTitle} opportunity` : "this opportunity";
  const closing = company || roleTitle
    ? `I look forward to discussing ${opportunity}${company ? ` at ${company}` : ""}.`
    : "";
  const introduction = confirmed.length
    ? [opening, ...confirmed.slice(0, 3).map((fact) => fact.text), template.transition, closing].filter(Boolean).join(" ")
    : "Add a user-confirmed personal fact to prepare an introduction grounded in your experience.";
  const factsById = new Map(workspace.profile.facts.map((fact) => [fact.id, fact]));
  return {
    template,
    introduction,
    confirmedCount: confirmed.length,
    stories: workspace.profile.stories.map((story) => {
      const linked = story.factIds.flatMap((id) => {
        const fact = factsById.get(id);
        return fact ? [fact] : [];
      });
      const personal = rank(linked.filter(isConfirmedPersonalFact));
      return {
        id: story.id,
        title: story.title,
        teamContext: linked
          .filter((fact) => fact.contribution === "team" && fact.provenance !== "needs-review")
          .map((fact) => fact.text)
          .join(" "),
        answer: personal.length
          ? [...personal.map((fact) => fact.text), template.transition, closing].filter(Boolean).join(" ")
          : "No confirmed personal contribution is linked to this story yet.",
        includedFactIds: personal.map((fact) => fact.id),
        excludedCount: linked.length - personal.length,
        reflection: story.reflection,
      };
    }),
  };
}
