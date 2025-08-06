import { supabase } from '@/integrations/supabase/client';

export const setupMissingFunctions = async (): Promise<boolean> => {
  try {
    // Script SQL com todas as funções necessárias
    const setupSQL = `
      -- Função para criar nova unidade
      CREATE OR REPLACE FUNCTION public.create_new_unit(name_param text, password_param text)
      RETURNS uuid
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
        new_unit_id uuid;
      BEGIN
        INSERT INTO units (name, password, score)
        VALUES (name_param, password_param, 0)
        RETURNING id INTO new_unit_id;
        
        RETURN new_unit_id;
      END;
      $$;

      -- Função para autenticar unidade
      CREATE OR REPLACE FUNCTION public.authenticate_unit(unit_name_param text, password_param text)
      RETURNS jsonb
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
        unit_record record;
      BEGIN
        SELECT * INTO unit_record FROM units WHERE name = unit_name_param AND password = password_param;
        
        IF unit_record IS NULL THEN
          RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid credentials'
          );
        END IF;
        
        RETURN jsonb_build_object(
          'success', true,
          'unit_id', unit_record.id,
          'unit_name', unit_record.name,
          'unit_score', unit_record.score
        );
      END;
      $$;

      -- Função para autenticar admin
      CREATE OR REPLACE FUNCTION public.authenticate_admin(username_param text, password_param text)
      RETURNS jsonb
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        IF username_param = 'admin' AND password_param = 'SecureAdmin123!' THEN
          RETURN jsonb_build_object(
            'success', true,
            'admin_id', gen_random_uuid(),
            'username', 'admin'
          );
        ELSE
          RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid credentials'
          );
        END IF;
      END;
      $$;
    `;

    // Nota: Supabase cliente não pode executar DDL diretamente
    // Este script deve ser executado no SQL Editor do painel
    console.log('Execute este script no SQL Editor do Supabase:', setupSQL);
    
    return false; // Retorna false porque precisa ser executado manualmente
  } catch (error) {
    console.error('Erro no setup:', error);
    return false;
  }
};

export const testDatabaseFunctions = async (): Promise<{
  createUnit: boolean;
  authUnit: boolean;
  authAdmin: boolean;
}> => {
  const results = {
    createUnit: false,
    authUnit: false,
    authAdmin: false
  };

  // Teste função create_new_unit
  try {
    await supabase.rpc('create_new_unit', {
      name_param: 'test_function_' + Date.now(),
      password_param: 'test123'
    });
    results.createUnit = true;
  } catch (error) {
    console.log('Função create_new_unit não existe:', error);
  }

  // Teste função authenticate_unit
  try {
    await supabase.rpc('authenticate_unit', {
      unit_name_param: 'test',
      password_param: 'test'
    });
    results.authUnit = true;
  } catch (error) {
    console.log('Função authenticate_unit não existe:', error);
  }

  // Teste função authenticate_admin
  try {
    await supabase.rpc('authenticate_admin', {
      username_param: 'test',
      password_param: 'test'
    });
    results.authAdmin = true;
  } catch (error) {
    console.log('Função authenticate_admin não existe:', error);
  }

  return results;
}; 