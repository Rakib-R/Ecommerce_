"use client"

import Link from 'next/link';
import React, { useRef, useState, useEffect } from 'react';
import { useForm, useWatch } from "react-hook-form";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from "axios";
import toast from 'react-hot-toast';
import { countries } from '../../utils/countries';
import CreateShop from '../../shared/modules/auth/create-shop';
import Stripe from "../../assets/stripe.jpeg";
import Image from 'next/image';
import { useSellerRegistrationStore } from '../../store/useSellerRegistrationStore';
import { AnimatePresence, motion } from "framer-motion";
import axiosInstance from '../../utils/axiosInstance';
import { convertFileToBase64 } from '../../utils/convertFile2Base64';


type FormData = {
  name: string;
  password: string;
  email: string;
  phone_number: string;
  country: string;
  avatar: string;
};


const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <span className="absolute left-0 -bottom-5 flex items-center gap-1 text-sm font-medium
        text-red-600 animate-in fade-in slide-in-from-top-1">
      <AlertCircle size={12} /> {message}
    </span>
  );
};

  const stepVariants = {
    enter: { opacity: 0, y: 80 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -80 },
  };

const SignUp = () => {
  // ── Read EVERYTHING that controls which step renders from the store ──────────
  // This is the critical fix: activeStep must come from the store, NOT useState.
  const {
    _hasHydrated,     // ← gate: don't render until localStorage is loaded
    activeStep,       // ← from store, persisted across refreshes
    sellerId,
    step1Values,
    setActiveStep,
    setSellerId,
    saveStep1Values,
    resetRegistration,
  } = useSellerRegistrationStore();

  // ── Local UI-only state (transient, fine to reset on refresh) ───────────────
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [dialCode, setDialCode] = useState("+880");
  // sellerData only needed within the current OTP flow session

  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarData, setAvatarData] = useState<{ file_id: string; file_url: string } | null>(null);

  // Pre-fill step-1 form with persisted values so nothing is re-typed after refresh
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: step1Values.name ?? "",
      email: step1Values.email ?? "",
      country: step1Values.country ?? "",
      phone_number: step1Values.phone_number ?? "",
      password: step1Values.password ?? "",
      avatar : step1Values.avatar ?? "" 
    },
  });

  const watchedCountry = useWatch({ control, name: "country" });
  useEffect(() => {
    if (!watchedCountry) return;
    const matched = countries.find((c) => c.code === watchedCountry);
    if (matched) setDialCode(matched.dialCode);
  }, [watchedCountry]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!canResend && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [canResend, timer]);

    //! Only run once when hydration completes
    // !← only on hydration, nothing else
  useEffect(() => {
    if (_hasHydrated && step1Values) {
      reset({
        name: step1Values.name,
        email: step1Values.email,
        country: step1Values.country,
        phone_number: step1Values.phone_number?.replace(dialCode, ""), // Clean the dial code
        password: step1Values.password,
        avatar: step1Values.avatar,
      });
    }
  }, [_hasHydrated]);

  // CLEARS UP SUCCESS MESSAGE
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [successMessage]);


  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axiosInstance.post(
        '/api/seller-registration', {...data, avatarData}
      );
      return response.data;
    },
    onSuccess: () => {
      // Clear the signup error when OTP panel opens 
      signupMutation.reset();
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
    },
  });

  const onSubmit = (data: FormData) => {

    // ✅ Guard against double fire
    if (signupMutation.isPending) return;
    const payload = { ...data, phone_number: `${dialCode}${data.phone_number}` };

    // Save BEFORE the network call — if connection drops, form stays filled
    saveStep1Values(payload);
    setSellerData(payload);
    signupMutation.mutate(payload);
  };
  
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axiosInstance.post(
        '/api/verify-seller',
        { ...sellerData, otp: otp.join('') }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage("Verification successful! Redirecting...");

      //! Persist sellerId AND advance step together so a refresh after this 
      // //! Pointing to lands on step 2, 
      setSellerId(data.seller?.id);
      setActiveStep(2);
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]$/.test(value) && value !== "") return;
    
    if (value && verifyOtpMutation.isError || AxiosError) {
      verifyOtpMutation.reset();
  }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      const isOtpComplete = otp.every(digit => digit !== "");
      if (isOtpComplete) verifyOtpMutation.mutate();
      else toast.error("Please enter the full 4-digit code");
    }
  };

const resendOtpMutation = useMutation({
  mutationFn: async () => {
    if (!sellerData) return;
    const response = await axiosInstance.post(
      '/api/seller-registration',
      sellerData
    );
    return response.data;
  },
  onSuccess: () => {
    setCanResend(false);
    setTimer(60);
    toast.success("OTP resent!");
  },
  onError: () => {
    toast.error("Failed to resend OTP. Try again.");
  }
});

