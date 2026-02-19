import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Briefcase, Settings } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
    redirect('/')
  }

  const { count: alumniCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord Administration</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alumni inscrits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alumniCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offres actives</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rôle actuel</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold uppercase text-orange-600">{profile.role}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href="/admin/jobs">
          <Button>Gérer les offres d'emploi</Button>
        </Link>
        {profile.role === 'SUPER_ADMIN' && (
          <Link href="/admin/roles">
            <Button variant="outline">Gérer les accès (Rôles)</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
