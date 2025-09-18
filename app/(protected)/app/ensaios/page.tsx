'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Calendar, Clock, Music } from 'lucide-react';
import { toast } from 'sonner';
import { Weekday } from '@/lib/roles';
import { musicalButton, musicalCard, musicalText } from '@/lib/musical-theme';

interface RehearsalSlot {
  id: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const WEEKDAY_LABELS = {
  [Weekday.SUNDAY]: 'Domingo',
  [Weekday.MONDAY]: 'Segunda-feira',
  [Weekday.TUESDAY]: 'Terça-feira',
  [Weekday.WEDNESDAY]: 'Quarta-feira',
  [Weekday.THURSDAY]: 'Quinta-feira',
  [Weekday.FRIDAY]: 'Sexta-feira',
  [Weekday.SATURDAY]: 'Sábado',
};

const WEEKDAY_SHORT = {
  [Weekday.SUNDAY]: 'Dom',
  [Weekday.MONDAY]: 'Seg',
  [Weekday.TUESDAY]: 'Ter',
  [Weekday.WEDNESDAY]: 'Qua',
  [Weekday.THURSDAY]: 'Qui',
  [Weekday.FRIDAY]: 'Sex',
  [Weekday.SATURDAY]: 'Sáb',
};

export default function EnsaiosPage() {
  const [rehearsalSlots, setRehearsalSlots] = useState<RehearsalSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<RehearsalSlot | null>(null);
  const [formData, setFormData] = useState<{
    weekday: Weekday;
    startTime: string;
    endTime: string;
    description: string;
  }>({
    weekday: Weekday.SUNDAY,
    startTime: '',
    endTime: '',
    description: '',
  });

  const fetchRehearsalSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ensaios');
      if (!response.ok) throw new Error('Failed to fetch rehearsal slots');

      const data = await response.json();
      setRehearsalSlots(data);
    } catch (error) {
      toast.error('Erro ao carregar ensaios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRehearsalSlots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startTime || !formData.endTime) {
      toast.error('Horários são obrigatórios');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error('Horário de início deve ser anterior ao horário de fim');
      return;
    }

    try {
      const url = editingSlot ? `/api/ensaios/${editingSlot.id}` : '/api/ensaios';
      const method = editingSlot ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save rehearsal slot');
      }

      toast.success(editingSlot ? 'Ensaio atualizado!' : 'Ensaio criado!');
      setShowCreateForm(false);
      setEditingSlot(null);
      setFormData({ weekday: Weekday.SUNDAY, startTime: '', endTime: '', description: '' });
      fetchRehearsalSlots();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/ensaios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete rehearsal slot');
      }

      toast.success('Ensaio excluído!');
      fetchRehearsalSlots();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = (slot: RehearsalSlot) => {
    setEditingSlot(slot);
    setFormData({
      weekday: slot.weekday,
      startTime: slot.startTime,
      endTime: slot.endTime,
      description: slot.description || '',
    });
    setShowCreateForm(true);
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds if present
  };

  // Group slots by weekday
  const slotsByWeekday = rehearsalSlots.reduce((acc, slot) => {
    if (!acc[slot.weekday]) {
      acc[slot.weekday] = [];
    }
    acc[slot.weekday].push(slot);
    return acc;
  }, {} as Record<Weekday, RehearsalSlot[]>);

  // Sort weekdays starting from Sunday
  const weekdayOrder = [
    Weekday.SUNDAY,
    Weekday.MONDAY,
    Weekday.TUESDAY,
    Weekday.WEDNESDAY,
    Weekday.THURSDAY,
    Weekday.FRIDAY,
    Weekday.SATURDAY,
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ensaios</h1>
          <p className="text-gray-600 text-sm sm:text-base">Gerencie os horários de ensaio semanais</p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(true);
            setEditingSlot(null);
            setFormData({ weekday: Weekday.SUNDAY, startTime: '', endTime: '', description: '' });
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Ensaio
        </Button>
      </div>

      {/* Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingSlot ? 'Editar Ensaio' : 'Novo Ensaio'}
            </CardTitle>
            <CardDescription>
              {editingSlot ? 'Edite o horário do ensaio' : 'Crie um novo horário de ensaio semanal'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="weekday">Dia da Semana *</Label>
                <select
                  id="weekday"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.weekday}
                  onChange={(e) => setFormData({ ...formData, weekday: e.target.value as Weekday })}
                >
                  {weekdayOrder.map((day) => (
                    <option key={day} value={day}>
                      {WEEKDAY_LABELS[day]}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Horário de Início *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="endTime">Horário de Fim *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Ensaio geral, Só vozes, etc."
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto">
                  {editingSlot ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  className="w-full sm:w-auto border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingSlot(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Carregando...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {weekdayOrder.map((weekday) => (
            <Card key={weekday}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  {WEEKDAY_LABELS[weekday]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {slotsByWeekday[weekday] && slotsByWeekday[weekday].length > 0 ? (
                  <div className="space-y-2">
                    {slotsByWeekday[weekday]
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </div>
                              {slot.description && (
                                <div className="text-sm text-gray-600 truncate">
                                  {slot.description}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Mobile Actions */}
                          <div className="flex sm:hidden gap-2 w-full">
                            <a
                              href={`/app/ensaios/${slot.id}`}
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded touch-manipulation"
                            >
                              <Music className="h-4 w-4 mr-1" />
                              Hinos
                            </a>
                            <Button
                              className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-2 text-sm touch-manipulation"
                              onClick={() => startEdit(slot)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button className="flex-1 bg-red-600 text-white hover:bg-red-700 px-3 py-2 text-sm touch-manipulation">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este horário de ensaio?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(slot.id)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>

                          {/* Desktop Actions */}
                          <div className="hidden sm:flex gap-2 flex-shrink-0">
                            <a
                              href={`/app/ensaios/${slot.id}`}
                              className="inline-flex items-center px-3 py-1 text-sm border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded touch-manipulation"
                            >
                              <Music className="h-4 w-4 mr-1" />
                              Hinos
                            </a>
                            <Button
                              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-1 text-sm touch-manipulation"
                              onClick={() => startEdit(slot)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 text-sm touch-manipulation">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este horário de ensaio?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(slot.id)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Nenhum ensaio agendado
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}