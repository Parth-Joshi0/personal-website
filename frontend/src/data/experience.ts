export interface ExperienceEntry {
  role: string;
  org: string;
  location: string;
  period: string;
  bullets: string[];
}

export const experience: ExperienceEntry[] = [
  {
    role: "Project Engineering Intern",
    org: "Bruce Power (Seconded by TetraTech)",
    location: "Tiverton, ON",
    period: "May 2025 – Present",
    bullets: [
      "Built a Power BI dashboard providing real-time visibility into engineering requests and surfacing key KPIs to stakeholders clearly.",
      "Connected Power BI and Power Apps to an Azure SQL database sourced from Oracle, pulling structured data to support real-time reporting and application tables.",
      "Engineered custom JavaScript logic to solve a many-to-many (n:n) relationship in Power Apps, enabling accurate record linking across related work packages and requests.",
      "Automated data updates and request routing using Power Automate, reducing manual data entry and cutting tracking errors/delays by an estimated 15%.",
    ],
  },
];
