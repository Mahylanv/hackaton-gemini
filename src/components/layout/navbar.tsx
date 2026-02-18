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
          {user && (
            <Link href="/alumni" className="text-sm font-medium hover:text-primary transition-colors">
              Annuaire
            </Link>
          )}
          {user ? (
            <>
              <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                Mon Profil
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="sm">
                  Déconnexion
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Connexion</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
