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
import { createDashboardTools } from './components/DashboardBuilderTools';
import type { ComponentUnderLoading, DashboardComponent, DashboardState } from './types/types';
import { ComponentRenderer } from './components/ComponentRenderer';
import { EmptyGridArea } from './components/EmptyGridArea';
import { HsafaUI } from './components/HsafaUIMapping';

type SetState<T> = (updater: T | ((prev: T) => T)) => void;

const EMPTY_DASHBOARD: DashboardState = {
  grid: {
    columns: '',
    rows: '',
    gap: '16px',
    templateAreas: []
  },
  components: {},
  componentsUnderLoading: [],
  metadata: {
    name: 'New Dashboard',
    description: 'Ask AI to create your dashboard',
    createdAt: new Date().toISOString(),
  }
};

const dashboardStore = createHsafaArtifactStore<DashboardState>({
  namespace: 'dashboards',
  legacyDecode: (raw: string) => {
    try {
      const parsed = JSON.parse(raw) as {
        chatId?: unknown;
        messageId?: unknown;
        updatedAt?: unknown;
        dashboard?: unknown;
      };

      if (typeof parsed.chatId !== 'string' || parsed.chatId.length === 0) return null;
      if (typeof parsed.messageId !== 'string' || parsed.messageId.length === 0) return null;
      if (!parsed.dashboard) return null;

      return {
        chatId: parsed.chatId,
        versionId: parsed.messageId,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined,
        value: parsed.dashboard as DashboardState,
      };
    } catch {
      return null;
    }
  },
});

const AGENT_ID = import.meta.env.VITE_AGENT_ID_DASHBOARD || 'cmiqj4p0w0004qgg4g71gza8w';
const AGENT_BASE_URL = import.meta.env.VITE_HSAFA_BASE_URL || 'http://localhost:3900';

export default function DashboardPage() {
  return (
    <HsafaProvider baseUrl={AGENT_BASE_URL}>
      <ContentContainer>
        <DashboardContent />
      </ContentContainer>
    </HsafaProvider>
  );
}

