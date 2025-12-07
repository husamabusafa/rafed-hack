import { HsafaChat, HsafaProvider, ContentContainer, useHsafa } from "@hsafa/ui-sdk";
import { useState, useMemo, useRef, useEffect } from 'react';
import { createPresentationTools, EMPTY_PRESENTATION, type PresentationState } from '../tools/presentationTools';
import { PresentationDisplay } from '../components/PresentationDisplay';

const AGENT_ID = 'cmisy479x0001qglw77xrr8pw';
const AGENT_BASE_URL = import.meta.env.VITE_AGENT_BASE_URL || 'http://localhost:3900';

export default function Home() {
  return (
    <HsafaProvider baseUrl={AGENT_BASE_URL}>
      <ContentContainer>
        <HomeContent />
      </ContentContainer>
    </HsafaProvider>
  );
}

function HomeContent() {
  const [presentationState, setPresentationState] = useState<PresentationState>(EMPTY_PRESENTATION);
  const presentationStateRef = useRef(presentationState);
  const { isAnyChatOpen } = useHsafa();

  useEffect(() => {
    presentationStateRef.current = presentationState;
  }, [presentationState]);

  const presentationTools = useMemo(
    () => createPresentationTools(() => presentationStateRef.current, setPresentationState),
    [setPresentationState]
  );

  return (
    <>
      <div style={{
        flex: 1,
        padding: '24px',
        overflow: 'auto'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: '24px',
          letterSpacing: '-0.02em'
        }}>
          Presentation Builder
        </h1>
        
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
