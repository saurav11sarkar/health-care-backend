import z from "zod";

const specialtiesSchema = z.object({
  title: z.string({ error: "title is required" }).min(1),
});

export const specialtiesValidation = {
  specialtiesSchema,
};
