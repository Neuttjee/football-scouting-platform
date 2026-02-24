export const targetSteps = [
  'Longlist',
  'Shortlist',
  'Introductie',
  'Gesprek',
  'Meetraining',
  'Aanbod',
  'Overeenkomst besproken',
  'Overeenkomst getekend',
  'Afgehaakt',
  'Niet haalbaar',
  'N.v.t.'
];

export const targetStatuses = [
  'Te volgen',
  'Actief',
  'Getekend',
  'Afgevallen',
  'Onbekend'
];

export function mapTargetStepToStatus(step: string | null | undefined): string | null {
  if (!step) return null;

  const activelyTracked = ['Longlist', 'Shortlist'];
  const activeProcess = [
    'Introductie',
    'Gesprek',
    'Meetraining',
    'Aanbod',
    'Overeenkomst besproken'
  ];

  if (activelyTracked.includes(step)) return 'Te volgen';
  if (activeProcess.includes(step)) return 'Actief';
  if (step === 'Overeenkomst getekend') return 'Getekend';
  if (step === 'Afgehaakt' || step === 'Niet haalbaar') return 'Afgevallen';

  return null; // N.v.t. -> status remains unchanged automatically
}
