'use client';

import { AlignLeft, ChevronDown, HeartIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { navItems } from '../../configs/constants';
import Image from 'next/image';
import Cart from "../../../../assests/svgs/cart.png"
import useUser from "@apps/user-ui/src/app/hooks/useUser"
import { useAuthState, useStore } from '../../store/authStore';
import ProfileIcon from "../../../../assests/svgs/profile-icon.svg";
import { queryClient } from '@apps/utils/queryClient';
import { useRouter } from 'next/navigation';
import axiosInstance from 'src/app/utils/axios';

interface HeaderBottomProps {
  topHeaderHeight?: number;
}

const HeaderBottom = ({ topHeaderHeight = 0 }: HeaderBottomProps) => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoading} = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  
  const router = useRouter();

  const handleLogout = async () => {
    await axiosInstance.post("/api/logout");
    useAuthState.getState().logout();
    queryClient.setQueryData(['user'], null);
    router.push("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      // Check if we've scrolled past the top header
      if (window.scrollY > topHeaderHeight) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [topHeaderHeight]);

  console.log('user' , user)

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
        `}
      >
        <div className="w-[1350px] mx-auto">
          <menu className={`flex items-center gap-8 transition-all duration-300 ${
            isSticky ? "py-3" : "py-4"
          }`}>
            {/* All Departments Dropdown */}
            <section 
              aria-label="department_navigation"
              className="w-1/6 h-[50px] flex items-center cursor-pointer relative"
              onClick={() => setShow(!show)}
            >
              <div className="flex items-center gap-2 mx-4">
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
                </div>
              )}
            </section>
           
            {/* Navigation Links */}
            <nav aria-label="nav" className="flex items-center justify-start w-1/2">
              {navItems.map((i: any, index: number) => (
                <Link
                  key={index}
                  href={i.href}
                  className="px-5 font-medium text-lg hover:text-blue-200 transition-colors">
                  {i.title}
                </Link>
              ))}
            </nav>

            {/* Right Side Icons - Only show when sticky */}
            <aside className="flex items-center ml-[1.2rem] gap-4 w-[340px]">
              {isSticky && (
                <>
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
                  <Link href="/login" className="flex items-center gap-1 underline">
                    {/* <img src="/logOut.svg" alt="Profile" className="w-6 h-6 ml-2" 
                    style={{ filter: 'invert(21%) sepia(99%) saturate(7479%) hue-rotate(360deg) brightness(92%) contrast(116%)' }}/> */}
                    <span className="text-md text-lg"
                      onClick={handleLogout}>{isLoading ? '...' : 'Log Out'}</span>
                  </Link>
                ) : (
                  <Link href="/login" className="flex items-center gap-1">
                    <span className="font-medium text-black">
                      <span className="text-lg text-cyan-600 font-medium">{isLoading ? '...' : 'Sign In'}</span>
                    </span>
                  </Link>
                )}
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
                </aside>
                </>
              )}
            </aside>
          </menu>
        </div>
      </header>
    </>
  );
};

export default HeaderBottom;