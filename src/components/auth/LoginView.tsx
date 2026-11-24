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
    <main className="leadership-login">
      <div className="leadership-login-brand">
        <BrandLogo variant="white" size="md" />
        <img className="leadership-login-emblem" src="/logo-semeadores.png" alt="" width={220} height={204} />
        <p>Estrutura, unidade e missão.</p>
      </div>
      <div className="leadership-login-content">
        <h1>Portal da Liderança</h1>
        <p>Acesse as ferramentas da sua regional ou da Direção Global.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label htmlFor="login-email" className="block text-xs font-bold text-[#0B2946] mb-1.5">
              E-mail Ministerial
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#586E84] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                autoComplete="username"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@semeadoresdefogo.org"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#DCE5ED] rounded-xl bg-white text-[#0B2946] focus:outline-hidden focus:ring-2 focus:ring-[#ED801F]/30 focus:border-[#0A3D69]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-[#0B2946] mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#586E84] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                autoComplete="current-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#DCE5ED] rounded-xl bg-white text-[#0B2946] focus:outline-hidden focus:ring-2 focus:ring-[#ED801F]/30 focus:border-[#0A3D69]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[#061A2D] hover:bg-[#0A3D69] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#FFBD58]" />
            <span>{submitting ? 'Verificando...' : 'Entrar no Portal'}</span>
          </button>

          <div className="pt-3 border-t border-[#DCE5ED]">
            <p className="text-[11px] font-bold text-[#586E84] mb-2">
              Contas de Teste (Ambiente Local):
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="text-left px-3 py-2 rounded-xl bg-[#EDF4F9] hover:bg-[#e1ecf4] border border-[#DCE5ED] text-[11px] text-[#0B2946] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="font-semibold">{acc.label}</span>
                  <span className="text-[#0A3D69] font-semibold text-[10px]">Preencher</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToPublic}
            className="w-full pt-2 text-xs font-semibold text-[#586E84] hover:text-[#061A2D] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Site Público</span>
          </button>
        </form>
      </div>
    </main>
  );
};
