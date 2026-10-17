import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Search,
  Filter,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Department, DepartmentTask } from '../../types/index.ts';

export const DepartmentsModule: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  // Task modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [taskForm, setTaskForm] = useState<Partial<DepartmentTask>>({
    departmentId: 'dept-1',
    title: '',
    description: '',
    assignee: '',
    priority: 'media',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptsData, tasksData] = await Promise.all([
        api.getDepartments(),
        api.getTasks(),
      ]);
      setDepartments(deptsData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Erro ao carregar departamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTask(taskForm);
      setIsTaskModalOpen(false);
      setTaskForm({
        departmentId: 'dept-1',
        title: '',
        description: '',
        assignee: '',
        priority: 'media',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar tarefa');
    }
  };

  const handleMoveTaskStatus = async (taskId: string, newStatus: DepartmentTask['status']) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar tarefa');
    }
  };

  const filteredTasks = selectedDeptId === 'all'
    ? tasks
    : tasks.filter(t => t.departmentId === selectedDeptId);

  const columns: Array<{ id: DepartmentTask['status']; label: string; color: string }> = [
    { id: 'pendente', label: 'Pendente', color: 'border-stone-300 bg-stone-50' },
    { id: 'em_andamento', label: 'Em Andamento', color: 'border-blue-300 bg-blue-50/40' },
    { id: 'em_revisao', label: 'Em Revisão', color: 'border-amber-300 bg-amber-50/40' },
    { id: 'concluido', label: 'Concluído', color: 'border-emerald-300 bg-emerald-50/40' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-red-700 text-xs font-bold uppercase tracking-wider">
            Estrutura Funcional Ministerial
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase mt-0.5">
            Departamentos & Tarefas
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Os 10 departamentos definidos na reunião de 16/10/2026 e painel Kanban de execução.
          </p>
        </div>

        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Tarefa</span>
        </button>
      </div>

      {/* 10 Departments List Horizontal Selector */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setSelectedDeptId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedDeptId === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Todos os Departamentos ({tasks.length})
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeptId(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedDeptId === d.id
                  ? 'bg-red-800 text-white font-bold shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {d.number}. {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className={`p-4 rounded-xl border ${col.color} flex flex-col min-h-[450px]`}>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900">
                  {col.label}
                </h3>
                <span className="w-5 h-5 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-700">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => {
                  const dept = departments.find(d => d.id === task.departmentId);
                  const priorityColor = {
                    baixa: 'bg-stone-100 text-stone-600',
                    media: 'bg-blue-100 text-blue-800',
                    alta: 'bg-amber-100 text-amber-800',
                    urgente: 'bg-red-100 text-red-800',
                  }[task.priority];

                  return (
                    <div
                      key={task.id}
                      className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs space-y-2 hover:border-red-300 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${priorityColor}`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {task.dueDate}
                        </span>
                      </div>

                      <h4 className="font-bold text-stone-900 text-xs leading-snug">{task.title}</h4>

                      {task.description && (
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                        <span className="truncate max-w-[120px]">{task.assignee}</span>
                        <select
                          value={task.status}
                          onChange={(e) => handleMoveTaskStatus(task.id, e.target.value as any)}
                          className="bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 text-[10px] font-semibold text-stone-700 cursor-pointer"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="em_andamento">Em Andamento</option>
                          <option value="em_revisao">Em Revisão</option>
                          <option value="concluido">Concluído</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Nova Tarefa */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900 uppercase">
                Criar Nova Tarefa
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Departamento *</label>
                <select
                  value={taskForm.departmentId}
                  onChange={(e) => setTaskForm({ ...taskForm, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.number}. {d.name} ({d.coordinator})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Enviar modelos de camisetas oficiais para estamparia"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes operacionais e orientações"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Responsável *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do líder"
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Prioridade</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Prazo de Conclusão</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold uppercase tracking-wider"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
