import { login, signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Alumni MDS</CardTitle>
          <CardDescription>Connectez-vous ou créez un compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="email@exemple.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="flex gap-4 pt-2">
              <Button formAction={login} className="flex-1">
                Connexion
              </Button>
              <Button formAction={signup} variant="outline" className="flex-1">
                S'inscrire
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
