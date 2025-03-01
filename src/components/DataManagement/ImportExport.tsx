'use client';

import { useState } from 'react';
import { useImportExport } from '@/hooks/useImportExport';
import { Dialog } from '@/components/ui/Dialog';
import { Progress } from '@/components/ui/Progress';
import { Alert } from '@/components/ui/Alert';

export function ImportExport() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const {
    exportTypes,
    selectedExportTypes,
    toggleExportType,
    startExport,
    importSource,
    setImportSource,
    importType,
    setImportType,
    handleFileSelect,
    startImport,
    currentJob,
    isLoading,
    error,
  } = useImportExport();

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold">Data Management</h2>
          <p className="text-gray-600 mt-1">Import and export your Mediaverse data</p>
        </div>
        <div className="space-x-4">
          <button
            onClick={() => setImportOpen(true)}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Import Data
          </button>
          <button
            onClick={() => setExportOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Export Data
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Error" description={error} />
      )}

      {currentJob && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">
              {currentJob.type === 'import' ? 'Import' : 'Export'} in progress...
            </h3>
            <span className="text-sm text-gray-500">
              {currentJob.status === 'completed' ? '100%' : 'Processing...'}
            </span>
          </div>
          <Progress
            value={currentJob.status === 'completed' ? 100 : undefined}
            indeterminate={currentJob.status === 'pending'}
          />
          {currentJob.status === 'completed' && currentJob.file_url && (
            <a
              href={currentJob.file_url}
              download
              className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
            >
              Download File
            </a>
          )}
        </div>
      )}

      <Dialog open={isImportOpen} onClose={() => setIsImportOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Import Data</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Import Source
              </label>
              <select
                value={importSource}
                onChange={(e) => setImportSource(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300"
              >
                <option value="">Select a source</option>
                <option value="imdb">IMDb</option>
                <option value="letterboxd">Letterboxd</option>
                <option value="mediaverse">Mediaverse Backup</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Content Type
              </label>
              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300"
              >
                <option value="">Select content type</option>
                <option value="movies">Movies</option>
                <option value="tv_shows">TV Shows</option>
                <option value="games">Games</option>
                <option value="books">Books</option>
                <option value="all">All Content</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Import File
              </label>
              <input 
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="mt-1 block w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: CSV, JSON
              </p>
            </div>

            <button
              onClick={startImport}
              disabled={isLoading || !importSource || !importType}
              className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Importing...' : 'Start Import'}
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog open={isExportOpen} onClose={() => setIsExportOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Export Data</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Content to Export
              </label>
              {exportTypes.map((type) => (
                <label key={type.id} className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedExportTypes.includes(type.id)}
                    onChange={() => toggleExportType(type.id)}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={startExport}
              disabled={isLoading || selectedExportTypes.length === 0}
              className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Exporting...' : 'Start Export'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}