const resendOtp = () => {
  if (!sellerData || resendOtpMutation.isPending) return;
  resendOtpMutation.mutate();
};

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      return error.response?.data?.message || error.message;
    }
    return "An unexpected error occurred.";
  };

  const connectStripe = async () => {
    try {
      console.log("Stripe Key Loaded:", process.env.STRIPE_SECRET_KEY?.substring(0, 8) + "...");
      const response = await axiosInstance.post(
        '/api/create-stripe-link',
        { sellerId }
      );
      if (response.data.url) {
        resetRegistration(); // wipe store only when truly done
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error connecting to Stripe:", error);
    }
  };

  const STEPS = [{step: 1 , label : "Create Account"}, {step: 2, label: "Setup Shop"}, {step: 3, label: "Connect Bank"}];

  // ── Hydration gate ──────────
  // Without this, Next.js renders with defaultState (step 1) first, then
  // immediately re-renders with the localStorage value — causing a flicker

  if (!_hasHydrated) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#f4f4f5]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </main>
    );
  }

    // HANDLE   IMAGE      UPLOAD
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

      const file = e.target.files?.[0];
      if (!file) return;
      
      try{
        const base64 = await convertFileToBase64(file)
        setAvatarPreview( base64 as string)

        const response = await axiosInstance.post("/product/api/upload-seller-image", { 
          file: base64 
        });
         setAvatarData({
          file_id: response.data.file_id,
          file_url: response.data.file_url
        });
      }
      catch(error){  
          console.error('Upload failed:', error);
          toast.error('Failed to upload image');
      }
    };
    //   // FOR PROGRESS ANIMATION 
