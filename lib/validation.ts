import { z } from "zod";

export const projectStatuses = [
  "W trakcie",
  "Planowany",
  "Zakończony",
  "Wstrzymany",
] as const;

export const issueStatuses = [
  "Nie naprawiona",
  "W trakcie naprawy",
  "Naprawiona",
] as const;

export const issuePriorities = [
  "Niska",
  "Normalna",
  "Pilna",
  "Krytyczna",
] as const;

export const imageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const maxImageSize = 5 * 1024 * 1024;
export const maxIssueImages = 6;

const optionalText = (maxLength: number, label: string) =>
  z
    .string(`${label} ma niepoprawny format.`)
    .trim()
    .max(maxLength, `${label} jest za długie.`)
    .transform((value) => value || null);

const optionalDate = z
  .string("Data ma niepoprawny format.")
  .trim()
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      const date = new Date(`${value}T00:00:00.000Z`);

      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    },
    { message: "Data startu musi mieć format RRRR-MM-DD." },
  )
  .transform((value) => value || null);

export const loginSchema = z.object({
  email: z.string().trim().email("Podaj poprawny adres e-mail."),
  password: z.string().min(6, "Hasło musi mieć minimum 6 znaków."),
});

export const registerSchema = z
  .object({
    company: optionalText(120, "Nazwa firmy").optional(),
    email: z.string().trim().email("Podaj poprawny adres e-mail."),
    name: z
      .string()
      .trim()
      .min(2, "Podaj imię i nazwisko.")
      .max(100, "Imię i nazwisko jest za długie."),
    password: z.string().min(6, "Hasło musi mieć minimum 6 znaków."),
    passwordConfirm: z.string().min(6, "Powtórz hasło."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą być takie same.",
    path: ["passwordConfirm"],
  });

export const profileUpdateSchema = z.object({
  company_name: optionalText(120, "Nazwa firmy")
    .optional()
    .transform((value) => value ?? null),
  full_name: z
    .string()
    .trim()
    .min(2, "Podaj imię i nazwisko.")
    .max(100, "Imię i nazwisko jest za długie."),
});

export const passwordChangeSchema = z
  .object({
    current_password: z
      .string()
      .min(6, "Aktualne hasło musi mieć minimum 6 znaków."),
    password: z.string().min(6, "Nowe hasło musi mieć minimum 6 znaków."),
    passwordConfirm: z.string().min(6, "Powtórz nowe hasło."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Nowe hasła muszą być takie same.",
    path: ["passwordConfirm"],
  })
  .refine((data) => data.current_password !== data.password, {
    message: "Nowe hasło musi być inne niż aktualne.",
    path: ["password"],
  });

export const projectCreateSchema = z.object({
  client_name: optionalText(120, "Nazwa klienta")
    .optional()
    .transform((value) => value ?? null),
  location: optionalText(160, "Lokalizacja")
    .optional()
    .transform((value) => value ?? null),
  name: z
    .string()
    .trim()
    .min(2, "Podaj nazwę projektu.")
    .max(140, "Nazwa projektu jest za długa."),
  start_date: optionalDate.optional().transform((value) => value ?? null),
  status: z
    .enum(projectStatuses, {
      error: "Status projektu ma niepoprawną wartość.",
    })
    .default("W trakcie"),
});

export const projectUpdateSchema = projectCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Brak danych do aktualizacji projektu.",
  },
);

const imageFileSchema = z
  .custom<File>((file) => file instanceof File && file.size > 0)
  .refine((file) => !file || imageMimeTypes.includes(file.type as (typeof imageMimeTypes)[number]), {
    message: "Zdjęcie musi być w formacie JPG, PNG, WebP lub GIF.",
  })
  .refine((file) => !file || file.size <= maxImageSize, {
    message: "Zdjęcie może mieć maksymalnie 5 MB.",
  });

export const projectImageSchema = imageFileSchema.optional();

export const issueImagesSchema = z
  .array(imageFileSchema)
  .max(maxIssueImages, `Możesz dodać maksymalnie ${maxIssueImages} zdjęć.`);

export const issueDraftSchema = z.object({
  description: optionalText(1200, "Opis usterki")
    .optional()
    .transform((value) => value ?? null),
  images: issueImagesSchema.default([]),
  location: optionalText(160, "Miejsce").optional(),
  priority: z.enum(issuePriorities, {
    error: "Priorytet ma niepoprawną wartość.",
  }),
  status: z.enum(issueStatuses, {
    error: "Status naprawy ma niepoprawną wartość.",
  }),
  title: z
    .string()
    .trim()
    .min(3, "Tytuł usterki musi mieć minimum 3 znaki.")
    .max(140, "Tytuł usterki jest za długi."),
});

export function getZodErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Niepoprawne dane formularza.";
}
