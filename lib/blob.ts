import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function uploadFile(file: File): Promise<string> {
  // Primeiro, tentar usar Vercel Blob se o token estiver disponível
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(file.name, file, {
        access: 'public',
      });
      
      return blob.url;
    } catch (error) {
      console.error('Erro no Vercel Blob, tentando upload local:', error);
    }
  }
  
  // Fallback para desenvolvimento local
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Criar diretório uploads se não existir
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    
    // Gerar nome único do arquivo
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);
    
    await writeFile(filePath, buffer);
    
    // Retornar URL local
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Erro no upload local:', error);
    throw new Error('Falha no upload do arquivo');
  }
}

export async function deleteFile(url: string): Promise<void> {
  // Extract the pathname from the blob URL to delete it
  // Note: This requires the BLOB_READ_WRITE_TOKEN to have delete permissions
  try {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) {
      console.error('Failed to delete blob:', response.statusText);
    }
  } catch (error) {
    console.error('Error deleting blob:', error);
  }
}