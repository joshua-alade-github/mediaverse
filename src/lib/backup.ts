import { createClient } from '@/lib/supabase';
import { MediaverseExporter } from './exporters/mediaverse';

export async function createBackup(userId: string): Promise<string> {
  const exporter = new MediaverseExporter(userId);
  const backup = await exporter.export({
    format: 'json',
    types: ['lists', 'reviews', 'ratings', 'preferences'],
  });

  // Store backup in storage
  const supabase = createClient();
  const fileName = `backup_${new Date().toISOString()}.json`;
  const { error } = await supabase.storage
    .from('backups')
    .upload(`${userId}/${fileName}`, backup);

  if (error) throw error;

  return backup;
}

export async function restoreBackup(backupId: string, userId: string) {
    const supabase = createClient();
  
    // Get backup file
    const { data: backup } = await supabase
      .from('backups')
      .select('file_url')
      .eq('id', backupId)
      .single();
  
    if (!backup) {
      throw new Error('Backup not found');
    }
  
    // Download backup content
    const response = await fetch(backup.file_url);
    const content = await response.json();
  
    // Create importer instance
    const importer = new MediaverseImporter(userId);
  
    // Restore data
    const result = await importer.import(JSON.stringify(content));
  
    if (result.failed > 0) {
      throw new Error(`Restore completed with ${result.failed} errors`);
    }
  
    return result;
  }
  
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }