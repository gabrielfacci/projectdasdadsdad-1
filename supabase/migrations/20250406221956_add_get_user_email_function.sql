
-- Função para obter email do usuário pelo ID
CREATE OR REPLACE FUNCTION get_user_email_by_id(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_email text;
BEGIN
  -- Verificar parâmetros
  IF p_user_id IS NULL OR p_user_id = '00000000-0000-0000-0000-000000000000' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ID de usuário inválido',
      'email', NULL
    );
  END IF;
  
  -- Obter email na tabela auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Construir resposta
  IF v_email IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'email', v_email
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuário não encontrado',
      'email', NULL
    );
  END IF;
EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'email', NULL
    );
END;
$$;

-- Conceder permissão para função
GRANT EXECUTE ON FUNCTION get_user_email_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email_by_id(uuid) TO service_role;
