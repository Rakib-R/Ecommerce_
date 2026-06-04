"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'; // Added useEffect
import { useForm } from "react-hook-form";
import GoogleButton from "../shared/components/google-button";

import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuthState } from '../store/authStore';

import { toast } from "react-hot-toast";   
import { authClient } from '../configs/auth-client';
import { UserType } from '../../types';


type FormData = {
  email: string;
  password: string;
};

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <span className="absolute left-0 -bottom-5 flex items-center gap-1 text-[13px] font-semibold text-red-500 animate-in fade-in slide-in-from-top-1">
      <AlertCircle size={14} /> {message}
    </span>
  );
};

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const { setUser } = useAuthState()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    loginMutation.mutate(data);
    setServerError(null);
  };

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: session, error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: !rememberMe,
      });

      if (!session || error) {
        setServerError(error?.message || "Invalid email or password.");
        return;
      }

     const typedUser: UserType = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
        avatar: session.user.image 
    ? {
        file_id: `${session.user.name}_avatar`,
        file_url: session.user.image
      } : undefined,
        
        role: (session.user.role as UserType['role']) || 'user',
      };
        return {
          user: typedUser,
          session: session || null,
          isAuthenticated: !!session,
        };
      },

    onSuccess: (data) => {
      setServerError(null);
      setUser(data?.user as unknown as UserType);

      toast.success("Welcome back!", {
        style: { background: "#18181b", color: "#fff", borderRadius: "12px" },
      });

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data?.user?.email || "");
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      router.replace("/home");
 
    },
    onError: (error) => {

      const authError = error as { status?: number; message?: string };
        if (authError?.status === 401) {
            setServerError("Authentication failed: Incorrect email or password.");
        } else {
            setServerError(authError?.message || "An unexpected error occurred.");
        }
    }
  });

  return (

      <main className="flex justify-center px-4">
        <section className="md:w-[480px] w-full p-8 bg-gray-100 shadow-xl rounded-2xl border border-gray-100">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Login to Ecommerce
          </h3>

          <button className="flex items-center justify-center gap-3 py-2.5 w-full bg-gray-50 hover:bg-red-50 border border-gray-200 rounded-xl transition-all group mb-2">
            <GoogleButton className="w-6 h-6" />
            <span className="text-gray-700 font-medium group-hover:text-red-600">
              Continue with Google
            </span>
          </button>


          <p className="text-center text-sm text-gray-500 mb-6 mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-bold hover:underline">
              Sign up
            </Link>
          </p>

          <aside className="flex items-center mb-8 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4">Or use Email</span>
            <div className="flex-1 border-t border-gray-200" />
          </aside>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-700 animate-in fade-in zoom-in-95">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Login Failed</p>
                <p>{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 px-2 md:px-6">
            <div className="relative pb-2">
              <label htmlFor="email" className="block text-sm font-semibold mb-1 text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="support@rakib.com"
                autoComplete="email"
                className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                  errors.email ? 'border-red-500 ring-1 ring-red-100 bg-red-50' : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100'
                }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                  onChange: (e) => e.target.value,
                })}
                 onInput={(e) =>                     // ← catches autofill injection
                  setValue("email", (e.target as HTMLInputElement).value, { 
                    shouldValidate: false 
                  })
                }
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="relative pb-2">
              <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    errors.password ? 'border-red-500 ring-1 ring-red-100 bg-red-50' : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100'
                  }`}
                  {...register("password", {
                    required: "Password is required",
                  })}
                   onInput={(e) =>
                  setValue("password", (e.target as HTMLInputElement).value, {
                    shouldValidate: false
                  })
                }
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                  {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center text-gray-600 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mr-2 w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="group-hover:text-black transition-colors">Remember me</span>
              </label>
              <Link href="/forgot-password" intrinsic-size="14" className="font-semibold text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-all flex justify-center items-center gap-2 shadow-lg shadow-gray-200"
            >
              {loginMutation.isPending ? <Loader2 className="animate-spin" /> : "Login"}
            </button>
          </form>
        </section>
      </main>
  );
};

export default Login;