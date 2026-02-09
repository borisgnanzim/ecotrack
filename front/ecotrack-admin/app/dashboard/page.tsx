import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-700">

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-700">
            ECOTRACK
          </h1>

          <span className="text-sm text-slate-500">
            Agent :{" "}
            <span className="text-slate-400 font-medium">
              Martin D.
            </span>
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Action */}
        <div className="flex justify-end">
          <Link
            href="/manage-containers"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm cursor-pointer"
          >
            Gérer les conteneurs
          </Link>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Conteneurs actifs" value="128" color="text-emerald-600" />
          <StatCard label="Alertes" value="12" color="text-amber-600" />
          <StatCard label="Signalements" value="5" color="text-red-600" />
          <StatCard label="Tournées du jour" value="3" color="text-slate-600" />
        </section>

        {/* Carte */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">
            Carte des conteneurs
          </h2>

          <div className="h-72 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 border border-slate-200">
            Carte temps réel (Leaflet / Mapbox à venir)
          </div>
        </section>

        {/* Table */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4">
            État des conteneurs
          </h2>

          <table className="w-full text-sm">
            <thead className="text-slate-500 border-b border-slate-200">
              <tr className="text-left">
                <th className="py-3">Code</th>
                <th>Zone</th>
                <th>Type</th>
                <th>Remplissage</th>
                <th>Statut</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 font-medium">CTR-001</td>
                <td>Centre-ville</td>
                <td>OM</td>
                <td>45%</td>
                <td className="text-emerald-600 font-semibold">OK</td>
              </tr>

              <tr>
                <td className="py-3 font-medium">CTR-014</td>
                <td>Nord</td>
                <td>Verre</td>
                <td>82%</td>
                <td className="text-amber-600 font-semibold">
                  À surveiller
                </td>
              </tr>

              <tr>
                <td className="py-3 font-medium">CTR-078</td>
                <td>Sud</td>
                <td>Plastique</td>
                <td>97%</td>
                <td className="text-red-600 font-semibold">
                  Urgent
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

/* ---------- Components ---------- */

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}
