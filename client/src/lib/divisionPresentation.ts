/** Maps division name to UI pillar (four primary divisions + generic). */
export type DivisionVisualKey = 'ds' | 'dev' | 'cyber' | 'cpd' | 'generic';

/** Fixed order for the four default pillars on the admin overview. */
export const FOUR_PILLARS = ['ds', 'dev', 'cyber', 'cpd'] as const;
export type FourPillarKey = (typeof FOUR_PILLARS)[number];

const NAME_TO_KEY: { pattern: RegExp; key: DivisionVisualKey }[] = [
  { pattern: /data\s*science|machine\s*learning|\bai\b|ml/i, key: 'ds' },
  { pattern: /development|software|engineering|devops|full[\s-]*stack/i, key: 'dev' },
  { pattern: /cyber|security|infosec|soc/i, key: 'cyber' },
  // Avoid matching stray "continuous" alone (e.g. CI/CD); keep CPD explicit.
  { pattern: /\bcpd\b|continuous\s+professional|professional\s*development|executive\s+education/i, key: 'cpd' },
];

export function divisionVisualKeyFromName(name: string): DivisionVisualKey {
  const n = name.trim();
  // Common typo when entering CPD quickly
  if (/^cpi$/i.test(n)) return 'cpd';
  for (const { pattern, key } of NAME_TO_KEY) {
    if (pattern.test(n)) return key;
  }
  return 'generic';
}

/** Canonical card titles (so the overview always reads clearly — not “CPI”). */
export function pillarCanonicalTitle(key: FourPillarKey): string {
  switch (key) {
    case 'ds':
      return 'Data Science';
    case 'dev':
      return 'Development';
    case 'cyber':
      return 'Cybersecurity';
    case 'cpd':
      return 'CPD';
    default:
      return key;
  }
}

/** Short line under the title; CPD always spells out the acronym. */
export function pillarCanonicalSubtitle(key: FourPillarKey): string | null {
  switch (key) {
    case 'cpd':
      return 'Continuous Professional Development';
    case 'dev':
      return 'Software & platform engineering';
    default:
      return null;
  }
}

export function pillarPlaceholderDescription(key: FourPillarKey): string {
  return `No “${pillarCanonicalTitle(key)}” division exists yet. Create it on the Divisions admin page.`;
}

const IMAGES: Record<DivisionVisualKey, string> = {
  ds: 'https://picsum.photos/seed/datascience/800/600',
  dev: 'https://picsum.photos/seed/devpillar/800/600',
  cyber: 'https://picsum.photos/seed/cyberpillar/800/600',
  cpd: 'https://picsum.photos/seed/cpdpillar/800/600',
  generic: 'https://picsum.photos/seed/divisiongeneric/800/600',
};

const HEADS: Record<
  DivisionVisualKey,
  { name: string; role: string; avatar: string; bio: string }
> = {
  ds: {
    name: 'Division lead',
    role: 'Head of Data Science',
    avatar: 'https://picsum.photos/seed/ds-lead/400',
    bio: 'Coordinates data science bootcamps and mentor allocation for this pillar.',
  },
  dev: {
    name: 'Division lead',
    role: 'Engineering lead',
    avatar: 'https://picsum.photos/seed/dev-lead/400',
    bio: 'Oversees development tracks, tooling standards, and cohort delivery.',
  },
  cyber: {
    name: 'Division lead',
    role: 'Security director',
    avatar: 'https://picsum.photos/seed/cyber-lead/400',
    bio: 'Leads cybersecurity programs, labs, and defensive operations training.',
  },
  cpd: {
    name: 'Division lead',
    role: 'Program director',
    avatar: 'https://picsum.photos/seed/cpd-lead/400',
    bio: 'Owns continuous professional development and executive education offerings.',
  },
  generic: {
    name: 'Division lead',
    role: 'Pillar coordinator',
    avatar: 'https://picsum.photos/seed/generic-lead/400',
    bio: 'Coordinates bootcamps and faculty for this division.',
  },
};

export function divisionHeroImage(visualKey: DivisionVisualKey): string {
  return IMAGES[visualKey] ?? IMAGES.generic;
}

export function divisionDefaultHead(visualKey: DivisionVisualKey) {
  return HEADS[visualKey] ?? HEADS.generic;
}
