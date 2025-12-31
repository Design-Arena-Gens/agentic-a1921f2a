'use client';

import { useMemo, useState } from "react";

type MessageStatus = "delivered" | "read" | "scheduled" | "failed";
type Message = {
  id: string;
  sender: "agent" | "contact";
  content: string;
  timestamp: string;
  status?: MessageStatus;
  followUp?: string;
};

type Chat = {
  id: string;
  contactName: string;
  phone: string;
  tags: string[];
  lastInteraction: string;
  unread: number;
  sentiment: "Positive" | "Neutral" | "Negative";
  priority: "High" | "Medium" | "Low";
  messages: Message[];
  channel: "WhatsApp" | "Instagram" | "SMS";
};

type Sequence = {
  id: string;
  title: string;
  type: "Broadcast" | "Drip" | "Follow-up";
  performance: {
    delivered: number;
    read: number;
    replies: number;
  };
  nextRun?: string;
};

const chats: Chat[] = [
  {
    id: "chat-1",
    contactName: "Amina Diallo",
    phone: "+221 77 555 3399",
    tags: ["VIP", "Renewal"],
    lastInteraction: "2m ago",
    unread: 3,
    sentiment: "Positive",
    priority: "High",
    channel: "WhatsApp",
    messages: [
      {
        id: "msg-1",
        sender: "contact",
        content: "Hello! Can you confirm that my massage appointment is still on for tonight?",
        timestamp: "09:11",
        status: "read",
      },
      {
        id: "msg-2",
        sender: "agent",
        content: "Absolutely Amina! You're confirmed for 7:30 pm with Maria. See you soon!",
        timestamp: "09:13",
        status: "delivered",
      },
      {
        id: "msg-3",
        sender: "contact",
        content: "Perfect, can I switch to a deep tissue massage instead?",
        timestamp: "09:14",
        status: "read",
        followUp: "Assign to therapist Maria after confirmation.",
      },
      {
        id: "msg-4",
        sender: "agent",
        content: "Done! Maria has been updated. I'll send the relaxation playlist an hour before the session.",
        timestamp: "09:15",
        status: "read",
      },
    ],
  },
  {
    id: "chat-2",
    contactName: "Wellness Retreat List",
    phone: "Broadcast • 1,280 recipients",
    tags: ["Campaign", "Onboarding"],
    lastInteraction: "14m ago",
    unread: 0,
    sentiment: "Positive",
    priority: "Medium",
    channel: "WhatsApp",
    messages: [
      {
        id: "msg-5",
        sender: "agent",
        content: "🌿 Reminder: Early bird pricing for the April retreat closes this Friday. Reply RETREAT for a tailored plan.",
        timestamp: "08:32",
        status: "delivered",
      },
      {
        id: "msg-6",
        sender: "agent",
        content: "Auto Follow-up scheduled for 17:00 — Offer expiring in 48 hours.",
        timestamp: "08:33",
        status: "scheduled",
      },
    ],
  },
  {
    id: "chat-3",
    contactName: "Joseph Mensah",
    phone: "+233 54 332 9088",
    tags: ["Refund", "Escalated"],
    lastInteraction: "33m ago",
    unread: 1,
    sentiment: "Negative",
    priority: "High",
    channel: "WhatsApp",
    messages: [
      {
        id: "msg-7",
        sender: "contact",
        content: "I was double charged for my couples massage yesterday. Can someone fix this ASAP?",
        timestamp: "08:45",
        status: "read",
      },
      {
        id: "msg-8",
        sender: "agent",
        content: "I'm on it Joseph. Refunding the duplicate payment right now and sending the receipt in a minute.",
        timestamp: "08:50",
        status: "delivered",
      },
      {
        id: "msg-9",
        sender: "agent",
        content: "Also added a complimentary aromatherapy upgrade for your next visit.",
        timestamp: "08:51",
        status: "delivered",
      },
    ],
  },
  {
    id: "chat-4",
    contactName: "Automation: Lapsed Clients",
    phone: "Flow • 92 members",
    tags: ["Automation"],
    lastInteraction: "1h ago",
    unread: 0,
    sentiment: "Neutral",
    priority: "Low",
    channel: "WhatsApp",
    messages: [
      {
        id: "msg-10",
        sender: "agent",
        content: "Triggered flow: Re-engage clients after 45 inactive days.",
        timestamp: "08:02",
        status: "delivered",
      },
      {
        id: "msg-11",
        sender: "agent",
        content: "Step 1 sent: Personalized reminder with 20% welcome back voucher.",
        timestamp: "08:10",
        status: "delivered",
      },
    ],
  },
];

