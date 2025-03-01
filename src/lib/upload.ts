import { createServiceClient } from '@/lib/server/supabase';

export async function handleFileUpload(file: File, userId: string) {
    const supabase = await createServiceClient();
    const fileExt = file.name.split('.').pop();
    const filePath = `uploads/${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    return filePath;
}
