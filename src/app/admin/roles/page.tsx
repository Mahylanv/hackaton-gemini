import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateRole } from '@/app/admin/actions'
import { redirect } from 'next/navigation'

export default async function RoleManagementPage() {
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

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('email')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des Rôles</h1>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs inscrits</CardTitle>
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
                  <tr key={profile.id} className="border-b">
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
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
