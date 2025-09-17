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
import { Plus, Edit, Trash2, Users, RefreshCw, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '@/lib/roles';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: Role.ADOLESCENTE as Role,
    password: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const payload = editingUser 
        ? { name: formData.name, email: formData.email, role: formData.role }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save user');
      }

      toast.success(editingUser ? 'Usuário atualizado!' : 'Usuário criado!');
      setShowCreateForm(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', role: Role.ADOLESCENTE, password: '' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      toast.success('Usuário excluído!');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    try {
      const newPassword = `Temp@${Math.random().toString(36).slice(-4)}`;
      
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      const data = await response.json();
      toast.success(`Senha redefinida para: ${data.newPassword}`);
    } catch (error) {
      toast.error('Erro ao redefinir senha');
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role as Role,
      password: '',
    });
    setShowCreateForm(true);
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'Administrador';
      case Role.USUARIO:
        return 'Usuário';
      case Role.ADOLESCENTE:
        return 'Adolescente';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie usuários do sistema</p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(true);
            setEditingUser(null);
            setFormData({ name: '', email: '', role: Role.ADOLESCENTE as Role, password: '' });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </CardTitle>
            <CardDescription>
              {editingUser ? 'Edite as informações do usuário' : 'Crie um novo usuário do sistema'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role">Papel *</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                >
                  <option value={Role.ADOLESCENTE}>Adolescente</option>
                  <option value={Role.USUARIO}>Usuário</option>
                  <option value={Role.ADMIN}>Administrador</option>
                </select>
              </div>
              
              {!editingUser && (
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    minLength={8}
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingUser ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingUser(null);
                  }}
                  className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Carregando...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === Role.ADMIN
                            ? 'bg-red-100 text-red-800'
                            : user.role === Role.USUARIO
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getRoleLabel(user.role)}
                        </span>
                        <span className="text-xs text-gray-400">
                          Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-1 text-sm"
                        onClick={() => startEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-1 text-sm"
                        onClick={() => handleResetPassword(user.id, user.name)}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-red-600 text-white hover:bg-red-700 px-3 py-1 text-sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o usuário "{user.name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id, user.name)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}