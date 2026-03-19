"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import GoogleButton from "../../shared/components/google-button";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../utils/axios";

type FormData = {
  name: string;
  password: string;
  email: string;
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
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!canResend && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [canResend, timer]);

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axiosInstance.post(`/api/user-registration`, data);
      return response.data;
    },
    onSuccess: () => {
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      toast.success("OTP sent to your email!", {
        style: {
          background: "#18181b",
          color: "#fff",
          borderRadius: "12px",
          fontWeight: "600",
        },
        iconTheme: { primary: "#22c55e", secondary: "#fff" },
      });
    },
    onError: (error: AxiosError) => {
      const msg =
        (error.response?.data as { message?: string })?.message ||
        "Registration failed. Please try again.";
      toast.error(msg, {
        style: {
          background: "#18181b", color: "#fff", borderRadius: "12px", fontWeight: "600",
        },
        iconTheme: { primary: "#ef4444", secondary: "#fff" },
      });
    },
  });

  const onSubmit = (data: FormData) => {
    setUserData(data);
    signupMutation.mutate(data);
  };

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axiosInstance.post(`/api/verify-user`, {
        ...userData,
        otp: otp.join(""),
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Account verified! Redirecting to login...", {
        duration: 3000,
        style: {
          background: "#18181b",
          color: "#fff",
          borderRadius: "12px",
          fontWeight: "600",
        },
        iconTheme: { primary: "#22c55e", secondary: "#fff" },
      });
      setTimeout(() => router.push("/"), 1000);
    },
    onError: (error: AxiosError) => {
      const msg =
        (error.response?.data as { message?: string })?.message ||
        "Invalid OTP. Please try again.";
      toast.error(msg, {
        style: {
          background: "#18181b",
          color: "#fff",
          borderRadius: "12px",
          fontWeight: "600",
        },
        iconTheme: { primary: "#ef4444", secondary: "#fff" },
      });
      // Shake the OTP inputs
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
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

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      const isComplete = otp.every((d) => d !== "");
      if (isComplete) {
        verifyOtpMutation.mutate();
      } else {
        toast.error("Please fill all 4 digits.", {
          style: {
            background: "#18181b",
            color: "#fff",
            borderRadius: "12px",
            fontWeight: "600",
          },
        });
      }
    }
  };

  const resendOtp = () => {
    if (!canResend || !userData) return;
    signupMutation.mutate(userData);
    setCanResend(false);
    setTimer(60);
  };

  return (
    <main className="py-10 min-h-[85vh] bg-gray-100">
      {/* React Hot Toast portal */}
      <Toaster position="top-center" />

      <h1 className="text-4xl mb-8 font-semibold text-black text-center">
        Ecommerce_
      </h1>

      <div className="flex justify-center px-4">
        <section className="md:w-[480px] w-full p-8 bg-gray-100 shadow-xl rounded-2xl border border-gray-100">

          {/* ── STEP 1: SIGN UP FORM ── */}
          {!showOtp ? (
            <>
              <h3 className="text-2xl font-bold text-center mb-2 text-gray-800">
                Create Your Account
              </h3>
              <p className="text-center text-sm text-gray-500 mb-6">
                Already have an account?{" "}
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
                        "Something went wrong. Please try again."}
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
                        ? "border-red-500 ring-1 ring-red-100 bg-red-50"
                        : "border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100"
                    }`}
                    {...register("name", { required: "Name is required" })}
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
                        ? "border-red-500 ring-1 ring-red-100 bg-red-50"
                        : "border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100"
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

                {/* Password */}
                <div className="relative pb-2">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      className={`w-full p-2.5 border rounded-lg outline-none transition-all ${
                        errors.password
                          ? "border-red-500 ring-1 ring-red-100 bg-red-50"
                          : "border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-100"
                      }`}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
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

                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-all flex justify-center items-center gap-2 shadow-lg shadow-gray-200"
                >
                  {signupMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── STEP 2: OTP VERIFICATION ── */
            <div className="flex flex-col items-center gap-6 py-2">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <MailCheck size={30} className="text-blue-600" />
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-1">
                  Check your inbox
                </h3>
                <p className="text-sm text-gray-500">
                  We sent a 4-digit code to{" "}
                  <span className="font-bold text-black">
                    {userData?.email}
                  </span>
                </p>
              </div>

              {/* OTP Error */}
              {verifyOtpMutation.isError && (
                <div className="w-full p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3 text-red-700 animate-in fade-in zoom-in-95">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-sm font-semibold">
                    {(
                      verifyOtpMutation.error as AxiosError<{
                        message?: string;
                      }>
                    )?.response?.data?.message || "Invalid code. Try again."}
                  </p>
                </div>
              )}

              {/* OTP Inputs */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all
                      ${
                        digit
                          ? "border-black bg-white text-black"
                          : "border-gray-200 bg-gray-50 focus:border-black focus:bg-white"
                      }
                      ${verifyOtpMutation.isError ? "border-red-300 bg-red-50" : ""}
                    `}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                disabled={
                  verifyOtpMutation.isPending ||
                  otp.some((d) => d === "") ||
                  verifyOtpMutation.isSuccess
                }
                onClick={() => verifyOtpMutation.mutate()}
                className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 disabled:bg-zinc-400 transition-all flex justify-center items-center gap-2 shadow-lg shadow-gray-200"
              >
                {verifyOtpMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : verifyOtpMutation.isSuccess ? (
                  <>
                    <CheckCircle2 size={18} /> Verified!
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>

              {/* Resend */}
              <div className="text-sm text-center">
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    disabled={signupMutation.isPending}
                    className="flex items-center gap-1.5 text-blue-600 font-bold hover:underline mx-auto disabled:opacity-50"
                  >
                    <RefreshCw
                      size={14}
                      className={
                        signupMutation.isPending ? "animate-spin" : ""
                      }
                    />
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-400 italic">
                    Resend available in{" "}
                    <span className="text-black font-bold">{timer}s</span>
                  </span>
                )}
              </div>

              {/* Back link */}
              <button
                onClick={() => {
                  setShowOtp(false);
                  setOtp(["", "", "", ""]);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
              >
                ← Back to sign up
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default SignUp;
