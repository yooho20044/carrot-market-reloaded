import {z} from "zod";

export const profileSchema = z.object({
    username: z.string({
        required_error:"Username is required"
    }),
    email: z.string().optional().nullable(),
    avatar: z.string().nullable(),
    phone: z.string().nullable(),
});

export type ProfileType = z.infer<typeof profileSchema>;