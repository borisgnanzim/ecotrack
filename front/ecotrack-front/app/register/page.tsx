"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      router.push("/login");
    } catch (err) {
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-emerald-700 text-center">
          ECOTRACK
        </h1>
        <p className="text-center text-slate-500 mt-2">
          Créer un compte
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="username"
            placeholder="Nom complet"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg 
                      text-slate-700 placeholder-slate-400
                      focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg 
                      text-slate-700 placeholder-slate-400
                      focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg 
                      text-slate-700 placeholder-slate-400
                      focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            required
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold"
          >
            {loading ? "Création..." : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Déjà un compte ? <a href="/login" className="text-emerald-600 font-semibold">Connexion</a>
        </p>
      </div>
    </div>
  );
}
