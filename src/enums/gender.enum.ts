import { Gender } from "@/generated/prisma/enums"

export { Gender }

export const GENDER_LABEL: Record<Gender, string> = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro / prefiro não informar",
}
