'use client';

interface EventLogProps {
  events: Array<{ type: string; message: string; time: string }>;
}

export function EventLog({ events }: EventLogProps) {
  return (
    <div className="panel" style={{ marginTop: '12px' }}>
      <div className="panel-title">Event Log</div>
      <div className="event-log">
        {events.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            No events yet
          </div>
        ) : (
          events.map((event, idx) => (
            <div key={idx} className={`log-entry ${event.type}`}>
              <div className="log-time">{event.time}</div>
              <div>{event.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
