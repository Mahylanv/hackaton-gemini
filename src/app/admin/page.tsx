import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Briefcase, Settings, Calendar, ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react'
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

  const { count: alumniCount } = await supabase.from('alumni').select('*', { count: 'exact', head: true })
  const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
  const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group font-bold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour à l'accueil
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Administration</h1>
          </div>
          <p className="text-muted-foreground text-lg">Gérez le contenu et les accès de la plateforme MYDIGITALUMNI.</p>
        </header>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Alumni" value={alumniCount || 0} icon={<Users className="h-5 w-5" />} color="bg-blue-500" />
          <StatCard title="Jobs" value={jobsCount || 0} icon={<Briefcase className="h-5 w-5" />} color="bg-teal-500" />
          <StatCard title="Événements" value={eventsCount || 0} icon={<Calendar className="h-5 w-5" />} color="bg-orange-500" />
          <StatCard title="Mon Rôle" value={profile.role} icon={<Settings className="h-5 w-5" />} color="bg-purple-500" isText />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <ManagementCard 
            title="Gestion des Alumni" 
            description="Importez des listes Excel et enrichissez les profils via LinkedIn."
            href="/admin/alumni"
            icon={<Users className="h-6 w-6" />}
          />
          <ManagementCard 
            title="Offres d'emploi" 
            description="Publiez de nouvelles offres ou gérez les annonces existantes."
            href="/admin/jobs"
            icon={<Briefcase className="h-6 w-6" />}
          />
          <ManagementCard 
            title="Agenda Événements" 
            description="Organisez des meetups, conférences ou soirées alumni."
            href="/admin/events"
            icon={<Calendar className="h-6 w-6" />}
          />
          {profile.role === 'SUPER_ADMIN' && (
            <ManagementCard 
              title="Permissions & Rôles" 
              description="Nommez de nouveaux administrateurs ou gérez les comptes utilisateurs."
              href="/admin/roles"
              icon={<ShieldCheck className="h-6 w-6" />}
              variant="outline"
            />
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, isText = false }: any) {
  return (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-center justify-between pt-6 pb-2 space-y-0">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-black italic uppercase tracking-tighter ${isText ? 'text-xl truncate' : ''}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function ManagementCard({ title, description, href, icon, variant = "default" }: any) {
  return (
    <Link href={href} className="group">
      <Card className={`h-full transition-all duration-300 group-hover:border-primary border-2 ${variant === 'outline' ? 'border-dashed' : ''}`}>
        <CardHeader className="p-8 pb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
              {icon}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
