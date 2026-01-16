import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-700">
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          
          <div>
            <h1 className="text-2xl font-bold text-emerald-700">
              Espace Citoyen
            </h1>
            <p className="text-slate-500 text-sm">
              Participez activement à l’amélioration de la propreté de votre ville
            </p>
          </div>

          {/* Profile Icon */}
          <Link
            href="/profile"
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition"
            title="Mon profil"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-emerald-700"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z"
                />
              </svg>
            </div>
            <span className="hidden sm:block text-sm font-medium">
              Mon profil
            </span>
          </Link>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Intro card */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-emerald-700">
            Vous avez repéré un problème ?
          </h2>
          <p className="text-sm text-emerald-800 mt-1">
            Un simple signalement permet à nos équipes d’intervenir plus rapidement.
            Ensemble, gardons notre ville propre
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow p-8">
          <form className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-slate-600">
                Conteneur concerné
              </label>
              <input
                type="text"
                placeholder="Ex : CTR-078"
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600">
                Type de signalement
              </label>
              <select
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option>Débordement</option>
                <option>Odeur inhabituelle</option>
                <option>Dégradation</option>
                <option>Conteneur inaccessible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Décrivez le problème rencontré..."
                className="mt-1 w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600">
                Photo du signalement
              </label>

              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full text-sm text-slate-600
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-emerald-50 file:text-emerald-700
                  hover:file:bg-emerald-100"
              />

              <p className="text-xs text-slate-400 mt-1">
                Formats acceptés : JPG, PNG – max 5 Mo
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                Envoyer le signalement
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
