"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B0000] to-[#FF8C00] flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-sm sm:max-w-md p-8 md:p-10 shadow-2xl">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          {/* TummyTime Logo */}
          <div className="mb-0">
            <Image
              src="/logo.png"
              alt="TummyTime Logo"
              width={400}
              height={120}
              priority
              className="w-full h-auto object-contain"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-[#FF8C00] -mt-3 mb-2">Welcome back</h2>
          <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          {/* Email Field */}
          <div className="space-y-1.5 focus-within:text-[#FF8C00]">
            <label className="text-sm font-semibold text-gray-700 ml-1 transition-colors" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full bg-[#f4f5f7] border border-transparent hover:border-gray-200 focus:bg-white focus:border-[#FF8C00] focus:ring-4 focus:ring-[#FF8C00]/20 rounded-[14px] py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-all outline-none"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 focus-within:text-[#FF8C00]">
            <label className="text-sm font-semibold text-gray-700 ml-1 transition-colors" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full bg-[#f4f5f7] border border-transparent hover:border-gray-200 focus:bg-white focus:border-[#FF8C00] focus:ring-4 focus:ring-[#FF8C00]/20 rounded-[14px] py-3.5 pl-11 pr-12 text-gray-900 placeholder-gray-400 transition-all outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-1">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-[#FF8C00] transition-colors font-medium"
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#8B0000] to-[#FF8C00] hover:opacity-90 active:scale-[0.98] text-white font-bold text-lg py-3.5 rounded-[14px] shadow-[0_4px_14px_0_rgba(255,140,0,0.39)] transition-all"
            >
              Login
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center text-sm text-gray-600">
          No account yet?{" "}
          <a href="#" className="font-bold text-[#FF8C00] hover:text-[#8B0000] transition-colors">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
