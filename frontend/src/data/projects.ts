export interface Project {
  slug: string;
  title: string;
  period?: string;
  repoUrl?: string;
  liveUrl?: string;
  devpostUrl?: string;
  videoId?: string;
  tech: string;
  summary: string;
  detail: string;
  note: string;
  callout?: string;
  status?: string;
}

export const projects: Project[] = [
  {
    slug: "fly-brain-rover",
    title: "Putting a fly brain in a drone",
    period: "Sept 2026",
    tech: "Python · Brian2 · FlyWire connectome · Computer vision · DJI Tello",
    status: "In progress — the core system is working; final flight testing and tuning remain.",
    summary: "A DJI Tello controller powered by a simulated slice of a fruit fly's nervous system. Camera motion becomes neural activity; descending-neuron spikes become escape and steering commands.",
    detail: "The current network models 418 neurons and 10,911 measured FlyWire synapses within a 33 ms control-loop budget. The looming circuit detected 5/5 swats with no false positives in hardware tests, while a DNg02 population circuit turns optic flow into graded thrust and yaw correction.",
    note: "camera → 10,911 synapses → flight command",
  },
  {
    slug: "chess-engine",
    title: "Searching for a better move",
    period: "Jan 2026",
    repoUrl: "https://github.com/Parth-Joshi0/chess-game-engine",
    liveUrl: "/chess",
    tech: "Python · Alpha-beta search · UCI",
    summary: "A chess engine with its own search, evaluation, and rule handling. Make a move and play against it right here.",
    detail: "Alpha-beta pruning cuts off branches that cannot improve the result. Transposition tables reuse work when different move sequences reach the same position; incremental state updates reduce the work needed for each move.",
    note: "The interesting part: deciding what not to search.",
  },
  {
    slug: "racing-simulator",
    title: "Teaching a network to drive",
    period: "Mar 2026",
    repoUrl: "https://github.com/Parth-Joshi0/Neural-Network-from-Scratch",
    tech: "C · OpenGL · Python · Reinforcement learning",
    summary: "A physics simulator in C and a driving policy trained from scratch, including the neural network's forward pass, backpropagation, and gradient descent. No ML libraries.",
    detail: "The car senses the track with ray casts. A quadtree narrows down collision and sensor queries, while a policy-gradient algorithm trains the driver over 30,000+ episodes.",
    note: "Build the world. Then teach the driver.",
  },
  {
    slug: "sap-flow-prediction",
    title: "When will the sap run?",
    period: "Nov 2025",
    repoUrl: "https://github.com/Parth-Joshi0/Maple-Sap-Flow-Prediction",
    tech: "Python · FastAPI · JavaScript · Geospatial data",
    summary: "A forecasting application for maple sap-flow windows, using climate and geospatial observations to find seasonal patterns.",
    detail: "The data pipeline turns 20+ years of climate data and 500K+ geospatial observations into model-ready features through normalization, feature engineering, and trend analysis.",
    callout: "Smart Cookie Award · BramHacks 2025 · $400 prize",
    note: "Weather data → seasonal patterns → sap-flow windows",
  },
  {
    slug: "appointment-followup",
    title: "Closing the appointment loop",
    period: "Jan 2026",
    repoUrl: "https://github.com/Parth-Joshi0/Nurse-Appointment-Management-System",
    devpostUrl: "https://devpost.com/software/closedloop-ai",
    videoId: "DkfdOxq3l8o",
    tech: "Python · FastAPI · SQL · React · WebSockets",
    summary: "An outbound voice-calling system for appointment confirmations and rescheduling. The demo walks through the interaction.",
    detail: "WebSockets carry the live conversation, while SQL-backed models keep track of patients, appointments, and call outcomes.",
    note: "Call → confirm or reschedule → record the outcome",
  },
];

export interface SmallProject {
  title: string;
  period: string;
  tech: string;
  summary: string;
  repoUrl?: string;
  devpostUrl?: string;
}

export const smallProjects: SmallProject[] = [
  {
    title: "BreadStacks",
    period: "Mar 2026",
    tech: "React · TypeScript · Canvas · AI APIs",
    summary: "A collaborative breadboard debugger with a structured circuit model, interactive annotations, and automated checks for wiring mistakes.",
    devpostUrl: "https://devpost.com/software/breadstacks",
  },
  {
    title: "IntroSpect",
    period: "Nov 2025",
    tech: "SwiftUI · TypeScript · Computer vision",
    summary: "An iOS accessibility prototype that turns live microexpression and sensor data into contextual social-cue guidance.",
    repoUrl: "https://github.com/Parth-Joshi0/introspect",
  },
  {
    title: "Resume Tailor",
    period: "Feb 2026",
    tech: "Python · Gemini · Jinja · LaTeX",
    summary: "A personal tool that scores structured project data against a job description, selects relevant work, and compiles a tailored PDF resume.",
    repoUrl: "https://github.com/Parth-Joshi0/resume-tailor",
  },
];
