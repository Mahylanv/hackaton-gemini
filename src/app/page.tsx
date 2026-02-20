import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Briefcase, Calendar, ArrowRight, GraduationCap } from 'lucide-react'

export default async function Home() {
  return (
    <div className="relative flex-1 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-24 pb-16 text-center">
        <div className="flex justify-center mb-8 animate-in fade-in zoom-in duration-1000">
          <div className="relative h-20 w-20 p-2 bg-background rounded-3xl border-4 border-primary/20 shadow-2xl">
            <Image 
              src="/logo.png" 
              alt="MDS Logo" 
              fill 
              className="object-contain p-2"
              priority
            />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <GraduationCap className="h-3 w-3" /> Retrouvez les anciens de MyDigital School Paris !
        </div>
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          <span className="text-secondary">MYDIGIT</span>
          <span className="text-primary">ALUMNI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          Rejoignez l'élite des anciens étudiants. Accédez à des opportunités uniques, 
          retrouvez vos pairs et participez aux événements qui façonnent demain.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
          <Link href="/alumni">
            <Button size="lg" className="rounded-full px-8 font-bold h-12 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
              Explorer l'annuaire <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline" size="lg" className="rounded-full px-8 font-bold h-12 hover:bg-muted transition-all hover:-translate-y-1">
              Voir les offres
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto px-4 py-16 grid md:grid-cols-3 gap-8 max-w-6xl">
        <Link href="/alumni" className="group">
          <Card className="h-full border-2 transition-all duration-300 group-hover:border-primary group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="h-24 w-24" />
            </div>
            <CardHeader className="p-8">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl mb-2">Networking</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Retrouvez plus de 2 000 diplômés. Filtrez par promo, diplôme ou secteur pour booster vos opportunités.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/jobs" className="group">
          <Card className="h-full border-2 transition-all duration-300 group-hover:border-primary group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Briefcase className="h-24 w-24" />
            </div>
            <CardHeader className="p-8">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl mb-2">Talents Board</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Des offres exclusives postées par le secrétariat et nos partenaires. CDI, Freelance et Alternance.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/events" className="group">
          <Card className="h-full border-2 transition-all duration-300 group-hover:border-primary group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calendar className="h-24 w-24" />
            </div>
            <CardHeader className="p-8">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl mb-2">Événements</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Conférences, soirées gala et sessions de recrutement. Ne manquez aucun rendez-vous clé du réseau.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </section>
    </div>
  )
}
