import type { CommunityRequest } from "../types/community";
import { daysFromNow } from "../utils/date";
import { makeId } from "../utils/id";

interface SeedRequest {
  title: string;
  description: string;
  tags: string[];
  author: string;
  daysAgo: number;
  status: "open" | "fulfilled";
  offers?: { author: string; note: string; fileName?: string; daysAgo: number }[];
}

const SEED: SeedRequest[] = [
  {
    title: "Need Python Notes for Machine Learning",
    description: "Looking for clean handwritten or typed notes covering supervised learning through to basic neural nets. Semester 6 syllabus.",
    tags: ["Python", "Machine Learning", "Semester 6"],
    author: "Ananya R.",
    daysAgo: 1,
    status: "open",
  },
  {
    title: "Need DBMS Notes",
    description: "Specifically normalization (1NF-BCNF) and transaction management. My own notes from that week went missing.",
    tags: ["DBMS", "Semester 6"],
    author: "Rohit K.",
    daysAgo: 2,
    status: "fulfilled",
    offers: [
      { author: "Meera S.", note: "Have the full unit typed up, covers 1NF through BCNF with solved examples.", fileName: "DBMS_Unit3_Normalization.pdf", daysAgo: 1 },
    ],
  },
  {
    title: "Need Operating Systems PDF",
    description: "Any consolidated PDF on CPU scheduling algorithms with worked Gantt chart examples would help a lot.",
    tags: ["Operating Systems", "Semester 6"],
    author: "Farah I.",
    daysAgo: 3,
    status: "open",
  },
  {
    title: "Need React Notes",
    description: "Coming from plain JS, looking for beginner-friendly notes on hooks and component patterns before the capstone starts.",
    tags: ["React", "Web Dev"],
    author: "Devika P.",
    daysAgo: 4,
    status: "open",
  },
  {
    title: "Need last year's Financial Modelling template",
    description: "Our capstone needs a starter workbook with the standard three-statement layout. Anyone from last year's cohort have one?",
    tags: ["Finance", "Capstone"],
    author: "Karan V.",
    daysAgo: 6,
    status: "fulfilled",
    offers: [
      { author: "You", note: "Sharing the one I built last term, has the linked three statements already set up.", fileName: "Financial_Model.xlsx", daysAgo: 5 },
    ],
  },
  {
    title: "Need Computer Networks lab manual",
    description: "Missed the first two lab sessions. Need the manual up to the socket programming exercises.",
    tags: ["Networks", "Semester 6"],
    author: "Priya M.",
    daysAgo: 8,
    status: "open",
  },
];

export function getSeedCommunityRequests(): CommunityRequest[] {
  return SEED.map((req) => ({
    id: makeId("req"),
    title: req.title,
    description: req.description,
    tags: req.tags,
    author: req.author,
    createdAt: daysFromNow(-req.daysAgo),
    status: req.status,
    offers: (req.offers ?? []).map((offer) => ({
      id: makeId("offer"),
      author: offer.author,
      note: offer.note,
      fileName: offer.fileName,
      createdAt: daysFromNow(-offer.daysAgo),
    })),
  }));
}
