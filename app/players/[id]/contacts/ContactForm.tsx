'use client';

import { useState } from 'react';
import { createContact } from './actions';

export function ContactForm({ playerId }: { playerId: string }) {
  const [outcome, setOutcome] = useState('');
  
  const requiresReason = outcome === 'Afgehaakt' || outcome === 'Niet haalbaar';
  
  const actionWithId = createContact.bind(null, playerId);

  return (
    <form action={actionWithId} className="bg-white p-4 rounded-lg shadow space-y-4 sticky top-4">
      <h2 className="text-lg font-bold border-b pb-2">Nieuw Contact</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Type *</label>
        <select name="type" required className="w-full border rounded p-2">
          <option value="">Selecteer...</option>
          {['Intro benadering', 'Follow up', 'Gesprek', 'Meetraining', 'Aanbod', 'Overig'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Kanaal *</label>
        <select name="channel" required className="w-full border rounded p-2">
          <option value="">Selecteer...</option>
          {['Whatsapp', 'Telefoon', 'Op de club', 'Training', 'Via derde', 'E-mail', 'Overig'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Uitkomst</label>
        <select name="outcome" value={outcome} onChange={e => setOutcome(e.target.value)} className="w-full border rounded p-2">
          <option value="">Geen of onbekend</option>
          {['Positief', 'Neutraal', 'Twijfel', 'Negatief', 'Afgehaakt', 'Niet haalbaar'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {requiresReason && (
        <div>
          <label className="block text-sm font-medium mb-1">Reden (Verplicht bij Afgehaakt/Niet haalbaar) *</label>
          <input type="text" name="reason" required={requiresReason} className="w-full border rounded p-2" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Notities</label>
        <textarea name="notes" rows={3} className="w-full border rounded p-2"></textarea>
      </div>

      <button type="submit" className="w-full btn-premium text-white px-4 py-2 rounded transition-all">Toevoegen</button>
    </form>
  );
}
