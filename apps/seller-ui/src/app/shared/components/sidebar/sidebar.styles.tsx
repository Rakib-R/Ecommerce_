import styled from "styled-components";


// SidebarWrapper component

interface SidebarWrapperProps {
  collapsed?: boolean;
}

export const SidebarWrapper = styled.div<SidebarWrapperProps>`
  background-color: var(--background);
  transition: transform 0.2s ease;
  height: 100%;
  position: fixed;
  width: 16rem;
  flex-shrink: 0;
  z-index: 202;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;

  padding-top: var(--space-l);
  padding-bottom: var(--space-l);
  padding-left: var(--space-6);
  padding-right: var(--space-6);

  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Mobile collapsed state */
  transform: ${({ collapsed }) =>
    collapsed ? "translateX(-100%)" : "translateX(0)"};

  /* Desktop styles */
  @media (min-width: 768px) {
    position: static;
    height: 100vh;
    margin-left: 0;
    display: flex;
    transform: translateX(0);
  }
`;


export const Overlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  z-index: 201;
  background: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;
  opacity: 0.8;

  @media (min-width: 768px) {
    display: none;
    z-index: auto;
    opacity: 1;
  }
`;
// Header component

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-8);

  padding-left: var(--space-l);
  padding-right: var(--space-l);
`;

// Body container
export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-l);
  margin-top: var(--space-13);
  padding-left: var(--space-4);
  padding-right: var(--space-4);
  padding-bottom: var(--space-8);
  min-height: calc(100vh - 100px); /* leave space for footer */
  color: var(--text-color, #111);
  font-family: var(--font-primary, "Poppins", sans-serif);
  line-height: 1.6;

  @media (max-width: 768px) {
    padding-left: var(--space-3);
    padding-right: var(--space-3);
    gap: var(--space-m);
  }
`;

// export const Body = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: var(--space-l);
//   margin-top: var(--space-13);

//   padding-left: var(--space-4);
//   padding-right: var(--space-4);
// `;

// Footer component
export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-12);
  padding-top: var(--space-18);
  padding-bottom: var(--space-8);
  padding-left: var(--space-8);
  padding-right: var(--space-8);
  background-color: var(--footer-bg, #111);
  color: var(--footer-text, #fff);
  border-top: 1px solid var(--footer-border, #333);
  font-size: 0.9rem;

  a {
    color: var(--footer-link, #1da1f2);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--footer-link-hover, #0d8ddb);
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--space-6);
    text-align: center;
  }
`;

// export const Footer = styled.div`
//   display: flex;
//   justify-content: center;
//   gap: var(--space-12);

//   padding-top: var(--space-18);
//   padding-bottom: var(--space-8);
//   padding-left: var(--space-8);
//   padding-right: var(--space-8);

//   @media (min-width: 768px) {
//     padding-top: 0;
//     padding-bottom: 0;
//   }
// `;

export const Sidebar = {
  Wrapper: SidebarWrapper,
  Header,
  Body,
  Overlay,
  Footer,
};