"use client";

import BackButton from "@/src/components/BackButton";
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-700">

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-emerald-700">
            Mon profil
          </h1>
          <p className="text-slate-500 text-sm">
            Gérez vos informations personnelles
          </p>
        </div>
      </header>

        <div className="max-w-4xl mx-auto px-6 mt-4">
            <BackButton />
        </div>
      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        <div className="bg-white rounded-xl shadow p-8 space-y-6">

          {/* Identité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Prénom
              </label>
              <input
                type="text"
                defaultValue="Jean"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600">
                Nom
              </label>
              <input
                type="text"
                defaultValue="Dupont"
                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-slate-600">
              Adresse email
            </label>
            <input
              type="email"
              defaultValue="jean.dupont@email.fr"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600">
              Téléphone
            </label>
            <input
              type="tel"
              defaultValue="06 12 34 56 78"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600">
              Adresse de résidence
            </label>
            <input
              type="text"
              defaultValue="12 rue de la République, 75000 Paris"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">

            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Enregistrer les modifications
            </button>

            <button
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Se déconnecter
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}
