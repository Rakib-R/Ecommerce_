"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { AlertCircle, Loader2, Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast'

type Step = "email" | "otp" | "reset";

type FormData = {
  email: string;
  otp: string[];
  password?: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<Step>("email");
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(new Array(4).fill(""));
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(true);
  const router = useRouter();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { tempEmail, setTempEmail } = useAuthStore();
  const { register, handleSubmit, setValue } = useForm<FormData>();

  useEffect(() => {
    if (tempEmail) setValue('email', tempEmail);
  }, [tempEmail, setValue]);

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 1. Request OTP (Used for both initial send and Resend)
  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/forgot-password-user`, 
        { email }
      );
      return response.data;
    },
    onSuccess: (data, { email }) => {
      setUserEmail(email);
      setTempEmail(email);
      if (step === "email") setStep("otp"); // Only move step if we aren't already there
      setServerError(null);
      startResendTimer();
      toast.success(step === "otp" ? "Code resent successfully!" : "OTP sent to your email!");
    },
    onError: (error: AxiosError) => {
      setServerError(
        (error.response?.data as { message?: string })?.message || "Error processing request."
      );
    }
  });

  // 2. Verify OTP
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/verify-forgot-password-user`,
        { email: userEmail, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      setServerError((error.response?.data as {message?:string})?.message || "Invalid OTP. Try Again");
    }
  });

  // 3. Reset Password
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/reset-password-user`, {
        email: userEmail,
        newPassword: password,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password reset successfully!");
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      setServerError((error.response?.data as {message?:string})?.message || "Reset failed.");
    }
  });

  // --- Handlers ---
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);
    if (element.value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // 2. Handle Enter (New logic)
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

  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };

  const handleResendOtp = () => {
    if (canResend) {
      requestOtpMutation.mutate({ email: userEmail });
    }
  };

  const onSubmitPassword = (data: FormData) => {
    if (data.password) {
      resetPasswordMutation.mutate({ password: data.password });
    }
  };

  return (
    <main className="py-10 min-h-[85vh] bg-[#f1f1f1] flex flex-col justify-center font-sans">
      <div className="flex justify-center px-4">
        <section className="md:w-[450px] w-full p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              {step === "email" && <Mail size={32} />}
              {step === "otp" && <KeyRound size={32} />}
              {step === "reset" && <Lock size={32} />}
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              {step === "email" && "Forgot Password?"}
              {step === "otp" && "Verify OTP"}
              {step === "reset" && "Create New Password"}
            </h3>
            <p className="text-center text-gray-500 mt-2 text-sm px-6">
              {step === "otp" ? `Code sent to ${userEmail}` : "Secure your account with a new password."}
            </p>
          </div>

          {serverError && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm flex gap-2">
              <AlertCircle size={18} /> {serverError}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-6">
              <input className="w-full p-3 border rounded-lg" type="email" placeholder="Email" 
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}  
              />
              <button disabled={requestOtpMutation.isPending} className="w-full py-3 bg-black text-white rounded-xl font-bold flex justify-center items-center">
                {requestOtpMutation.isPending ? <Loader2 className="animate-spin" /> : "Send Code"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4">
                {otp.map((data, index) => (
                  <input key={index} type="text" maxLength={1} ref={(el) => { inputRefs.current[index] = el; }} value={data}
                    onChange={(e) => handleOtpChange(e.target, index)} onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-12 h-14 border-2 rounded-lg text-center text-xl font-bold focus:border-black outline-none" />
                ))}
              </div>
              <button 
                onClick={() => verifyOtpMutation.mutate()} 
                disabled={otp.some(v => v === "") || verifyOtpMutation.isPending} 
                className="w-full py-3 bg-black text-white rounded-xl font-bold flex justify-center items-center"
              >
                {verifyOtpMutation.isPending ? <Loader2 className="animate-spin" /> : "Verify OTP"}
              </button>

              {/* RESEND OTP SECTION */}
              <div className="pt-2 text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive the code?{' '}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={requestOtpMutation.isPending}
                      className="text-blue-600 font-bold hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                    >
                      {requestOtpMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                      Resend
                    </button>
                  ) : (
                    <small className="text-gray-400 font-medium">
                      Resend in <span className="text-black font-bold">{timer}s</span>
                    </small>
                  )}
                </p>
              </div>
            </div>
          )}

          {step === "reset" && (
            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="New Password"
                  className="w-full p-3 border rounded-lg outline-none"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-3 top-3.5 text-gray-400"
                >
                  {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center"
              >
                {resetPasswordMutation.isPending ? <Loader2 className="animate-spin" /> : "Update Password"}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-black flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;