"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { register } from "./actions";
import { Lock, Mail, User, KeyRound, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Background from "@/components/Background";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="group relative flex w-full justify-center rounded-xl bg-orange-400 py-3 px-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-orange-500 hover:shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Mendaftarkan...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          Gabung Sekarang
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      )}
    </button>
  );
}

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      <Background />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="z-10 w-full max-w-2xl"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 items-center justify-center gap-3">
              <img
                src="/logo-telkom.png"
                className="h-10 w-auto object-contain"
                alt="Telkom"
              />
              {/* Divider kecil */}
              <div className="h-8 w-px bg-gray-300"></div>
              <img
                src="/logo-pojok.png"
                className="h-10 w-auto object-contain"
                alt="Potik"
              />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Join the Squad!
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Registrasi Anggota Baru{" "}
              <span className="font-bold text-orange-500">2026/2027</span>
            </p>
          </div>

          {/* Form dengan GRID 2 KOLOM */}
          <form action={register}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Kolom Kiri */}
              <div className="space-y-4">
                {/* Nama Lengkap */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 ml-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      name="fullName"
                      required
                      placeholder="Nama sesuai KTM"
                      className="block w-full rounded-xl border-0 bg-white/50 py-2.5 pl-9 pr-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 ml-1">
                    Email Student
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="nama@student.telkom..."
                      className="block w-full rounded-xl border-0 bg-white/50 py-2.5 pl-9 pr-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="space-y-4">
                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      className="block w-full rounded-xl border-0 bg-white/50 py-2.5 pl-9 pr-3 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Token (Highlight) */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-orange-600 ml-1">
                    Kode Token
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-orange-500" />
                    <input
                      name="token"
                      required
                      placeholder="Paste Token Disini"
                      className="block w-full rounded-xl border-0 bg-orange-50/60 py-2.5 pl-9 pr-3 text-sm text-gray-900 ring-1 ring-inset ring-orange-200 placeholder:text-orange-300 focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Submit Full Width di Bawah Grid */}
            <SubmitButton />
          </form>

          {/* Footer */}
          <div className="mt-5 text-center text-xs text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Login disini
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
