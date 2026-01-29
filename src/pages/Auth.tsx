import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import precifixLogo from '@/assets/precifix-logo.png';
import precifixLogoWhiteSvg from '@/assets/precifix-logo-white.svg';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string()
    .min(1, 'O email é obrigatório')
    .email('Email inválido'),
  password: z.string()
    .min(1, 'A palavra-passe é obrigatória')
    .min(6, 'A palavra-passe deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  fullName: z.string()
    .min(1, 'O nome é obrigatório')
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .min(1, 'O email é obrigatório')
    .email('Email inválido')
    .max(255, 'O email deve ter no máximo 255 caracteres'),
  password: z.string()
    .min(1, 'A palavra-passe é obrigatória')
    .min(6, 'A palavra-passe deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
    .min(1, 'Confirme a palavra-passe'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As palavras-passe não coincidem',
  path: ['confirmPassword'],
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setFieldErrors({ ...fieldErrors, [field]: '' });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        // Validate login
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const errors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0] as string] = err.message;
            }
          });
          setFieldErrors(errors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email ou palavra-passe incorretos');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Por favor, confirme o seu email antes de entrar');
          } else {
            setError(error.message);
          }
        }
      } else {
        // Validate signup
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
          const errors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0] as string] = err.message;
            }
          });
          setFieldErrors(errors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes('User already registered')) {
            setError('Este email já está registado. Tente fazer login.');
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <img 
              src={precifixLogoWhiteSvg} 
              alt="Precifix" 
              className="h-16 object-contain mb-8 mx-auto"
            />
            <p className="text-xl text-white/90 mb-6">
              A inteligência por trás das tuas propostas
            </p>
            <p className="text-white/70">
              Crie cotações precisas e documentos profissionais em minutos. 
              Automatize a precificação e gere propostas técnicas e orçamentais completas.
            </p>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-white/5" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src={precifixLogo} 
              alt="Precifix" 
              className="h-12 object-contain mx-auto"
            />
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {isLogin
                  ? 'Entre na sua conta para continuar'
                  : 'Registe-se para começar a usar o PRECIFIX'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="João Silva"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-sm text-destructive">{fieldErrors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar palavra-passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Entrar' : 'Criar conta'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setFieldErrors({});
                  }}
                  className="ml-2 text-primary font-medium hover:underline"
                >
                  {isLogin ? 'Registar-se' : 'Entrar'}
                </button>
              </p>
            </div>

            {/* Test Users Quick Access */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-6 border-t border-border"
            >
              <p className="text-xs text-muted-foreground text-center mb-3">
                {isLogin ? 'Acesso rápido para testes' : 'Criar utilizadores de teste'}
              </p>
              <div className="space-y-2">
                {/* Existing Admin User */}
                <button
                  type="button"
                  onClick={() => {
                    if (isLogin) {
                      setFormData({
                        ...formData,
                        email: 'aniceto@precifix.pt',
                        password: '',
                      });
                    }
                  }}
                  disabled={!isLogin}
                  className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Aniceto de Carvalho</p>
                      <p className="text-xs text-muted-foreground">aniceto@precifix.pt</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        Admin
                      </span>
                      <span className="text-xs text-green-600">✓ Registado</span>
                    </div>
                  </div>
                </button>

                {/* Test Gestor */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isLogin) {
                      setFormData({
                        fullName: 'Maria Santos',
                        email: 'maria.gestor@precifix.pt',
                        password: 'teste123',
                        confirmPassword: 'teste123',
                      });
                    } else {
                      setFormData({
                        ...formData,
                        email: 'maria.gestor@precifix.pt',
                        password: '',
                      });
                    }
                  }}
                  className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Maria Santos</p>
                      <p className="text-xs text-muted-foreground">maria.gestor@precifix.pt</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600">
                      Gestor
                    </span>
                  </div>
                </button>

                {/* Test Comercial */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isLogin) {
                      setFormData({
                        fullName: 'João Comercial',
                        email: 'joao.comercial@precifix.pt',
                        password: 'teste123',
                        confirmPassword: 'teste123',
                      });
                    } else {
                      setFormData({
                        ...formData,
                        email: 'joao.comercial@precifix.pt',
                        password: '',
                      });
                    }
                  }}
                  className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">João Comercial</p>
                      <p className="text-xs text-muted-foreground">joao.comercial@precifix.pt</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-500/10 text-orange-600">
                      Comercial
                    </span>
                  </div>
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                {isLogin 
                  ? 'Clique para preencher • Palavra-passe de teste: teste123'
                  : 'Clique para pré-preencher • Depois clique "Criar conta"'}
              </p>
              {!isLogin && (
                <p className="text-xs text-amber-600 text-center mt-2">
                  ⚠️ Após criar, atribua o papel em Configurações → Utilizadores
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
