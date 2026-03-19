"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MoveRight } from "lucide-react";

const Hero = () => {
  const router = useRouter();

  return (
    <main className="bg-black/85 h-[85vh] flex flex-col justify-center w-full">
      <div className="flex gap-16 m-auto md:flex h-full items-center">

        {/* LEFT CONTENT */}
        <section className="md:w-1/2">
          <p className="font-Roboto font-normal text-white pb-2 text-xl">
            Starting from
          </p>

          <h1 className="text-white text-6xl font-extrabold font-Roboto">
            The best watch <br /> collection 2025
          </h1>

          <p className="font-Oregano text-3xl pt-4 text-white">
            Exclusive offer{" "}
            <span className="text-yellow-400">10% off</span> this week
          </p>

          <br />

          <button
            onClick={() => router.push("/products")}
            className="w-[140px] h-[40px] flex items-center justify-center gap-2 font-semibold bg-white text-black rounded hover:bg-gray-200 transition"
          >
            Shop Now <MoveRight size={18} />
          </button>
        </section>

        {/* RIGHT IMAGE */}
        <section className="md:w-1/2 flex justify-center">
          <Image
            src="https://ik.imagekit.io/hasanRakib/products/Hero-Slide.png"
            alt="Watch"
            width={650}
            height={650}
            priority
          />
        </section>

      </div>
    </main>
  );
};

export default Hero;