import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  Video,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  Search,
  ExternalLink,
  Printer,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Course, Enrollment, Region } from '../../types/index.ts';

export const TeachingModule: React.FC = () => {
  const { currentUser, isAdmin, isTeachingTeam } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Enroll modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [enrollForm, setEnrollForm] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    regionId: 'reg-sp',
    hasPhysicalBooks: true,
  });

  // Certificate Modal
  const [certModalEnrollment, setCertModalEnrollment] = useState<Enrollment | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, enrollmentsData, regionsData] = await Promise.all([
        api.getCourses(),
        api.getEnrollments(),
        api.getRegions(),
      ]);
      setCourses(coursesData);
      setEnrollments(enrollmentsData);
      setRegions(regionsData);
    } catch (err) {
      console.error('Erro ao buscar dados de ensino:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.enrollStudent(enrollForm);
      setIsEnrollModalOpen(false);
      setEnrollForm({
        studentName: '',
        studentEmail: '',
        studentPhone: '',
        regionId: 'reg-sp',
        hasPhysicalBooks: true,
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao matricular aluno');
    }
  };

  const handleCertify = async (enrollmentId: string) => {
    try {
      const updated = await api.certifyStudent(enrollmentId);
      setCertModalEnrollment(updated);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao emitir certificado');
    }
  };

  const course = courses[0];

  const filteredEnrollments = enrollments.filter((en) =>
    en.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    en.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (en.certificateCode && en.certificateCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-red-700 text-xs font-bold uppercase tracking-wider">
            Capacitação Teológica & Prática
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase mt-0.5">
            Escola de Formação de Semeadores
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Curso trimestral, aulas mensais via Zoom, estudo dos 4 módulos físicos e certificação digital.
          </p>
        </div>

        <button
          onClick={() => setIsEnrollModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Matricular Aluno</span>
        </button>
      </div>

      {/* Official Guidelines from Strategy Meeting */}
      <div className="bg-stone-900 text-white p-5 rounded-xl border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-700 text-white rounded text-[10px] font-bold uppercase tracking-wider">
              Diretriz da Reunião
            </span>
            <span className="text-xs text-stone-400">Duração: 3 Meses • Ensino Gratuito para Jovens</span>
          </div>
          <h3 className="text-base font-bold text-white">Treinamentos Mensais via Zoom</h3>
          <p className="text-xs text-stone-300 max-w-2xl">
            A aquisição dos 4 módulos físicos de estudo é indispensável para alinhamento teológico. O processo de aquisição será formalizado pela liderança.
          </p>
        </div>

        {course && (
          <a
            href={course.zoomMeetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-xs"
          >
            <Video className="w-4 h-4" />
            <span>Acessar Sala Zoom</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* The 4 Modules Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-3">
          Grade Curricular Oficial — 4 Módulos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {course?.modules.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-red-800 text-white font-extrabold flex items-center justify-center text-xs">
                {m.order}
              </div>
              <h4 className="font-bold text-stone-900 text-xs">{m.title}</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">{m.description}</p>
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-medium">
                <span>{m.durationWeeks} semanas</span>
                <span className="text-red-700 font-bold">Livro Físico Requerido</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrollments & Certification Table */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900 text-sm uppercase">Alunos Matriculados & Certificação</h3>
            <p className="text-xs text-stone-500">Acompanhamento de progresso nos 4 módulos e emissão de certificados</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar aluno ou certificado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
            />
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredEnrollments.map((en) => {
            const reg = regions.find(r => r.id === en.regionId);
            const isCompleted = en.status === 'completed';

            return (
              <div key={en.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{en.studentName}</span>
                    {reg && (
                      <span className="text-[11px] text-stone-500">
                        ({reg.name.split('(')[0]})
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCompleted ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800'
                    }`}>
                      {isCompleted ? 'Formado' : 'Em Andamento'}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-500 flex items-center gap-3">
                    <span>{en.studentEmail}</span>
                    <span>• Livros físicos: {en.hasPhysicalBooks ? 'Sim' : 'Pendente'}</span>
                    <span>• Matrícula: {en.enrollmentDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Progress */}
                  <div className="w-24 text-right">
                    <span className="text-[11px] font-bold text-stone-700">{en.progressPercent}%</span>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mt-0.5">
                      <div
                        className={`h-full ${isCompleted ? 'bg-emerald-600' : 'bg-red-700'}`}
                        style={{ width: `${en.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {isCompleted ? (
                    <button
                      onClick={() => setCertModalEnrollment(en)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Ver Certificado</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCertify(en.id)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concluir & Emitir</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Matrícula */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900 uppercase">
                Matricular Aluno na Escola
              </h3>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nome Completo do Aluno *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do jovem/semeador"
                  value={enrollForm.studentName}
                  onChange={(e) => setEnrollForm({ ...enrollForm, studentName: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">E-mail para Acesso ao Zoom *</label>
                <input
                  type="email"
                  required
                  placeholder="aluno@email.com"
                  value={enrollForm.studentEmail}
                  onChange={(e) => setEnrollForm({ ...enrollForm, studentEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 98888-7777"
                  value={enrollForm.studentPhone}
                  onChange={(e) => setEnrollForm({ ...enrollForm, studentPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Regional *</label>
                <select
                  value={enrollForm.regionId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, regionId: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enrollForm.hasPhysicalBooks}
                  onChange={(e) => setEnrollForm({ ...enrollForm, hasPhysicalBooks: e.target.checked })}
                  className="rounded text-red-700"
                />
                <span className="text-[11px] text-stone-700 font-medium">
                  Aluno solicitou / adquiriu o kit físico dos 4 módulos de estudo
                </span>
              </label>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold uppercase tracking-wider"
                >
                  Confirmar Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Certificado Digital */}
      {certModalEnrollment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 print:p-0 print:shadow-none">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 no-print">
              <span className="text-xs font-bold text-stone-500 uppercase">Certificado Oficial</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-md text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Certificado</span>
                </button>
                <button
                  onClick={() => setCertModalEnrollment(null)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Display */}
            <div className="p-8 border-8 border-double border-red-900 bg-gradient-to-b from-stone-50 via-white to-stone-50 text-center space-y-6">
              <div className="space-y-1">
                <h1 className="text-xl font-black uppercase text-stone-900 tracking-wider">
                  SEMEADORES DE FOGO GLOBAL
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-red-700">
                  Certificado de Conclusão Ministerial
                </p>
              </div>

              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Certificamos que o semeador(a)
              </p>

              <h2 className="text-2xl font-black text-stone-900 underline decoration-red-700 underline-offset-8">
                {certModalEnrollment.studentName}
              </h2>

              <p className="text-xs text-stone-600 max-w-lg mx-auto leading-relaxed">
                concluiu com êxito os 4 Módulos de Formação Evangelística (Evangelismo Sobrenatural, Unção do Espírito, Dons do Espírito e Paternidade Espiritual), cumprindo a carga horária de 3 meses de ensino teórico e prático nas ruas.
              </p>

              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-t border-stone-400 pt-1 w-44 mx-auto font-bold">
                    Mateus Rocha / Arthur
                  </div>
                  <span className="text-stone-500 text-[10px]">Coordenação de Ensino</span>
                </div>
                <div>
                  <div className="border-t border-stone-400 pt-1 w-44 mx-auto font-bold">
                    Lucas Moreira
                  </div>
                  <span className="text-stone-500 text-[10px]">Direção Global</span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                <span>Código de Autenticidade: {certModalEnrollment.certificateCode}</span>
                <span>Data de Conclusão: {certModalEnrollment.certifiedAt}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
