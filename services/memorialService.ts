import { supabase } from './supabaseClient';
import { MemorialFormData, Memorial, TimelineEvent, MediaItem } from '../types';

// --- MOCK DATA FOR DEMO (Fallback when DB is empty) ---
const MOCK_MEMORIALS: Memorial[] = [
  {
    id: 'demo-1',
    user_id: 'demo-user',
    name: 'Helena Ferreira',
    relationship: 'Avó',
    birth_date: '1945-03-12',
    death_date: '2023-01-15',
    biography: 'Helena foi uma mulher de fibra, amorosa e cheia de vida. Dedicou seus dias a cuidar da família e das suas amadas orquídeas. Seu bolo de fubá nas tardes de domingo deixará saudades eternas. Ensinou a todos nós o valor da honestidade e do trabalho duro.',
    is_public: true,
    status: true, // Approved
    cover_image_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=2525&auto=format&fit=crop',
    profile_image_url: 'https://images.unsplash.com/photo-1551843073-4a9a5b6fcd5f?q=80&w=987&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    user_id: 'demo-user',
    name: 'Carlos Mendes',
    relationship: 'Pai',
    birth_date: '1960-08-22',
    death_date: '2022-11-30',
    biography: 'Um pai exemplar e um amigo para todas as horas. Carlos amava o mar e a pescaria. Suas histórias de pescador animavam qualquer churrasco. Deixa um legado de alegria e resiliência.',
    is_public: true,
    status: true, // Approved
    cover_image_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2670&auto=format&fit=crop',
    profile_image_url: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=2070&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-3',
    user_id: 'demo-user',
    name: 'Rex',
    relationship: 'Melhor Amigo',
    birth_date: '2010-05-10',
    death_date: '2024-02-01',
    biography: 'O melhor companheiro que alguém poderia pedir. Rex trouxe luz e alegria para nossa casa por 14 anos. Adorava correr no parque e buscar bolinhas. Sempre estará em nossos corações.',
    is_public: true,
    status: true, // Mock agora é true para aparecer na demo pública
    cover_image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2669&auto=format&fit=crop',
    profile_image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop',
    created_at: new Date().toISOString()
  }
];

// Helper to export mocks specifically
export const getMockMemorials = () => MOCK_MEMORIALS;

// Helper to upload a single file
const uploadFile = async (file: File, path: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error } = await supabase.storage
      .from('memorials')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('memorials')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error('Exception uploading file:', err);
    return null;
  }
};

// --- USER PROFILE SERVICES ---

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const updateUserProfileImage = async (userId: string, file: File, type: 'avatar' | 'cover') => {
  try {
    const folder = type === 'avatar' ? 'avatars' : 'covers';
    const url = await uploadFile(file, `${userId}/profile/${folder}`);
    
    if (!url) throw new Error('Falha no upload da imagem');

    const updateData = type === 'avatar' ? { avatar_url: url } : { cover_url: url };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) throw error;

    return { success: true, url };
  } catch (error) {
    console.error('Error updating profile image:', error);
    return { success: false, error };
  }
};

export const deleteUserAccount = async () => {
  try {
    // Call the PostgreSQL function we created to delete the auth user
    const { error } = await supabase.rpc('delete_own_account');
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error };
  }
};

// --- MEMORIAL SERVICES ---

