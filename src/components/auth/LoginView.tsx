import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface LoginViewProps {
  onBackToPublic: () => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Direção Global (Lucas)', email: 'lucas@semeadoresdefogo.org' },
  { label: 'Coord. Regional SP (Pr. Marcos)', email: 'marcos.sp@semeadoresdefogo.org' },
  { label: 'Coord. Regional MG (Pr. Samuel)', email: 'samuel.mg@semeadoresdefogo.org' },
  { label: 'Consolidação SP (Sarah)', email: 'sarah.consol@semeadoresdefogo.org' },
];

export const LoginView: React.FC<LoginViewProps> = ({ onBackToPublic }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Semeadores@2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="bg-stone-900 px-6 py-6 text-white flex flex-col items-center text-center border-b border-stone-800">
          <BrandLogo variant="white" size="sm" />
          <h1 className="text-lg font-black uppercase tracking-wider mt-4">
            Portal da Liderança
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Acesso protegido por autenticação e isolamento regional (LGPD)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
              E-mail Ministerial
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@semeadoresdefogo.org"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? 'Verificando...' : 'Entrar no Portal'}</span>
          </button>

          <div className="pt-3 border-t border-stone-200">
            <p className="text-[11px] font-bold text-stone-500 uppercase mb-2">
              Contas de Teste (Ambiente Local):
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="text-left px-2.5 py-1.5 rounded bg-stone-50 hover:bg-stone-100 border border-stone-200 text-[11px] text-stone-700 flex items-center justify-between cursor-pointer"
                >
                  <span className="font-semibold">{acc.label}</span>
                  <span className="text-stone-400 font-mono text-[10px]">preencher</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToPublic}
            className="w-full pt-2 text-xs text-stone-500 hover:text-stone-900 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Site Público</span>
          </button>
        </form>
      </div>
    </div>
  );
};
