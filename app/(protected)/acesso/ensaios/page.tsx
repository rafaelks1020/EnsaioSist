'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Music, Users, ChevronRight } from 'lucide-react';
import { musicalButton, musicalCard, musicalText } from '@/lib/musical-theme';
import { toast } from 'sonner';
import { Weekday } from '@/lib/roles';

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

export default function AcessoEnsaiosPage() {
  const [rehearsalSlots, setRehearsalSlots] = useState<RehearsalSlot[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Get next rehearsal
  const getNextRehearsal = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5);

    const weekdayMapping: Record<number, Weekday> = {
      0: Weekday.SUNDAY,
      1: Weekday.MONDAY,
      2: Weekday.TUESDAY,
      3: Weekday.WEDNESDAY,
      4: Weekday.THURSDAY,
      5: Weekday.FRIDAY,
      6: Weekday.SATURDAY,
    };

    // Look for rehearsals today (after current time) and this week
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDay = (currentDay + dayOffset) % 7;
      const targetWeekday = weekdayMapping[targetDay];
      const slotsForDay = slotsByWeekday[targetWeekday] || [];

      for (const slot of slotsForDay.sort((a, b) => a.startTime.localeCompare(b.startTime))) {
        if (dayOffset === 0 && slot.startTime <= currentTime) {
          continue; // Skip past rehearsals today
        }
        return { slot, daysUntil: dayOffset };
      }
    }

    return null;
  };

  const nextRehearsal = getNextRehearsal();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="h-32 bg-gray-200 animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ensaios</h1>
        <p className="text-gray-600">Consulte os horários de ensaio da semana</p>
      </div>

      {/* Next Rehearsal */}
      {nextRehearsal && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximo Ensaio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    {WEEKDAY_LABELS[nextRehearsal.slot.weekday]}
                  </span>
                  <span>•</span>
                  <span>
                    {formatTime(nextRehearsal.slot.startTime)} - {formatTime(nextRehearsal.slot.endTime)}
                  </span>
                </div>
                {nextRehearsal.slot.description && (
                  <div className="text-indigo-700 text-sm mt-1">
                    {nextRehearsal.slot.description}
                  </div>
                )}
                <div className="mt-2 text-sm text-indigo-600">
                  {nextRehearsal.daysUntil === 0 ? 'Hoje' : 
                   nextRehearsal.daysUntil === 1 ? 'Amanhã' : 
                   `Em ${nextRehearsal.daysUntil} dias`}
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href={`/acesso/ensaios/${nextRehearsal.slot.id}`}>
                  <Music className="h-4 w-4 mr-2 text-indigo-600" />
                  Ver Hinos
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Cronograma Semanal</h2>
        
        {rehearsalSlots.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum ensaio agendado</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          weekdayOrder.map((weekday) => (
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
                          className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </div>
                              {slot.description && (
                                <div className="text-sm text-gray-600">
                                  {slot.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <a href={`/acesso/ensaios/${slot.id}`}>
                              <Music className="h-4 w-4 mr-1 text-blue-600" />
                              Ver Hinos
                            </a>
                          </Button>
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
          ))
        )}
      </div>

      {/* Summary */}
      {rehearsalSlots.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p>
                Total de {rehearsalSlots.length} ensaio{rehearsalSlots.length !== 1 ? 's' : ''} agendado{rehearsalSlots.length !== 1 ? 's' : ''} esta semana
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}