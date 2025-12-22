import {
  ContentContainer,
  createHsafaArtifactStore,
  HsafaChat,
  HsafaProvider,
  useChatArtifact,
  useChatArtifactVersioning,
  useHsafaActiveChatId,
  useHsafaTools,
} from '@hsafa/ui-sdk';
import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { PresentationDisplay } from '../../components/PresentationDisplay';
import { createPresentationTools, EMPTY_PRESENTATION, type PresentationState } from '../../tools/presentationTools';

const AGENT_ID = import.meta.env.VITE_AGENT_ID_PRESENTATION || 'cmisy479x0001qglw77xrr8pw';
const AGENT_BASE_URL = import.meta.env.VITE_HSAFA_BASE_URL || 'http://localhost:3900';

type SetState<T> = (updater: T | ((prev: T) => T)) => void;

type ToolUIProps = {
  input: unknown;
  toolName: string;
  toolCallId: string;
  output?: unknown;
  status?: string;
};

const presentationStore = createHsafaArtifactStore<PresentationState>({
  namespace: 'presentations',
});

const asRecord = (v: unknown): Record<string, unknown> => {
  if (v && typeof v === 'object') return v as Record<string, unknown>;
  return {};
};

const getString = (obj: Record<string, unknown>, key: string) => {
  const v = obj[key];
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
};

const getNested = (obj: Record<string, unknown>, ...keys: string[]): unknown => {
  let cur: unknown = obj;
  for (const k of keys) {
    const rec = asRecord(cur);
    cur = rec[k];
    if (cur === undefined || cur === null) return cur;
  }
  return cur;
};

const isRunningStatus = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (!s) return false;
  if (s === 'input-streaming') return true;
  if (s === 'input-available') return true;
  if (s.includes('run') || s.includes('pending') || s.includes('loading') || s.includes('stream')) return true;
  return false;
};

