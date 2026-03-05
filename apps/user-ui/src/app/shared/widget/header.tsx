'use client'

import Link from "next/link";
import React from "react";
import { HeartIcon, Search } from "lucide-react";
import Cart from "../../../../assests/svgs/cart.png";
import ProfileIcon from "../../../../assests/svgs/profile-icon.svg";
import HeaderBottom from "./header-bottom";
import useUser from "../../hooks/useUser";

const Header = () => {
  const { user, isLoading } = useUser();
  const isUserAuthenticated = !isLoading && !!user;
  return (
    <>
      {/* 1. Ensure isAuthenticated is actually a boolean or truthy value */}
      {isUserAuthenticated && (
        <>
          <main className="max-w-[1300px] mx-auto relative">
            <div className="px-5 py-5 h-32 flex items-center justify-between gap-4">
              
              <nav className="shrink-0">
                <Link href="/">
                  <span className="text-2xl font-bold">Home</span>
                </Link>
              </nav>

              <section className="relative flex-1 max-w-[600px]">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full px-4 border-[2.5px] border-[#3489FF] outline-none h-[55px] rounded-md"
                />
                <div className="w-[60px] bg-[#3489FF] flex items-center justify-center h-[55px] absolute top-0 right-0 rounded-r-md">
                  <Search color="white" />
                </div>
              </section>
              
              <section className="flex items-center shrink-0 gap-6">
                <div className="flex items-center gap-2">
                  {!isLoading && user ? (
                    <Link href="/profile" className="flex items-center gap-2">
                      <img src={ProfileIcon.src} alt="Profile" className="w-6 h-6" />
                      <span className="font-medium text-black">
                        Hello, <span className="font-semibold">{user.name?.split(" ")[0]}</span>
                      </span>
                    </Link>
                  ) : (
                    <Link href="/login" className="flex items-center gap-2">
                      <img src={ProfileIcon.src} alt="Login" className="w-6 h-6" />
                      <span className="font-medium text-black">
                        Hello, <span>{isLoading ? '...' : 'Sign In'}</span>
                      </span>
                    </Link>
                  )}
                </div>

                <aside className="flex items-center gap-4">
                   <Link href="/wishlist" className="relative">
                     <HeartIcon className="w-6 h-6" />
                     <sup className="absolute -top-1 -right-1 bg-red-700 w-4 h-4 text-white rounded-full flex items-center justify-center text-[10px]">
                       0
                     </sup>
                   </Link>
                   <Link href="/cart" className="relative">
                     <img src={Cart.src} alt="Cart" className="w-6 h-6" />
                     <sup className="absolute -top-1 -right-1 bg-red-700 w-4 h-4 text-white rounded-full flex items-center justify-center text-[10px]">
                       0
                     </sup>
                   </Link>
                </aside>
              </section>
            </div>
            <div className="border-b border-b-[#99999938]" />
          </main>
          <HeaderBottom />
        </>
   )}
    </>
  );
};

export default Header;