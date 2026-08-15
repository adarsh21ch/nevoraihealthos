import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { createCustomerAccount, resolveLoginIdentifier } from '@/lib/auth.functions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { AppLogo } from '@/components/ui/app-logo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useServerFn } from '@tanstack/react-start'

export default function LoginView() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Sign In State
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // Sign Up State
  const [fboId, setFboId] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      // 1. Resolve email if FBO ID was provided
      const email = await resolveLoginIdentifier({ data: { identifier: loginId } })
      
      // 2. Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword,
      })
      
      if (signInError) throw signInError
      
      toast.success("Welcome back!")
      navigate({ to: '/onboarding' })
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      await createCustomerAccount({
        data: {
          email: signupEmail,
          password: signupPassword,
          fboId,
          accessCode,
        }
      })
      
      toast.success("Account created successfully!")
      navigate({ to: '/onboarding' })
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-white relative overflow-hidden">
        <div className="z-10">
          <AppLogo className="w-24" />
          <h1 className="text-7xl font-serif text-emerald-900 mt-12 leading-tight">
            True health,<br />
            <span className="text-emerald-500 italic">UNLOCKED.</span>
          </h1>
          <p className="text-xl text-slate-500 mt-8 max-w-md">
            Welcome to the Fat2Fit elite portal. Your 9-day metabolic evolution starts here.
          </p>
        </div>
        
        <div className="z-10 flex gap-12">
          <div>
            <p className="text-2xl font-serif text-emerald-900">2026</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fat2Fit Edition</p>
          </div>
          <div>
            <p className="text-2xl font-serif text-emerald-900">E2E</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Health Data Privacy</p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="md:hidden flex justify-center mb-8">
            <AppLogo className="w-20" />
          </div>

          <Tabs defaultValue="login" className="w-full">
            <div className="flex flex-col space-y-2 text-left mb-8">
              <h2 className="text-3xl font-serif text-emerald-900">Create Account</h2>
              <p className="text-sm text-slate-500">Enroll in the program with your access code.</p>
            </div>

            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg font-black uppercase text-[10px] tracking-widest">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg font-black uppercase text-[10px] tracking-widest">Join Program</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-50 text-red-600 border-red-100 rounded-xl uppercase font-black text-[10px] tracking-widest">
                <AlertDescription>
                  {error.toUpperCase()}
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-id" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email or FBO ID</Label>
                  <Input 
                    id="login-id" 
                    placeholder="name@example.com" 
                    className="h-14 rounded-xl border-slate-200 bg-white"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-14 rounded-xl border-slate-200 bg-white"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-emerald-900 hover:bg-emerald-800 text-white font-black uppercase tracking-widest rounded-xl mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In →"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fbo" className="text-[10px] font-black uppercase tracking-widest text-slate-500">FBO ID</Label>
                    <Input 
                      id="fbo" 
                      placeholder="910..." 
                      className="h-14 rounded-xl border-slate-200 bg-white"
                      value={fboId}
                      onChange={(e) => setFboId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Access Code</Label>
                    <Input 
                      id="code" 
                      placeholder="FAT2FIT" 
                      className="h-14 rounded-xl border-slate-200 bg-white"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="h-14 rounded-xl border-slate-200 bg-white"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-14 rounded-xl border-slate-200 bg-white"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-emerald-900 hover:bg-emerald-800 text-white font-black uppercase tracking-widest rounded-xl mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create My Account →"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            Fat2Fit © 2026<br />
            <span className="opacity-50">Build by Nevorai Technologies</span>
          </p>
        </div>
      </div>
    </div>
  )
}
