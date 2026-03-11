'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  FileSpreadsheet, Upload, CheckCircle2, AlertCircle, ArrowLeft, Zap, Loader2, 
  BarChart3, Linkedin, Mail, Search, Filter, Briefcase, GraduationCap, Users 
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
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all')

  const fetchAlumni = useCallback(async () => {
    try {
      const data = await getAlumniList()
      setAlumni((data as unknown as AlumniProfile[]) || [])
    } catch (err) {
      console.error('Failed to fetch alumni:', err)
    }
  }, [])

  useEffect(() => { fetchAlumni() }, [fetchAlumni])

  // Polling logic
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
            setResult({ success: true, message: "Enrichissement terminé !" })
            fetchAlumni()
          }
        }
      }, 5000)
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

  // Filtered Data
  const filteredAlumni = useMemo(() => {
    return alumni.filter(p => {
      const matchesSearch = (p.first_name + ' ' + p.last_name + ' ' + p.current_company).toLowerCase().includes(searchTerm.toLowerCase());
      const isVerified = p.degree && p.degree !== 'Importé via Excel';
      
      if (filterStatus === 'verified') return matchesSearch && isVerified;
      if (filterStatus === 'pending') return matchesSearch && !isVerified;
      return matchesSearch;
    });
  }, [alumni, searchTerm, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    const total = alumni.length;
    const verified = alumni.filter(p => p.degree && p.degree !== 'Importé via Excel').length;
    const placed = alumni.filter(p => p.current_company).length;
    return { total, verified, placed };
  }, [alumni]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Link href="/alumni" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour à l&apos;annuaire
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">DASHBOARD ADMIN</h1>
            <p className="text-slate-500">Gérez l&apos;importation et l&apos;enrichissement des données.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Total</p>
                <p className="text-lg font-black text-slate-900">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="bg-green-50 p-2 rounded-lg text-green-600"><CheckCircle2 className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Vérifiés</p>
                <p className="text-lg font-black text-slate-900">{stats.verified}</p>
              </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="bg-amber-50 p-2 rounded-lg text-amber-600"><Briefcase className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">En poste</p>
                <p className="text-lg font-black text-slate-900">{stats.placed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
            <div className="h-1.5 bg-blue-600 w-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" /> Import Excel
              </CardTitle>
              <CardDescription>Mettez à jour la base avec un fichier .xlsx ou .csv</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleUpload} className="flex gap-3">
                <div className="relative flex-1">
                  <Input id="file" name="file" type="file" accept=".xlsx, .xls, .csv" required className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                  <div className="h-10 w-full border border-slate-200 bg-slate-50 rounded-lg flex items-center px-3 text-sm text-slate-500 hover:border-blue-400 transition-colors">
                    Choisir un fichier...
                  </div>
                </div>
                <Button type="submit" disabled={isUploading} className="bg-blue-600 hover:bg-blue-700 font-bold">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
            <div className="h-1.5 bg-amber-500 w-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-amber-500" /> Robot LinkedIn
              </CardTitle>
              <CardDescription>Récupération automatique des données manquantes</CardDescription>
            </CardHeader>
            <CardContent>
              {!isScanning ? (
                <Button onClick={handleStartScan} className="w-full bg-amber-500 hover:bg-amber-600 font-bold text-white shadow-md">
                  Lancer l&apos;enrichissement
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                    <span>Progression</span>
                    <span className="text-amber-600">{estimatedTime ? `~${estimatedTime}` : "..."}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${progress.percentage}%` }} />
                  </div>
                  <p className="text-xs text-center text-slate-400 italic">Traitement de {progress.processed} / {progress.total} profils...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {result && (
          <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 ${result.success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            {result.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="font-bold text-sm">{result.message || (result.success ? `${result.count} profils traités.` : result.error)}</span>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Filtrer par nom ou entreprise..." 
                className="pl-9 bg-white border-slate-200 focus-visible:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setFilterStatus('all')}
                className="text-xs font-bold"
              >
                Tout
              </Button>
              <Button 
                variant={filterStatus === 'verified' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setFilterStatus('verified')}
                className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100"
              >
                Vérifiés
              </Button>
              <Button 
                variant={filterStatus === 'pending' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setFilterStatus('pending')}
                className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100"
              >
                En attente
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-3">Alumni</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Poste & Entreprise</th>
                  <th className="px-6 py-3">Formation</th>
                  <th className="px-6 py-3 text-right">Lien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlumni.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-xs">{p.first_name?.[0]}</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{p.first_name} {p.last_name}</p>
                          <p className="text-[10px] text-slate-400">{p.email || 'Pas d\'email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {p.degree && p.degree !== 'Importé via Excel' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 text-[10px] font-bold uppercase border border-green-100">Vérifié</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase border border-slate-200">En attente</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {p.current_company ? (
                        <div className="flex items-center gap-2">
                          {p.company_logo && <img src={p.company_logo} className="h-5 w-5 object-contain rounded-sm" alt="" />}
                          <div>
                            <p className="text-xs font-bold text-slate-800">{p.current_company}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{p.current_job_title}</p>
                          </div>
                        </div>
                      ) : <span className="text-xs text-slate-300 italic">-</span>}
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-xs text-slate-600 truncate max-w-[200px]" title={p.degree || ''}>{p.degree || '-'}</p>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <a href={p.linkedin_url} target="_blank" className="text-blue-600 hover:text-blue-800"><Linkedin className="h-4 w-4 ml-auto" /></a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAlumni.length === 0 && (
              <div className="p-12 text-center text-slate-400 italic">Aucun profil ne correspond à vos filtres.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
