'use client'

import React, { useEffect } from 'react'
import useSidebar from '../../../hooks/useSidebar';
import { usePathname } from 'next/navigation';
import useSeller from '../../../hooks/useSeller';
import  Box from '../box/index';
import { Sidebar } from './sidebar.styles';
import Link from 'next/link';
import Logo from '../../../assets/logo.svg'
import Image from 'next/image';
import SidebarItem from './sidebar.item';
import { BellPlus, BellRing, CalendarPlus, CreditCard, Home, ListOrdered, LogOut, Mail, PackageSearch, Settings, SquarePlus, TicketPercent } from 'lucide-react';
import SidebarMenu from './sidebar.menu';
import axiosInstance from '../../../utils/axiosInstance';
import { useAuthState } from '../../../store/authStore';
import { queryClient } from 'apps/utils/queryClient';
import { useRouter } from 'next/navigation';

const SideBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();
  const router = useRouter();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const handleLogout = async () => {
    await axiosInstance.post('/api/logout');
    useAuthState.getState().logout();
    queryClient.setQueryData(['seller'], null);
    router.push("/seller-login");
  };

  const getIconColor = (route: string) => activeSidebar === route ? "#0085ff" : "#969696"
  return (
    <Box style={{
      height: "100vh",
      zIndex: 202,
      position: "sticky",
      top: 0,
      overflowY: "scroll",
      scrollbarWidth: 'none',
  }}
    className='sidebar-wrapper'>
  <Sidebar.Header>
  <Box>
    <Link href="/" className="flex gap-2">
      <Image width={40} height={40} src={Logo} alt='Logo'  sizes="(max-width: 512px) 100vw, 33vw"
          loading="lazy"/>
      <Box>
        <h3 className="text-xl text-green-600 --font-shadows-into-light font-medium">{seller?.shop?.name}</h3>
        <h5 className='font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]'>
          {seller?.shop?.address}
        </h5>
      </Box>
    </Link>
  </Box>
</Sidebar.Header>

  <main className="block my-2 h-full ">
  <Sidebar.Body className="body sidebar">
    <SidebarItem
      title="Dashboard"
      icon={<Home size={26} fill={getIconColor("/dashboard")}/>}
      isActive={activeSidebar === "/dashboard"}
      href='/dashboard'
      className="transition-all duration-2000 ring-1 ring-red-500 mt-4 p-1"
    /> 
  <section className="block py-1">
    <SidebarMenu title="Main Menu">
      <SidebarItem
        isActive={activeSidebar === "/orders"}
        title="Orders"
        href="/orders"
        icon={
          <ListOrdered
            size={26}
            color={getIconColor("/orders")}
          />
        }
      />
      <SidebarItem
          isActive={activeSidebar === "/payments"}
          title="Payments"
          href="/payments" icon={
            <CreditCard />
          }      
          />
    </SidebarMenu>
      
    <SidebarMenu title="Products">
        <SidebarItem
          isActive={activeSidebar === "/dashboard/create-product"}
          title="Create Product"
          href="/dashboard/create-product"
          className="transition-all duration-2000 ring-1 ring-red-500"
          icon={
            <SquarePlus
              color={getIconColor("/dashboard/create-product")}
            />
          }
        />
        <SidebarItem
          isActive={activeSidebar === "/dashboard/all-products"}
          title="All Products"
          href="/dashboard/all-products"
          className="transition-all duration-2000 ring-1 ring-red-500"
          icon={
            <PackageSearch
              color={getIconColor("/dashboard/all-products")}
            />
          }/>
      </SidebarMenu>
      <SidebarMenu title="Events">
          <SidebarItem
            isActive={activeSidebar === "/dashboard/create-event"}
            title="Create Event"
            href="/dashboard/create-event"
            icon={
              <CalendarPlus
                color={getIconColor("/dashboard/create-event")}
              />
            }
          />
           <SidebarItem
          isActive={activeSidebar === "/dashboard/all-events"}
          title="All Events"
          href="/dashboard/all-events"
          icon={
            <BellPlus
              size={24}
              color={getIconColor("/dashboard/all-events")}
            />
          }
        />
      </SidebarMenu>
       
      <SidebarMenu title="Controllers">
        <SidebarItem
            isActive={activeSidebar === "/dashboard/inbox"}
            title="Inbox"
            href="/dashboard/inbox"
            icon={
              <Mail color={getIconColor("/dashboard/inbox")}/>
            }
          />
        <SidebarItem
          isActive={activeSidebar === "/dashboard/settings"}
          title="Settings"
          href="/dashboard/settings"
          icon={
            <Settings
              size={22}
              color={getIconColor("/dashboard/settings")}
            />
          }
        />
      <SidebarItem
        isActive={activeSidebar === "/dashboard/notifications"}
        title="Notifications"
        href="/dashboard/notifications"
        icon={
          <BellRing
            size={22}
            color={getIconColor("/dashboard/notifications")}
          />
        }/>
      </SidebarMenu>
      <SidebarMenu title='Extras'>
        <SidebarItem
          isActive={activeSidebar === "/dashboard/discount-codes"}
          title="Discount Codes"
          href="/dashboard/discount-codes"
          className="transition-all duration-2000 ring-1 ring-red-500"
          icon={
            <TicketPercent
              size={22}
              color={getIconColor("/dashboard/discount-codes")}
            />
          }/>
        <SidebarItem
          isActive={activeSidebar === "/logout"}
          title="Logout"
          href="/seller-login"
          className="transition-all duration-2000 ring-1 ring-red-500"
          logOutFunc={handleLogout}
          icon={
            <LogOut
              size={22}
              color={getIconColor("/logout")}
            />
          }
        />
      </SidebarMenu>
    </section>
  </Sidebar.Body>
  </main>
</Box>

  )
}

export default SideBarWrapper