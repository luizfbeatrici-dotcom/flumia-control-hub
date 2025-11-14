import { supabase } from "@/integrations/supabase/client";

// Variáveis de tracking da sessão
let sessionStartTime: number | null = null;
let sessionEvents: any[] = [];
let maxScrollDepth = 0;
let sectionsViewed: { [key: string]: number } = {};
let trackingInterval: NodeJS.Timeout | null = null;

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

// Registra um evento de interação
export const trackEvent = (eventType: string, elementId?: string, elementText?: string, metadata?: any) => {
  const event = {
    type: eventType,
    element_id: elementId,
    element_text: elementText,
    timestamp: new Date().toISOString(),
    metadata
  };
  
  sessionEvents.push(event);
};

// Calcula scroll depth
const updateScrollDepth = () => {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  
  const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
  maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);
};

// Rastreia visualização de seções
export const trackSectionView = (sectionId: string) => {
  if (!sectionsViewed[sectionId]) {
    sectionsViewed[sectionId] = Date.now();
  }
};

// Salva dados de tracking
const saveTrackingData = async () => {
  if (!sessionStartTime) return;
  
  try {
    const sessionId = getSessionId();
    const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
    
    await supabase
      .from("landing_page_visitors")
      .update({
        session_duration: sessionDuration,
        session_events: sessionEvents,
        scroll_depth: maxScrollDepth,
        sections_viewed: sectionsViewed,
      })
      .eq("session_id", sessionId);
  } catch (error) {
    console.error("Erro ao salvar dados de tracking:", error);
  }
};

// Inicia tracking da sessão
export const startSessionTracking = () => {
  if (sessionStartTime) return; // Já iniciado
  
  sessionStartTime = Date.now();
  
  // Listener de scroll
  const handleScroll = () => {
    updateScrollDepth();
  };
  
  window.addEventListener("scroll", handleScroll, { passive: true });
  
  // Salvar dados antes de sair
  const handleBeforeUnload = () => {
    saveTrackingData();
  };
  
  window.addEventListener("beforeunload", handleBeforeUnload);
  
  // Salvar dados periodicamente (a cada 10 segundos)
  trackingInterval = setInterval(() => {
    saveTrackingData();
  }, 10000);
  
  // Cleanup
  return () => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("beforeunload", handleBeforeUnload);
    if (trackingInterval) clearInterval(trackingInterval);
  };
};

// Finaliza tracking da sessão
export const endSessionTracking = async () => {
  await saveTrackingData();
  
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
};
