export interface JdTemplate {
  id: string;
  category: string;
  title: string;
  content: string;
}

export const JD_TEMPLATES: JdTemplate[] = [
  {
    id: "swe-fullstack",
    category: "Software Engineer",
    title: "Full-Stack Software Engineer",
    content: `We are looking for a Full-Stack Software Engineer to join our team.

Responsibilities:
• Design, develop, and maintain web applications using modern frameworks
• Build RESTful APIs and microservices
• Collaborate with product managers and designers to deliver features
• Write clean, testable, well-documented code
• Participate in code reviews and mentor junior developers

Requirements:
• 3+ years of experience with React, TypeScript, and Node.js
• Proficiency in SQL and NoSQL databases (PostgreSQL, MongoDB)
• Experience with cloud platforms (AWS, GCP, or Azure)
• Familiarity with CI/CD pipelines and Docker
• Strong problem-solving and communication skills

Nice to Have:
• Experience with GraphQL or gRPC
• Knowledge of Kubernetes and infrastructure-as-code
• Contributions to open-source projects`,
  },
  {
    id: "swe-backend",
    category: "Software Engineer",
    title: "Backend Engineer",
    content: `We are hiring a Backend Engineer to build scalable, high-performance systems.

Responsibilities:
• Design and implement backend services and APIs
• Optimize application performance and database queries
• Build data pipelines and event-driven architectures
• Ensure system reliability, monitoring, and incident response
• Document technical designs and architecture decisions

Requirements:
• 4+ years of backend development experience (Python, Go, or Java)
• Strong knowledge of SQL databases and query optimization
• Experience with message queues (Kafka, RabbitMQ)
• Proficiency with AWS or GCP services
• Understanding of distributed systems and microservice patterns

Nice to Have:
• Experience with Kubernetes and Terraform
• Knowledge of machine learning pipelines
• Prior experience in high-traffic, real-time systems`,
  },
  {
    id: "pm-product",
    category: "Product Manager",
    title: "Product Manager",
    content: `We are looking for a Product Manager to drive product strategy and execution.

Responsibilities:
• Define product vision, strategy, and roadmap
• Gather and prioritize requirements from stakeholders and users
• Write detailed PRDs and user stories
• Work closely with engineering, design, and marketing teams
• Analyze product metrics and make data-driven decisions
• Conduct user research and competitive analysis

Requirements:
• 3+ years of product management experience in a tech company
• Strong analytical skills with experience in A/B testing
• Excellent written and verbal communication
• Experience with agile methodologies (Scrum, Kanban)
• Ability to translate business goals into technical requirements

Nice to Have:
• Technical background or CS degree
• Experience with B2B SaaS products
• Familiarity with SQL and data analysis tools`,
  },
  {
    id: "pm-technical",
    category: "Product Manager",
    title: "Technical Product Manager",
    content: `We are hiring a Technical Product Manager to bridge engineering and business.

Responsibilities:
• Own the technical product roadmap for platform/infrastructure
• Partner with engineering leads on architecture decisions
• Define API contracts, integration specs, and developer experience
• Manage technical debt and platform reliability priorities
• Drive cross-team alignment on shared technical initiatives

Requirements:
• 4+ years in technical product management or engineering
• Deep understanding of APIs, databases, and cloud infrastructure
• Experience managing developer tools or platform products
• Strong ability to communicate technical concepts to non-technical stakeholders
• Data-driven mindset with SQL proficiency

Nice to Have:
• Prior software engineering experience
• Experience with developer ecosystems and SDKs
• Knowledge of security and compliance requirements`,
  },
  {
    id: "design-product",
    category: "Designer",
    title: "Product Designer",
    content: `We are looking for a Product Designer to create exceptional user experiences.

Responsibilities:
• Design end-to-end user flows, wireframes, and high-fidelity mockups
• Conduct user research, usability testing, and synthesis
• Build and maintain a design system with reusable components
• Collaborate with engineers on implementation feasibility
• Present design decisions to stakeholders with clear rationale

Requirements:
• 3+ years of product design experience
• Proficiency in Figma and prototyping tools
• Strong portfolio demonstrating UX process and visual design
• Experience with responsive and mobile-first design
• Understanding of accessibility standards (WCAG)

Nice to Have:
• Experience with motion design and micro-interactions
• Knowledge of HTML/CSS and front-end development
• Background in design systems at scale`,
  },
  {
    id: "design-ux",
    category: "Designer",
    title: "UX Researcher",
    content: `We are hiring a UX Researcher to drive user-centered design decisions.

Responsibilities:
• Plan and conduct qualitative and quantitative research studies
• Synthesize findings into actionable insights and recommendations
• Create user personas, journey maps, and experience frameworks
• Partner with product and design teams to inform roadmap decisions
• Build a culture of user empathy across the organization

Requirements:
• 3+ years of UX research experience
• Expertise in multiple research methods (interviews, surveys, usability testing)
• Strong analytical and storytelling skills
• Experience with research tools (UserTesting, Maze, Dovetail)
• Ability to work in a fast-paced, iterative environment

Nice to Have:
• Background in psychology, HCI, or cognitive science
• Experience with data analytics and A/B testing
• Published research or conference presentations`,
  },
];

export const JD_CATEGORIES = [...new Set(JD_TEMPLATES.map((t) => t.category))];
