'use client';

import { AlignLeft, ChevronDown, HeartIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { navItems } from '../../configs/constants';
import Cart from "../../../../assests/svgs/cart.png"
import useUser from "apps/user-ui/src/app/hooks/useUser"

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const{ user, isLoading} = useUser();


  useEffect(() => {
    const initialPos = containerRef.current?.offsetTop || 0;

    const handleScroll = () => {
      if (window.scrollY > initialPos) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    /*
       When the child becomes 'fixed', this div prevents the content below from jumping up.  */
    <div ref={containerRef} className={`relative w-full h-[80px] ${isFixed ? "shadow-md" : '' }` }>
      <main
        className={`w-[1300px] mx-8 z-[100] transition-all duration-300 ${
            isFixed 
            ? "fixed top-0 left-0 shadow-lg bg-blue-500 animate-in fade-in slide-in-from-top-4" 
            : "relative bg-blue-500"
        }`}
      >
        {/*  THE MARGIN/WIDTH CONTAINER: This mirrors the 'mx-8'  */}
          <menu 
            className={`relative flex items-center justify-between transition-all duration-300 ${
              isFixed ? "py-3" : "py-4"
            }`}
          >
            {/* ALL DROPDOWNS SECTION */}
            <nav aria-label="department_navigation"
                className="w-1/7 h-[50px] flex items-center justify-between cursor-pointer text-white bg-blue-500 rounded-sm"
                onClick={() => setShow(!show)}
              >
                <div className="flex items-center gap-2 mx-4">
                  <AlignLeft color="white" />
                  <span className=" font-medium">All Departments</span>
                </div>
                <ChevronDown 
                  color="white" 
                  className={`transition-transform duration-300 ${show ? "rotate-180" : ""}`} 
                />
              {/* Dropdown menu: */}

              {show && (
              <div className="absolute left-0 top-full mt-1 w-[260px] h-[400px] bg-[#f5f5f5] shadow-xl z-[110] 
              border-t-2 border-blue-500">
                  <ul className="p-4 text-gray-700">
                  <li className="py-2 hover:text-blue-500 cursor-pointer border-b">Category 1</li>
                  <li className="py-2 hover:text-blue-500 cursor-pointer border-b">Category 2</li>
                  <li className="py-2 hover:text-blue-500 cursor-pointer">Category 3</li>
              </ul>
              </div>
            )}
            </nav>
           
            {/* NAVIGATION LINKS */}
            <section aria-label="nav" className="flex items-center">
                {navItems.map((i: any, index: number) => (
                <Link
                    key={index}
                    href={i.href}
                    className="px-5 font-medium text-lg text-white hover:text-blue-200 transition-colors"
                >
                    {i.title}
                </Link>
                ))}
            </section>

          {/* FLEX GROW SPACE */}
          <aside className="flex items-center gap-4 w-[36vw]">
          {isFixed && (
            <> 
              {isLoading || !user ? (
                /* GUEST / LOADING STATE */
                <>
                  <Link href="/login">
                    <span className="block font-medium">
                      Hello, <span className="font-semibold">Sign In</span>
                    </span>
                  </Link>

                  <Link href={"/wishlist"} className="relative">
                    <HeartIcon className="w-6 h-6" />
                    <sup className="absolute top-[-5px] right-[-3px] bg-red-700 size-4 text-slate-100 rounded-full flex items-center justify-center ">
                      <span className="text-red font-medium text-sm">0</span>
                    </sup>
                  </Link>

                  <Link href={"/cart"} className="relative">
                    <img src={Cart.src} alt="Cart icon" className="w-6 h-6" />
                    <sup className="absolute top-[-5px] right-[-3px] bg-red-700 size-4 text-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-red font-medium text-sm">0</span>
                    </sup>
                  </Link>
                </>
              ) : (
                /* LOGGED IN STATE */
                <>
                  <Link href="/login">
                    <span className="block font-medium">
                      Hello, <span className="font-semibold">{user.name?.split(" ")[0]}</span>
                    </span>
                  </Link>

                  <Link href={"/wishlist"} className="relative">
                    <HeartIcon className="w-6 h-6" />
                    <sup className="absolute top-[-5px] right-[-3px] bg-red-700 size-4 text-slate-100 rounded-full flex items-center justify-center ">
                      <span className="text-red font-medium text-sm">0</span>
                    </sup>
                  </Link>

                  <Link href={"/cart"} className="relative">
                    <img src={Cart.src} alt="Cart icon" className="w-6 h-6" />
                    <sup className="absolute top-[-5px] right-[-3px] bg-red-700 size-4 text-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-red font-medium text-sm">0</span>
                    </sup>
                  </Link>
                </>
              )}
            </> 
          )}
            </aside>
          </menu>
      </main>
    </div>
  );
};

export default HeaderBottom;