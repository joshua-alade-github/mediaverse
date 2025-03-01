'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';

export function BackupManager() {
  const [isRestoring, setIsRestoring] = useState(false);
  const { showToast } = useToast();

  // Query backup history
  const { data: backups, isLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/backup', {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      showToast('Backup created successfully', 'success');
    },
    onError: (error) => {
      showToast(error.message, 'error');
    },
  });

  // Restore backup mutation
  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const response = await fetch(`/api/backup/${backupId}/restore`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      showToast('Backup restored successfully', 'success');
      setIsRestoring(false);
    },
    onError: (error) => {
      showToast(error.message, 'error');
      setIsRestoring(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Backups</h2>
          <p className="text-gray-600 mt-1">Manage your data backups</p>
        </div>
        <button
          onClick={() => createBackupMutation.mutate()}
          disabled={createBackupMutation.isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {createBackupMutation.isLoading ? 'Creating...' : 'Create Backup'}
        </button>
      </div>

      {isLoading ? (
        <div>Loading backups...</div>
      ) : backups?.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No backups found. Create your first backup to protect your data.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {backups?.map((backup) => (
              <li key={backup.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Backup from {format(new Date(backup.created_at), 'PPP pp')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Size: {formatBytes(backup.size)}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setIsRestoring(true);
                        restoreBackupMutation.mutate(backup.id);
                      }}
                      disabled={isRestoring}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Restore
                    </button>
                    <a
                      href={backup.file_url}
                      download
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isRestoring && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-lg font-medium mb-4">Restoring backup...</p>
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}