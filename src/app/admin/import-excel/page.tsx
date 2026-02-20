'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, ArrowLeft, Zap, Loader2, BarChart3 } from 'lucide-react'
import { importExcelData, startEnrichmentScan, getEnrichmentProgress } from '../actions'
import Link from 'next/link'

export default function ImportExcelPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; count?: number; error?: string; message?: string } | null>(null)
  
  // Progress state
  const [progress, setProgress] = useState({ processed: 0, total: 0, percentage: 0 })
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null)

  // Polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isScanning) {
      interval = setInterval(async () => {
        const data = await getEnrichmentProgress()
        setProgress(data)
        
        // Nouvelle estimation (approx 6s par profil restant avec les optimisations)
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
          }
        }
      }, 2000) // Poll every 2 seconds for better responsiveness
    }

    return () => clearInterval(interval)
  }, [isScanning])

  const handleUpload = async (formData: FormData) => {
    setIsUploading(true)
    setResult(null)
    const res = await importExcelData(formData)
    setResult(res)
    setIsUploading(false)
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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/alumni" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'annuaire
        </Link>

        <div className="space-y-6">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <div className="h-2 bg-blue-600 w-full" />
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">1. Importation des noms</CardTitle>
              <CardDescription>
                Téléchargez votre fichier Excel avec les colonnes <strong>Prenom</strong>, <strong>Nom</strong> et <strong>Linkedin</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={handleUpload} className="space-y-6">
                <div className="grid w-full items-center gap-1.5">
                  <div className="relative group">
                    <Input 
                      id="file" name="file" type="file" accept=".xlsx, .xls, .csv" required
                      className="h-24 cursor-pointer file:hidden text-transparent bg-slate-50 border-dashed border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all rounded-2xl"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                      <Upload className="h-8 w-8 mb-2" />
                      <span className="text-sm font-medium">Sélectionner le fichier Excel</span>
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isUploading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all">
                  {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importation...</> : "Lancer l'importation"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
            <div className="h-2 bg-amber-500 w-full" />
            <CardHeader className="pb-2">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">2. Enrichissement LinkedIn</CardTitle>
              <CardDescription>
                Récupération automatique des <strong>photos</strong>, <strong>diplômes</strong> et <strong>entreprises</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!isScanning ? (
                <Button 
                  onClick={handleStartScan} 
                  disabled={isUploading}
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-200 transition-all"
                >
                  Lancer l'enrichissement automatique
                </Button>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-bold text-amber-700 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scan en cours...
                    </span>
                    <span className="text-slate-500 font-mono">
                      {progress.processed} / {progress.total} profils
                    </span>
                  </div>
                  
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-out"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5" />
                      {progress.percentage}% complété
                    </div>
                    <div className="text-amber-600">
                      Temps restant : {estimatedTime || "--:--"}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-xs italic leading-relaxed">
                <strong>Attention</strong> : Le robot va ouvrir une fenêtre. Connectez-vous à LinkedIn si demandé. Le scan s'arrêtera automatiquement une fois tous les profils traités.
              </div>
            </CardContent>
          </Card>

          {result && (
            <div className={`p-5 rounded-2xl border-2 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${
              result.success ? "bg-green-50 border-green-100 text-green-800" : "bg-red-50 border-red-100 text-red-800"
            }`}>
              {result.success ? <CheckCircle2 className="h-6 w-6 mt-0.5 text-green-600 shrink-0" /> : <AlertCircle className="h-6 w-6 mt-0.5 text-red-600 shrink-0" />}
              <div>
                <p className="font-black text-lg leading-tight mb-1">{result.success ? "Opération réussie" : "Attention"}</p>
                <p className="text-sm font-medium opacity-90 leading-snug">{result.message || (result.success ? `${result.count} profils importés.` : result.error)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
