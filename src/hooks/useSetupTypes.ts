import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SetupType {
  id: string;
  user_id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSetupTypeData {
  code: string;
  name: string;
  description?: string;
}

export function useSetupTypes() {
  const { user } = useAuth();
  const [setupTypes, setSetupTypes] = useState<SetupType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSetupTypes = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('setup_types')
        .select('*')
        .eq('user_id', user.id)
        .order('code');

      if (error) throw error;
      setSetupTypes(data || []);
    } catch (error) {
      console.error('Error fetching setup types:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSetupTypes();
  }, [fetchSetupTypes]);

  const createSetupType = async (data: CreateSetupTypeData): Promise<SetupType | null> => {
    if (!user) return null;

    // Normalize code: uppercase, trimmed
    const normalizedCode = data.code.toUpperCase().trim();
    const normalizedName = data.name.trim();

    // Validate code format
    if (!/^[A-Z0-9]{2,6}$/.test(normalizedCode)) {
      toast.error('Code must be 2-6 uppercase letters/numbers');
      return null;
    }

    // Check for duplicates
    const existing = setupTypes.find(s => s.code === normalizedCode);
    if (existing) {
      toast.error(`Setup type "${normalizedCode}" already exists`);
      return null;
    }

    try {
      const { data: newSetup, error } = await supabase
        .from('setup_types')
        .insert({
          user_id: user.id,
          code: normalizedCode,
          name: normalizedName,
          description: data.description?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setSetupTypes(prev => [...prev, newSetup].sort((a, b) => a.code.localeCompare(b.code)));
      toast.success(`Setup type "${normalizedCode}" created`);
      return newSetup;
    } catch (error: any) {
      console.error('Error creating setup type:', error);
      if (error.code === '23505') {
        toast.error(`Setup type "${normalizedCode}" already exists`);
      } else {
        toast.error('Failed to create setup type');
      }
      return null;
    }
  };

  const updateSetupType = async (id: string, data: Partial<CreateSetupTypeData & { is_active: boolean }>): Promise<boolean> => {
    try {
      const updateData: Record<string, any> = {};
      
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.description !== undefined) updateData.description = data.description?.trim() || null;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      // Note: code cannot be changed once created

      const { error } = await supabase
        .from('setup_types')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchSetupTypes();
      toast.success('Setup type updated');
      return true;
    } catch (error) {
      console.error('Error updating setup type:', error);
      toast.error('Failed to update setup type');
      return false;
    }
  };

  const deactivateSetupType = async (id: string): Promise<boolean> => {
    return updateSetupType(id, { is_active: false });
  };

  const reactivateSetupType = async (id: string): Promise<boolean> => {
    return updateSetupType(id, { is_active: true });
  };

  // Get active setup types for dropdowns
  const activeSetupTypes = setupTypes.filter(s => s.is_active);

  // Get setup by ID (for display)
  const getSetupById = (id: string): SetupType | undefined => {
    return setupTypes.find(s => s.id === id);
  };

  // Get setup by code (for backward compatibility)
  const getSetupByCode = (code: string): SetupType | undefined => {
    return setupTypes.find(s => s.code === code);
  };

  return {
    setupTypes,
    activeSetupTypes,
    loading,
    fetchSetupTypes,
    createSetupType,
    updateSetupType,
    deactivateSetupType,
    reactivateSetupType,
    getSetupById,
    getSetupByCode,
  };
}
