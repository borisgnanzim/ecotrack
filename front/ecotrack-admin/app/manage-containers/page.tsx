"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "@/src/components/BackButton";

interface Container {
  id_conteneur: number;
  code_conteneur: number;
  id_Zone: string;
  type_Dechet: string;
  capacite_i?: number;
  Statut?: string;
  fill_level?: number;
}

const statusStyles: Record<string, string> = {
  OK: "bg-emerald-100 text-emerald-700",
  ALERTE: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

export default function ManageContainersPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<number | null>(null);

  const [form, setForm] = useState({
    code_conteneur: "",
    id_Zone: "",
    type_Dechet: "",
    capacite_i: "",
    Statut: "OK",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_CONTAINER_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchContainers = async () => {
    try {
      const res = await api.get("/containers");
      setContainers(res.data);
    } catch {
      console.error("Erreur chargement conteneurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post("/containers", {
        ...form,
        code_conteneur: Number(form.code_conteneur),
        capacite_i: Number(form.capacite_i),
      });
      setShowCreate(false);
      fetchContainers();
    } catch (e) {
      console.log("Erreur création", e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/containers/${id}`);
      setShowDelete(null);
      fetchContainers();
    } catch {
      alert("Impossible de supprimer");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-700">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-emerald-700">
            Gestion des conteneurs
          </h1>
          <p className="text-slate-500 text-sm">
            Administration et suivi des conteneurs urbains
          </p>
        </div>
      </header>

      {/* Back */}
      <div className="max-w-6xl mx-auto px-6 mt-4">
        <BackButton />
      </div>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreate(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition cursor-pointer"
          >
            + Créer un conteneur
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-slate-500">
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Zone</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Capacité</th>
                <th className="px-6 py-3">Remplissage</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {!loading &&
                containers.map((c) => (
                  <tr
                    key={c.id_conteneur}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-3 font-medium">
                      {c.code_conteneur}
                    </td>
                    <td className="px-6 py-3">{c.id_Zone}</td>
                    <td className="px-6 py-3">{c.type_Dechet}</td>
                    <td className="px-6 py-3">
                      {c.capacite_i ?? "-"}
                    </td>
                    <td className="px-6 py-3">
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>{c.fill_level ?? 0}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (c.fill_level ?? 0) < 70
                                ? "bg-emerald-500"
                                : (c.fill_level ?? 0) < 90
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${c.fill_level ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          statusStyles[c.Statut || "OK"]
                        }`}
                      >
                        {c.Statut || "OK"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-4">
                        <button
                          className="text-emerald-600 hover:underline font-medium cursor-pointer"
                        >
                          Modifier
                        </button>

                        <button
                          className="text-blue-600 hover:underline font-medium cursor-pointer"
                        >
                          Inspecter
                        </button>

                        <button
                          onClick={() => setShowDelete(c.id_conteneur)}
                          className="text-red-600 hover:underline font-medium cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {loading && (
            <div className="p-6 text-center text-slate-500">
              Chargement des conteneurs…
            </div>
          )}
        </div>
      </main>

      {/* MODAL CREATE */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-emerald-700">
              Nouveau conteneur
            </h2>

            {["code_conteneur", "id_Zone", "type_Dechet", "capacite_i"].map(
              (field) => (
                <input
                  key={field}
                  placeholder={field}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onChange={(e) =>
                    setForm({ ...form, [field]: e.target.value })
                  }
                />
              )
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 space-y-4 max-w-sm">
            <p className="text-slate-700">
              Confirmer la suppression de ce conteneur ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDelete(null)}
                className="text-slate-500"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDelete)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
