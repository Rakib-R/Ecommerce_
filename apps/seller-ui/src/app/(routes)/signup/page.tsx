"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from "axios";
import toast from 'react-hot-toast';
import { countries } from '../../utils/countries';

type FormData = {
  name: string;
  password: string;
  email: string;
  phone_number: Number;
  country: string;
};

// Sub-component for consistent inline errors
const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <span className="absolute left-0 -bottom-5 flex items-center gap-1 text-sm font-medium 
        text-red-600 animate-in fade-in slide-in-from-top-1">
      <AlertCircle size={12} /> {message}
    </span>
  );
};

const SignUp = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [activeStep, setActiveStep] = useState(1);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [canResend, timer]);

      const signupMutation = useMutation({
      mutationFn: async (data: FormData) => {
        const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/seller-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (formData) => {
      // setUserData(formData); //! LONG AND HARD CORE FIX You need to store the original form data (what the user typed) into your userData state, not the server's response.
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
    },
  });

  // --- ADDED THIS FUNCTION TO FIX THE REFERENCE ERROR ---
  const onSubmit = (data: FormData) => {
    setUserData(data);
    signupMutation.mutate(data);
  };

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/verify-seller`,
        { ...userData, otp: otp.join('') }
      );
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage("Verification successful! Redirecting...");
      setTimeout(() => router.push("/login"), 2000);
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]$/.test(value) && value !== "") return;
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
      // Check if all OTP fields are filled
      const isOtpComplete = otp.every(digit => digit !== "");
      
      if (isOtpComplete) {
        verifyOtpMutation.mutate();
      } else {
        toast.error("Please enter the full 4-digit code");
      }
    }
  };

  const resendOtp = () => {
    if (userData) {
      signupMutation.mutate(userData);
      setCanResend(false);
      setTimer(60);
    }
  };

  const getErrorMessage = (error: any) => {
    if (error instanceof AxiosError) {
      return error.response?.data?.message || error.message;
    }
    return "An unexpected error occurred.";
  };

  return (
    <div className="relative w-full flex flex-col items-center pt-10 min-h-screen">

      {/* Stepper*/}
      <div className="relative flex items-center justify-between md:w-[50%] mb-8"> 
          {[1, 2, 3].map((step) => (
            <div key={step}>
             <span key={step} className={`flex items-center justify-center h-10 w-10 rounded-full text-white 
                font-bold ${step <= activeStep ? "bg-blue-500" : 'bg-gray-300'} `}>
                 {step}
              </span>
              <span>
                {step === 1
                  ? "Create Account" : step === 2 ? "Setup Shop" : "Connect Bank"}
              </span>
          </div>
          ))}
      </div>
      <aside className='absolute top-[50vh] w-full h-screen bg-slate-300'></aside>
         
      {activeStep === 1 && (!showOtp ? (
      <>
      <main className="relative h-screen my-16 ">
      {/* SUCCESS TOAST */}
        {successMessage && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 font-semibold">
              <CheckCircle2 size={20} />
              {successMessage}
            </div>
          </div>
        )}

     
      <div className="flex justify-center relative top-0">
        <section className=" md:w-[480px] p-8 bg-[#f1f1f1] rounded-2xl border border-gray-100">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
            {showOtp ? "Email Verification" : "Create Account"}
          </h1>

          {/* SERVER ERROR CALLOUT */}
          {(signupMutation.isError || verifyOtpMutation.isError) && !successMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-700 animate-in fade-in zoom-in-95">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Action Failed</p>
                <p>{getErrorMessage(signupMutation.error || verifyOtpMutation.error)}</p>
              </div>
            </div>
          )}
        </section>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 p-8 h-screen space-y-6 bg-[#f1f1f1] shadow-[10_10_8px_rgba(248,113,113,0.6)] ">
        {/* Name */}
        <div className="relative pb-2">
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input
            type="text"
            placeholder="Mona Mia"
            className={`w-full p-2.5 border rounded-md outline-none transition-all ${
              errors.name
                ? "border-red-500 ring-1 ring-red-100"
                : "border-gray-300 focus:border-black"
            }`}
            {...register("name", { required: "Name is required" })}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* Email */}
        <div className="relative pb-2">
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            placeholder="www@email.com"
            className={`w-full p-2.5 border rounded-md outline-none transition-all ${
              errors.email
                ? "border-red-500 ring-1 ring-red-100"
                : "border-gray-300 focus:border-black"
            }`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
          <FieldError message={errors.email?.message} />
        </div>
          
        <div>
          <label className="block O text-gray-700 mb-1">Phone Numbers</label>
         <input className=' border-gray-30@ outline-o rounded-[opx] mb-l p-2 border'
                placeholder='0178*******'
           {... register("phone_number",{ 
            required: "Phone Number is required",
            pattern : {
              value : /^(?:\+8801|8801|01)[3-9]\d{8}$/,
              message: 'Invalid phone number format'
            },
            minLength: {
              value: 10,
              message: 'Phone umber must be at least 10 digits'
            },
              maxLength: {
              value: 15,
              message: 'Phone umber can not exceed 15 digits'
            }
           })}
           />
        </div>
        <div>
          <div>
          <label className="block text-gray-700 mb-1">
            Country
          </label>

          <select
            className="w-full p-2 border border-gray-300 outline-none rounded-md"
            {...register("country", { required: "Country is required" })}>
            <option value="">Select your country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
          <p className="text-sm text-red-500">
            {String(errors.country.message)}
          </p>
        )}
      </div>
        </div>
        {/* Password */}
        <div className="relative pb-2">
          <label className="block text-sm font-semibold mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Min. 6 characters"
              className={`w-full p-2.5 border rounded-md outline-none transition-all ${
                errors.password
                  ? "border-red-500 ring-1 ring-red-100"
                  : "border-gray-300 focus:border-black"
              }`}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password too short",
                },
              })}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {passwordVisible ? (
                <Eye size={18} />
              ) : (
                <EyeOff size={18} />
              )}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <button
          type="submit"
          disabled={signupMutation.isPending}
          className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-all flex justify-center items-center gap-2"
        >
          {signupMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Sign Up"
          )}
        </button>
        {signupMutation.isError && signupMutation.error instanceof AxiosError && (
          <p className="text-sm text-red-500">
            {signupMutation.error.response?.data?.message || signupMutation.error.message}
          </p>
        )}
      
        <div className="text-center font-medium py-3">
          Already have an account?{" "}
          <Link href="/login" className="text-red-400 underline transition-all duration-300 hover:text-red-500 hover:shadow-[10_0_8px_rgba(248,113,113,0.6)]">Login</Link>
        </div>
        <aside className="absolute w-[90%] h-1 top-[25%] left-0 bg-blue-100 -z-10"></aside>

      </form>
    </main>

      
    </>
  ) : (
    <section>
      <div className="flex flex-col items-center gap-8 py-4">
        <p className="text-sm text-center text-gray-500">
          Enter the code sent to{" "}
          <span className="font-bold text-black">
            {userData?.email}
          </span>
        </p>

        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              ref={(el) => {
                if (el) inputRefs.current[index] = el;
              }}
              maxLength={1}
              value={digit}
              onChange={(e) =>
                handleOtpChange(index, e.target.value)
              }
              onKeyDown={(e) =>
                handleOtpKeyDown(e, index)
              }
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white bg-gray-50 outline-none transition-all"
            />
          ))}
        </div>

        <button
          disabled={
            verifyOtpMutation.isPending || !!successMessage
          }
          onClick={() => verifyOtpMutation.mutate()}
          className={`w-full py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-lg ${
            successMessage
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
          }`}>
            {verifyOtpMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : successMessage ? (
              <CheckCircle2 />
            ) : (
              "Verify OTP"
            )}
          </button>
            {verifyOtpMutation?.isError && verifyOtpMutation.error instanceof AxiosError && (
            <p className="text-sm text-red-500">
              {verifyOtpMutation.error.response?.data?.message || verifyOtpMutation.error.message}
            </p>
          )}
          <small className="text-sm">
          {canResend ? (
            <button
              onClick={resendOtp}
              className="text-blue-600 font-bold hover:underline">
              Resend OTP
            </button>
          ) : (
            <span className="text-gray-400 italic">
              available in{" "}
              <span className="text-black font-bold">
                {timer}s
              </span>
            </span>
          )}
        </small>
      </div>
    </section>
  )
)}

    
    </div>
    
  );
};

export default SignUp;