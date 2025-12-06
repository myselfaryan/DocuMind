import { AuthForm } from "../auth/auth-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <div className="w-full flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">DocuMind</h1>
          <p className="text-muted-foreground">AI-Powered Document Generation</p>
        </div>
        <AuthForm mode="login" />
      </div>
    </main>
  )
}
