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
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#E7E2DA] overflow-hidden">
        <div className="bg-[#141210] px-6 py-7 text-white flex flex-col items-center text-center border-b border-stone-800">
          <BrandLogo variant="white" size="sm" />
          <h1 className="text-lg font-extrabold tracking-tight mt-4">
            Portal da Liderança
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Acesso protegido por autenticação e isolamento regional (LGPD)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800 font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-stone-700 mb-1.5">
              E-mail Ministerial
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@semeadoresdefogo.org"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#E7E2DA] rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/30 focus:border-red-700"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-stone-700 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#E7E2DA] rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/30 focus:border-red-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? 'Verificando...' : 'Entrar no Portal'}</span>
          </button>

          <div className="pt-3 border-t border-[#E7E2DA]">
            <p className="text-[11px] font-semibold text-stone-500 mb-2">
              Contas de Teste (Ambiente Local):
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="text-left px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-stone-100 border border-[#E7E2DA] text-[11px] text-stone-700 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="font-semibold">{acc.label}</span>
                  <span className="text-stone-400 text-[10px]">Preencher</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToPublic}
            className="w-full pt-2 text-xs font-medium text-stone-600 hover:text-[#141210] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Site Público</span>
          </button>
        </form>
      </div>
    </div>
  );
};
