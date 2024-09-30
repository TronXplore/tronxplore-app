import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom'


const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Poppins:wght@300;400;600&display=swap');

  body {
    font-family: "Poppins", sans-serif;
    background-color: #000000;
    color: #ffffff;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    overflow: hidden;
    background-image: radial-gradient(
        circle at 10% 20%,
        rgba(255, 0, 0, 0.1) 0%,
        transparent 20%
      ),
      radial-gradient(
        circle at 90% 80%,
        rgba(255, 0, 0, 0.1) 0%,
        transparent 20%
      );
  }
`;

const fadeIn = keyframes`
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const Container = styled.div`
  max-width: 650px;
  background-color: rgba(36, 36, 36, 0.8);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 20px 50px rgba(255, 0, 0, 0.2),
    0 0 0 1px rgba(255, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(20px);
  animation: ${fadeIn} 0.5s ease-out forwards;
  backdrop-filter: blur(10px);
  margin: auto;
`;

const Title = styled.h2`
  font-family: "Orbitron", sans-serif;
  font-weight: 700;
  margin-top: 0;
  font-size: 32px;
  text-shadow: 2px 2px 4px rgba(255, 51, 51, 0.3),
    0 0 10px rgba(255, 51, 51, 0.2);
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #fff;
  text-align: center;
`;

const Subtitle = styled.h3`
  font-family: "Orbitron", sans-serif;
  color: #ff6666;
  margin-top: 24px;
  font-weight:700;
`;

const Description = styled.h6`
  margin-bottom: 15px;
  font-size: 14px;
`;

const Paragraph = styled.p`
  margin-bottom: 15px;
  background-color: rgb(82 79 79 / 80%);
  padding: 20px;
  border-left: 4px solid #cc0000;
  margin-top: 16px;
  border-radius: 0 10px 10px 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const Button = styled.button`
  background: linear-gradient(45deg, #ff0000, #cc0000);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin:0 10px;
  text-decoration: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
`;

const BackButton = styled.button`
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  z-index: 10;
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 20px auto 0 20px;

  &:hover {
    background-color: #b91c1c;
  }
`;

interface TronLinkWalletTerminologyProps {
  onBack: () => void;
}

export default function TronLinkWalletTerminology({
  onBack,
//   onContinue,
//   onExit,
}: TronLinkWalletTerminologyProps) {
    const navigate = useNavigate()
  return (
    <>
      <GlobalStyle />
      <PageWrapper>
        <BackButton onClick={onBack}>← Back to Game</BackButton>
        <ScrollableContent>
          <Container>
            {/* <Title>Transaction Terminology</Title> */}
            <Description>
              Here are some important terms to know :
            </Description>

            <Subtitle>What is Tron Blockchain?</Subtitle>
            <Paragraph>
            Tron is a decentralized blockchain platform that aims to build a free, global digital content entertainment system with distributed storage technology. It allows easy and cost-effective sharing of digital content.
            </Paragraph>

            <Subtitle>Why Tron?</Subtitle>
            <Paragraph>
            Tron is known for its scalability, high throughput, and low fees, making it ideal for creating decentralized applications (dApps), including games, finance, and content sharing platforms. It also supports smart contracts, making it a versatile option for developers.
            </Paragraph>

            <Subtitle>Our Purpose</Subtitle>
            <Paragraph>
            We are creating a gamified learning platform that provides an interactive way for users to learn about the Tron blockchain. Through various stages and tasks, you'll explore Tron's core features, its use cases, and gain valuable knowledge of how to use the Tron ecosystem effectively.
            </Paragraph>

            <ButtonGroup>
              <Button onClick={()=>navigate('/task1_continue')}>Let's do Activity</Button>
            </ButtonGroup>
          </Container>
        </ScrollableContent>
      </PageWrapper>
    </>
  );
}