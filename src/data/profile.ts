export const profile = {
  name:     'Nidhi Joshi',
  role:     'AI/ML Engineer',
  location: 'Duluth, GA',
  status:   'Open to work',
} as const;

export const siteMeta = {
  title:       `${profile.name} — ${profile.role}`,
  description: "I don't ship AI without guardrails. Building robust, explainable systems end-to-end.",
} as const;

export const labels = {
  contact:    ' ',
  experience: 'Experience',
  education:  'Education',
} as const;
