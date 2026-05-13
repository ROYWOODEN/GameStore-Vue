import { z } from 'zod'

type Translate = (key: string) => string

const createEmailSchema = (t: Translate) =>
  z.string().trim().min(1, t('auth.validation.required')).email(t('auth.validation.email'))

const createPasswordSchema = (t: Translate) =>
  z
    .string()
    .min(1, t('auth.validation.required'))
    .min(8, t('auth.validation.passwordMin'))
    .regex(/[A-Z]/, t('auth.validation.passwordUppercase'))
    .regex(/\d/, t('auth.validation.passwordDigit'))

export const createLoginSchema = (t: Translate) =>
  z.object({
    email: createEmailSchema(t),
    password: createPasswordSchema(t),
  })

export const createRegisterSchema = (t: Translate) =>
  createLoginSchema(t).extend({
    name: z
      .string()
      .trim()
      .min(1, t('auth.validation.required'))
      .min(3, t('auth.validation.nameMin')),
  })
