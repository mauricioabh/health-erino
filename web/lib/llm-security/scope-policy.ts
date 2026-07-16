import type { AllowedTopic } from "./types";

export const ALLOWED_TOPICS: AllowedTopic[] = [
  "medicamentos_list",
  "symptom_recommendation",
  "app_help",
  "expiration_check",
];

export const SCOPE_RULES = {
  allowed: [
    "Consultar medicamentos guardados en la BD del usuario",
    "Recomendar solo entre medicamentos de su lista para síntomas comunes",
    "Explicar uso de la app (sync, admin, voz)",
    "Recordar caducados vs válidos",
  ],
  rejected: [
    "Diagnósticos médicos",
    "Prescripciones de medicamentos no en su lista",
    "Dosis para menores, embarazo o interacciones complejas sin datos",
    "Preguntas de software general, código, política, entretenimiento",
    "Emergencias médicas",
    "Acciones sobre la BD más allá de las tools permitidas",
  ],
} as const;
