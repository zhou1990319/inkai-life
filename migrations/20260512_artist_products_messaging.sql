-- =============================================
-- Artist Products & Messaging Tables
-- 艺术家产品 + 私信系统
-- =============================================

-- 艺术家产品表
CREATE TABLE IF NOT EXISTS public.artist_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    product_link TEXT,
    price TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 私信对话表
CREATE TABLE IF NOT EXISTS public.artist_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, artist_id)
);

-- 私信消息表
CREATE TABLE IF NOT EXISTS public.artist_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.artist_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_artist_products_artist_id ON public.artist_products(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_conversations_user_id ON public.artist_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_conversations_artist_id ON public.artist_conversations(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_messages_conversation_id ON public.artist_messages(conversation_id);

-- RLS
ALTER TABLE public.artist_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_messages ENABLE ROW LEVEL SECURITY;

-- 艺术家产品：所有人可见，艺术家可编辑
CREATE POLICY "Anyone can view artist products"
    ON public.artist_products FOR SELECT USING (true);

CREATE POLICY "Artists can manage own products"
    ON public.artist_products FOR ALL
    USING (auth.uid() = artist_id);

-- 对话：参与者可见
CREATE POLICY "Participants can view conversations"
    ON public.artist_conversations FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = artist_id);

CREATE POLICY "Users can create conversations"
    ON public.artist_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() = artist_id);

-- 消息：对话参与者可见，发送者可发消息
CREATE POLICY "Participants can view messages"
    ON public.artist_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.artist_conversations
            WHERE id = conversation_id
            AND (user_id = auth.uid() OR artist_id = auth.uid())
        )
    );

CREATE POLICY "Participants can send messages"
    ON public.artist_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.artist_conversations
            WHERE id = conversation_id
            AND (user_id = auth.uid() OR artist_id = auth.uid())
        )
    );

CREATE POLICY "Recipients can mark messages as read"
    ON public.artist_messages FOR UPDATE
    USING (
        auth.uid() = sender_id OR
        EXISTS (
            SELECT 1 FROM public.artist_conversations
            WHERE id = conversation_id
            AND (user_id = auth.uid() OR artist_id = auth.uid())
        )
    );

-- 更新对话最后消息的触发器
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.artist_conversations
    SET last_message = NEW.content,
        last_message_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
    AFTER INSERT ON public.artist_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

COMMENT ON TABLE public.artist_products IS 'Tattoo artist products for sale';
COMMENT ON TABLE public.artist_conversations IS 'Direct message conversations between users and artists';
COMMENT ON TABLE public.artist_messages IS 'Individual messages in artist conversations';
