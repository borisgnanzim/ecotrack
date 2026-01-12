export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-800 text-slate-200">

      {/* Header */}
      <header className="bg-slate-600 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-400">ECOTRACK</h1>
          <span className="text-sm text-slate-400">
            Agent : <span className="text-slate-200 font-medium">Martin D.</span>
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <p className="text-sm text-slate-400">Conteneurs</p>
            <p className="text-3xl font-bold text-emerald-400">128</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <p className="text-sm text-slate-400">Alertes</p>
            <p className="text-3xl font-bold text-amber-400">12</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <p className="text-sm text-slate-400">Signalements</p>
            <p className="text-3xl font-bold text-red-400">5</p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <p className="text-sm text-slate-400">Tournées</p>
            <p className="text-3xl font-bold text-slate-200">3</p>
          </div>
        </div>

        {/* Carte */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">
            Carte des conteneurs
          </h2>
          <div className="h-72 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 border border-slate-700">
            Carte temps réel (Leaflet / Mapbox)
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 text-left">Code</th>
                <th>Zone</th>
                <th>Type</th>
                <th>Remplissage</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr>
                <td className="py-3 font-medium">CTR-001</td>
                <td>Centre-ville</td>
                <td>OM</td>
                <td>45%</td>
                <td className="text-emerald-400 font-semibold">OK</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">CTR-078</td>
                <td>Sud</td>
                <td>Plastique</td>
                <td>97%</td>
                <td className="text-red-400 font-semibold">Urgent</td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}