export const getUserMemorials = async (userId: string): Promise<{ data: Memorial[] | null, error: any }> => {
  const { data, error } = await supabase
    .from('memorials')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const getPublicMemorials = async (): Promise<{ data: Memorial[] | null, error: any }> => {
  const { data, error } = await supabase
    .from('memorials')
    .select('*')
    .eq('is_public', true)
    .eq('status', true) // Only show APPROVED/PAID memorials to public
    .order('created_at', { ascending: false });

  return { data, error };
};

// --- ADMIN FUNCTIONS ---

export const getAllMemorialsAdmin = async (): Promise<{ data: Memorial[] | null, error: any }> => {
  // Query Real DB
  // Because we implemented the SQL Policies for admin@eternize.com.br,
  // this simple select will now return ALL rows if logged in as that user.
  const { data, error } = await supabase
    .from('memorials')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

export const updateMemorialStatus = async (memorialId: string, status: boolean) => {
  // Try to update Mock first if it's a demo ID (just for UI responsiveness in demos)
  const mockIndex = MOCK_MEMORIALS.findIndex(m => m.id === memorialId);
  if (mockIndex !== -1) {
    MOCK_MEMORIALS[mockIndex].status = status;
    return { success: true };
  }

  // Update Real DB
  const { error } = await supabase
    .from('memorials')
    .update({ status: status })
    .eq('id', memorialId);

  if (error) {
    console.error('Error updating status:', error);
    return { success: false, error };
  }
  return { success: true };
};

// --- END ADMIN FUNCTIONS ---

export const getMemorialFull = async (memorialId: string) => {
  // CHECK FOR MOCK FIRST (For Demo Purposes)
  const mockMemorial = MOCK_MEMORIALS.find(m => m.id === memorialId);
  if (mockMemorial) {
    return {
      memorial: mockMemorial,
      timeline: [
         { id: 't1', memorial_id: memorialId, year: '1980', title: 'Nascimento', description: 'Chegada ao mundo, trazendo alegria para a família.' },
         { id: 't2', memorial_id: memorialId, year: '1998', title: 'Formatura', description: 'Conclusão dos estudos, um momento de muito orgulho.' },
         { id: 't3', memorial_id: memorialId, year: '2010', title: 'Viagem dos Sonhos', description: 'A tão aguardada viagem com toda a família reunida.' }
      ],
      media: [
        { id: 'm1', memorial_id: memorialId, type: 'image', url: mockMemorial.cover_image_url || '' },
        { id: 'm2', memorial_id: memorialId, type: 'image', url: mockMemorial.profile_image_url || '' },
        { id: 'm3', memorial_id: memorialId, type: 'image', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2664&auto=format&fit=crop' },
        { id: 'm4', memorial_id: memorialId, type: 'image', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2670&auto=format&fit=crop' },
        
        // Video Mock
        { 
          id: 'v1', 
          memorial_id: memorialId, 
          type: 'video', 
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          file_name: 'viagem_familia.mp4'
        },
        
        // Audio Mock
        { 
          id: 'a1', 
          memorial_id: memorialId, 
          type: 'audio', 
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
          file_name: 'mensagem_voz.mp3'
        }
      ],
      error: null
    };
  }

  // 1. Get Memorial
  const { data: memorial, error: memError } = await supabase
    .from('memorials')
    .select('*')
    .eq('id', memorialId)
    .single();

  if (memError) return { error: memError };

  // 2. Get Timeline
  const { data: timeline, error: timeError } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('memorial_id', memorialId)
    .order('year', { ascending: true });

  // 3. Get Media
  const { data: media, error: mediaError } = await supabase
    .from('media_items')
    .select('*')
    .eq('memorial_id', memorialId);

  return { 
    memorial, 
    timeline: timeline || [], 
    media: media || [],
    error: timeError || mediaError
  };
};

export const createMemorial = async (
  formData: MemorialFormData, 
  userId: string,
  coverFile: File | null,
  profileFile: File | null
) => {
  try {
    // 1. Upload Cover & Profile
    let coverUrl = null;
    let profileUrl = null;

    if (coverFile) {
      coverUrl = await uploadFile(coverFile, `${userId}/covers`);
    }
    if (profileFile) {
      profileUrl = await uploadFile(profileFile, `${userId}/profiles`);
    }

    // 2. Insert Memorial Data
    const { data: memorialData, error: memorialError } = await supabase
      .from('memorials')
      .insert([
        {
          user_id: userId,
          name: formData.name,
          relationship: formData.relationship,
          birth_date: formData.birthDate || null,
          death_date: formData.deathDate || null,
          biography: formData.biography,
          is_public: formData.isPublic,
          status: false, // Default to OFF/Pending until payment is approved by admin
          cover_image_url: coverUrl,
          profile_image_url: profileUrl
        }
      ])
      .select()
      .single();

    if (memorialError || !memorialData) {
      throw new Error(`Error saving memorial: ${memorialError?.message}`);
    }

    const memorialId = memorialData.id;

    // 3. Insert Timeline Events
    await saveTimeline(memorialId, formData.timeline);

    // 4. Upload and Insert Media Items
    await saveMedia(memorialId, userId, formData.gallery, 'gallery');
    await saveMedia(memorialId, userId, formData.videos, 'video');
    await saveMedia(memorialId, userId, formData.audios, 'audio');

    return { success: true, memorialId };

  } catch (error) {
    console.error('Full save error:', error);
    return { success: false, error };
  }
};

export const updateMemorial = async (
  memorialId: string,
  userId: string,
  formData: MemorialFormData,
  coverFile: File | null,
  profileFile: File | null,
  deletedMediaIds: string[] = []
) => {
  try {
    // 1. Handle New Cover/Profile Uploads
    const updateData: any = {
      name: formData.name,
      relationship: formData.relationship,
      birth_date: formData.birthDate || null,
      death_date: formData.deathDate || null,
      biography: formData.biography,
      is_public: formData.isPublic,
    };

    if (coverFile) {
      const url = await uploadFile(coverFile, `${userId}/covers`);
      if (url) updateData.cover_image_url = url;
    }
    
    if (profileFile) {
      const url = await uploadFile(profileFile, `${userId}/profiles`);
      if (url) updateData.profile_image_url = url;
    }

    // 2. Update Memorial Table
    const { error: updateError } = await supabase
      .from('memorials')
      .update(updateData)
      .eq('id', memorialId)
      .eq('user_id', userId); // Security check

    if (updateError) throw updateError;

    // 3. Handle Deletions
    if (deletedMediaIds.length > 0) {
      await supabase.from('media_items').delete().in('id', deletedMediaIds);
      // Note: We are not deleting files from Storage to avoid complex logic, but in production you should.
    }

    // 4. Update Timeline (Delete all and re-insert strategy for simplicity)
    await supabase.from('timeline_events').delete().eq('memorial_id', memorialId);
    await saveTimeline(memorialId, formData.timeline);

    // 5. Save ONLY NEW Media (items with 'file' property present and not marked as existing)
    // Filter items that have a File object (newly added)
    const newGallery = formData.gallery.filter(i => i.file && !i.isExisting);
    const newVideos = formData.videos.filter(i => i.file && !i.isExisting);
    const newAudios = formData.audios.filter(i => i.file && !i.isExisting);

    await saveMedia(memorialId, userId, newGallery, 'gallery');
    await saveMedia(memorialId, userId, newVideos, 'video');
    await saveMedia(memorialId, userId, newAudios, 'audio');

    return { success: true };

  } catch (error) {
    console.error('Update error:', error);
    return { success: false, error };
  }
};

export const deleteMemorial = async (memorialId: string) => {
  try {
    const { error } = await supabase
      .from('memorials')
      .delete()
      .eq('id', memorialId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting memorial:', error);
    return { success: false, error };
  }
};

// --- Helpers ---

const saveTimeline = async (memorialId: string, events: TimelineEvent[]) => {
  if (events.length === 0) return;
  
  const timelinePayload = events.map(event => ({
    memorial_id: memorialId,
    year: event.year,
    title: event.title,
    description: event.description
  }));

  const { error } = await supabase.from('timeline_events').insert(timelinePayload);
  if (error) console.error('Error saving timeline:', error);
};

const saveMedia = async (memorialId: string, userId: string, items: MediaItem[], category: string) => {
  if (items.length === 0) return;

  const uploadPromises = items.map(async (item) => {
    if (!item.file) return null; // Should not happen for new items
    
    const url = await uploadFile(item.file, `${userId}/${memorialId}/${category}`);
    if (url) {
      return {
        memorial_id: memorialId,
        type: item.type,
        url: url,
        file_name: item.file.name
      };
    }
    return null;
  });

  const uploadedItems = (await Promise.all(uploadPromises)).filter(Boolean);

  if (uploadedItems.length > 0) {
    const { error } = await supabase.from('media_items').insert(uploadedItems);
    if (error) console.error(`Error saving ${category}:`, error);
  }
};