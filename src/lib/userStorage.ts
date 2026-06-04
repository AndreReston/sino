import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { SavedDesign } from '../store/useStore';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(id: string): boolean {
  return UUID_RE.test(id);
}

// ── Auth ────────────────────────────────────────────────────────────

export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

export const registerUser = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data.user) {
    return { success: false, message: 'Registration failed. Please try again.' };
  }

  return { success: true, message: 'Registration complete.', user: data.user };
};

export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Login successful.', user: data.user };
};

export const logoutUser = async () => {
  await supabase.auth.signOut();
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
};

// ── Profile ─────────────────────────────────────────────────────────

export const getUserProfile = async (userId: string): Promise<{ username: string } | null> => {
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle();
  return data;
};

// ── Designs ──────────────────────────────────────────────────────────

export const getUserDesigns = async (userId: string): Promise<SavedDesign[]> => {
  const { data, error } = await supabase
    .from('designs')
    .select('id, title, canvas_width, canvas_height, canvas_background, created_at, updated_at, design_pages(id, page_order, canvas_data, thumbnail)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id,
    title: d.title,
    canvasWidth: d.canvas_width,
    canvasHeight: d.canvas_height,
    canvasBackground: d.canvas_background,
    canvasName: d.title,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    pages: (d.design_pages || [])
      .sort((a: any, b: any) => a.page_order - b.page_order)
      .map((p: any) => ({
        page_id: p.id,
        canvas_data: p.canvas_data,
        thumbnail: p.thumbnail ?? '',
      })),
  }));
};

export const saveUserDesign = async (userId: string, design: SavedDesign): Promise<string> => {
  const isNew = !isUUID(design.id);
  const designRow: Record<string, any> = {
    user_id: userId,
    title: design.title,
    canvas_width: design.canvasWidth,
    canvas_height: design.canvasHeight,
    canvas_background: design.canvasBackground,
    updated_at: new Date().toISOString(),
  };

  let designId = design.id;

  if (isNew) {
    // Insert new design, let DB generate the UUID
    const { data, error } = await supabase
      .from('designs')
      .insert(designRow)
      .select('id')
      .single();

    if (error || !data) {
      console.error('Failed to save new design:', error);
      return design.id;
    }
    designId = data.id;
  } else {
    const { error } = await supabase
      .from('designs')
      .update(designRow)
      .eq('id', design.id);

    if (error) {
      console.error('Failed to update design:', error);
      return design.id;
    }
  }

  // Delete existing pages and re-insert
  const { error: deleteError } = await supabase
    .from('design_pages')
    .delete()
    .eq('design_id', designId);

  if (deleteError) {
    console.error('Failed to clear old pages:', deleteError);
    return designId;
  }

  if (design.pages.length > 0) {
    const pageRows = design.pages.map((p, index) => ({
      design_id: designId,
      page_order: index,
      canvas_data: p.canvas_data ?? null,
      thumbnail: p.thumbnail ?? null,
    }));

    const { error: pagesError } = await supabase
      .from('design_pages')
      .insert(pageRows);

    if (pagesError) {
      console.error('Failed to save pages:', pagesError);
    }
  }

  return designId;
};

export const deleteUserDesign = async (designId: string) => {
  const { error } = await supabase
    .from('designs')
    .delete()
    .eq('id', designId);

  if (error) {
    console.error('Failed to delete design:', error);
  }
};
