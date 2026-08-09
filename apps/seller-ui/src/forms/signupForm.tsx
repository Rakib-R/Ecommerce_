'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { countries } from '../app/utils/countries';
import CreateShop from '../app/shared/modules/auth/create-shop';
import Stripe from '../app/assets/stripe.jpeg';
import Image from 'next/image';
import { useSellerRegistrationStore } from '../app/store/useSellerRegistrationStore';
import { AnimatePresence, motion, progress } from 'framer-motion';
import { authClient } from '../app/configs/auth-client';
import { useRouter } from 'next/navigation';
import axiosInstance from '../app/utils/axiosInstance';

type FormData = {
  name: string;
  password: string;
  email: string;
  phone_number: string;
  country: string;
  avatar: string;
  role: 'seller';
  isAgreedToTerms: boolean;
};

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <span
      className="absolute left-0 -bottom-5 flex items-center gap-1 text-sm font-medium
        text-red-600 animate-in fade-in slide-in-from-top-1"
    >
      <AlertCircle size={12} /> {message}
    </span>
  );
};

const stepVariants = {
  enter: { opacity: 0, x: 80 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
};

const SignUp = () => {
  // This is the critical fix: activeStep must come from the store, NOT useState.
  const {
    _hasHydrated,
    activeStep,
    setActiveStep,
    progressActiveStep,
    setProgressActiveStep,
    step1Values,
    saveStep1Values,
    resetRegistration,
  } = useSellerRegistrationStore();

  // ── Local UI-only state (transient, fine to reset on refresh) ───────────────
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dialCode, setDialCode] = useState('+880');
  // sellerData only needed within the current OTP flow session

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<{
    file_id: string;
    file_url: string;
  } | null>(null);
  const router = useRouter();

  // Pre-fill step-1 form with persisted values so nothing is re-typed after refresh
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: step1Values.name ?? '',
      email: step1Values.email ?? '',
      country: step1Values.country ?? '',
      phone_number: step1Values.phone_number ?? '',
      password: step1Values.password ?? '',
      avatar: step1Values.avatar ?? '',
    },
  });

  // RESENDING OTP TIME COUNTING
  //! Only run once when hydration completes // !← only on hydration, nothing else
  useEffect(() => {
    if (_hasHydrated && step1Values) {
      reset({
        name: step1Values.name,
        email: step1Values.email,
        country: step1Values.country,
        phone_number: step1Values.phone_number?.replace(dialCode, ''),
        password: step1Values.password,
        avatar: step1Values.avatar,
      });
    }
  }, [_hasHydrated]);

  const onSubmit = (data: FormData) => {
    if (signupMutation.isPending) return;
    const payload = {
      ...data,
      phone_number: `${dialCode}${data.phone_number}`,
    };

    saveStep1Values(payload);
    signupMutation.mutate(payload);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // 1. Perform the signup first
      const signUpResult = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'seller',
        isAgreedToTerms: data.isAgreedToTerms,
        phone_number: data.phone_number,
        country: data.country,
        avatarFileId: avatarData?.file_id,
        avatarFileUrl: avatarData?.file_url,
      });

      if (signUpResult.error) {
        throw new Error(
          signUpResult.error.message ||
            'Registration failed.Account is not created'
        );
      }

      const emailResult = await authClient.sendVerificationEmail({
        email: data.email,
        callbackURL: '/dashboard',
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
      setActiveStep(2);
      setProgressActiveStep(2);
      router.push('/dashboard');
    },

    onError: (error: any) => {
      toast.error(error.message || 'An unexpected error occurred.');
    },
  });

  // const verifyOtpMutation = useMutation({
  //   mutationFn: async () => {
  //     const code = otp.join("");
  //     const result = await authClient.emailOtp.verifyEmail({ email: sellerData!.email, otp: code } as any);
  //     if (result.error) throw new Error(result.error.message || "Invalid OTP.");
  //     return result;
  //   },
  //   onSuccess: (data) => {
  //     setSuccessMessage("Verification Succeeded. Redirecting...")
  //     setSellerId(data?.data?.user?.id ?? "");
  //     setActiveStep(2);
  //   },
  // });

  // const resendOtpMutation = useMutation({
  //   mutationFn: async () => {
  //     await authClient.emailOtp.sendVerificationOtp({ email: sellerData!.email, type: "email-verification" });
  //   },

  //   onSuccess: () => {
  //     setCanResend(false);
  //     setTimer(60);
  //     toast.success("OTP resent!");
  //   },
  //   onError: () => {
  //     toast.error("Failed to resend OTP. Try again.");
  //   }
  // });

  // const connectStripe = async () => {
  //   try {
  //     console.log("Stripe Key Loaded:", process.env.STRIPE_SECRET_KEY?.substring(0, 8) + "...");
  //     const response = await axiosInstance.post(
  //       '/api/create-stripe-link',
  //       { sellerId }
  //     );
  //     if (response.data.url) {
  //       resetRegistration(); // wipe store only when truly done
  //       window.location.href = response.data.url;
  //     }
  //   } catch (error) {
  //     console.error("Error connecting to Stripe:", error);
  //   }
  // };

  const STEPS = [
    { step: 1, label: 'Create Account' },
    { step: 2, label: 'Setup Shop' },
    { step: 3, label: 'Connect Bank' },
  ];

  // ── Hydration gate ──────────
  // Without this, Next.js renders with defaultState (step 1) first, then

  if (!_hasHydrated) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#f4f4f5]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </main>
    );
  }
  // --- HANDLE IMAGE   UPLOAD
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Keep the local preview using URL.createObjectURL (faster than Base64)
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setAvatarPreview(newPreviewUrl);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(
        '/product/api/upload-seller-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setAvatarData({
        file_id: response.data.file_id,
        file_url: response.data.file_url,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    }
  };

  return (
    <main className="w-full flex flex-col items-center pt-10 min-h-screen bg-[#f4f4f5]">
      {/* ── Stepper ── */}
      <div className="relative hidden md:flex items-center justify-between  md:w-[520px] mb-10 w-full px-10 md:px-0">
        {/* SINGLE CONTINUOUS BACKGROUND LINE (STAYS DEKTOP AND MOBILE) */}

        <div
          className="absolute left-[20px] top-1/2 bottom-5 w-[2px] bg-gray-300 z-0 md:hidden"
          style={{ height: 'calc(100% - 40px)', top: '20px' }}
        />

        {/* SINGLE BLUE FILL LINE THAT TRACKS ACTIVE INDEX SMOOTHLY */}
        <div
          className="absolute bg-blue-600 transition-all duration-500 ease-in-out z-0 hidden md:block"
          style={{
            top: '25%',
            left: '21px',
            height: '3.5px',
            width: `${((progressActiveStep - 1) / (STEPS.length - 1)) * 100}%`,
            maxWidth: 'calc(100% - 40px)',
          }}
        />
        <div
          className="absolute bg-blue-600 transition-all duration-500 ease-in-out z-0 md:hidden"
          style={{
            left: '59px',
            top: '20px',
            width: '2px',
            height: `${((progressActiveStep - 1) / (STEPS.length - 1)) * 100}%`,
            maxHeight: 'calc(100% - 40px)',
          }}
        />

        {STEPS.map(({ step, label }) => {
          const activeTrue = step <= activeStep;

          return (
            <div
              key={step}
              className="flex flex-row md:flex-col items-center gap-4 md:gap-1.5 z-10 w-full md:w-auto relative"
            >
              <button
                className={`flex items-center justify-center h-10 w-10 text-sm font-bold cursor-pointer
                  rounded-full border-2 transition-all duration-300 shrink-0
                  ${
                    activeTrue
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                onClick={() =>
                  setProgressActiveStep(
                    step <= activeStep ? step : progressActiveStep
                  )
                }
              >
                {step}
              </button>

              <span
                className={`text-sm md:text-xs font-medium ${
                  activeTrue ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {successMessage && (
        <div
          key="success-toast"
          className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300"
        >
          <div className="bg-green-600 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 font-semibold">
            <CheckCircle2 size={20} />
            {successMessage}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          className="flex"
          key={progressActiveStep}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* ── STEP 1 ── */}
          {progressActiveStep === 1 && (
            <div className="w-full flex justify-center">
              <section className="w-[90%] md:w-[480px] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                {/* Step 1 of 3 = 33.33%. The bar animates in on mount via CSS. */}
                <div className="w-full h-1 bg-gray-100">
                  <div
                    className="h-full bg-blue-500 rounded-r-full transition-all duration-700 ease-out"
                    style={{ width: '33.33%' }}
                  />
                </div>

                <div className="px-8 pt-6 pb-2">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Create Your Account
                    </h1>
                    <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">
                      Step 1 of {STEPS.length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Let us Know about you.
                  </p>
                </div>
                {/* {(signupMutation.isError || verifyOtpMutation.isError) && !successMessage && (
              <div className="mx-8 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-700 animate-in fade-in zoom-in-95">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Registration Faileds</p>
                </div>
              </div>
            )} */}

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-5 p-8"
                >
                  {/* // SELLER AVATAR */}
                  <div className="relative flex justify-center items-center mx-auto w-24 h-24">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <FieldError message={errors.avatar?.message} />

                    {/* Avatar Preview */}
                    <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden border-4 border-white shadow-lg">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Camera Icon Overlay */}
                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* N A M E  */}
                  <div className="relative pb-2">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Mona Mia"
                      {...register('name', { required: 'Name is required' })}
                      className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm
                    ${
                      errors.name
                        ? 'border-red-500 ring-1 ring-red-100'
                        : 'border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100'
                    }`}
                    />
                    <FieldError message={errors.name?.message} />
                  </div>

                  <div className="relative pb-2">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm
                    ${
                      errors.email
                        ? 'border-red-500 ring-1 ring-red-100'
                        : 'border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100'
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

                  <div className="relative pb-2">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                      Country
                    </label>
                    <select
                      className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm bg-white
                    ${
                      errors.country
                        ? 'border-red-500 ring-1 ring-red-100'
                        : 'border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100'
                    }`}
                      {...register('country', {
                        onChange: (e) => {
                          const matched = countries.find(
                            (c) => c.code === e.target.value
                          );
                          if (matched) setDialCode(matched.dialCode);
                        },
                        required: 'Country is required',
                      })}
                    >
                      <option value="" className="bg-blue-500">
                        Select your country
                      </option>
                      {countries.map((country) => (
                        <option
                          key={country.code}
                          value={country.code}
                          className="bg-gray-200"
                        >
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <FieldError message={errors.country?.message} />
                  </div>

                  {/* P H O N E     N U M B E R  */}
                  <div className="relative pb-2">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                      Phone Number
                    </label>
                    <div
                      className={`flex border rounded-lg overflow-hidden transition-all
                  ${
                    errors.phone_number
                      ? 'border-red-500 ring-1 ring-red-100'
                      : 'border-gray-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100'
                  }`}
                    >
                      <select
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        className="shrink-0 border-r border-gray-300 text-sm text-gray-700 px-2 py-2.5 outline-none cursor-pointer
                      hover:bg-gray-100 transition-colors"
                      >
                        {countries.map((country) => (
                          <option
                            className="bg-gray-200"
                            key={country.code}
                            value={country.dialCode}
                          >
                            {country.dialCode} {country.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="1234567890"
                        className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                        {...register('phone_number', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^\d{6,14}$/,
                            message: 'Enter digits only, 6–14 characters',
                          },
                        })}
                      />
                    </div>
                    <FieldError message={errors.phone_number?.message} />
                  </div>

                  <div className="relative pb-2">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                      Password
                    </label>
                    <div
                      className={`flex border rounded-lg overflow-hidden transition-all
                  ${
                    errors.password
                      ? 'border-red-500 ring-1 ring-red-100'
                      : 'border-gray-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100'
                  }`}
                    >
                      <input
                        type={passwordVisible ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                        {...register('password', {
                          required: 'Password is required',
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="px-3 text-gray-400 hover:text-gray-600 transition-colors bg-white"
                      >
                        {passwordVisible ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
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
                    className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-all flex justify-center items-center gap-2 mt-1"
                  >
                    {signupMutation.isPending ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              </section>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {progressActiveStep === 2 && <CreateShop />}

          {/* ── STEP 3 ── */}
          {progressActiveStep === 3 && (
            <section className="text-center">
              {/* Step 3 of 3 = 100%. The bar animates in on mount via CSS. */}
              <div className="w-full h-1 bg-gray-100">
                <div
                  className="h-full bg-blue-500 rounded-r-full transition-all duration-700 ease-out"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="px-8 pt-6 pb-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Connect With Stripe
                  </h1>
                  <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">
                    Step 3 of {STEPS.length}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Connect your payout account to start receiving payments.
                </p>
              </div>
              <br />
              <button
                type="button"
                // onClick={connectStripe}
                className="m-auto flex items-center justify-center gap-3 text-lg text-white py-2 px-6 bg-[#2516a4] hover:bg-[#3730a3] transition-colors rounded-md w-full max-w-[300px]"
              >
                Connect Stripe{' '}
                <Image
                  src={Stripe}
                  width={30}
                  height={30}
                  alt="Stripe"
                  loading="lazy"
                />
              </button>
            </section>
          )}
        </motion.section>
      </AnimatePresence>
    </main>
  );
};

export default SignUp;
