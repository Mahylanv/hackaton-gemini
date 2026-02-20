import { login, signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const error = params.error as string

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">
            <span className="text-secondary">MYDIGIT</span>
            <span className="text-primary">ALUMNI</span>
          </CardTitle>
          <CardDescription>Accès réservé à l'administration</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="email@exemple.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="flex gap-4 pt-2">
              <Button formAction={login} className="flex-1 font-bold">
                Connexion
              </Button>
              <Button formAction={signup} variant="outline" className="flex-1 font-bold text-secondary">
                S'inscrire
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
