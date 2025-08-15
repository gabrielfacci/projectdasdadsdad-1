
CREATE OR REPLACE FUNCTION get_user_licenses_by_email(p_email TEXT)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    license_key TEXT,
    product_code TEXT,
    license_status TEXT,
    created_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.user_id, l.license_key, l.product_code, l.license_status, l.created_at, l.expires_at
    FROM licenses l
    JOIN auth.users u ON l.user_id = u.id
    WHERE u.email = p_email;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to all users
GRANT EXECUTE ON FUNCTION get_user_licenses_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_licenses_by_email(TEXT) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION get_user_licenses_by_email(TEXT) IS 'Returns all licenses for a user by email directly';
