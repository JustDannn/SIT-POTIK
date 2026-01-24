"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { login } from "./action";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
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
          Memproses...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          Masuk Dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      )}
    </button>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <Background />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-md px-4"
      >
        {/* CARD GLASSMORPHISM */}
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            {/* Logo Placeholder */}
            <div className="mx-auto mb-6 flex h-20 items-center justify-center gap-4">
              <img
                src="/logo-telkom.png"
                className="scale-100 object-contain"
              />
              <img src="/logo-pojok.png" className="scale-100 object-contain" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Welcome Back!
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Masuk untuk mengelola Potik TUS
            </p>
          </div>

          {/* Form */}
          <form action={login} className="space-y-6">
            <div className="space-y-1">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@potik.com"
                  className="block w-full rounded-xl border-0 bg-white/50 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl border-0 bg-white/50 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>

          <div className="mt-8 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Potik TUS System
          </div>
        </div>
      </motion.div>
    </div>
  );
}
