import React, { useState } from 'react';
import styled from 'styled-components';

function Contact({ onClose, isFocus }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Message sent successfully!');
    // In a real app, you'd send this to a backend
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <Container>
      <Header>
        <Title>Contact Me</Title>
        <Subtitle>I'd love to hear from you!</Subtitle>
      </Header>
      <Content>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Name</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Subject</Label>
            <Input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Message</Label>
            <TextArea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              required
            />
          </FormGroup>
          <SubmitButton type="submit">Send Message</SubmitButton>
          {status && <StatusMessage>{status}</StatusMessage>}
        </Form>
        <ContactInfo>
          <InfoSection>
            <InfoTitle>Get in Touch</InfoTitle>
            <InfoItem>
              <InfoIcon>@</InfoIcon>
              <span>john@example.com</span>
            </InfoItem>
            <InfoItem>
              <InfoIcon>in</InfoIcon>
              <a href="https://linkedin.com/in/johndoe" target="_blank" rel="noreferrer">
                linkedin.com/in/johndoe
              </a>
            </InfoItem>
            <InfoItem>
              <InfoIcon>gh</InfoIcon>
              <a href="https://github.com/johndoe" target="_blank" rel="noreferrer">
                github.com/johndoe
              </a>
            </InfoItem>
          </InfoSection>
        </ContactInfo>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  overflow: auto;
  background: #f5f5f5;
`;

const Header = styled.div`
  padding: 30px;
  background: linear-gradient(to right, #1e3c72 0%, #2a5298 100%);
  color: white;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
`;

const Subtitle = styled.p`
  margin: 10px 0 0;
  opacity: 0.9;
`;

const Content = styled.div`
  display: flex;
  gap: 30px;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Form = styled.form`
  flex: 1;
  background: white;
  padding: 25px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1e3c72;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1e3c72;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #2a5298;
  }
`;

const StatusMessage = styled.p`
  color: #27ae60;
  text-align: center;
  margin-top: 15px;
  font-size: 13px;
`;

const ContactInfo = styled.div`
  width: 250px;
`;

const InfoSection = styled.div`
  background: white;
  padding: 25px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const InfoTitle = styled.h3`
  margin: 0 0 20px;
  font-size: 16px;
  color: #1e3c72;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 12px;

  a {
    color: #1e3c72;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const InfoIcon = styled.span`
  width: 30px;
  height: 30px;
  background: #1e3c72;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 10px;
  font-size: 10px;
  font-weight: bold;
`;

export default Contact;
