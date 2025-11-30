const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function submitFeedback(rating, comment) {
  if (!isSupabaseConfigured) {
    return {
      error: new Error(
        'Supabase не настроен: заполните VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env'
      ),
    };
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/detective_sql_csat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ stars: rating, comment }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: new Error(
          errorText || 'Не удалось отправить отзыв: неизвестная ошибка Supabase'
        ),
      };
    }

    return { error: null };
  } catch (error) {
    const fallbackMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка запроса к Supabase';
    return { error: new Error(fallbackMessage) };
  }
}
