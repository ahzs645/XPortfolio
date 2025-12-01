import React from 'react';
import styled from 'styled-components';

function Resume({ onClose, isFocus }) {
  return (
    <Container>
      <Toolbar>
        <ToolbarButton>Print</ToolbarButton>
        <ToolbarButton>Download PDF</ToolbarButton>
      </Toolbar>
      <ResumeContent>
        <ResumeHeader>
          <Name>John Doe</Name>
          <ContactInfo>
            john@example.com | (555) 123-4567 | San Francisco, CA
          </ContactInfo>
        </ResumeHeader>

        <Section>
          <SectionTitle>Professional Summary</SectionTitle>
          <p>
            Experienced Full Stack Developer with 5+ years of experience building
            scalable web applications. Proficient in JavaScript, React, Node.js,
            and cloud technologies.
          </p>
        </Section>

        <Section>
          <SectionTitle>Experience</SectionTitle>
          <Job>
            <JobHeader>
              <JobTitle>Senior Software Engineer</JobTitle>
              <JobDate>2021 - Present</JobDate>
            </JobHeader>
            <Company>Tech Company Inc.</Company>
            <JobDescription>
              <li>Led development of microservices architecture</li>
              <li>Mentored junior developers and conducted code reviews</li>
              <li>Improved application performance by 40%</li>
            </JobDescription>
          </Job>
          <Job>
            <JobHeader>
              <JobTitle>Software Engineer</JobTitle>
              <JobDate>2018 - 2021</JobDate>
            </JobHeader>
            <Company>Startup XYZ</Company>
            <JobDescription>
              <li>Developed React frontend applications</li>
              <li>Built RESTful APIs using Node.js</li>
              <li>Implemented CI/CD pipelines</li>
            </JobDescription>
          </Job>
        </Section>

        <Section>
          <SectionTitle>Education</SectionTitle>
          <Education>
            <Degree>Bachelor of Science in Computer Science</Degree>
            <School>University of Technology, 2018</School>
          </Education>
        </Section>

        <Section>
          <SectionTitle>Skills</SectionTitle>
          <SkillsGrid>
            <SkillCategory>
              <SkillCategoryTitle>Frontend</SkillCategoryTitle>
              <span>React, Vue.js, TypeScript, CSS</span>
            </SkillCategory>
            <SkillCategory>
              <SkillCategoryTitle>Backend</SkillCategoryTitle>
              <span>Node.js, Python, PostgreSQL, MongoDB</span>
            </SkillCategory>
            <SkillCategory>
              <SkillCategoryTitle>Tools</SkillCategoryTitle>
              <span>Git, Docker, AWS, CI/CD</span>
            </SkillCategory>
          </SkillsGrid>
        </Section>
      </ResumeContent>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 5px;
  padding: 5px;
  background: #ece9d8;
  border-bottom: 1px solid #aaa;
`;

const ToolbarButton = styled.button`
  padding: 5px 15px;
  border: 1px solid #888;
  border-radius: 3px;
  background: linear-gradient(to bottom, #fff 0%, #e3e3e3 100%);
  cursor: pointer;
  font-size: 11px;

  &:hover {
    background: linear-gradient(to bottom, #e3e3e3 0%, #fff 100%);
  }
`;

const ResumeContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 30px;
  background: white;
  margin: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: 'Times New Roman', serif;
`;

const ResumeHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;
`;

const Name = styled.h1`
  margin: 0;
  font-size: 28px;
  color: #333;
`;

const ContactInfo = styled.p`
  margin: 10px 0 0;
  color: #666;
  font-size: 12px;
`;

const Section = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h2`
  font-size: 14px;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
  margin-bottom: 15px;
`;

const Job = styled.div`
  margin-bottom: 15px;
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const JobTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  color: #333;
`;

const JobDate = styled.span`
  font-size: 12px;
  color: #666;
`;

const Company = styled.p`
  margin: 3px 0;
  font-style: italic;
  color: #666;
  font-size: 13px;
`;

const JobDescription = styled.ul`
  margin: 10px 0;
  padding-left: 20px;
  font-size: 12px;
  line-height: 1.6;
`;

const Education = styled.div``;

const Degree = styled.h3`
  margin: 0;
  font-size: 14px;
`;

const School = styled.p`
  margin: 3px 0;
  color: #666;
  font-size: 12px;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
`;

const SkillCategory = styled.div`
  font-size: 12px;
`;

const SkillCategoryTitle = styled.h4`
  margin: 0 0 5px;
  font-size: 12px;
  color: #333;
`;

export default Resume;
