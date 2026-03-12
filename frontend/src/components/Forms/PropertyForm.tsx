import { useState } from 'react';
import { useProperty } from '../../hooks/useProperty';
import { useMapStore } from '../../store/useMapStore';

interface Props {
  onCreated: () => void;
}

export function PropertyForm({ onCreated }: Props) {
  const { createProperty } = useProperty();
  const { isLoading, error } = useMapStore();
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError('Nome é obrigatório.');
      return;
    }
    try {
      await createProperty(name.trim());
      onCreated();
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Erro ao criar propriedade.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome da Propriedade
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Sítio Boa Esperança"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          autoFocus
        />
      </div>

      {(localError || error) && (
        <p className="text-sm text-red-600">{localError || error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading ? 'Criando...' : 'Criar Propriedade →'}
      </button>
    </form>
  );
}
