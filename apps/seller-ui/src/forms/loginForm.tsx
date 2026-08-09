<<<<<<< HEAD
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuthState } from '../app/store/authStore';
import GoogleButton from '../app/shared/components/google-button';

import { toast } from 'react-hot-toast';
=======
"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuthState } from '../app/store/authStore';
import GoogleButton from "../app/shared/components/google-button";



import { toast } from "react-hot-toast";   
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
import { authClient } from '../app/configs/auth-client';

type SellerSessionUser = {
  id: string;
  email: string;
  name?: string;
<<<<<<< HEAD
  role: 'seller';
=======
  role: "seller";
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
};

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
<<<<<<< HEAD

const Login = () => {
=======
  
const Login = () => {
  
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

<<<<<<< HEAD
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>();
  const { setSeller } = useAuthState();

  // Pre-fill email if remembered
  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setValue('email', remembered);
      setRememberMe(true);
    }
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
=======
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();
  const { setSeller } = useAuthState();

  // Pre-fill email if remembered


  const onSubmit = async (data: FormData) => {
    
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
    loginMutation.mutate(data);
    setServerError(null);
  };

  const loginMutation = useMutation({
<<<<<<< HEAD
    mutationFn: async (data: FormData) => {
=======
     mutationFn: async (data: FormData) => {
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
      const { data: session, error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe,
      });

      if (!session || error) {
<<<<<<< HEAD
        setServerError(error?.message || 'Invalid email or password.');
        return;
      }

      const typedUser: SellerSessionUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as 'seller',
      };
      return {
        user: typedUser,
        session: session || null,
        isAuthenticated: !!session,
      };
    },

    onSuccess: (data) => {
      setServerError(null);
      if (!data?.user) {
        setServerError('Something went wrong. Please try again.');
        return;
      }
      setSeller(data?.user);

      toast.success('Welcome back!', {
        style: { background: '#18181b', color: '#fff', borderRadius: '12px' },
      });

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data?.user?.email || '');
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      router.replace('/dashboard');
    },
    onError: (error) => {
      const authError = error as { status?: number; message?: string };
      if (authError?.status === 401) {
        setServerError('Authentication failed: Incorrect email or password.');
      } else {
        setServerError(authError?.message || 'An unexpected error occurred.');
      }
    },
=======
        setServerError(error?.message || "Invalid email or password.");
        return;
      }

     const typedUser: SellerSessionUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user.role as 'seller'),
      };
        return {
          user: typedUser,
          session: session || null,
          isAuthenticated: !!session,
        };
      },

    onSuccess: (data) => {
      setServerError(null);

      setSeller(data?.user);

      toast.success("Welcome back!", {
        style: { background: "#18181b", color: "#fff", borderRadius: "12px" },
      });

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data?.user?.email || "");
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      router.replace("/dashboard");
 
    },
    onError: (error) => {

      const authError = error as { status?: number; message?: string };
        if (authError?.status === 401) {
            setServerError("Authentication failed: Incorrect email or password.");
        } else {
            setServerError(authError?.message || "An unexpected error occurred.");
        }
    }
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
  });

  return (
    <main className="py-10 h-screen bg-[#f1f1f1]">
      <h1 className="text-4xl mb-8 font-Poppins font-semibold text-black text-center">
        Ecommerce
      </h1>
<<<<<<< HEAD

      {/* EMERGENCY - Admin Demo */}
      <div className="fixed top-32 left-4 w-1/4 h-16 text-lg font-mono z-50 bg-amber-500 text-black px-3 py-1.5 rounded-lg shadow-lg animate-bounce">
        🔐 Demo Access: <span className="font-bold">admin@email.com</span> /{' '}
        <span className="font-bold">admin</span>
      </div>
=======
    
    {/* EMERGENCY - Admin Demo */}
    <div className="fixed top-32 left-4 w-1/4 h-16 text-lg font-mono z-50 bg-amber-500 text-black px-3 py-1.5 rounded-lg shadow-lg animate-bounce">
      🔐 Demo Access: <span className="font-bold">admin@email.com</span> / <span className="font-bold">admin</span>
    </div>
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5

      <div className="flex justify-center px-4">
        <section className="md:w-[480px] w-full p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Seller Login To ECommerce
          </h3>

<<<<<<< HEAD
          <button className="flex items-center justify-center gap-3 py-2.5 w-full bg-gray-50 hover:bg-red-50 border border-gray-200 rounded-xl transition-all group mb-2">
=======
           <button className="flex items-center justify-center gap-3 py-2.5 w-full bg-gray-50 hover:bg-red-50 border border-gray-200 rounded-xl transition-all group mb-2">
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
            <GoogleButton className="w-6 h-6" />
            <span className="text-gray-700 font-medium group-hover:text-red-600">
              Continue with Google
            </span>
          </button>
<<<<<<< HEAD

          <p className="text-center text-sm text-gray-500 mb-6 mt-4">
            Don't have an account?{' '}
            <Link
              href="/seller-signup"
              className="text-blue-600 font-bold hover:underline"
            >
=======
          
          <p className="text-center text-sm text-gray-500 mb-6 mt-4">
            Don't have an account?{" "}
            <Link href="/seller-signup" className="text-blue-600 font-bold hover:underline">
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
              Sign up as Seller
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

<<<<<<< HEAD
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-7 px-2 md:px-6"
          >
            <div className="relative pb-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-1 text-gray-700"
              >
=======
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 px-2 md:px-6">
            <div className="relative pb-2">
              <label htmlFor="email" className="block text-sm font-semibold mb-1 text-gray-700">
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="current-password"
                placeholder="seller@example.com"
                className={`w-full p-2.5 border text-black! rounded-lg outline-none transition-all ${
<<<<<<< HEAD
                  errors.email
                    ? 'border-red-500 ring-1 ring-red-100 bg-red-50'
                    : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) =>
                    value === 'admin@email.com' ||
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
                    'Invalid email address',
=======
                  errors.email ? 'border-red-500 ring-1 ring-red-100 bg-red-50' : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100'
                }`}
                {...register("email", {
                  required: "Email is required",
                  validate: (value) => 
                    value === "admin@email.com" || 
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 
                    "Invalid email address"
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
                })}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="relative pb-2">
<<<<<<< HEAD
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full p-2.5 text-black! border rounded-lg outline-none transition-all ${
                    errors.password
                      ? 'border-red-500 ring-1 ring-red-100 bg-red-50'
                      : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    validate: (value) =>
                      value === 'admin' ||
                      value.length >= 6 ||
                      'Password must be at least 6 characters',
=======
              <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full p-2.5 text-black! border rounded-lg outline-none transition-all ${
                    errors.password ? 'border-red-500 ring-1 ring-red-100 bg-red-50' : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100'
                  }`}
                  {...register("password", {
                    required: "Password is required",
                    validate: (value) => 
                      value === "admin" || 
                      value.length >= 6 || 
                      "Password must be at least 6 characters",
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
                  })}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
<<<<<<< HEAD
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
=======
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
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
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
<<<<<<< HEAD
                <span className="group-hover:text-black transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="font-semibold text-blue-600 hover:underline"
              >
=======
                <span className="group-hover:text-black transition-colors">Remember me</span>
              </label>
              <Link href="/forgot-password" className="font-semibold text-blue-600 hover:underline">
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-all flex justify-center items-center gap-2 shadow-lg shadow-gray-200"
            >
<<<<<<< HEAD
              {loginMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                'Login'
              )}
=======
              {loginMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Login"}
>>>>>>> 9744e8e22b789996b94156049ff05144cc0972e5
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Login;