const sequences: Sequence[] = [
  {
    id: "seq-1",
    title: "Post-session Care Follow-up",
    type: "Drip",
    performance: {
      delivered: 184,
      read: 156,
      replies: 92,
    },
    nextRun: "Today • 18:30",
  },
  {
    id: "seq-2",
    title: "Membership Renewal Nudges",
    type: "Follow-up",
    performance: {
      delivered: 92,
      read: 81,
      replies: 24,
    },
  },
  {
    id: "seq-3",
    title: "Weekend Flash Sale Broadcast",
    type: "Broadcast",
    performance: {
      delivered: 1_280,
      read: 1_044,
      replies: 312,
    },
    nextRun: "Tomorrow • 09:00",
  },
];

const metrics = [
  {
    label: "Inbound today",
    value: "128",
    delta: "+18%",
    tone: "positive",
  },
  {
    label: "Average first reply",
    value: "3m 12s",
    delta: "-41%",
    tone: "positive",
  },
  {
    label: "Automation coverage",
    value: "67%",
    delta: "+9 workflows",
    tone: "neutral",
  },
  {
    label: "CSAT (7d)",
    value: "4.8 / 5",
    delta: "12 detractors",
    tone: "alert",
  },
] as const;

const sentimentBadge: Record<Chat["sentiment"], string> = {
  Positive: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40",
  Neutral: "bg-slate-500/10 text-slate-300 border border-slate-500/30",
  Negative: "bg-rose-500/10 text-rose-300 border border-rose-500/40",
};