//   function getProgressPercent(activeStep: number, totalSteps: number): number {
//   if (activeStep <= 1) return 0;
//   return ((activeStep - 1) / (totalSteps - 1)) * 100;
// }
  return (
    <main className=" w-full flex flex-col items-center pt-10 min-h-screen bg-[#f4f4f5]">

      {/* ── Stepper ── */}
     <div className="relative flex items-center justify-between w-[90%] md:w-[520px] mb-10">

        {STEPS.map(({ step, label }: any, index: number) => {
          const active = step <= activeStep;
          const isLast = index === STEPS.length - 1;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1.5 -mx-8 z-10 ">
                <span
                  className={`flex items-center justify-center h-10 w-10 text-sm font-bold 
                    rounded-full border-2 transition-all duration-300
                    ${active
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white border-gray-200 text-gray-400"
                    }`}>
                  {step}
                </span>
                <span className={`text-xs font-medium ${active ? "text-blue-600" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>

              {/* Connector line — only between steps, not after the last */}
              {!isLast && (
                <div className="flex-1 h-[2px] bg-gray-300 relative overflow-hidden -mt-5">
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-500 ease-in-out"
                    style={{ width: activeStep > step ? "100%" : "0%" }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })} 
    </div>

      {successMessage && (
        <div key="success-toast" className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-green-600 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 font-semibold">
            <CheckCircle2 size={20} />
            {successMessage}
          </div>
        </div>
      )}

    <AnimatePresence mode="wait" initial={false}>
     <motion.section className='flex'
         key={activeStep}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}>
      
      {/* ── STEP 1 ── */}
      { activeStep === 1 && (
        <div className="w-full flex justify-center">
          <section className="w-[90%] md:w-[480px] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="px-8 pt-8 pb-2">
              <h1 className="text-2xl font-bold text-gray-900 text-center">
                {showOtp ? "Email Verification" : "Create Your Seller Account"}
              </h1>
              {!showOtp && (
                <p className="text-center text-sm text-gray-500 mt-1.5">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-500 font-medium hover:underline">Login</Link>
                </p>
              )}
            </div>

            {(signupMutation.isError || verifyOtpMutation.isError) && !successMessage && (
              <div className="mx-8 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-700 animate-in fade-in zoom-in-95">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Action Failed</p>
                  <p>{getErrorMessage(signupMutation.error || verifyOtpMutation.error)}</p>
                </div>
              </div>
            )}

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-8">
               
                {/* // SELLER AVATAR */}
               <div className='relative flex justify-center items-center mx-auto w-24 h-24'>
                <input 
                  type='file' 
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                />
                <FieldError message={errors.avatar?.message} />
                
                {/* Avatar Preview */}
                <div className='w-3/4 h-3/4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden border-4 border-white shadow-lg'>
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-gray-200'>
                      <svg className='w-12 h-12 text-gray-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Camera Icon Overlay */}
                <div className='absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md'>
                  <svg className='w-4 h-4 text-gray-600' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div> 

                    {/* N A M E  */}
              <div className="relative pb-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">Name</label>
                <input
                  type="text"
                  placeholder="Mona Mia"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm
                    ${errors.name ? "border-red-500 ring-1 ring-red-100" : "border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`}
                  {...register("name", { required: "Name is required" })}
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div className="relative pb-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm
                    ${errors.email ? "border-red-500 ring-1 ring-red-100" : "border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
                  })}
                />
                <FieldError message={errors.email?.message} />
              </div>

              <div className="relative pb-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">Country</label>
                <select
                  className={`w-full p-2.5 border rounded-lg outline-none transition-all text-sm bg-white
                    ${errors.country ? "border-red-500 ring-1 ring-red-100" : "border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`}
                  {...register("country", { required: "Country is required" })}
                >
                  <option value="" className='bg-blue-500'>Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code} className='bg-gray-200'>{country.name}</option>
                  ))}
                </select>
                <FieldError message={errors.country?.message} />
              </div>

                {/* P H O N E     N U M B E R  */}
              <div className="relative pb-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">Phone Number</label>
                <div className={`flex border rounded-lg overflow-hidden transition-all
                  ${errors.phone_number ? "border-red-500 ring-1 ring-red-100" : "border-gray-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100"}`}>
                  <select
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                    className="shrink-0 border-r border-gray-300 text-sm text-gray-700 px-2 py-2.5 outline-none cursor-pointer
                      hover:bg-gray-100 transition-colors"
                  >
                    {countries.map((country) => (
                      <option className='bg-gray-200' key={country.code} value={country.dialCode}>
                        {country.dialCode} {country.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="1234567890"
                    className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                    {...register("phone_number", {
                      required: "Phone number is required",
                      pattern: { value: /^\d{6,14}$/, message: "Enter digits only, 6–14 characters" },
                    })}
                  />
                </div>
                <FieldError message={errors.phone_number?.message} />
              </div>

              <div className="relative pb-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">Password</label>
                <div className={`flex border rounded-lg overflow-hidden transition-all
                  ${errors.password ? "border-red-500 ring-1 ring-red-100" : "border-gray-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100"}`}>
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                    {...register("password", {
                      required: "Password is required",
                      
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="px-3 text-gray-400 hover:text-gray-600 transition-colors bg-white"
                  >
                    {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-all flex justify-center items-center gap-2 mt-1"
              >
                {signupMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-6 px-8 py-8">
              <p className="text-sm text-center text-gray-500">
                Enter the 4-digit code sent to{" "}
                <span className="font-bold text-gray-900">{sellerData?.email}</span>
              </p>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => { if (el) inputRefs.current[index] = el; }}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white bg-gray-50 outline-none transition-all"
                  />
                ))}
              </div>
              <button
                disabled={verifyOtpMutation.isPending || !!successMessage}
                onClick={() => verifyOtpMutation.mutate()}
                className={`w-full py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-lg
                  ${successMessage ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"}`}
              >
                {verifyOtpMutation.isPending
                  ? <Loader2 className="animate-spin" size={18} />
                  : successMessage ? <CheckCircle2 size={18} /> : "Verify OTP"}
              </button>
              {verifyOtpMutation.isError && verifyOtpMutation.error instanceof AxiosError && (
                <p className="text-sm text-red-500">
                  {verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}
                </p>
              )}
              <div className="text-sm">
                {canResend ? (
                  <button onClick={resendOtp} disabled={resendOtpMutation.isPending}
                    className="text-blue-600 font-bold hover:underline disabled:opacity-50">
                     {resendOtpMutation.isPending 
                      ? <Loader2 className="animate-spin inline" size={14} /> 
                         : "Resend OTP"}   
                        </button>
                  ) : (
                    <span className="text-gray-400 italic">
                      Resend available in <span className="text-black font-bold">{timer}s</span>
                    </span>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    )}

      {/* ── STEP 2 ── */}
      { activeStep === 2 && <CreateShop setActiveStep={setActiveStep} />}

      {/* ── STEP 3 ── */}
      { activeStep === 3 && (
        <section className="text-center">
          <h3 className="text-2xl font-semibold text-gray-800">Withdraw Method</h3>
          <p className="text-gray-500 mt-2">Connect your payout account to start receiving payments.</p>
          <br />
          <button
            type="button"
            onClick={connectStripe}
            className="m-auto flex items-center justify-center gap-3 text-lg text-white py-2 px-6 bg-[#2516a4] hover:bg-[#3730a3] transition-colors rounded-md w-full max-w-[300px]"
          >
            Connect Stripe <Image src={Stripe} width={30} height={30} alt="Stripe" loading="lazy"/>
          </button>
        </section>
      )}

    </motion.section>
</AnimatePresence>
    </main>
  );
};

export default SignUp;
