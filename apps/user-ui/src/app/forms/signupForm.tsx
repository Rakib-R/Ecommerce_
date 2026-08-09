'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import GoogleButton from '../shared/components/google-button';

import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import toast, { Toaster } from 'react-hot-toast';
// import axiosInstance from "../../utils/axios";

import { authClient } from '../configs/auth-client';

type FormData = {
  name: string;
  password: string;
  email: string;
  role: 'user' | 'seller';
  isAgreedToTerms: boolean;
};

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <span className="absolute left-0 -bottom-5 flex items-center gap-1 text-[13px] font-semibold text-red-500 animate-in fade-in slide-in-from-top-1">
      <AlertCircle size={14} /> {message}
    </span>
  );
};

const SignUp = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // 1. Perform the signup first
      const signUpResult = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'user',
        isAgreedToTerms: data.isAgreedToTerms,
      });

      if (signUpResult.error) {
        throw new Error(signUpResult.error.message || 'Registration failed.');
      }

      const emailResult = await authClient.sendVerificationEmail({
        email: data.email,
        callbackURL: '/home',
      });

      if (emailResult.error) {
        // Don't throw an error here; the account IS created, they just need a resend option
        toast.error(
          'Account created, but confirmation email failed to send. Please request a resend.'
        );
      }
    },

    onSuccess: () => {
      toast.success(
        'Welcome! Account created. Check your email later to verify your vendor status.'
      );
      router.push('/home');
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.';
      toast.error(message);
    },
  });

  return (
    <main className="">
      <Toaster position="top-center" />

      <div className="flex justify-center px-4">
        <section className="md:w-[480px] w-full p-8 bg-gray-100 shadow-xl rounded-2xl border border-gray-100">
          {/* todo ── STEP 1: SIGN UP FORM ── */}
          <>
            <h3 className="text-2xl font-bold text-center mb-2 text-gray-800">
              Create Your Account
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-600 font-bold hover:underline"
              >
                Login
              </Link>
            </p>

            {/* Social Login */}
            <button
              type="button"
              className="flex items-center justify-center gap-3 py-2.5 w-full bg-gray-50 hover:bg-red-50 border border-gray-200 rounded-xl transition-all group mb-4"
            >
              <GoogleButton className="w-6 h-6" />
              <span className="text-gray-700 font-medium group-hover:text-red-600">
                Continue with Google
              </span>
            </button>

            <aside className="flex items-center mb-6 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4">Or use Email</span>
              <div className="flex-1 border-t border-gray-200" />
            </aside>

            {/* Server Error */}
            {signupMutation.isError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-700 animate-in fade-in zoom-in-95">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Registration Failed</p>
                  <p>
                    {(
                      signupMutation.error as AxiosError<{
                        message?: string;
                      }>
                    )?.response?.data?.message ||
                      (signupMutation.error instanceof Error
                        ? signupMutation.error.message
                        : undefined) ||
                      'Something went wrong during signup!'}
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-7 px-2 md:px-6"
            >
              {/* Name */}
              <div className="relative pb-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Mona Mia"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    errors.name
                      ? 'border-red-500 ring-1 ring-red-100 bg-red-50'
                      : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100'
                  }`}
                  {...register('name', { required: 'Name is required' })}
                />
                <FieldError message={errors.name?.message} />
              </div>

              {/* Email */}
              <div className="relative pb-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                    errors.email
                      ? 'border-red-500 ring-1 ring-red-100 bg-red-50'
                      : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                <FieldError message={errors.email?.message} />
              </div>

              {/* Password */}
              <div className="relative pb-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                      errors.password
                        ? 'border-red-500 ring-1 ring-red-100 bg-red-50'
                        : 'border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100'
                    }`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              <fieldset className="relative pb-2 flex items-start gap-2 pt-2">
                <div className="flex h-5 items-center">
                  <input
                    id="isAgreedToTerms"
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 text-black focus:ring-black transition-all ${
                      errors.isAgreedToTerms
                        ? 'border-red-500 ring-1 ring-red-100'
                        : ''
                    }`}
                    {...register('isAgreedToTerms', {
                      required:
                        'You must accept the terms and conditions to proceed',
                    })}
                  />
                </div>

                <div className="text-sm leading-5 select-none">
                  <label
                    htmlFor="isAgreedToTerms"
                    className="text-gray-600 font-medium cursor-pointer"
                  >
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-blue-600 font-bold hover:underline transition-colors"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-blue-600 font-bold hover:underline transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    , including automated order updates.
                  </label>

                  {/* Reuses your custom FieldError component for layout consistency */}
                  <FieldError message={errors.isAgreedToTerms?.message} />
                </div>
              </fieldset>
              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-all flex justify-center items-center gap-2 shadow-lg shadow-gray-200"
              >
                {signupMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>
          </>
        </section>
      </div>
    </main>
  );
};

export default SignUp;
