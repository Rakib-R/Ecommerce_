
import Link from "next/link";
import React from "react";
import { Search} from "lucide-react"


const Header = () => {
  return (
    <main className="bg-white mx-8">
      <div className="py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            <span className="text-2xl">Home</span>
          </Link>
        </div>
      <div className="relative">
        <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]"
        />
            <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] absolute top-0 right-0 border-[#3489FF] ">
                <Search color="white"/>
            </div>
             <div className="items-center">
              <Link href="/profile">
                <ProfileIcon />
              </Link>
            </div>
        </div>
    </div>
</main>

  );
};

export default Header;
