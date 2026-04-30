-- Add user_id column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create user_api_keys table to store API keys securely
CREATE TABLE public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  gemini_key TEXT,
  chatgpt_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_api_keys
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all access to conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow all access to messages" ON public.messages;

-- Create secure RLS policies for conversations
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
ON public.conversations FOR DELETE
USING (auth.uid() = user_id);

-- Create secure RLS policies for messages (via conversation ownership)
CREATE POLICY "Users can view messages in own conversations"
ON public.messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE id = messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert messages in own conversations"
ON public.messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE id = messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update messages in own conversations"
ON public.messages FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE id = messages.conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete messages in own conversations"
ON public.messages FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE id = messages.conversation_id AND user_id = auth.uid()
));

-- Create secure RLS policies for user_api_keys
CREATE POLICY "Users can view own api keys"
ON public.user_api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys"
ON public.user_api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys"
ON public.user_api_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys"
ON public.user_api_keys FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on user_api_keys
CREATE TRIGGER update_user_api_keys_updated_at
BEFORE UPDATE ON public.user_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();