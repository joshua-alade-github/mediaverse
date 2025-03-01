import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';

const EXPORT_TYPES = [
  { id: 'lists', label: 'Lists & Collections' },
  { id: 'ratings', label: 'Ratings & Reviews' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'settings', label: 'Settings & Preferences' },
];

export function useImportExport() {
  const [selectedExportTypes, setSelectedExportTypes] = useState<string[]>([]);
  const [importSource, setImportSource] = useState('');
  const [importType, setImportType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Query current job if exists
  const { data: currentJob } = useQuery({
    queryKey: ['import-export-job'],
    queryFn: async () => {
      const [importJob, exportJob] = await Promise.all([
        supabase
          .from('data_imports')
          .select('*')
          .eq('status', 'pending')
          .limit(1)
          .maybeSingle(),
        supabase
          .from('data_exports')
          .select('*')
          .eq('status', 'pending')
          .limit(1)
          .maybeSingle(),
      ]);

      return importJob.data || exportJob.data;
    },
    refetchInterval: (data) => (data?.status === 'pending' ? 2000 : false),
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('source', importSource);
      formData.append('type', importType);

      const response = await fetch('/api/data/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/data/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exportTypes: selectedExportTypes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
  });

  const toggleExportType = useCallback((typeId: string) => {
    setSelectedExportTypes((current) =>
      current.includes(typeId)
        ? current.filter((id) => id !== typeId)
        : [...current, typeId]
    );
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const startImport = useCallback(async () => {
    try {
      setError(null);
      await importMutation.mutateAsync();
    } catch (error) {
      setError(error.message);
    }
  }, [importMutation]);

  const startExport = useCallback(async () => {
    try {
      setError(null);
      await exportMutation.mutateAsync();
    } catch (error) {
      setError(error.message);
    }
  }, [exportMutation]);

  return {
    exportTypes: EXPORT_TYPES,
    selectedExportTypes,
    toggleExportType,
    importSource,
    setImportSource,
    importType,
    setImportType,
    handleFileSelect,
    startImport,
    startExport,
    currentJob,
    isLoading: importMutation.isLoading || exportMutation.isLoading,
    error,
  };
}