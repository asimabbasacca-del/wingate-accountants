import { INVESTIGATION_GROUPS, INVESTIGATION_TOPICS } from "./data";
import type { InvestigationGroup, InvestigationTopic } from "./types";

export function investigationPath(slug?: string): string {
  return slug ? `/tax-investigations/${slug}/` : "/tax-investigations/";
}

export function getInvestigationTopics(): InvestigationTopic[] {
  return INVESTIGATION_TOPICS;
}

export function getInvestigationTopic(slug: string): InvestigationTopic | undefined {
  return INVESTIGATION_TOPICS.find((topic) => topic.slug === slug);
}

export function getInvestigationGroups(): InvestigationGroup[] {
  return INVESTIGATION_GROUPS;
}

export function topicsForGroup(groupId: InvestigationGroup["id"]): InvestigationTopic[] {
  return INVESTIGATION_TOPICS.filter((topic) => topic.groupId === groupId);
}

export function relatedTopics(topic: InvestigationTopic): InvestigationTopic[] {
  return topic.related
    .map((slug) => getInvestigationTopic(slug))
    .filter((item): item is InvestigationTopic => Boolean(item));
}
