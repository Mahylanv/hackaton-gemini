import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { cache } from 'react'
import { Menu, GraduationCap, Briefcase, Calendar, ShieldCheck, LogOut } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const getCachedUser = cache(async () => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (e) {
    return null
  }
})

export default async function Navbar() {
  const user = await getCachedUser()

  const navLinks = [
    { href: '/alumni', label: 'Annuaire', icon: <GraduationCap className="h-4 w-4" /> },
    { href: '/jobs', label: 'Jobs', icon: <Briefcase className="h-4 w-4" /> },
    { href: '/events', label: 'Événements', icon: <Calendar className="h-4 w-4" /> },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link 
          href="/" 
          className="group flex items-center gap-3 shrink-0"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-lg">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain transition-transform group-hover:scale-110"
              priority
            />
          </div>
          <span className="text-xl font-black italic uppercase tracking-tighter transition-opacity group-hover:opacity-80">
            <span className="text-secondary">MYDIGIT</span>
            <span className="text-primary">ALUMNI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              prefetch={true} 
              className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href="/admin" 
                prefetch={true} 
                className="text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="h-3 w-3" /> Admin Panel
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="sm" className="font-bold hover:bg-destructive/10 hover:text-destructive transition-all">
                  Déconnexion
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login" prefetch={true}>
              <Button size="sm" className="rounded-full px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                Admin Access
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu (Burger) */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="text-primary border-2 bg-background hover:bg-muted transition-all shadow-sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-pro-max">
              <SheetHeader className="text-left mb-8">
                <SheetTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8">
                      <Image 
                        src="/logo.png" 
                        alt="Logo" 
                        fill 
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xl font-black italic uppercase tracking-tighter">
                      <span className="text-secondary">MYDIGIT</span>
                      <span className="text-primary">ALUMNI</span>
                    </span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex flex-col gap-6 pl-2">
                <div className="flex flex-col gap-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 pl-2">Navigation</p>
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className="flex items-center gap-4 text-lg font-bold text-secondary hover:text-primary transition-colors p-2 pl-4 rounded-xl hover:bg-primary/5"
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {link.icon}
                      </div>
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-border w-full my-2" />

                <div className="flex flex-col gap-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 pl-2">Compte</p>
                  {user ? (
                    <>
                      <Link 
                        href="/admin" 
                        className="flex items-center gap-4 text-lg font-bold text-orange-600 hover:text-orange-700 transition-colors p-2 pl-4 rounded-xl hover:bg-orange-50"
                      >
                        <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        Administration
                      </Link>
                      <form action={signOut} className="w-full pt-2 flex justify-start pl-2">
                        <Button variant="outline" className="w-auto px-6 font-bold justify-center gap-3 h-11 rounded-xl border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm">
                          <LogOut className="h-4 w-4" /> Déconnexion
                        </Button>
                      </form>
                    </>
                  ) : (
                    <Link href="/login" className="w-full">
                      <Button className="w-full font-black uppercase italic tracking-tighter h-12 rounded-xl shadow-lg shadow-primary/20">
                        Admin Access
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
