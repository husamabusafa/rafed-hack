import { Icon } from '@iconify/react';
import type { CSSProperties, ReactNode } from 'react';
import type { ToolUIProps } from './HsafaUITypes';

const safeStringify = (v: unknown) => {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    try {
      return String(v);
    } catch {
      return '[unserializable]';
    }
  }
};

const getStatusBadge = (status?: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'input-streaming') {
    return { label: 'Input streaming', bg: 'rgba(99,102,241,0.14)', border: 'rgba(99,102,241,0.35)', color: '#A78BFA' };
  }
  if (s === 'input-available') {
    return { label: 'Input ready', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.35)', color: '#38BDF8' };
  }
  if (s === 'output-available') {
    return { label: 'Output ready', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.35)', color: '#22C55E' };
  }
  if (s.includes('success') || s.includes('done') || s.includes('complete')) {
    return { label: status || 'success', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.35)', color: '#22C55E' };
  }
  if (s.includes('error') || s.includes('fail')) {
    return { label: status || 'error', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', color: '#EF4444' };
  }
  if (s.includes('run') || s.includes('pending') || s.includes('loading') || s.includes('stream')) {
    return { label: status || 'running', bg: 'rgba(99,102,241,0.14)', border: 'rgba(99,102,241,0.35)', color: '#A78BFA' };
  }
  return { label: status || 'unknown', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', color: '#CBD5E1' };
};

const ToolCallCard = (props: ToolUIProps & { title: string; icon: string; summary?: string; children?: ReactNode }) => {
  const badge = getStatusBadge(props.status);
  const s = (props.status || '').toLowerCase();
  const isStreaming = s === 'input-streaming';
  const isInputAvailable = s === 'input-available' || isStreaming;
  const isOutputAvailable = s === 'output-available' || props.output !== undefined;
  return (
    <div style={{
      borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'linear-gradient(135deg, rgba(26,27,30,0.9) 0%, rgba(23,24,28,0.95) 100%)',
      padding: '14px 14px',
      marginTop: '10px',
      boxShadow: isStreaming
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

      <details style={{ marginTop: '10px' }}>
        <summary style={{
          cursor: 'pointer',
          color: '#A78BFA',
          fontSize: '12px',
          fontWeight: 700,
          listStyle: 'none'
        }}>
          View input/output
        </summary>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '10px' }}>
          <div style={{
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(0,0,0,0.18)',
            padding: '10px 12px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#D1D5DB', marginBottom: '8px' }}>Input</div>
            <pre style={{ margin: 0, fontSize: '11px', color: '#CBD5E1', whiteSpace: 'pre-wrap' }}>
              {isInputAvailable ? safeStringify(props.input) : '—'}
            </pre>
          </div>
          <div style={{
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(0,0,0,0.18)',
            padding: '10px 12px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#D1D5DB', marginBottom: '8px' }}>Output</div>
            <pre style={{ margin: 0, fontSize: '11px', color: '#CBD5E1', whiteSpace: 'pre-wrap' }}>
              {isOutputAvailable ? safeStringify(props.output) : (isStreaming ? 'Waiting for final tool output…' : 'Not available yet')}
            </pre>
          </div>
        </div>
      </details>

      <div style={{
        marginTop: '10px',
        fontSize: '11px',
        color: 'rgba(148,163,184,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Tool Call ID: {props.toolCallId}
        </span>
      </div>
    </div>
  );
};

const codeBlockStyle: CSSProperties = {
  marginTop: '10px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.08)',
  backgroundColor: 'rgba(0,0,0,0.18)',
  padding: '10px 12px',
};

const codePreStyle: CSSProperties = {
  margin: 0,
  fontSize: '11px',
  color: '#CBD5E1',
  whiteSpace: 'pre-wrap',
};

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

export const SetGridLayoutUI = (props: ToolUIProps) => {
  const input = asRecord(props.input);
  const templateAreas = input.templateAreas;
  const areas = Array.isArray(templateAreas) ? templateAreas : [];
  const summary = `${getString(input, 'columns')} • ${getString(input, 'rows')} • gap ${getString(input, 'gap')}`;
  return (
    <ToolCallCard {...props} title="Set Grid Layout" icon="lucide:layout-dashboard" summary={summary}>
      {areas.length ? (
        <div style={codeBlockStyle}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#D1D5DB', marginBottom: '8px' }}>Template Areas</div>
          <pre style={codePreStyle}>{areas.map((a) => String(a)).join('\n')}</pre>
        </div>
      ) : null}
    </ToolCallCard>
  );
};

export const CreateComponentUI = (props: ToolUIProps) => {
  const input = asRecord(props.input);
  const summary = `${getString(input, 'type')} • ${getString(input, 'id')} → ${getString(input, 'gridArea')}`;
  const sql = getNested(input, 'query', 'sql');
  const jsCode = getNested(input, 'query', 'jsCode');
  return (
    <ToolCallCard {...props} title="Create Component" icon="lucide:square-plus" summary={summary}>
      {typeof sql === 'string' && sql ? (
        <div style={codeBlockStyle}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#D1D5DB', marginBottom: '8px' }}>SQL</div>
          <pre style={codePreStyle}>{sql}</pre>
        </div>
      ) : null}
      {typeof jsCode === 'string' && jsCode ? (
        <div style={codeBlockStyle}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#D1D5DB', marginBottom: '8px' }}>JS Transform</div>
          <pre style={codePreStyle}>{jsCode}</pre>
        </div>
      ) : null}
    </ToolCallCard>
  );
};

export const UpdateComponentUI = (props: ToolUIProps) => {
  const input = asRecord(props.input);
  const path = getString(input, 'path');
  const summary = `${getString(input, 'id')} • ${getString(input, 'operation') || 'set'} ${path ? `• ${path}` : ''}`;
  const sql = getNested(input, 'updates', 'dataConfig', 'source', 'query');
  return (
    <ToolCallCard {...props} title="Update Component" icon="lucide:pencil" summary={summary}>
      {typeof sql === 'string' && sql ? (
        <div style={codeBlockStyle}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#D1D5DB', marginBottom: '8px' }}>SQL</div>
          <pre style={codePreStyle}>{sql}</pre>
        </div>
      ) : null}
    </ToolCallCard>
  );
};

export const RemoveComponentUI = (props: ToolUIProps) => {
  const input = asRecord(props.input);
  const summary = getString(input, 'id');
  return <ToolCallCard {...props} title="Remove Component" icon="lucide:trash-2" summary={summary} />;
};

export const FetchComponentDataUI = (props: ToolUIProps) => {
  const input = asRecord(props.input);
  const summary = getString(input, 'id');
  return <ToolCallCard {...props} title="Fetch Component Data" icon="lucide:database" summary={summary} />;
};

export const RefreshAllComponentsUI = (props: ToolUIProps) => {
  return <ToolCallCard {...props} title="Refresh All Components" icon="lucide:refresh-cw" summary="Refresh all component data" />;
};

export const GetGridInfoUI = (props: ToolUIProps) => {
  return <ToolCallCard {...props} title="Get Grid Info" icon="lucide:info" summary="Grid stats and occupancy" />;
};

export const GetDashboardUI = (props: ToolUIProps) => {
  return <ToolCallCard {...props} title="Get Dashboard" icon="lucide:folder-open" summary="Retrieve current dashboard state" />;
};

export const SetPostgresSchemaUI = (props: ToolUIProps) => {
  return <ToolCallCard {...props} title="Set PostgreSQL Schema" icon="lucide:layers" summary="Configure schema context" />;
};

export const QueryPostgresSchemaUI = (props: ToolUIProps) => {
  const input = asRecord(props.input);
  const tableName = getString(input, 'tableName');
  const schemaName = getString(input, 'schemaName');
  const summary = tableName ? `table ${tableName}` : schemaName ? `schema ${schemaName}` : 'list schemas';
  return <ToolCallCard {...props} title="Query PostgreSQL Schema" icon="lucide:search" summary={summary} />;
};

export const SetGraphQLEndpointUI = (props: ToolUIProps) => {
  const input = asRecord(props.input);
  const summary = getString(input, 'endpoint');
  return <ToolCallCard {...props} title="Set GraphQL Endpoint" icon="lucide:plug" summary={summary} />;
};

export const GenerateChartTemplateUI = (props: ToolUIProps) => {
  return <ToolCallCard {...props} title="Generate Chart Template" icon="lucide:bar-chart-3" summary="Creates a chart JSON template" />;
};

export const GenerateTableTemplateUI = (props: ToolUIProps) => {
  return <ToolCallCard {...props} title="Generate Table Template" icon="lucide:table" summary="Creates a table JSON template" />;
};
