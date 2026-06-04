'use client';

import { AlignLeft, ChevronDown, HeartIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { navItems } from '../../configs/constants';
import Image from 'next/image';
import Cart from "../../../../assests/svgs/cart.png"
import useUser from "../../hooks/useUser"
import { useAuthState, useStore } from '../../store/authStore';
import ProfileIcon from "../../../../assests/svgs/profile-icon.svg";
import { useRouter } from 'next/navigation';

import { authClient } from '../../configs/auth-client';

import toast from 'react-hot-toast';
import { LogOut, Loader2 } from "lucide-react";


interface HeaderBottomProps {
  topHeaderHeight?: number;
}

const HeaderBottom = ({ topHeaderHeight = 0 }: HeaderBottomProps) => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoading} = useUser();
  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const router = useRouter();

  const handleLogout = async () => {
      setIsLoggingOut(true);
    try {
      
      await authClient.signOut();

      toast.success("Logged out successfully", {
        style: { background: "#18181b", color: "#fff", borderRadius: "12px" },
      });
      router.replace("/login");
      router.refresh();

    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Failed to log out cleanly.");
    } finally {
      setIsLoggingOut(false);
    }
    useAuthState.getState().handleLogout();

    router.push("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
 
      if (window.scrollY > topHeaderHeight) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [topHeaderHeight]);

  return (
    <>
      {/* Spacer that appears when sticky to prevent content jump */}
      {isSticky && <div style={{ height: '80px' }} />}
      
      <header
        className={`
          w-full transition-all duration-300
          ${isSticky 
            ? 'fixed top-0 left-0 z-[200] bg-white/90 text-black backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-top-4' 
            : 'relative bg-black/85 text-white shadow-[0_2px_4px_-2px_rgba(255,255,255,0.3)] z-[50]'
          }
        `}>
        <div className="w-[1350px] mx-auto">
          <menu className={`grid grid-flow-col grid-cols-12 gap-8 transition-all duration-300 ${
            isSticky ? "py-3" : "py-4"
          }`}>

            {/* FIRST CHILD */} {/* All Departments Dropdown */}
            <section 
              aria-label="department_navigation"
              className="col-span-2 h-[50px] flex items-center cursor-pointer relative"
              onClick={() => setShow(!show)}>

              <div className="flex items-center gap-2 mx-2">
                <AlignLeft color={`${isSticky ? 'black' : 'white'}` } />
                <span className="font-medium">All Departments</span>
              </div>
              <ChevronDown 
                color={`${isSticky ? 'black' : 'white'}` }
                className={`transition-transform duration-300 ${show ? "rotate-180" : ""}`} 
              />
              
              {show && (
                <div className={`${isSticky ? 'text-black bg-[#f6f5f5]' : 'text-white bg-[#262626]'} absolute w-[110%] h-[400px] left-0 top-full mt-[13.5px] border-2 border-white shadow-xl z-[110]`}>
                  <ul className="relative p-4">
                    <li className="absolute w-[88%] left-8 top-8 py-2 hover:text-blue-500 cursor-pointer border-b">Category 1</li>
                    <li className="absolute w-[88%] left-8 top-20 py-2 hover:text-blue-500 cursor-pointer border-b">Category 2</li>
                    <li className="absolute w-[88%] left-8 top-32 py-2 hover:text-blue-500 cursor-pointer border-b">Category 3</li>
                  </ul>
                  <select name="" id="">
                    <option value=""></option>
                    <option value=""></option>
                    <option value=""></option>
                  </select>
                </div>
              )}
            </section>
           
           {/* Middle NAv CHILD */} {/* Navigation Links */} 
            <nav aria-label="nav" className="col-start-3 col-span-6 flex items-center justify-start ">
              {navItems.map((i: any, index: number) => (
                <Link
                  key={index}
                  href={i.href}
                  className="px-5 font-medium text-lg hover:text-blue-200 transition-colors">
                  {i.title}
                </Link>
              ))}
            </nav>

            {/* Right Side T H I R D CHILD - Only show when sticky */}
            <section className="col-span-4 flex justify-center items-center gap-4">
              {isSticky && (
                <>
                 {/* IT WILL STAY HERE REGARDLESS USER EXISTS OR NOT */}
                 <div className={`${user && ''} `}>
                  {!isLoading && user && (
                    <Link href="/profile" className="flex items-center gap-2">
                    <Image src={ProfileIcon.src} alt="Profile" width={20} height={20} className="brightness-0"  sizes="(max-width: 512px) 100vw, 33vw"
                      loading="lazy"/>
                    <p className="font-medium text-black">
                      <span className='text-md'>Hello,{' '}</span>
                      <span className="font-adamina text-xl font-serif">{user.name?.split(" ")[0]}</span>
                    </p>
                      </Link>)}
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
                </>
              )}
            </section>
          </menu>
        </div>
      </header>
    </>
  );
};

export default HeaderBottom;