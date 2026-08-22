-- CUTiS-IQ Bring-Your-Own-API-Key (BYOK) storage
-- Stores AES-256-GCM encrypted API keys per user/provider. Encryption and
-- decryption both happen server-side only (see src/lib/crypto/apiKeyCrypto.ts)
-- — this table never holds a plaintext key. Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'anthropic')),
    encrypted_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, provider)
);
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own api keys" ON public.user_api_keys
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
