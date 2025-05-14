import React from 'react';
import { Link, useLocation } from 'wouter';
import { useDispatch } from 'react-redux';
import { uiActions } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Focus } from 'lucide-react';

export function Header() {
  const [location, navigate] = useLocation();
  const dispatch = useDispatch();

  return (
    <header className="bg-white border-b border-neutral-300 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="font-bold text-xl text-primary flex items-center">
              <Focus className="mr-2" />
              DroneOps
            </a>
          </Link>
          
          <nav className="ml-10 hidden md:flex">
            <Link href="/">
              <a className={`px-3 py-2 ${location === '/' ? 'text-primary' : 'text-neutral-600 hover:text-primary'} transition`}>
                Dashboard
              </a>
            </Link>
            <Link href="/missions">
              <a className={`px-3 py-2 ${location.includes('/missions') ? 'text-primary' : 'text-neutral-600 hover:text-primary'} transition`}>
                Missions
              </a>
            </Link>
            <Link href="/fleet">
              <a className={`px-3 py-2 ${location === '/fleet' ? 'text-primary' : 'text-neutral-600 hover:text-primary'} transition`}>
                Fleet
              </a>
            </Link>
            <Link href="/analytics">
              <a className={`px-3 py-2 ${location === '/analytics' ? 'text-primary' : 'text-neutral-600 hover:text-primary'} transition`}>
                Analytics
              </a>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center text-sm px-3 py-2">
                <span className="mr-2">Acme Corporation</span>
                <i className="fas fa-angle-down"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Organization</DropdownMenuLabel>
              <DropdownMenuItem>Switch Organization</DropdownMenuItem>
              <DropdownMenuItem>Organization Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center text-sm px-3 py-2 ml-4">
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=32&h=32" alt="User profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="ml-0 mr-2 hidden sm:inline">John Doe</span>
                <i className="fas fa-angle-down"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Your Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
