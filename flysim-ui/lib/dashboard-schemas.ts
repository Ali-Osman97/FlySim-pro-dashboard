import { z } from "zod"

const percentageSchema = z.number().int().min(0).max(100)
const impactSchema = z.enum(["High", "Medium", "Low"])
const riskSchema = z.enum(["High", "Medium", "Low"])
const trendSchema = z.enum(["up", "stable", "down"])
const colorClassSchema = z.enum(["border-cyan-500", "border-indigo-600", "border-rose-400"])

const insightSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  impact: impactSchema,
  colorClass: colorClassSchema,
}).strict()

const radarItemSchema = z.object({
  subject: z.string().min(1),
  Actual: percentageSchema,
  Benchmark: percentageSchema,
}).strict()

const subSkillSchema = z.object({
  name: z.string().min(1),
  score: percentageSchema,
  benchmark: percentageSchema,
  trend: trendSchema,
}).strict()

const colorThemeSchema = z.object({
  text: z.enum(["text-indigo-400", "text-cyan-400", "text-slate-400"]),
  bg: z.enum(["bg-indigo-500/10", "bg-cyan-500/10", "bg-slate-500/10"]),
  border: z.enum(["border-indigo-500/20", "border-cyan-500/20", "border-slate-500/20"]),
  accent: z.enum(["bg-indigo-500", "bg-cyan-500", "bg-slate-400"]),
  fill: z.string().regex(/^#[0-9a-fA-F]{6}$/),
}).strict()

const skillCategorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  colorTheme: colorThemeSchema,
  subSkills: z.array(subSkillSchema).min(1),
}).strict()

export const skillsResponseSchema = z.object({
  radarData: z.array(radarItemSchema).min(1),
  skillCategories: z.array(skillCategorySchema).min(1),
  crewAIInsights: z.array(insightSchema),
}).strict()

const velocityItemSchema = z.object({
  month: z.string().min(1),
  Velocity: percentageSchema,
  Completed: percentageSchema,
  Target: percentageSchema,
}).strict()

const efficiencyItemSchema = z.object({
  module: z.string().min(1),
  Efficiency: percentageSchema,
  DeliveryDays: z.number().int().min(0),
}).strict()

const reportItemSchema = z.object({
  id: z.string().regex(/^REP-\d{2}-\d{2}$/),
  title: z.string().min(1),
  discipline: z.string().min(1),
  risk: riskSchema,
  date: z.string().regex(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/),
}).strict()

export const reportsResponseSchema = z.object({
  velocityData: z.array(velocityItemSchema).min(1),
  efficiencyData: z.array(efficiencyItemSchema).min(1),
  crewAIInsights: z.array(insightSchema),
  reportsList: z.array(reportItemSchema),
}).strict()

export type SkillsResponse = z.infer<typeof skillsResponseSchema>
export type ReportsResponse = z.infer<typeof reportsResponseSchema>
export type ApiInsight = z.infer<typeof insightSchema>
export type SkillCategory = z.infer<typeof skillCategorySchema>
export type ReportItem = z.infer<typeof reportItemSchema>
