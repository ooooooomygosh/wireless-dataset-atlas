import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { datasetSchema } from "./schema.ts";

const datasets = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./data/datasets" }),
  schema: datasetSchema,
});

export const collections = { datasets };
