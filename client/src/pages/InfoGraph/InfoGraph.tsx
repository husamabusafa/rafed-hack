import { HsafaChat, HsafaProvider, ContentContainer, useHsafa } from "@hsafa/ui-sdk";
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPresentationTools, EMPTY_PRESENTATION, type PresentationState } from '../../tools/presentationTools';
import { PresentationDisplay } from '../../components/PresentationDisplay';
import { savePresentationVersion, loadLatestPresentation } from '../../utils/presentationStorage';

const AGENT_ID = import.meta.env.VITE_AGENT_ID_INFOGRAPH || 'cmisy479x0001qglw77xrr8pw';
const AGENT_BASE_URL = import.meta.env.VITE_HSAFA_BASE_URL || 'http://localhost:3900';

export default function InfoGraph() {
  return (
    <HsafaProvider baseUrl={AGENT_BASE_URL}>
      <ContentContainer>
        <InfoGraphContent />
      </ContentContainer>
    </HsafaProvider>
  );
}

function InfoGraphContent() {
  const [presentationState, setPresentationState] = useState<PresentationState>(EMPTY_PRESENTATION);
  const presentationStateRef = useRef(presentationState);
  const { currentChatId, isAnyChatOpen } = useHsafa();
  const readStoredChatId = useCallback(() => {
    try { return localStorage.getItem(`hsafaChat_${AGENT_ID}.currentChatId`); } catch { return null; }
  }, []);
  const resolveActiveChatId = useCallback(() => (currentChatId || readStoredChatId() || undefined) as string | undefined, [currentChatId, readStoredChatId]);

  useEffect(() => {
    presentationStateRef.current = presentationState;
  }, [presentationState]);

  // Load latest presentation when chat changes or on mount
  useEffect(() => {
    const id = resolveActiveChatId();
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        console.log('[Presentation] Loading latest presentation for chat', id);
        const latest = await loadLatestPresentation(String(id));
        if (cancelled) return;
        setPresentationState(latest || EMPTY_PRESENTATION);
        console.log('[Presentation] Loaded latest presentation result', { chatId: id, hasLatest: !!latest, slidesCount: latest ? latest.slides.length : 0 });
      } catch (e) {
        console.error('[Presentation] LoadLatest error', e);
      }
    })();
    return () => { cancelled = true; };
  }, [currentChatId, isAnyChatOpen, resolveActiveChatId]);

  const presentationTools = useMemo(
    () => createPresentationTools(() => presentationStateRef.current, setPresentationState),
    [setPresentationState]
  );

  // Debounced autosave of the latest presentation for the active chat
  const autosaveTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const id = resolveActiveChatId();
    if (!id || !isAnyChatOpen) return;
    if (autosaveTimerRef.current) { window.clearTimeout(autosaveTimerRef.current); }
    console.log('[Presentation] Autosave scheduled for chat', id);
    autosaveTimerRef.current = window.setTimeout(async () => {
      try {
        const summary = { slidesCount: presentationStateRef.current.slides.length };
        console.log('[Presentation] Autosave firing', { chatId: id, messageId: '__latest', summary });
        await savePresentationVersion(String(id), '__latest', presentationStateRef.current);
        console.log('[Presentation] Autosave done', { chatId: id });
      } catch (e) {
        console.error('[Presentation] AutoSave error', e);
      }
    }, 800);
    return () => {
      if (autosaveTimerRef.current) { window.clearTimeout(autosaveTimerRef.current); }
    };
  }, [presentationState, currentChatId, isAnyChatOpen, resolveActiveChatId]);

  return (
    <>
      <div style={{
        flex: 1,
        padding: '24px',
        overflow: 'auto'
      }}>
     
        {/* Presentation Display */}
        {!isAnyChatOpen && presentationState.slides.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '500px',
            background: 'linear-gradient(135deg, #1a1b1e 0%, #17181c 100%)',
            border: '2px dashed #2A2C33',
            borderRadius: '16px',
            padding: '48px 24px',
          }}>
            <div style={{ textAlign: 'center', maxWidth: '500px' }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>
                Open the chat to start building
              </h3>
              <p style={{ marginTop: '12px', color: '#888', fontSize: '14px', lineHeight: '1.6' }}>
                Ask the AI to create presentation slides with images and titles.
              </p>
            </div>
          </div>
        ) : (
          <PresentationDisplay slides={presentationState.slides} />
        )}
      </div>
      
      <HsafaChat
        agentId={AGENT_ID}
        theme="dark"
        title="Presentation Builder Assistant"
        placeholder="Ask me to create presentation slides..."
        primaryColor="#6366F1"
        accentColor="#8B5CF6"
        alwaysOpen={true}
        expandable={false}
        HsafaTools={presentationTools}
        HsafaUI={{}}
        presetPrompts={[
          {
            label: "📊 Sample Presentation",
            prompt: "Create a 3-slide presentation about data analytics with sample images"
          },
          {
            label: "📈 Business Slides",
            prompt: "Generate presentation slides showing our key metrics and charts"
          },
          {
            label: "👁️ View Slides",
            prompt: "Show me the current presentation slides"
          }
        ]}
      />
    </>
  );
}