function DashboardContent() {
  const activeChat = useHsafaActiveChatId({ agentId: AGENT_ID });
  const activeChatId = activeChat.chatId;

  const { value: dashboardState, setValue: setDashboardState } = useChatArtifact<DashboardState>({
    agentId: AGENT_ID,
    chatId: activeChatId,
    initial: EMPTY_DASHBOARD,
    store: dashboardStore,
    saveDebounceMs: 800,
  });

  const versioning = useChatArtifactVersioning<DashboardState>({
    chatId: activeChatId,
    store: dashboardStore,
    value: dashboardState,
    setValue: setDashboardState,
    initial: EMPTY_DASHBOARD,
  });

  const dashboardTools = useHsafaTools({
    state: dashboardState,
    setState: setDashboardState,
    tools: ({
      get,
      set,
    }: {
      get: () => DashboardState;
      set: SetState<DashboardState>;
    }) => createDashboardTools(get, set),
  });

  const rawAreas: string[] = dashboardState.grid.templateAreas
    .join(' ')
    .split(/\s+/)
    .filter((area) => area.length > 0 && area !== '.');

  const gridAreas: string[] = Array.from(new Set<string>(rawAreas));

  const gridAreasWithComponents: Array<{
    area: string;
    component?: DashboardComponent;
    loading?: ComponentUnderLoading;
  }> = gridAreas.map((area) => ({
    area,
    component: (Object.values(dashboardState.components) as DashboardComponent[]).find((c) => c.gridArea === area),
    loading: ((dashboardState.componentsUnderLoading || []) as ComponentUnderLoading[])
      .slice()
      .reverse()
      .find((l) => l.gridArea === area),
  }));

  return (
    <>
      <div style={{
        flex: 1,
        padding: '24px',
        overflow: 'auto'
      }}>
        {!activeChatId ? (
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
              <div style={{ 
                display: 'inline-flex',
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                marginBottom: '24px'
              }}>
                <Icon icon="lucide:message-square" style={{ fontSize: '64px', color: '#6366F1', opacity: 0.9 }} />
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>Open the chat to view this dashboard</h3>
              <p style={{ marginTop: '12px', color: '#888', fontSize: '14px', lineHeight: '1.6' }}>Each chat has its own dashboard. Open or switch chats to see their dashboards.</p>
            </div>
          </div>
        ) : gridAreas.length === 0 ? (
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
            <div style={{ textAlign: 'center', maxWidth: '550px' }}>
              <div style={{ 
                display: 'inline-flex',
                padding: '24px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                marginBottom: '28px',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)'
              }}>
                <Icon icon="lucide:layout-dashboard" style={{ fontSize: '72px', color: '#6366F1' }} />
              </div>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '28px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em'
              }}>
                No Dashboard Yet
              </h3>
              <p style={{
                margin: '0 0 32px 0',
                fontSize: '15px',
                color: '#999',
                lineHeight: '1.7'
              }}>
                Start by asking the AI to create a grid layout for your dashboard.
                The AI will help you design and populate it with components.
              </p>
              <div style={{
                padding: '20px 24px',
                background: 'rgba(99, 102, 241, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                textAlign: 'left'
              }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#6366F1', 
                  marginBottom: '12px', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Icon icon="lucide:sparkles" style={{ fontSize: '16px' }} />
                  Try asking:
                </div>
                <div style={{ fontSize: '14px', color: '#AAA', lineHeight: '2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <Icon icon="lucide:check" style={{ fontSize: '16px', color: '#6366F1', flexShrink: 0 }} />
                    <span>"Create a 2x2 grid layout"</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <Icon icon="lucide:check" style={{ fontSize: '16px', color: '#6366F1', flexShrink: 0 }} />
                    <span>"Set up a dashboard with header and main area"</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon icon="lucide:check" style={{ fontSize: '16px', color: '#6366F1', flexShrink: 0 }} />
                    <span>"Make a 3-column layout with sidebar"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: dashboardState.grid.columns,
              gridTemplateRows: dashboardState.grid.rows,
              gap: dashboardState.grid.gap,
              gridTemplateAreas: dashboardState.grid.templateAreas.map(area => `"${area}"`).join(' '),
              minHeight: '500px',
              width: '100%'
            }}
          >
            {gridAreasWithComponents.map(({ area, component, loading }) => (
              component ? (
                <ComponentRenderer
                  key={component.id}
                  component={component}
                />
              ) : (
                <EmptyGridArea
                  key={area}
                  gridArea={area}
                  loading={loading}
                />
              )
            ))}
          </div>
        )}
      </div>
      
      <HsafaChat
        agentId={AGENT_ID}
        theme="dark"
        title="Dashboard Builder Assistant"
        placeholder="Describe the dashboard you want to build..."
        primaryColor="#6366F1"
        accentColor="#8B5CF6"
        alwaysOpen={true}
        expandable={false}
        HsafaTools={dashboardTools}
        HsafaUI={HsafaUI}
        onMessagesChange={(messages: unknown[], chatId?: string) => {
          void versioning.onMessagesChange(messages, chatId);
        }}
        onFinish={(payload: unknown) => {
          void versioning.onFinish(payload);
        }}
        presetPrompts={[
    {
      label: "👥 Student Analytics",
      prompt: "Create a student analytics dashboard with: 1) A 3-column grid, 2) KPI cards showing total students, total schools, and unassigned students, 3) A bar chart of students by region, 4) A pie chart of students by gender"
    },
    {
      label: "🚌 Transport Dashboard",
      prompt: "Build a transport dashboard with: 1) KPIs for total routes, average utilization, and total capacity, 2) A bar chart showing routes by vehicle type, 3) A table showing top 10 routes by utilization"
    },
    {
      label: "📞 Complaints Overview",
      prompt: "Create a complaints dashboard showing: 1) Total complaints KPI, 2) Bar chart of complaints by region, 3) Pie chart of complaints by category, 4) Table of top complaint reasons"
    },
    {
      label: "🎯 Simple Grid",
      prompt: "Create a 2-column, 2-row grid layout with areas named: kpi1, kpi2, chart1, chart2"
    },
    {
      label: "📊 Quick Stats",
      prompt: "Show me: 1) Total students count, 2) Total schools count, 3) Total routes count - all as KPI cards in a simple layout"
    }
  ]}
      />
    </>
  );
}
