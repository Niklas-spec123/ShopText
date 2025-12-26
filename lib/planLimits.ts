import { Plan } from "./getEffectivePlan";

export type PlanLimits = {
  generationsPerMonth: number;
  maxFavorites: number;
  maxProjects: number;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    generationsPerMonth: 5,
    maxFavorites: 5,
    maxProjects: 1,
  },
  pro: {
    generationsPerMonth: Infinity,
    maxFavorites: Infinity,
    maxProjects: Infinity,
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}
