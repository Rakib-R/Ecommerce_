'use client';

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { HeartIcon, Search } from "lucide-react";
import Cart from "../../../../assests/svgs/cart.png";
import ProfileIcon from "../../../../assests/svgs/profile-icon.svg";
import HeaderBottom from "./header-bottom";
import useUser from "../../hooks/useUser";
import Image from "next/image";
import { useAuthState, useStore } from "../../store/authStore";
import {useRouter} from "next/navigation";
import { queryClient } from "@apps/utils/queryClient";
import axiosInstance from "../../utils/axios";

const Header = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const router = useRouter();
  const topHeaderRef = useRef<HTMLDivElement>(null);
  const [topHeaderHeight, setTopHeaderHeight] = useState(0);

  useEffect(() => {
    if (topHeaderRef.current) {
      setTopHeaderHeight(topHeaderRef.current.offsetHeight);
    }
  }, []);

  const handleLogout = async () => {
    await axiosInstance.post(`/api/logout`);
    useAuthState.getState().logout();
    queryClient.setQueryData(['user'], null);
    router.push("/login");
  };

  return (
    <div className="z-[90]">
      <div ref={topHeaderRef}>
        <main className="max-w-[1300px] mx-auto relative z-[10]">
          <div className="px-5 py-5 h-32 flex items-center justify-between gap-4">
            <nav className="shrink-0">
              <Link href="/">
                <span className="text-3xl font-semibold">Home</span>
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
            
            <section className="flex items-center shrink-0 gap-4 w-[310px]">
              <div className="flex items-center">

                {/* IT WILL STAY HERE REGARDLESS USER EXISTS OR NOT */}
                <div className={`${user && ''} w-[140px]`}>
                  {!isLoading && user && (
                    <Link href="/profile" className="flex items-center gap-2">
                    <Image src={ProfileIcon.src} alt="Profile" width={20} height={20} className="brightness-0" />
                    <p className="font-medium text-black">
                      <span className='text-md'>Hello, {user.role === 'admin' ? 'Admin' : ''}</span>
                      <span className="text-xl font-serif">{user.name?.split(" ")[0]}</span>
                    </p>
                  </Link>
                  )}
              </div>

                {!isLoading && user ? (
                  <Link href="/login" className="flex items-center gap-1">
                    {/* <img src="/logOut.svg" alt="Profile" className="w-6 h-6 ml-2" 
                    style={{ filter: 'invert(21%) sepia(99%) saturate(7479%) hue-rotate(360deg) brightness(92%) contrast(116%)' }}/> */}
                    <span className="text-lg  underline"
                      onClick={handleLogout}>{isLoading ? '...' : 'Log Out'}</span>
                  </Link>
                ) : (
                  <Link href="/login" className="flex items-center gap-1">
                    <span className="font-medium text-black">
                      <span className="text-lg text-cyan-600 font-medium">{isLoading ? '...' : 'Sign In'}</span>
                    </span>
                  </Link>
                )}
              </div>

              <aside className="flex items-center gap-3">
                <Link href="/wishlist" className="relative">
                  <HeartIcon className="w-6 h-6" />
                  <sup className="absolute -top-1 -right-1 bg-red-700 w-4 h-4 text-white rounded-full flex items-center justify-center text-[10px]">
                    {wishlist?.length}
                  </sup>
                </Link>
                <Link href="/cart" className="relative">
                  <img src={Cart.src} alt="Cart" className="w-6 h-6" />
                  <sup className="absolute -top-1 -right-1 bg-red-700 w-4 h-4 text-white rounded-full flex items-center justify-center text-[10px]">
                    {cart?.length}
                  </sup>
                </Link>
              </aside>

            </section>
          </div>
          <div className="border-b border-b-[#99999938]" />
        </main>
      </div>
      
      {/* Pass the top header height to HeaderBottom */}
      <HeaderBottom topHeaderHeight={topHeaderHeight} />
    </div>
  );
};

export default Header;