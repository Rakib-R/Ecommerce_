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
import { usePathname } from 'next/navigation';
import { authClient } from '../../configs/auth-client';

import toast from 'react-hot-toast';
import { LogOut, Loader2 } from "lucide-react";

const Header = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);
  const router = useRouter();
  const path = usePathname();
  const [pathname, setPath] = useState('');
  const topHeaderRef = useRef<HTMLDivElement>(null);
  const [topHeaderHeight, setTopHeaderHeight] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (topHeaderRef.current) {
      setTopHeaderHeight(topHeaderRef.current.offsetHeight);
    }
  }, []);

//! PATH NAME MODIFIER !
 useEffect(() => {

  const displayPath = path === '/' 
    ? 'Home' 
    : (() => {
        const lastSegment = path
          .replace(/^\//, '')
          .split('/')
          .pop();
        
        if (!lastSegment) return 'Home';
        
        return lastSegment
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      })();

    setPath(displayPath);
  }, [path]); 

  
  const handleLogout = async () => {
      setIsLoggingOut(true);
      
    try {
      
      await authClient.signOut();
      toast.success("Logged out successfully", {
        style: { background: "#18181b", color: "#fff", borderRadius: "12px" },
      });

      router.replace("/login");
      useAuthState.getState().handleLogout();
      
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Failed to log out cleanly.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="z-[90]">
      <div ref={topHeaderRef}>
        <main className="max-w-[1350px] mx-auto relative z-[10]">

          {/* FIRST CHILD */}
          <div className=" grid grid-flow-col grid-cols-12 gap-8 py-5 h-32 items-center ">
            <nav className="col-span-2 shrink-0">
              <Link href="/">
                <span className="text-3xl font-semibold">{pathname}</span>
              </Link>
            </nav>

            {/* SECOND CHILD */}
            <section className="relative col-start-3 col-span-6">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full h-[55px] px-4 border-[1.5px] border-[#3489FF] outline-none rounded-md"/>
              <div className="w-[50px] bg-[#3489FF] flex items-center justify-center h-[55px] absolute top-0 right-0 rounded-r-md">
                <Search color="white" />
              </div>
            </section>
            
            
            {/* TH I R D C H I L D */}
            
            <section className="col-span-4 flex justify-center items-center shrink-0 gap-4 ">
              <div className="flex items-center">

                {/* IT WILL STAY HERE REGARDLESS USER EXISTS OR NOT */}
                <div className={`${user &&''} `}>
                  {!isLoading && user && (
                    <Link href="/profile" className="flex items-center gap-2">
                    <Image src={ProfileIcon.src} alt="Profile" width={20} height={20} className="brightness-0"  sizes="(max-width: 512px) 100vw, 33vw"
                      loading="lazy"/>
                    <p className="font-medium text-black">
                      <span className='text-md'>Hello,{' '}</span>
                      <span className="font-adamina text-xl font-serif">{user.name?.split(" ")[0]}</span>
                    </p>
                  </Link>
                  )}
              </div>
              </div>

               <aside className="flex items-center gap-3">
                   <Link href="/wishlist" className="relative">
                    <HeartIcon className="w-6 h-6 " />
                    <sup className="absolute top-[-5px] right-[-3px] bg-red-700 size-4 text-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">{wishlist?.length || 0}</span>
                    </sup>
                  </Link>

                  <Link href="/cart" className="relative">
                    <img src={Cart.src} alt="Cart icon" className="w-6 h-6" />
                    <sup className="absolute top-[-5px] right-[-3px] bg-red-700 size-4 rounded-full flex items-center justify-center">
                      <span className="text-xs">{cart?.length || 0}</span>
                    </sup>
                  </Link> 
       
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 px-4 py-2 text-lg text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50">
                    {isLoggingOut ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <LogOut size={16} />
                    )}
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
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