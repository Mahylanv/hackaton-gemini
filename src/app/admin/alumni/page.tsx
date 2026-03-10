'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, ArrowLeft, Zap, Loader2, BarChart3, Users, Trash2, Search } from 'lucide-react'
import { importExcelData, startEnrichmentScan, getEnrichmentProgress, deleteAlumnus } from '../actions'
import { createClient } from '@/utils/supabase/client'
import { AlumniEditDialog } from '@/components/features/alumni/AlumniEditDialog'
import Link from 'next/link'

export default function AdminAlumniPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string; message?: string } | null>(null)
  const [alumni, setAlumni] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isLoadingAlumni, setIsLoadingAlumni] = useState(true)
  
  // Progress state
  const [progress, setProgress] = useState({ processed: 0, total: 0, percentage: 0 })
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null)

  const supabase = createClient()

  async function fetchAlumni() {
    setIsLoadingAlumni(true)
    let query = supabase.from('alumni').select('*').order('last_name', { ascending: true })
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,current_company.ilike.%${search}%`)
    }

    const { data } = await query
    setAlumni(data || [])
    setIsLoadingAlumni(false)
  }

  useEffect(() => {
    fetchAlumni()
  }, [search])

  // Polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isScanning) {
      interval = setInterval(async () => {
        const data = await getEnrichmentProgress()
        setProgress(data)
        
        const remaining = data.total - data.processed
        if (remaining > 0) {
          const seconds = remaining * 6
          const mins = Math.floor(seconds / 60)
          const secs = seconds % 60
          setEstimatedTime(`${mins}:${secs.toString().padStart(2, '0')}`)
        } else {
          setEstimatedTime("0:00")
          if (data.total > 0 && data.processed === data.total) {
            setIsScanning(false)
            setResult({ success: true, message: "L'enrichissement de tous les profils est terminé !" })
            fetchAlumni()
          }
        }
      }, 2000)
    }

    return () => clearInterval(interval)
  }, [isScanning])

  const handleUpload = async (formData: FormData) => {
    setIsUploading(true)
    setResult(null)
    const res = await importExcelData(formData)
    setResult(res)
    setIsUploading(false)
    if (res.success) fetchAlumni()
  }

  const handleStartScan = async () => {
    setIsScanning(true)
    setResult(null)
    const res = await startEnrichmentScan()
    if (res.success) {
      const data = await getEnrichmentProgress()
      setProgress(data)
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

      <h1 className="text-3xl font-bold mb-8 italic uppercase">Gestion des Alumni</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Import Card */}
        <Card className="border-2 overflow-hidden">
          <CardHeader className="pt-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">1. Importation Excel</CardTitle>
            <CardDescription className="font-medium">
              Importez massivement des noms avec les colonnes <strong>Prenom</strong>, <strong>Nom</strong> et <strong>Linkedin</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-8">
            <form action={handleUpload} className="space-y-6">
              <div className="relative group">
                <Input 
                  id="file" name="file" type="file" accept=".xlsx, .xls, .csv" required
                  className="h-32 cursor-pointer file:hidden text-transparent bg-muted/30 border-dashed border-2 border-border hover:border-primary hover:bg-primary/5 transition-all rounded-2xl"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm font-bold uppercase tracking-tighter italic">Cliquer ou glisser le fichier</span>
                </div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full h-14 text-lg font-black italic uppercase tracking-tighter shadow-xl">
                {isUploading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Importation...</> : "Lancer l'importation"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Enrichment Card */}
        <Card className="border-2 overflow-hidden">
          <CardHeader className="pt-6">
            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">2. Robot d'enrichissement</CardTitle>
            <CardDescription className="font-medium">
              Scraping LinkedIn pour récupérer les <strong>photos</strong>, <strong>diplômes</strong> et <strong>postes actuels</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-8">
            {!isScanning ? (
              <Button 
                onClick={handleStartScan} 
                disabled={isUploading}
                variant="outline"
                className="w-full h-14 text-lg font-black italic uppercase tracking-tighter border-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
              >
                Lancer le scan automatique
              </Button>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-black italic uppercase tracking-tighter text-orange-600 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scan en cours...
                  </span>
                  <span className="text-muted-foreground font-mono font-bold">
                    {progress.processed} / {progress.total} profils
                  </span>
                </div>
                
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden border-2 border-border shadow-inner">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-1000 ease-out"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {progress.percentage}% complété
                  </div>
                  <div className="text-orange-600 italic">
                    Temps restant : {estimatedTime || "--:--"}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-800 text-xs italic font-semibold leading-relaxed">
              <strong>Note</strong> : Le robot utilise Playwright pour simuler un humain. Connectez-vous à LinkedIn si la fenêtre vous le demande.
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
