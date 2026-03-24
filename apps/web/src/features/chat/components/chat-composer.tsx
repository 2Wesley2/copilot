'use client';

import { useState } from 'react';

interface ChatComposerProps {
  readonly disabled: boolean;
  readonly onSend: (value: string) => Promise<void>;
}

export const ChatComposer = ({ disabled, onSend }: ChatComposerProps) => {
  const [value, setValue] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        if (!value.trim()) {
          return;
        }

        const content = value;
        setValue('');
        void onSend(content);
      }}
      style={{ display: 'flex', gap: '0.5rem' }}
    >
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => {
          setValue(event.target.value);
        }}
        placeholder="Descreva a operação para gerar um draft..."
        style={{
          flex: 1,
          background: '#030712',
          border: '1px solid #334155',
          borderRadius: 8,
          color: '#e2e8f0',
          padding: '0.625rem 0.75rem',
        }}
      />
      <button
        disabled={disabled}
        type="submit"
        style={{
          background: '#2563eb',
          border: 0,
          borderRadius: 8,
          color: '#fff',
          cursor: 'pointer',
          padding: '0.625rem 0.875rem',
        }}
      >
        Enviar
      </button>
    </form>
  );
};
