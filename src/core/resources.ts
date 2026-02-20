import type { Resource } from "../types";

export function flattenResources(resources: Resource[]): Resource[] {
  const result: Resource[] = [];

  for (const resource of resources) {
    result.push(resource);

    if (resource.children) {
      result.push(...flattenResources(resource.children));
    }
  }

  return result;
}
