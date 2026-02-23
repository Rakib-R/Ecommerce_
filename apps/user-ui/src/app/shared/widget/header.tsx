
'use client'

import Link from "next/link";
import React from "react";
import { HeartIcon, Search} from "lucide-react"
import Cart from "../../../../assests/svgs/cart.png"
import ProfileIcon from "../../../../assests/svgs/profile-icon.svg"
import HeaderBottom from "./header-bottom";
import useUser from "../../hooks/useUser";

const Header = () => {

  const{ user, isLoading} = useUser();

  return (
    <>
    <main className="w-[1300px] mx-8 bg-white ">
      <div className="px-5 py-5 m-auto h-32 flex items-center justify-between bg-blue-500">
        <nav className="w-1/4">
          <Link href="/">
            <span className="text-2xl">Home</span>
          </Link>
        </nav>

        <section className="relative w-2/3">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]"/>
            <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] absolute top-0 right-0 border-[#3489FF] ">
              <Search color="white"/>
            </div>
        </section>
        
        <section className="flex items-center w-2/3 h-8">
          <aside className="flex gap-1 mx-4">

          <div className="flex items-center gap-2">
          {!isLoading && user ? (
            <>
              <div className="flex items-center">
                <Link href="/profile">
                  <img src={ProfileIcon.src} alt="ProfileIcon" className="w-6 h-6" />
                </Link>
              </div>
              
              <Link href="/profile">
                <span className="block font-medium">
                  Hello, <span className="font-semibold">{user.name?.spit(" ")[0]}</span>
                </span>
              </Link>
            </>
            ) : (
              <>
                <div className="flex items-center">
                  <Link href="/profile">
                    <img src={ProfileIcon.src} alt="ProfileIcon" className="w-6 h-6" />
                  </Link>
                </div>
                
                <Link href="/login">
                  <span className="block font-medium">
                    Hello, <span className="font-semibold">{isLoading ?  ' ...' : 'Sign In'}</span>
                  </span>
                </Link>
              </>
            )}
            </div>
        </aside>

          <aside className="flex items-center gap-4 w-1/2 h-4">
            <Link href={"/wishlist"} className="relative">
              <HeartIcon className="w-6 h-6"/>
              <sup className="bg-red-700 size-4 text-slate-100 rounded-full flex items-center justify-center absolute top-[-5px] right-[-3px]">
                <span className="text-red font-medium text-sm">0</span>
              </sup>
            </Link>
            <Link href={"/cart"} className="relative">
            <img src={Cart.src} alt="Cart icon" className="w-6 h-6" />
             <sup className="bg-red-700 size-4 text-slate-100 rounded-full flex items-center justify-center absolute top-[-5px] right-[-3px]">
                <span className="text-red font-medium text-sm">0</span>
              </sup>
            </Link>

        </aside>
      </section>
      </div>

      <div className="border-b border-b-[#99999938]" />
  </main>

  {/* //TODO MAKE ---- HEADERBOTTOM  --- IT SIBLING  */}
  <HeaderBottom />
</>
  );
};

export default Header;
