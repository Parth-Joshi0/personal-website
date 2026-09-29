export interface EducationEntry {
  school: string;
  program: string;
  location: string;
  period: string;
  gpa: string;
  coursework: string[];
}

export const education: EducationEntry = {
  school: "Western University",
  program: "Honors Spec in Computer Science + Math",
  location: "London, ON",
  period: "Sept 2024 – June 2028",
  gpa: "3.72",
  coursework: [
    "Operating Systems",
    "Data Structures and Algorithms",
    "Discrete Math",
    "Numerical Computing",
    "Statistics",
  ],
};