const getStatusBadge = (status?: string, hasOutput?: boolean) => {
  const s = (status || '').toLowerCase();
  if (s === 'input-streaming') {
    return { label: 'Generating…', bg: 'rgba(99,102,241,0.14)', border: 'rgba(99,102,241,0.35)', color: '#A78BFA', running: true };
  }
  if (s === 'input-available') {
    return { label: 'Starting…', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.35)', color: '#38BDF8', running: true };
  }
  if (s.includes('run') || s.includes('pending') || s.includes('loading') || s.includes('stream')) {
    return { label: 'In progress', bg: 'rgba(99,102,241,0.14)', border: 'rgba(99,102,241,0.35)', color: '#A78BFA', running: true };
  }
  if (s === 'output-available' || s.includes('success') || s.includes('done') || s.includes('complete')) {
    return { label: 'Done', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.35)', color: '#22C55E', running: false };
  }
  if (s.includes('error') || s.includes('fail')) {
    return { label: 'Error', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', color: '#EF4444', running: false };
  }
  if (!s && !hasOutput) {
    return { label: 'In progress', bg: 'rgba(99,102,241,0.14)', border: 'rgba(99,102,241,0.35)', color: '#A78BFA', running: true };
  }
  return { label: status || '—', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', color: '#CBD5E1', running: false };
};

const extractImageUrl = (value: unknown): string | undefined => {
  const rec = asRecord(value);

  const direct = getString(rec, 'image') || getString(rec, 'url') || getString(rec, 'imageUrl');
  if (direct) return direct;

  const data = asRecord(rec.data);
  const dataUrl = getString(data, 'image') || getString(data, 'url') || getString(data, 'imageUrl');
  if (dataUrl) return dataUrl;

  const result = getNested(rec, 'result');
  const resultRec = asRecord(result);
  const resultUrl = getString(resultRec, 'image') || getString(resultRec, 'url') || getString(resultRec, 'imageUrl');
  if (resultUrl) return resultUrl;

  return undefined;
};

function ToolCard(props: ToolUIProps & { title: string; icon: string; summary?: string; children?: ReactNode; badgeOverride?: ReturnType<typeof getStatusBadge> }) {
  const badge = props.badgeOverride || getStatusBadge(props.status, props.output !== undefined);
  return (
    <div style={{
      borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'linear-gradient(135deg, rgba(26,27,30,0.9) 0%, rgba(23,24,28,0.95) 100%)',
      padding: '14px 14px',
      marginTop: '10px',
      boxShadow: badge.running
        ? '0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(99,102,241,0.28)'
        : '0 12px 40px rgba(0,0,0,0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))',
            border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon icon={props.icon} style={{ fontSize: '18px', color: '#A78BFA' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: 0
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {props.title}
              </div>
              <code style={{
                fontSize: '11px',
                color: '#AAA',
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.04)'
              }}>
                {props.toolName}
              </code>
            </div>
            {props.summary ? (
              <div style={{
                fontSize: '12px',
                color: '#9CA3AF',
                marginTop: '4px',
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {props.summary}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '999px',
          backgroundColor: badge.bg,
          border: `1px solid ${badge.border}`,
          color: badge.color,
          textTransform: 'capitalize',
          flexShrink: 0
        }}>
          {badge.label}
        </div>
      </div>

      {props.children}
    </div>
  );
}

function ImageGeneratorToolUI(props: ToolUIProps) {
  const input = asRecord(props.input);
  const prompt = getString(input, 'prompt') || getString(input, 'description') || getString(input, 'text');
  const imageUrl = extractImageUrl(props.output) || extractImageUrl(props.input);

  const isLoading = !imageUrl;
  const badgeOverride = isLoading
    ? {
        label: 'Generating…',
        bg: 'rgba(99,102,241,0.14)',
        border: 'rgba(99,102,241,0.35)',
        color: '#A78BFA',
        running: true,
      }
    : undefined;

  return (
    <ToolCard
      {...props}
      title={isLoading ? 'Generating image…' : 'Image ready'}
      icon={isLoading ? 'lucide:loader-2' : 'lucide:image'}
      summary={prompt ? `Prompt: ${prompt}` : 'Creating a slide visual'}
      badgeOverride={badgeOverride}
    >
      <style>
        {'@keyframes hsafaSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}
      </style>
      {isLoading ? (
        <div style={{
          marginTop: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(0,0,0,0.18)',
          padding: '14px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#CBD5E1'
        }}>
          <Icon icon="lucide:loader-2" style={{ fontSize: '18px', color: '#A78BFA', animation: 'hsafaSpin 1s linear infinite' }} />
          <div style={{ fontSize: '12px', fontWeight: 700 }}>Generating the image…</div>
        </div>
      ) : null}

      {imageUrl ? (
        <div style={{
          marginTop: '12px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(0,0,0,0.18)',
          overflow: 'hidden'
        }}>
          <img
            src={imageUrl}
            alt="Generated"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      ) : null}
    </ToolCard>
  );
}

function SetPresentationSlidesUI(props: ToolUIProps) {
  const input = asRecord(props.input);
  const slides = input.slides;
  const slidesCount = Array.isArray(slides) ? slides.length : undefined;
  const running = isRunningStatus(props.status);

  return (
    <ToolCard
      {...props}
      title={running ? 'Updating slides' : 'Slides updated'}
      icon={running ? 'lucide:loader-2' : 'lucide:layout-template'}
      summary={typeof slidesCount === 'number' ? `${slidesCount} slide(s)` : undefined}
    />
  );
}

const HsafaUI: Record<string, (props: ToolUIProps) => ReactNode> = {
  set_presentation_slides: SetPresentationSlidesUI,
  imageGenerator: ImageGeneratorToolUI,
  'tool-imageGenerator': ImageGeneratorToolUI,
  generate_image: ImageGeneratorToolUI,
  create_image: ImageGeneratorToolUI,
  image_generator: ImageGeneratorToolUI,
  generate_slide_image: ImageGeneratorToolUI,
  generate_infographic_image: ImageGeneratorToolUI,
  generate_presentation_image: ImageGeneratorToolUI,
};

export default function PresentaionBuilder() {
  return (
    <HsafaProvider baseUrl={AGENT_BASE_URL}>
      <ContentContainer>
        <PresentaionBuilderContent />
      </ContentContainer>
    </HsafaProvider>
  );
}

function PresentaionBuilderContent() {
  const activeChat = useHsafaActiveChatId({ agentId: AGENT_ID });
  const activeChatId = activeChat.chatId;

  const [stableChatId, setStableChatId] = useState<string | undefined>(activeChatId);

  useEffect(() => {
    if (!activeChatId) return;
    const timer = window.setTimeout(() => {
      setStableChatId(activeChatId);
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [activeChatId]);

  const { value: presentationState, setValue: setPresentationState } = useChatArtifact<PresentationState>({
    agentId: AGENT_ID,
    chatId: stableChatId,
    initial: EMPTY_PRESENTATION,
    store: presentationStore,
    saveDebounceMs: 800,
  });

  const versioning = useChatArtifactVersioning<PresentationState>({
    chatId: stableChatId,
    store: presentationStore,
    value: presentationState,
    setValue: setPresentationState,
    initial: EMPTY_PRESENTATION,
  });

  const presentationTools = useHsafaTools({
    state: presentationState,
    setState: setPresentationState as unknown as SetState<PresentationState>,
    tools: ({
      get,
      set,
    }: {
      get: () => PresentationState;
      set: SetState<PresentationState>;
    }) => createPresentationTools(get, set),
  });

  return (
    <>
      <div style={{
        flex: 1,
        padding: '24px',
        overflow: 'auto'
      }}>

        {!stableChatId && presentationState.slides.length === 0 ? (
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
            <div style={{ textAlign: 'center', maxWidth: '520px' }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>
                Open the chat to start building
              </h3>
              <p style={{ marginTop: '12px', color: '#888', fontSize: '14px', lineHeight: '1.6' }}>
                Each chat keeps its own slides. Ask the assistant to generate images and titles.
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
        title="Presentation Builder"
        placeholder="Describe the slides you want…"
        primaryColor="#6366F1"
        accentColor="#8B5CF6"
        alwaysOpen={true}
        expandable={false}
        HsafaTools={presentationTools}
        HsafaUI={HsafaUI}
        onMessagesChange={(messages: unknown[], chatId?: string) => {
          if (chatId) setStableChatId(chatId);
          void versioning.onMessagesChange(messages, chatId);
        }}
        onFinish={(payload: unknown) => {
          void versioning.onFinish(payload);
        }}
        presetPrompts={[
          {
            label: "📊 Sample deck",
            prompt: "Create a 3-slide deck with: 1) Executive summary, 2) Key metrics, 3) Next steps. Each slide should have an image and a concise title."
          },
          {
            label: "🖼️ Regenerate images",
            prompt: "Regenerate the slide images with a more modern, clean style."
          },
          {
            label: "👁️ Show slides",
            prompt: "Show me the current slides."
          }
        ]}
      />
    </>
  );
}
