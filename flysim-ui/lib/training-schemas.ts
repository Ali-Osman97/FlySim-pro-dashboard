import { z } from "zod"

export const skillCategorySchema = z.enum([
  "Computer Science",
  "Engineering",
  "Project Management",
])

const skillMappingSchema = z.object({
  skill_id: z.string().min(1),
  name: z.string().min(1),
  category: skillCategorySchema,
  weight: z.number().int().min(1).max(100),
}).strict()

const rubricCriterionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  weight: z.number().int().min(1).max(100),
  evidence_terms: z.array(z.string().min(1)).min(1),
}).strict()

export const trainingTaskSchema = z.object({
  id: z.string().min(1),
  source_id: z.string().min(1),
  title: z.string().min(1),
  domain: z.string().min(1),
  difficulty: z.enum(["Foundation", "Intermediate", "Advanced"]),
  brief: z.string().min(1),
  scenario: z.string().min(1),
  deliverables: z.array(z.string().min(1)).min(1),
  constraints: z.array(z.string().min(1)),
  estimated_minutes: z.number().int().min(10).max(480),
  skills: z.array(skillMappingSchema).min(1),
  rubric: z.array(rubricCriterionSchema).min(1),
}).strict()

export const trainingTasksSchema = z.array(trainingTaskSchema).min(1)

const sourceCaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  domain: z.string().min(1),
  source_type: z.enum(["Project", "Incident", "Case Study", "Design Brief"]),
  context: z.string().min(1),
  objectives: z.array(z.string().min(1)).min(1),
  constraints: z.array(z.string().min(1)),
  collected_at: z.string().min(1),
}).strict()

export const sourceCollectionResultSchema = z.object({
  source: sourceCaseSchema,
  task: trainingTaskSchema,
}).strict()

const criterionAssessmentSchema = z.object({
  criterion_id: z.string().min(1),
  title: z.string().min(1),
  score: z.number().int().min(0).max(100),
  feedback: z.string().min(1),
  evidence_found: z.array(z.string()),
}).strict()

const skillAssessmentSchema = z.object({
  skill_id: z.string().min(1),
  name: z.string().min(1),
  category: skillCategorySchema,
  score: z.number().int().min(0).max(100),
  benchmark: z.number().int().min(0).max(100),
}).strict()

const skillGapSchema = z.object({
  skill_id: z.string().min(1),
  name: z.string().min(1),
  category: skillCategorySchema,
  score: z.number().int().min(0).max(100),
  target: z.number().int().min(0).max(100),
  gap: z.number().int().min(0).max(100),
  recommendation: z.string().min(1),
}).strict()

export const evaluationReportSchema = z.object({
  submission_id: z.string().min(1),
  task_id: z.string().min(1),
  task_title: z.string().min(1),
  submitted_at: z.string().min(1),
  evaluator_mode: z.enum(["ai", "rubric_fallback"]),
  overall_score: z.number().int().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(z.string().min(1)),
  criterion_assessments: z.array(criterionAssessmentSchema).min(1),
  skill_assessments: z.array(skillAssessmentSchema).min(1),
  skill_gaps: z.array(skillGapSchema),
  next_steps: z.array(z.string().min(1)).min(1),
}).strict()

export const evaluationReportsSchema = z.array(evaluationReportSchema)

export type TrainingTask = z.infer<typeof trainingTaskSchema>
export type EvaluationReport = z.infer<typeof evaluationReportSchema>
export type SourceCollectionResult = z.infer<typeof sourceCollectionResultSchema>
