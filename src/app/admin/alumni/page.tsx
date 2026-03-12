'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  Trash2, 
  Search,
  Users,
  Briefcase,
  Settings2,
  RefreshCcw,
  UserPlus,
  FileText,
  ChevronRight,
  Database
} from 'lucide-react'
import { importExcelData, startEnrichmentScan, getEnrichmentProgress, deleteAlumnus } from '../actions'
import { createClient } from '@/utils/supabase/client'
import { AlumniEditDialog } from '@/components/features/alumni/AlumniEditDialog'
import { DeleteAlumniDialog } from '@/components/features/alumni/DeleteAlumniDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string; message?: string } | null>(null)
  const [alumni, setAlumni] = useState<Alumnus[]>([])
  const [search, setSearch] = useState('')
  const [isLoadingAlumni, setIsLoadingAlumni] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [progress, setProgress] = useState({ processed: 0, total: 0, percentage: 0 })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const fetchAlumni = useCallback(async () => {
    if (isAuthenticated !== true) return
    setIsLoadingAlumni(true)
    try {
      let query = supabase.from('alumni').select('*').order('last_name', { ascending: true })
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,current_company.ilike.%${search}%`)
      }
      const { data } = await query
      setAlumni((data as Alumnus[]) || [])
    } finally {
      setIsLoadingAlumni(false)
    }
  }, [search, supabase, isAuthenticated])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [supabase])

  useEffect(() => {
    if (isAuthenticated === true) {
      fetchAlumni()
      const channel = supabase
        .channel('alumni-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alumni' }, () => {
          fetchAlumni()
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [fetchAlumni, isAuthenticated, supabase])

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      setShowProgressModal(true)
      interval = setInterval(async () => {
        const data = await getEnrichmentProgress()
        setProgress(data)
        if (data.total > 0 && data.processed >= data.total) {
          setIsScanning(false)
          fetchAlumni()
        }
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isScanning, fetchAlumni])

  const handleStartScan = async () => {
    setIsScanning(true)
    setResult(null)
    await startEnrichmentScan()
  }

  const handleUpload = async (formData: FormData) => {
    setIsUploading(true)
    setResult(null)
    const res = await importExcelData(formData)
    
    if (res.success) {
      setResult({
        success: true,
        message: `EXTRACTION RÉUSSIE : ${res.count} alumni ont été ajoutés à la base de données.`
      })
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      setResult({
        success: false,
        error: res.error || "Une erreur est survenue lors de l'importation."
      })
    }
    
    setIsUploading(false)
    fetchAlumni()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer définitivement cet alumnus ?')) {
      await deleteAlumnus(id)
      fetchAlumni()
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setResult(null) // Clear previous result when selecting new file
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div className="space-y-4">
            <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-all font-bold text-[10px] uppercase tracking-[0.25em] group">
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" /> Retour Dashboard
            </Link>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter text-secondary flex items-center gap-5">
              <Database className="h-12 w-12 text-primary" />
              Alumni <span className="text-primary">Database</span>
            </h1>
            <p className="text-muted-foreground font-medium text-xl max-w-xl">Gérez l'importation et l'enrichissement automatique des données diplômés.</p>
          </div>
          
          <div className="bg-card border-2 border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-6 min-w-[220px]">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Alumni</span>
              <span className="text-4xl font-black italic text-secondary leading-none mt-1">{alumni.length}</span>
            </div>
          </div>
        </div>

        {/* Action Cards Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          
          {/* Card 1: Import */}
          <Card className="border-2 border-border shadow-2xl rounded-[3rem] overflow-hidden bg-card transition-all hover:shadow-primary/5">
            <CardHeader className="p-10 border-b border-border bg-muted/30">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-secondary shadow-sm border border-border">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black italic uppercase tracking-tight">1. Importation</CardTitle>
                  <CardDescription className="font-bold text-muted-foreground uppercase text-[10px] tracking-[0.2em] mt-1">Fichiers Excel ou CSV</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-12 space-y-8">
              <form action={handleUpload} className="space-y-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "group relative border-4 border-dashed rounded-[2.5rem] p-20 text-center transition-all cursor-pointer",
                    selectedFile ? "border-primary bg-primary/5 shadow-inner" : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <input 
                    ref={fileInputRef}
                    name="file" 
                    type="file" 
                    required 
                    onChange={onFileChange}
                    className="hidden" 
                  />
                  <div className="space-y-5">
                    {selectedFile ? (
                      <>
                        <div className="h-20 w-20 bg-primary rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-primary/20 animate-in zoom-in-50 duration-300">
                          <FileText className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-black text-primary uppercase tracking-tight">{selectedFile.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em]">PRÊT POUR L'EXTRACTION • {(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-20 w-20 bg-muted rounded-3xl mx-auto flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                          <Upload className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-black text-muted-foreground uppercase tracking-tight group-hover:text-secondary transition-colors">Déposer le fichier source</p>
                          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">PRÉNOM, NOM, LINKEDIN URL</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Button disabled={isUploading || !selectedFile} className="w-full h-20 bg-secondary hover:bg-secondary/90 text-white rounded-[1.5rem] font-black uppercase italic text-xl shadow-2xl shadow-secondary/20 transition-all active:scale-[0.98]">
                  {isUploading ? <Loader2 className="h-7 w-7 animate-spin mr-4" /> : <UserPlus className="h-7 w-7 mr-4" />}
                  Lancer l'importation
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Card 2: Enrichment */}
          <Card className="border-2 border-primary/20 shadow-2xl rounded-[3rem] overflow-hidden bg-card transition-all hover:shadow-primary/10">
            <CardHeader className="p-10 border-b border-primary/10 bg-primary/5">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                  <Zap className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black italic uppercase tracking-tight text-secondary">2. Scrap LinkedIn</CardTitle>
                  <CardDescription className="font-bold text-primary uppercase text-[10px] tracking-[0.2em] mt-1">Smart Enrichment Process</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-12 space-y-12 flex flex-col justify-between h-full min-h-[450px]">
              <div className="space-y-6">
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                  Le robot MDS analyse chaque profil pour récupérer automatiquement le poste actuel et l'entreprise via l'indexation Google.
                </p>
                <div className="bg-muted/50 border-2 border-border rounded-[2rem] p-8 flex items-center justify-between shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">État du système</span>
                    <span className="text-2xl font-black text-secondary italic uppercase flex items-center gap-3">
                      {isScanning ? (
                        <>
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                          </span>
                          Traitement actif
                        </>
                      ) : "Système en attente"}
                    </span>
                  </div>
                  <div className="h-16 w-16 bg-card rounded-2xl flex items-center justify-center border-2 border-border shadow-sm">
                    <BarChart3 className={cn("h-8 w-8 transition-colors duration-500", isScanning ? "text-primary" : "text-muted-foreground/30")} />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleStartScan} 
                disabled={isScanning || alumni.length === 0}
                className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] font-black uppercase italic text-2xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isScanning ? <Loader2 className="h-8 w-8 animate-spin mr-4" /> : <RefreshCcw className="h-8 w-8 mr-4" />}
                Activer le robot
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Success / Error Result Alert */}
        {result && (
          <div className={cn(
            "mb-16 p-10 rounded-[2.5rem] border-4 flex items-center gap-8 animate-in slide-in-from-bottom-8 duration-700 shadow-2xl",
            result.success ? "bg-emerald-500 border-emerald-400 text-white" : "bg-rose-500 border-rose-400 text-white"
          )}>
            <div className="h-20 w-20 rounded-[1.5rem] bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-xl shrink-0">
              {result.success ? <CheckCircle2 className="h-10 w-10 text-white" /> : <AlertCircle className="h-10 w-10 text-white" />}
            </div>
            <div className="space-y-1">
              <p className="font-black text-3xl uppercase italic tracking-tighter leading-none">
                {result.success ? "Opération Terminée" : "Erreur Détectée"}
              </p>
              <p className="font-bold text-white/90 text-lg uppercase tracking-widest">{result.message || result.error}</p>
            </div>
            {result.success && (
              <Button 
                variant="outline" 
                className="ml-auto bg-white/10 hover:bg-white/20 border-white/30 text-white font-black uppercase italic h-14 px-8 rounded-xl backdrop-blur-sm"
                onClick={() => setResult(null)}
              >
                Ignorer le message
              </Button>
            )}
          </div>
        )}

        {/* Database Section */}
        <div className="space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="h-3 w-12 bg-primary rounded-full shadow-[0_0_15px_rgba(45,184,197,0.4)]"></div>
                <h2 className="text-5xl font-black italic uppercase tracking-tighter text-secondary">Annuaire Global</h2>
              </div>
              <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em] pl-16 opacity-60">Base de données en temps réel • MDS Network</p>
            </div>
            
            <div className="relative w-full lg:w-[500px] group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
              <Input 
                placeholder="RECHERCHER UN PROFIL MDS..." 
                className="pl-16 h-20 bg-white border-2 border-border rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all focus:ring-[15px] focus:ring-primary/5 focus:border-primary shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Card className="border-2 border-border shadow-2xl rounded-[4rem] overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground bg-muted/30 border-b border-border">
                    <th className="px-12 py-10">Allumni & Promo</th>
                    <th className="px-12 py-10">Poste & Entreprise</th>
                    <th className="px-12 py-10">Statut Data</th>
                    <th className="px-12 py-10 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingAlumni ? (
                    <tr><td colSpan={4} className="py-48 text-center"><Loader2 className="h-20 w-20 animate-spin mx-auto text-primary/10" /></td></tr>
                  ) : alumni.length > 0 ? (
                    alumni.map((person) => (
                      <tr key={person.id} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-12 py-10">
                          <div className="flex items-center gap-8">
                            <div className="relative shrink-0">
                              <div className="h-20 w-20 rounded-[1.75rem] bg-secondary border-4 border-white shadow-xl flex items-center justify-center text-white overflow-hidden group-hover:scale-110 group-hover:rotate-2 transition-all duration-500">
                                {person.avatar_url ? (
                                  <img src={person.avatar_url} className="h-full w-full object-cover" alt="" />
                                ) : (
                                  <span className="text-2xl font-black italic uppercase tracking-tighter">
                                    {person.first_name?.[0]}{person.last_name?.[0]}
                                  </span>
                                )}
                              </div>
                              <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-primary rounded-xl border-4 border-white flex items-center justify-center text-[11px] font-black text-white italic shadow-lg">
                                {person.grad_year?.toString().slice(-2) || '??'}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="font-black text-secondary uppercase italic leading-none text-2xl tracking-tighter">
                                {person.first_name} {person.last_name}
                              </p>
                              <Badge variant="outline" className="font-black text-[9px] uppercase tracking-[0.2em] border-slate-200 py-1 px-3">
                                {person.degree || 'Bachelor Digital'}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="px-12 py-10">
                          {person.current_company ? (
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-3">
                                <div className="h-1 w-4 bg-primary rounded-full"></div>
                                <p className="font-black text-slate-900 leading-tight uppercase italic text-base tracking-tight">
                                  {person.current_job_title}
                                </p>
                              </div>
                              <p className="text-[12px] font-black text-primary uppercase tracking-[0.25em] bg-primary/5 px-4 py-1.5 rounded-lg w-fit border border-primary/10 ml-7">
                                {person.current_company}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4 text-muted-foreground/20 italic font-bold text-sm uppercase tracking-widest ml-7">
                              <RefreshCcw className="h-5 w-5 animate-pulse" />
                              Synchronisation en attente
                            </div>
                          )}
                        </td>
                        <td className="px-12 py-10">
                           {person.current_company ? (
                             <div className="flex flex-col gap-3">
                               <div className="flex gap-1.5">
                                 {[1,2,3].map(i => <div key={i} className="h-1.5 w-6 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />)}
                               </div>
                               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Données Fiables</span>
                             </div>
                           ) : (
                             <div className="flex flex-col gap-3">
                               <div className="flex gap-1.5">
                                 <div className="h-1.5 w-6 rounded-full bg-amber-400 animate-pulse" />
                                 <div className="h-1.5 w-6 rounded-full bg-slate-100" />
                                 <div className="h-1.5 w-6 rounded-full bg-slate-100" />
                               </div>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Incomplet</span>
                             </div>
                           )}
                        </td>
                        <td className="px-12 py-10 text-right">
                          <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                            <AlumniEditDialog alumnus={person} />
                            <DeleteAlumniDialog allumni={person} onSuccess={fetchAlumni} />
                          </div>
                        </td>
                      </tr>
                    ))

                  ) : (
                    <tr><td colSpan={4} className="py-60 text-center text-muted-foreground/10 font-black italic uppercase tracking-[0.6em] text-4xl">Base de données vide</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>

      {/* Progress Modal - TOTAL REDESIGN */}
      <Dialog open={showProgressModal} onOpenChange={isScanning ? () => {} : setShowProgressModal}>
        <DialogContent className="sm:max-w-3xl bg-secondary border-0 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[4rem] p-0 overflow-hidden text-white">
          <div className="p-16 space-y-12">
            <DialogHeader className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-20 w-20 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/40 animate-pulse">
                  {isScanning ? <RefreshCcw className="h-10 w-10 animate-spin" /> : <CheckCircle2 className="h-10 w-10" />}
                </div>
                <Badge className="bg-white/10 text-white border-white/20 h-10 px-6 font-black text-sm tracking-widest backdrop-blur-md rounded-full">
                  MDS ROBOT SYSTEM v2.0
                </Badge>
              </div>
              
              <div className="space-y-3">
                <DialogTitle className="text-5xl font-black italic uppercase tracking-tighter text-white">
                  {isScanning ? "Traitement de la data" : "Mission Terminée"}
                </DialogTitle>
                <DialogDescription className="text-white/50 font-bold uppercase text-[10px] tracking-[0.4em] leading-relaxed">
                  {isScanning 
                    ? "Synchronisation intelligente via Google Search API pour chaque alumnus importé." 
                    : "L'analyse globale est terminée. Tous les profils sont maintenant enrichis dans Supabase."}
                </DialogDescription>
              </div>
            </DialogHeader>

            <Separator className="bg-white/10" />

            <div className="space-y-10">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Progression en temps réel</span>
                  <div className="flex items-baseline gap-4">
                    <span className="text-9xl font-black italic text-white tracking-tighter leading-none">{progress.percentage}%</span>
                    <span className="text-primary text-3xl font-black animate-pulse">●</span>
                  </div>
                </div>
                <div className="bg-white/5 border-2 border-white/10 rounded-[2rem] p-8 min-w-[240px] text-center backdrop-blur-xl">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Profils analysés</p>
                  <p className="text-4xl font-black italic text-white leading-none">
                    {progress.processed} <span className="text-white/20">/</span> {progress.total}
                  </p>
                </div>
              </div>
              
              <div className="relative pt-2">
                <Progress value={progress.percentage} className="h-8 bg-white/5 rounded-3xl border-4 border-white/5 overflow-hidden" />
                <div 
                  className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_40px_rgba(45,184,197,0.6)] transition-all duration-700 rounded-3xl"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>

            <div className="pt-8">
              {!isScanning && (
                <Button 
                  onClick={() => setShowProgressModal(false)} 
                  className="w-full h-24 font-black uppercase italic bg-primary text-white rounded-[2rem] hover:bg-primary/90 transition-all text-3xl shadow-3xl shadow-primary/30 active:scale-[0.97]"
                >
                  Confirmer et fermer
                </Button>
              )}
              {isScanning && (
                <div className="w-full flex flex-col items-center gap-6 p-10 bg-white/5 rounded-[2.5rem] border-2 border-white/10 backdrop-blur-sm">
                  <div className="flex gap-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />
                    ))}
                  </div>
                  <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">
                    Le serveur traite la file d'attente... ne pas quitter
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
