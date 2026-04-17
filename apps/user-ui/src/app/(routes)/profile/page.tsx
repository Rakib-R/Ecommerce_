'use client'

import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Bell, CheckCircle, Gift, Inbox, Loader2, Lock, LogOut, MapPin, Pencil, PhoneCall, Receipt, Settings, ShoppingBag, ShoppingCart, Truck, User } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, {  useEffect, useState } from "react";
import useUser from "src/app/hooks/useUser";
import StatCard from "src/app/shared/components/cards/stat-card";
import { useAuthState } from "src/app/store/authStore";
import axiosInstance from "src/app/utils/axios";
import Image from "next/image";
import QuickActionCard from "src/app/shared/components/cards/quick-action.card";
import { type LucideIcon } from 'lucide-react';
import ShippingAddressSection from "@user-ui/shared/components/ShippingAddressSection";

interface NavItemTypes{
  label : string;
  Icon  : LucideIcon;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}

const Page = () => {

    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const {user, isLoading} = useUser();
    const queryTab = searchParams.get('active') || 'Profile';
    const [activeTab, setActiveTab] = useState(queryTab)

    useEffect(() => {
    if (activeTab !== queryTab) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("active", activeTab);
        router.replace(`?${newParams.toString()}`, { scroll: false });
    }
    }, [activeTab]);

    const handleLogout = async () => {
      await axiosInstance.post(`/api/logout`);
      useAuthState.getState().logout();
      queryClient.setQueryData(['user'], null);
      router.push("/login");
  };

  console.log('USER -> ', user)
  return (
    <main className="bg-gray-50 p-6">
      <div className="md:max-w-8xl mx-auto">
        
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-center text-3xl font-bold">
            Welcome back,{" "}
            <span>
              {isLoading ? (
                <Loader2 className="inline animate-spin w-5 h-5" />
              ) : (
                `${user?.name || "User"}`
              )}
            </span> {" "}
          </h1> 
        </div>

     {/* Profile Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <StatCard title="Total Orders" count={120} Icon={ShoppingCart} />
            <StatCard title="Processing Orders" count={8} Icon={Truck} />
            <StatCard title="Completed Orders" count={5} Icon={CheckCircle} />
        </div>

        {/* Sidebar and Content Layout */}
      <main className="grid grid-flow-col grid-cols-10">
        
        {/* L   E  F  T N a v i g a ti  on */}
        <div className="col-span-2 bg-white p-4 rounded-md shadow-sm border border-gray-100">
            <nav className="space-y-2">
            
            <NavItem
                label="Profile"
                Icon={User}
                active={activeTab === "Profile"}
                onClick={() => setActiveTab("Profile")}
            /> 
            <NavItem
                label="My Orders"
                Icon={ShoppingBag}
                active={activeTab === "My Orders"}
                onClick={() => setActiveTab("My Orders")}
            />
            <NavItem
                label="Inbox"
                Icon={Inbox}
                active={activeTab === "Inbox"}
                onClick={() => setActiveTab("Inbox")}
                />
            <NavItem
                label="Notifications"
                Icon={Bell}
                active={activeTab === "Notifications"}
                onClick={() => setActiveTab("Notifications")}
                />

              <NavItem
                label="Shipping Address"
                Icon={MapPin}
                active={activeTab === "Shipping Address"}
                onClick={() => setActiveTab("Shipping Address")}
                />

              <NavItem
                label="Change Password"
                Icon={Lock}
                active={activeTab === "Change Password"}
                onClick={() => setActiveTab("Change Password")}
                />

              <NavItem
                label="Logout"
                Icon={LogOut}
                danger
                onClick={handleLogout}
                />
        </nav>
        </div>
 
            {/* M I D D L E M A I N C O N T E N T */}
        <section className="min-h-[50px] col-span-6 p-6 rounded-md shadow-sm border border-gray-100">

            {/* Sidebar */}
        <div className=" bg-white p-4 rounded-md shadow-sm border border-gray-100 md:w-1/4">
            <nav className="space-y-2">
            {/* your NavItems here */}
            </nav>

        </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {activeTab}
            </h2>

            {/* Profile Tab */}
            {activeTab === "Profile" && !isLoading && user ? (
            <div className="text-sm">
                <div className="flex flex-col gap-4">
                <aside className="flex flex-row">
                    <Image
                      src={user.avatar?.url || 'https://ik.imagekit.io/hasanRakib/Person/avater.webp?updatedAt=1775922329704'}
                      alt="profile_photo"
                      width={60}
                      height={60}
                      className="h-16 w-16 rounded-full border border-gray-200"
                  />
                  <button className="flex items-center gap-1 text-blue-500 text-xs font-medium">
                      <Pencil className="w-4 h-4"/> Change Photo
                  </button>
                </aside>
               <div className="flex flex-col gap-2">
                    <span>{user.name}</span>
                    <p>
                        <span className="font-semibold">Email:</span> {user.email}
                    </p>
                    <p>
                        <span className="font-semibold">Joined:</span>{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                    </p> 
                    <p>
                        <span className="font-semibold">Earned Points:</span>{" "}
                        {user.Points || 0}
                    </p>
                </div>
              </div>
            </div>
            ) : activeTab === 'Shipping Address' ? (
              <ShippingAddressSection />
            ) :  null}
         </section>

         {/* RIGHT QUICK PANEL */}
          <section className="bg-green-500 col-span-2 w-full space-y-4">
           
           <QuickActionCard Icon={Gift} title={"Referral Program"} description="Invite friends and get rewards" />
            
            <QuickActionCard
                Icon={Gift}
                title="Invite Program"
                description="Invite friends and earn rewards."
                />
            <QuickActionCard
            Icon={BadgeCheck}
            title="Your Badges"
            description="View your earned achievements."
            />

            <QuickActionCard
            Icon={Settings}
            title="Account Settings"
            description="Manage preferences and security."
            />

            <QuickActionCard
            Icon={Receipt}
            title="Billing History"
            description="Check your recent payments."
            />

            <QuickActionCard
            Icon={PhoneCall}
            title="Support Center"
            description="Need help? Contact support."
            />
          </section>
     
      </main>

     </div>
    </main>
  );
};

export default Page;


const NavItem = ({ label, Icon, active, danger, onClick }: NavItemTypes) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition
        ${
          active
            ? "bg-blue-100 text-blue-600"
            : danger
            ? "text-red-500 hover:bg-red-50"
            : "text-gray-700 hover:bg-gray-100"
        }`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};
