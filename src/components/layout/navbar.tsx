import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary italic uppercase">
          Alumni MDS
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/alumni" className="text-sm font-medium hover:text-primary transition-colors">
            Annuaire
          </Link>
          <Link href="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
            Offres d'emploi
          </Link>
          <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
            Événements
          </Link>
          {user ? (
            <>
              <Link href="/admin" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
                Administration
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="sm">
                  Déconnexion
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="outline">Admin Access</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
