import { supabase } from '@/integrations/supabase/client';

interface AuthResponse {
  success: boolean;
  admin_id?: string;
  username?: string;
  message?: string;
}

interface UnitAuthResponse {
  success: boolean;
  unit_id?: string;
  unit_name?: string;
  unit_score?: number;
  message?: string;
}

/**
 * Authenticate admin using Supabase RPC function
 * This removes hardcoded passwords from client code
 */
export const authenticateAdmin = async (
  username: string,
  password: string
): Promise<{ success: boolean; message: string; adminId?: string }> => {
  try {
    const { data, error } = await supabase.rpc('authenticate_admin', {
      username_param: username,
      password_param: password
    });

    if (error) {
      console.error('Admin authentication error:', error);
      return {
        success: false,
        message: 'Erro ao autenticar. Tente novamente.'
      };
    }

    const response = data as unknown as AuthResponse;
    
    if (response.success) {
      return {
        success: true,
        message: response.message || 'Login bem-sucedido',
        adminId: response.admin_id
      };
    }

    return {
      success: false,
      message: response.message || 'Credenciais inválidas'
    };
  } catch (error) {
    console.error('Admin authentication exception:', error);
    return {
      success: false,
      message: 'Erro de conexão. Verifique sua internet.'
    };
  }
};

/**
 * Verify admin password using Supabase RPC function
 * Used for sensitive operations that require password confirmation
 */
export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  const result = await authenticateAdmin('admin', password);
  return result.success;
};

/**
 * Authenticate unit using Supabase RPC function
 */
export const authenticateUnit = async (
  unitName: string,
  password: string
): Promise<{ 
  success: boolean; 
  message: string; 
  unitId?: string;
  unitName?: string;
  unitScore?: number;
}> => {
  try {
    const { data, error } = await supabase.rpc('authenticate_unit', {
      unit_name_param: unitName,
      password_param: password
    });

    if (error) {
      console.error('Unit authentication error:', error);
      return {
        success: false,
        message: 'Erro ao autenticar. Tente novamente.'
      };
    }

    const response = data as unknown as UnitAuthResponse;
    
    if (response.success) {
      return {
        success: true,
        message: response.message || 'Login bem-sucedido',
        unitId: response.unit_id,
        unitName: response.unit_name,
        unitScore: response.unit_score
      };
    }

    return {
      success: false,
      message: response.message || 'Credenciais inválidas'
    };
  } catch (error) {
    console.error('Unit authentication exception:', error);
    return {
      success: false,
      message: 'Erro de conexão. Verifique sua internet.'
    };
  }
};
