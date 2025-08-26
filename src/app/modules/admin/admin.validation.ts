import z from "zod";

const updatedSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
});

export const adminValidatedData = {
  updatedSchema,
};
