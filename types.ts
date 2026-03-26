
export interface Topic {
  id: string;
  title: string;
  query: string;
  description: string;
  icon: string;
  category: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  type: 'main' | 'secondary' | 'weak' | 'object' | 'closure' | 'reference';
}

export interface DiagramLink {
  source: string;
  target: string;
  label: string;
  strength: 'strong' | 'weak' | 'unowned';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CodeExample {
  title: string;
  code: string;
  explanation: string;
}

export interface DeepDiveResponse {
  content: string;
  diagramData?: {
    nodes: DiagramNode[];
    links: DiagramLink[];
  };
  quizQuestions: QuizQuestion[];
  codeExamples: CodeExample[];
  interviewTips: string[];
  commonMistakes: string[];
}
