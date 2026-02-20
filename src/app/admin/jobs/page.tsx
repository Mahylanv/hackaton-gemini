import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { deleteJob } from '@/app/admin/actions'
import { JobCreationForm } from '@/components/features/jobs/JobCreationForm'
import { JobEditDialog } from '@/components/features/jobs/JobEditDialog'
import { redirect } from 'next/navigation'

export default async function AdminJobsPage() {
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

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 italic uppercase">Gestion des Offres</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="sticky top-8">
            <CardHeader className="pt-6">
              <CardTitle>Publier une offre</CardTitle>
            </CardHeader>
            <CardContent>
              <JobCreationForm />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pt-6">
              <CardTitle>Offres en ligne ({jobs?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs?.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h3 className="font-bold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company} • {job.type} • {job.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <JobEditDialog job={job} />
                      <form action={deleteJob.bind(null, job.id)}>
                        <Button variant="destructive" size="sm">Supprimer</Button>
                      </form>
                    </div>
                  </div>
                ))}
                {jobs?.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune offre publiée pour le moment.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
