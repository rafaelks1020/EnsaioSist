'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Music, X } from 'lucide-react';

interface Hymn {
  id: string;
  title: string;
  lyrics: string;
  mp3Url?: string;
  createdBy: {
    name: string;
  };
}

interface HymnSelectorProps {
  rehearsalId: string;
  onHymnAdded: () => void;
}

export function HymnSelector({ rehearsalId, onHymnAdded }: HymnSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [filteredHymns, setFilteredHymns] = useState<Hymn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingHymnId, setAddingHymnId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHymns();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = hymns.filter(hymn =>
      hymn.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHymns(filtered);
  }, [hymns, searchTerm]);

  const fetchHymns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hinos');
      if (response.ok) {
        const data = await response.json();
        setHymns(data.hymns || []);
      }
    } catch (error) {
      console.error('Erro ao carregar hinos');
    } finally {
      setLoading(false);
    }
  };

  const addHymnToRehearsal = async (hymnId: string) => {
    setAddingHymnId(hymnId);
    try {
      const response = await fetch(`/api/ensaios/${rehearsalId}/hinos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hymnId }),
      });

      if (response.ok) {
        alert('Hino adicionado ao ensaio!');
        onHymnAdded();
        setIsOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao adicionar hino');
      }
    } catch (error) {
      alert('Erro ao adicionar hino');
    } finally {
      setAddingHymnId(null);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Hino
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Selecionar Hino para o Ensaio</h2>
            <Button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar hinos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredHymns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhum hino encontrado' : 'Nenhum hino disponível'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHymns.map((hymn) => (
                  <div
                    key={hymn.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-gray-400" />
                        <h3 className="font-medium">{hymn.title}</h3>
                        {hymn.mp3Url && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            MP3
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Criado por: {hymn.createdBy.name}
                      </p>
                    </div>
                    <Button
                      onClick={() => addHymnToRehearsal(hymn.id)}
                      disabled={addingHymnId === hymn.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      {addingHymnId === hymn.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        'Adicionar'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <a 
              href="/app/hinos/novo"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Hino
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}