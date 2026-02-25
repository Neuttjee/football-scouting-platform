import { createPlayer } from '../actions';
import { targetSteps, targetStatuses } from '@/lib/statusMapping';
import Link from 'next/link';

export default function NewPlayerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/players" className="text-gray-500 hover:text-gray-900">← Terug</Link>
        <h1 className="text-3xl font-bold">Nieuwe Speler</h1>
      </div>

      <form action={createPlayer} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Naam *</label>
          <input type="text" name="name" required className="w-full border rounded p-2" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Positie</label>
          <input type="text" name="position" className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nevenpositie</label>
          <input type="text" name="secondaryPosition" className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Voorkeursbeen</label>
          <select name="preferredFoot" className="w-full border rounded p-2">
            <option value="">Selecteer been...</option>
            <option value="Rechts">Rechts</option>
            <option value="Links">Links</option>
            <option value="Tweebenig">Tweebenig</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Team</label>
          <input type="text" name="team" className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Geboortedatum</label>
          <input type="date" name="dateOfBirth" className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Processtap</label>
          <select name="step" className="w-full border rounded p-2">
            <option value="">Selecteer processtap...</option>
            {targetSteps.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status (Override)</label>
          <select name="status" className="w-full border rounded p-2 text-gray-600">
            <option value="">Automatisch bepalen via processtap</option>
            {targetStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-1">Laat leeg om status automatisch te laten bepalen op basis van de processtap.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Huidige Club</label>
          <input type="text" name="currentClub" className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Niveau (Huidig)</label>
          <input type="text" name="niveau" className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contactpersoon</label>
          <input type="text" name="contactPerson" className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Advies</label>
          <input type="text" name="advies" className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Korte Notities</label>
          <textarea name="notes" className="w-full border rounded p-2" rows={3}></textarea>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Opslaan</button>
        </div>
      </form>
    </div>
  );
}
