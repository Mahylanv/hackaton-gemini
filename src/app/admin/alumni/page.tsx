'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, ArrowLeft, Zap, Loader2, BarChart3, Users, Trash2, Search } from 'lucide-react'
import { importExcelData, startEnrichmentScan, getEnrichmentProgress, deleteAlumnus } from '../actions'
import { createClient } from '@/utils/supabase/client'
import { AlumniEditDialog } from '@/components/features/alumni/AlumniEditDialog'
import Link from 'next/link'

interface Alumnus {
  id: string
  first_name: string
  last_name: string
  linkedin_url: string
  avatar_url: string | null
  grad_year: number | null
  degree: string | null
  current_job_title: string | null
  current_company: string | null
  company_logo: string | null
  updated_at: string
}

export default function AdminAlumniPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string; message?: string } | null>(null)
  const [alumni, setAlumni] = useState<Alumnus[]>([])
  const [search, setSearch] = useState('')
  const [isLoadingAlumni, setIsLoadingAlumni] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  
  // Progress state
  const [progress, setProgress] = useState({ processed: 0, total: 0, percentage: 0 })

  const supabase = createClient()

  const fetchAlumni = useCallback(async () => {
    // Si on n'est pas authentifié, on ne tente même pas
    if (isAuthenticated !== true) {
      if (isAuthenticated === false) {
        setIsLoadingAlumni(false)
      }
      return
    }

    setIsLoadingAlumni(true)
    console.log("Fetching alumni with search:", search)
    try {
      let query = supabase.from('alumni').select('*').order('last_name', { ascending: true })
      
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,current_company.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) {
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          console.error("Auth error fetching alumni, redirecting to login...")
          setIsAuthenticated(false)
        } else {
          console.error("Supabase error fetching alumni:", error)
        }
      } else {
        console.log("Alumni data received:", data?.length, "rows")
        setAlumni((data as Alumnus[]) || [])
      }
    } catch (err) {
      console.error("Unexpected error fetching alumni:", err)
    } finally {
      setIsLoadingAlumni(false)
    }
  }, [search, supabase, isAuthenticated])

  useEffect(() => {
    // Vérifier l'auth initiale
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          setIsAuthenticated(false)
          setIsLoadingAlumni(false)
        } else {
          setIsAuthenticated(true)
        }
      } catch (err) {
        setIsAuthenticated(false)
        setIsLoadingAlumni(false)
      }
    }
    checkAuth()

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
      if (event === 'SIGNED_IN') fetchAlumni()
      if (event === 'SIGNED_OUT') setAlumni([])
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchAlumni])

  useEffect(() => {
    if (isAuthenticated === true) {
      fetchAlumni()
      
      // Souscription temps réel pour la liste des membres
      const channel = supabase
        .channel('alumni-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alumni' }, () => {
          console.log("Realtime update received!")
          fetchAlumni()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchAlumni, supabase, isAuthenticated])

  // Polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isScanning) {
      interval = setInterval(async () => {
        const data = await getEnrichmentProgress()
        setProgress(data)
        fetchAlumni() // Rafraîchir la liste en direct
        
        const remaining = data.total - data.processed
        if (remaining === 0) {
          if (data.total > 0 && data.processed === data.total) {
            setIsScanning(false)
            setResult({ success: true, message: "L'enrichissement de tous les profils est terminé !" })
            fetchAlumni()
          }
        }
      }, 2000)
    }

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning])

  const handleUpload = async (formData: FormData) => {
    setIsUploading(true)
    setResult(null)
    const res = await importExcelData(formData)
    setResult(res)
    setIsUploading(false)
    if (res.success) {
      // Déclencher automatiquement l'affichage du scan après l'import réussi
      setIsScanning(true)
      fetchAlumni()
    }
  }

  const handleStartScan = async () => {
    setIsScanning(true)
    setResult(null)
    const res = await startEnrichmentScan()
    if (res.success && res.stats) {
      setProgress(res.stats)
    }
    setResult(res)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet alumnus ?')) {
      await deleteAlumnus(id)
      fetchAlumni()
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link 
        href="/admin" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 group font-bold"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Retour au tableau de bord
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold italic uppercase">Gestion des Alumni</h1>
        {isScanning && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0077b5]/10 border border-[#0077b5]/20 rounded-full animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0077b5] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0077b5]"></span>
            </span>
            <span className="text-[#0077b5] text-xs font-black uppercase tracking-widest">Enrichissement Apify en cours</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Import Card */}
        <Card className="border-2 overflow-hidden hover:border-[#0077b5]/30 transition-all duration-300">
          <CardHeader className="pt-6">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 mb-4 shadow-sm border border-slate-200">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">1. Importation Excel</CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Importez massivement des noms avec les colonnes <strong>Prenom</strong>, <strong>Nom</strong> et <strong>Linkedin</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-8">
            <form action={handleUpload} className="space-y-6">
              <div className="relative group">
                <Input 
                  id="file" name="file" type="file" accept=".xlsx, .xls, .csv" required
                  className="h-32 cursor-pointer file:hidden text-transparent bg-slate-50/50 border-dashed border-2 border-slate-200 hover:border-[#0077b5] hover:bg-[#0077b5]/5 transition-all rounded-2xl"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 group-hover:text-[#0077b5] transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm font-bold uppercase tracking-tighter italic">Déposer le fichier Excel ici</span>
                </div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full h-14 text-lg font-black italic uppercase tracking-tighter shadow-xl bg-slate-900 hover:bg-slate-800">
                {isUploading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Importation...</> : "Lancer l'importation"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Enrichment Card */}
        <Card className="border-2 overflow-hidden bg-slate-50/30 border-slate-200 shadow-sm transition-all duration-300">
          <CardHeader className="pt-6">
            <div className="h-12 w-12 rounded-2xl bg-[#0077b5]/10 flex items-center justify-center text-[#0077b5] mb-4 shadow-sm border border-[#0077b5]/20">
              <Zap className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter text-[#0077b5]">2. Enrichissement LinkedIn</CardTitle>
            <CardDescription className="font-medium text-slate-600">
              Les profils sont enrichis <strong>automatiquement</strong> via l&apos;API Apify (Scraping Cloud sécurisé).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-8">
            {isScanning ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-black italic uppercase tracking-tighter text-[#0077b5] flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Apify traite les profils...
                  </span>
                  <span className="text-slate-500 font-mono font-bold px-2 py-1 bg-slate-100 rounded-lg">
                    {progress.processed} / {progress.total}
                  </span>
                </div>
                
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                  <div 
                    className="h-full bg-[#0077b5] transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,119,181,0.5)]"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {progress.percentage}% COMPLÉTÉ
                  </div>
                  <div className="text-[#0077b5] italic flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    SYNC EN TEMPS RÉEL
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm font-bold italic shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-slate-300" />
                <span>Prêt pour le prochain import. L&apos;enrichissement se lance automatiquement.</span>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-[#0077b5]/5 rounded-2xl border border-[#0077b5]/10 text-slate-600 text-[10px] italic font-semibold leading-relaxed">
              <strong className="text-[#0077b5] uppercase not-italic">Infrastructure Apify</strong> : Notre robot cloud récupère les postes, entreprises et logos LinkedIn sans risque de blocage local.
            </div>
          </CardContent>
        </Card>
      </div>

      {result && (
        <div className={`mt-8 p-6 rounded-3xl border-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${
          result.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {result.success ? <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" /> : <AlertCircle className="h-8 w-8 text-red-600 shrink-0" />}
          <div>
            <p className="font-black text-xl italic uppercase tracking-tighter leading-tight mb-1">{result.success ? "Opération réussie" : "Une erreur est survenue"}</p>
            <p className="font-bold opacity-90">{result.message || (result.success ? `${result.count} profils importés avec succès.` : result.error)}</p>
          </div>
        </div>
      )}

      {/* Alumni List Section */}
      <div className="mt-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Liste des membres</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-10 h-11 rounded-xl border-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-2 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Alumni</th>
                    <th className="px-6 py-4">Infos</th>
                    <th className="px-6 py-4">Poste actuel</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t">
                  {isLoadingAlumni ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" />
                      </td>
                    </tr>
                  ) : alumni.length > 0 ? (
                    alumni.map((person) => (
                      <tr key={person.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {person.avatar_url ? (
                                <img src={person.avatar_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs font-black bg-primary/10 text-primary">
                                  {person.first_name?.[0]}{person.last_name?.[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-foreground leading-none">{person.first_name} {person.last_name}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Promo {person.grad_year || '?'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-foreground line-clamp-1">{person.degree || 'Non spécifié'}</p>
                        </td>
                        <td className="px-6 py-4">
                          {person.current_company ? (
                            <div>
                              <p className="text-xs font-bold text-foreground">{person.current_job_title || 'Poste inconnu'}</p>
                              <p className="text-[10px] font-bold text-primary uppercase">{person.current_company}</p>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground uppercase italic">Non enrichi</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <AlumniEditDialog alumnus={person} />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 w-9 p-0"
                              onClick={() => handleDelete(person.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-bold italic">
                        Aucun membre trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
