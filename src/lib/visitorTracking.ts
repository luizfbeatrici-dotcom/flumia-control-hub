import { supabase } from "@/integrations/supabase/client";

// Gera um ID de sessão único ou recupera existente
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem("flumia_session_id");
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("flumia_session_id", sessionId);
  }
  
  return sessionId;
};

// Obtém parâmetros UTM da URL
export const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
};

// Registra ou atualiza visitante
export const trackVisitor = async (cookieConsent: boolean) => {
  try {
    const sessionId = getSessionId();
    const utmParams = getUtmParams();
    
    // Verifica se já existe registro para esta sessão
    const { data: existingVisitor } = await supabase
      .from("landing_page_visitors")
      .select("id, page_views")
      .eq("session_id", sessionId)
      .single();

    if (existingVisitor) {
      // Atualiza visitante existente
      await supabase
        .from("landing_page_visitors")
        .update({
          last_visit: new Date().toISOString(),
          page_views: (existingVisitor.page_views || 0) + 1,
          cookie_consent: cookieConsent,
        })
        .eq("id", existingVisitor.id);
    } else {
      // Cria novo registro de visitante
      await supabase
        .from("landing_page_visitors")
        .insert({
          session_id: sessionId,
          cookie_consent: cookieConsent,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          ...utmParams,
        });
    }
  } catch (error) {
    console.error("Erro ao rastrear visitante:", error);
  }
};

// Atualiza informações de contato do visitante
export const updateVisitorContact = async (contactData: {
  nome?: string;
  email?: string;
  telefone?: string;
  interesse?: string;
}) => {
  try {
    const sessionId = getSessionId();
    
    await supabase
      .from("landing_page_visitors")
      .update(contactData)
      .eq("session_id", sessionId);
  } catch (error) {
    console.error("Erro ao atualizar contato do visitante:", error);
  }
};