const priorityBadge: Record<Chat["priority"], string> = {
  High: "text-rose-200 bg-rose-500/20 border border-rose-500/30",
  Medium: "text-amber-200 bg-amber-500/20 border border-amber-500/30",
  Low: "text-slate-200 bg-slate-500/20 border border-slate-500/30",
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string>(chats[0]?.id);
  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId) ?? chats[0],
    [selectedChatId],
  );

  const filteredChats = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return chats;

    return chats.filter((chat) => {
      const haystack = [
        chat.contactName,
        chat.phone,
        ...chat.tags,
        chat.messages[chat.messages.length - 1]?.content,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-white/5 bg-slate-950/70 px-6 py-6 lg:flex">
          <div className="space-y-8">
            <div>
              <span className="text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
                Massage Collective
              </span>
              <h1 className="mt-2 text-xl font-semibold text-white">
                WhatsApp Command Center
              </h1>
            </div>
            <nav className="space-y-1 text-sm font-medium text-white/70">
              <NavItem label="Inbox" active />
              <NavItem label="Broadcasts" />
              <NavItem label="Automations" />
              <NavItem label="Contacts" />
              <NavItem label="Templates" />
            </nav>
          </div>
          <div className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-xs text-white/60">
            <p className="font-semibold text-white/80">Live workspace status</p>
            <p className="leading-relaxed">
              4 teammates online. SLA holding at 6 minutes. Next broadcast at
              17:00 with 1,280 recipients.
            </p>
          </div>
        </aside>

        <main className="flex w-full flex-1 flex-col overflow-hidden">
          <header className="border-b border-white/5 bg-white/5 px-6 py-4 backdrop-blur-md">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Today • Tuesday, 09 April
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Manage WhatsApp Conversations
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400/10 hover:text-emerald-200">
                  Create Broadcast
                </button>
                <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400">
                  New WhatsApp Message
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 overflow-hidden p-6">
            <section className="grid flex-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
              <div className="flex min-h-[28rem] flex-col rounded-3xl border border-white/5 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Conversations
                    </h3>
                    <p className="text-xs text-white/50">
                      {filteredChats.length} active threads
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/60 bg-emerald-400/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-200">
                    SLA 6m
                  </span>
                </div>
                <div className="mt-4 rounded-2xl border border-white/5 bg-slate-900/60">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full rounded-2xl bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
                    placeholder="Search by name, tag, or note"
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-medium text-white/60">
                  <SegmentPill label="Inbox" active />
                  <SegmentPill label="Priority" />
                  <SegmentPill label="Automations" />
                </div>

                <div className="mt-4 grid grow gap-2 overflow-y-auto pr-1">
                  {filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={[
                        "flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition",
                        chat.id === selectedChat?.id
                          ? "border-emerald-400/60 bg-emerald-400/10 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.3)]"
                          : "border-white/0 bg-white/0 text-white/80 hover:border-white/10 hover:bg-white/5",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {chat.contactName}
                          </p>
                          <p className="text-xs text-white/50">{chat.phone}</p>
                        </div>
                        {chat.unread > 0 && (
                          <span className="rounded-full bg-emerald-500 px-2 py-1 text-[0.65rem] font-semibold text-emerald-950">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-medium uppercase tracking-wide">
                        <span className={priorityBadge[chat.priority]}>
                          {chat.priority} priority
                        </span>
                        <span className={sentimentBadge[chat.sentiment]}>
                          {chat.sentiment}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-white/70">
                          {chat.lastInteraction}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-white/60">
                        {chat.messages[chat.messages.length - 1]?.content}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-[28rem] flex-col rounded-3xl border border-white/5 bg-white/5">
                <div className="flex items-start justify-between border-b border-white/5 p-5">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
                      {selectedChat?.channel}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {selectedChat?.contactName}
                    </h3>
                    <p className="text-xs text-white/50">
                      {selectedChat?.phone}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs text-white/60">
                    <span>Last seen {selectedChat?.lastInteraction}</span>
                    <div className="flex gap-2">
                      <button className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-400/10 hover:text-emerald-200">
                        Notes
                      </button>
                      <button className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-400/10 hover:text-rose-200">
                        Escalate
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
                  {selectedChat?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={[
                        "flex w-full",
                        message.sender === "agent"
                          ? "justify-end"
                          : "justify-start",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "max-w-[80%] rounded-3xl border px-4 py-3 text-sm shadow-sm transition",
                          message.sender === "agent"
                            ? "rounded-tr-xl border-emerald-400/40 bg-emerald-400/15 text-emerald-50"
                            : "rounded-tl-xl border-white/10 bg-white/10 text-white/80",
                        ].join(" ")}
                      >
                        <p className="leading-relaxed">{message.content}</p>
                        <div className="mt-3 flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-wide text-white/50">
                          <span>{message.timestamp}</span>
                          {message.status && (
                            <span className="text-[0.65rem]">
                              {statusLabel(message.status)}
                            </span>
                          )}
                        </div>
                        {message.followUp && (
                          <p className="mt-2 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[0.7rem] font-medium text-amber-100">
                            Follow-up: {message.followUp}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/5 bg-slate-900/60 p-5">
                  <MessageComposer />
                </div>
              </div>

              <div className="flex min-h-[28rem] flex-col gap-4">
                <div className="rounded-3xl border border-white/5 bg-white/5 p-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Live Metrics
                    </h3>
                    <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
                      09:30 updated
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {metrics.map((metric) => (
                      <MetricCard key={metric.label} {...metric} />
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Active Automations
                    </h3>
                    <button className="text-xs font-semibold text-emerald-300 transition hover:text-emerald-200">
                      View all
                    </button>
                  </div>
                  <div className="mt-4 space-y-4">
                    {sequences.map((sequence) => (
                      <AutomationCard key={sequence.id} sequence={sequence} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/5 bg-gradient-to-r from-emerald-400/10 via-white/5 to-emerald-400/10 p-6 text-sm text-white/80">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Smart nudges enabled
                  </h3>
                  <p className="text-sm text-white/60">
                    Contacts without agent response within 4 minutes will
                    receive a personalized acknowledgement and placeholder
                    options that keep the conversation warm.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-emerald-400/60 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                    4 workflows
                  </span>
                  <button className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10">
                    Configure
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

type MetricCardProps = (typeof metrics)[number];

function MetricCard({ label, value, delta, tone }: MetricCardProps) {
  const deltaTone =
    tone === "positive"
      ? "text-emerald-200"
      : tone === "alert"
        ? "text-rose-200"
        : "text-white/60";

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/60 px-4 py-3">
      <p className="text-[0.7rem] uppercase tracking-[0.3em] text-white/40">
        {label}
      </p>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-xl font-semibold text-white">{value}</span>
        <span className={`text-xs font-semibold ${deltaTone}`}>{delta}</span>
      </div>
    </div>
  );
}

function SegmentPill({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={[
        "rounded-full border px-3 py-1 text-left transition",
        active
          ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100"
          : "border-white/10 bg-white/0 text-white/60 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className={[
        "flex w-full items-center justify-between rounded-full border px-3 py-2 transition",
        active
          ? "border-white/20 bg-white/10 text-white"
          : "border-transparent text-white/60 hover:border-white/10 hover:bg-white/10 hover:text-white/80",
      ].join(" ")}
    >
      <span>{label}</span>
      {active && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      )}
    </button>
  );
}

function statusLabel(status: MessageStatus) {
  switch (status) {
    case "delivered":
      return "Delivered";
    case "read":
      return "Read";
    case "scheduled":
      return "Scheduled";
    case "failed":
      return "Failed";
    default:
      return status;
  }
}

function AutomationCard({ sequence }: { sequence: Sequence }) {
  const total = sequence.performance.delivered || 1;
  const readPercent = Math.round(
    (sequence.performance.read / total) * 100,
  ).toString();
  const replyPercent = Math.round(
    (sequence.performance.replies / total) * 100,
  ).toString();

  return (
    <div className="space-y-3 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
            {sequence.type}
          </p>
          <h4 className="mt-1 text-sm font-semibold text-white">
            {sequence.title}
          </h4>
        </div>
        {sequence.nextRun && (
          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-200">
            {sequence.nextRun}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/60">
        <div className="rounded-lg border border-white/5 bg-white/5 px-2 py-1.5">
          <p className="text-[0.65rem] uppercase tracking-wide text-white/40">
            Delivered
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {sequence.performance.delivered.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2 py-1.5">
          <p className="text-[0.65rem] uppercase tracking-wide text-emerald-200/80">
            Read
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-100">
            {sequence.performance.read.toLocaleString()}{" "}
            <span className="text-xs text-emerald-300">({readPercent}%)</span>
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
          <p className="text-[0.65rem] uppercase tracking-wide text-white/40">
            Replies
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {sequence.performance.replies.toLocaleString()}{" "}
            <span className="text-xs text-white/60">({replyPercent}%)</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageComposer() {
  const [message, setMessage] = useState(
    "Sure thing! I’ve confirmed your deep tissue massage with Maria for 7:30 pm tonight. Let me know if you need anything before you arrive.",
  );
  const [schedule, setSchedule] = useState("Send now");
  const [template, setTemplate] = useState("Personal reply");

  return (
    <form className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr,minmax(0,180px)]">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
            Message
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between text-[0.65rem] text-white/50">
            <span>{message.length} characters</span>
            <button
              type="button"
              className="rounded-full border border-white/10 px-3 py-1 font-semibold text-white transition hover:bg-white/10"
            >
              Insert template
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
            <label className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/40">
              Schedule
            </label>
            <select
              value={schedule}
              onChange={(event) => setSchedule(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option>Send now</option>
              <option>Send in 10 minutes</option>
              <option>Send at 18:00</option>
              <option>Add to follow-up queue</option>
            </select>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
            <label className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/40">
              Template
            </label>
            <select
              value={template}
              onChange={(event) => setTemplate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option>Personal reply</option>
              <option>After-care instructions</option>
              <option>Upsell membership</option>
              <option>Quick acknowledgement</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-xs text-white/50">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border border-white/10 bg-slate-900/60 text-emerald-400 focus:ring-emerald-400"
            />
            Mark as resolved on send
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-white/10 bg-slate-900/60 text-emerald-400 focus:ring-emerald-400"
            />
            Request CSAT
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            Send via WhatsApp
          </button>
        </div>
      </div>
    </form>
  );
}
