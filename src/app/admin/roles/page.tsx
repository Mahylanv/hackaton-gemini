import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { updateRole, deleteUser } from '@/app/admin/actions'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Trash2 } from 'lucide-react'

export default async function RoleManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUserProfile?.role !== 'SUPER_ADMIN') {
    redirect('/admin')
  }

  const params = await searchParams
  const query = params.query as string || ''

  let supabaseQuery = supabase
    .from('profiles')
    .select('*')
    .order('email')

  if (query) {
    supabaseQuery = supabaseQuery.or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
  }

  const { data: allProfiles } = await supabaseQuery

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold italic uppercase">Gestion des Rôles</h1>
        
        <Suspense fallback={<div className="w-full md:w-64 h-10 bg-muted animate-pulse rounded-md" />}>
          <SearchInput placeholder="Email, nom ou prénom..." />
        </Suspense>
      </div>

      <Card>
        <CardHeader className="pt-6">
          <CardTitle>Utilisateurs inscrits ({allProfiles?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Rôle actuel</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles?.map((profile) => (
                  <tr key={profile.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{profile.email}</td>
                    <td className="px-6 py-4">{profile.first_name} {profile.last_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        profile.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                        profile.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {profile.id !== user.id && (
                        <div className="flex gap-2">
                          <form action={updateRole.bind(null, profile.id, 'ADMIN')}>
                            <Button size="sm" variant="outline" disabled={profile.role === 'ADMIN'}>Admin</Button>
                          </form>
                          <form action={updateRole.bind(null, profile.id, 'USER')}>
                            <Button size="sm" variant="outline" disabled={profile.role === 'USER'}>User</Button>
                          </form>
                          <form action={deleteUser.bind(null, profile.id)}>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {allProfiles?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
