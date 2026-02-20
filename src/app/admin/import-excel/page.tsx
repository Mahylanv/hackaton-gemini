'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Zap, 
  Loader2, 
  BarChart3, 
  Linkedin, 
  Mail, 
  ExternalLink,
  RefreshCcw,
  User,
  Building2,
  GraduationCap,
  Calendar,
  CheckCircle,
  X
} from 'lucide-react'
import { importExcelData, startEnrichmentScan, getEnrichmentProgress, getAlumniList } from '../actions'
import Link from 'next/link'

interface AlumniProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  linkedin_url: string;
  grad_year: number | null;
  entry_year: number | null;
  degree: string | null;
  avatar_url: string | null;
  current_company: string | null;
  company_logo: string | null;
  current_job_title: string | null;
  updated_at: string;
}

export default function ImportExcelPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string; message?: string } | null>(null)
  const [alumni, setAlumni] = useState<AlumniProfile[]>([])
  const [progress, setProgress] = useState({ processed: 0, total: 0, percentage: 0 })
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null)

  const fetchAlumni = useCallback(async () => {
    try {
      const data = await getAlumniList()
      setAlumni((data as unknown as AlumniProfile[]) || [])
    } catch (err) {
      console.error('Failed to fetch alumni:', err)
    }
  }, [])

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isScanning) {
      interval = setInterval(async () => {
        const data = await getEnrichmentProgress()
        setProgress(data)
        const remaining = data.total - data.processed
        if (remaining > 0) {
          const seconds = remaining * 4 
          const mins = Math.floor(seconds / 60)
          const secs = seconds % 60
          setEstimatedTime(mins + ":" + secs.toString().padStart(2, '0'))
        } else {
          setEstimatedTime("0:00")
          if (data.total > 0 && data.processed === data.total) {
            setIsScanning(false)
            setResult({ success: true, message: "L'enrichissement de tous les profils est terminé !" })
            fetchAlumni()
          }
        }
      }, 5000) // Poll more frequently for testing
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isScanning, fetchAlumni])

  const handleUpload = async (formData: FormData) => {
    setIsUploading(true)
    setResult(null)
    const res = await importExcelData(formData)
    setResult(res)
    setIsUploading(false)
    fetchAlumni()
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

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-8">
          <Link href="/alumni" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l&apos;annuaire
          </Link>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Console d&apos;administration Alumni</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {/* Step 1: Import */}
          <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-blue-600 text-white pb-6">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6" />
                <CardTitle className="text-xl font-bold">1. Importation</CardTitle>
              </div>
              <CardDescription className="text-blue-100">Prénoms, Noms et LinkedIn</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={handleUpload} className="space-y-4">
                <div className="relative group border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center">
                  <Input 
                    id="file" name="file" type="file" accept=".xlsx, .xls, .csv" required
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <p className="text-sm font-medium text-slate-600">Cliquer ou glisser le fichier</p>
                </div>
                <Button type="submit" disabled={isUploading} className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-xl font-bold shadow-md transition-all">
                  {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Import...</> : "Lancer l'importation"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Step 2: Enrichment */}
          <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-amber-500 text-white pb-6">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6" />
                <CardTitle className="text-xl font-bold">2. Robot LinkedIn</CardTitle>
              </div>
              <CardDescription className="text-amber-50 text-balance">Photos, Diplômes et Postes</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!isScanning ? (
                <Button 
                  onClick={handleStartScan} 
                  disabled={isUploading}
                  className="w-full bg-amber-500 hover:bg-amber-600 h-11 rounded-xl font-bold shadow-md transition-all"
                >
                  Lancer l'enrichissement
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase text-amber-600">
                    <span>Scan : {progress.processed} / {progress.total}</span>
                    <span>{estimatedTime ? `Reste ~${estimatedTime}` : "Calcul..."}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${progress.percentage}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 italic text-center">Gardez l'onglet LinkedIn ouvert.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {result && (
          <div className={`max-w-4xl mx-auto mb-8 p-4 rounded-xl border-2 flex items-center gap-3 ${result.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            {result.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="font-bold text-sm">{result.message || (result.success ? `${result.count} profils importés.` : result.error)}</span>
          </div>
        )}

        {/* DATA TABLE VIEW */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 bg-slate-900 flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Aperçu complet des données ({alumni.length})</h2>
            <Button onClick={fetchAlumni} variant="ghost" className="text-white hover:bg-white/10 rounded-full h-9 w-9 p-0">
              <RefreshCcw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4">Profil</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Entreprise Actuelle</th>
                  <th className="px-6 py-4">Formation MyDigitalSchool</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alumni.map((profile) => {
                  const isVerified = profile.degree && profile.degree !== 'Importé via Excel' && profile.degree !== 'Parcours non trouvé';
                  const isNotFound = profile.degree === 'Parcours non trouvé';

                  return (
                    <tr key={profile.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {profile.avatar_url ? (
                              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-sm">
                                {profile.first_name?.[0]}{profile.last_name?.[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm uppercase">{profile.first_name} {profile.last_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{profile.email || 'Email non fourni'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-tighter border border-green-100">
                            <CheckCircle className="h-2.5 w-2.5" /> Vérifié
                          </span>
                        ) : isNotFound ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-tighter border border-slate-200">
                            <X className="h-2.5 w-2.5" /> Inconnu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-tighter border border-blue-100">
                            <Loader2 className="h-2.5 w-2.5 animate-spin" /> En attente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {profile.current_company ? (
                          <div className="flex items-center gap-2">
                            {profile.company_logo && (
                              <img src={profile.company_logo} alt="" className="h-6 w-6 rounded shadow-sm border border-slate-100 bg-white object-contain" />
                            )}
                            <div className="max-w-[180px]">
                              <p className="text-xs font-bold text-slate-800 truncate uppercase">{profile.current_company}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1 italic">{profile.current_job_title}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 italic">Non scanné</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 max-w-[200px]">
                          <GraduationCap className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                          <p className="text-xs font-semibold text-slate-600 leading-tight">{profile.degree || '...'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-xs font-bold font-mono">{profile.entry_year || '??'} - {profile.grad_year || '??'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a 
                            href={profile.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {alumni.length === 0 && (
              <div className="p-20 text-center text-slate-300 italic font-medium">
                Aucune donnée à afficher. Commencez par importer un fichier Excel.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
