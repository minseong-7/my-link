# Project Context: MyLink

This file provides essential context for AI agents to understand and work on the MyLink project consistently. Use this as the primary reference for all tasks.

## 1. Project Overview
**MyLink** is a link management service designed for developers and creators to consolidate their digital assets (portfolios, social media, etc.) into a single, shareable page.
Users can sign up via Google and manage their profile and links using an intuitive inline editing experience.

- **Current Version**: v0.3 (Draft)
- **Primary Documents**: '@docs/Wireframe.md', '@docs/PRD.md', '@docs/UserScenario.md'

## 2. Tech Stack & Architecture
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Icons**: Lucide React
- **Backend/Auth**: Firebase (Authentication, Firestore)
- **Package Manager**： npm

### Key Directories & Files
-'app/': Pages and layouts (App Router)
-'components/ui/': Reusable UI componentI based on shadcn/ui
-'docs/': Product requirements and design documents
-'lib/utils.ts': Utility functions
for styling and common logic
-'@package.json': Project dependencies and scripts

## 3. Development & Build Commands
- **Development Server**: 'npm run dev'
- **Build Verification**: 'npm run build'
- **Linting**: 'npm run lint'

## 4. Operational Guidelines (AI Instructions)

### 4.1. Language & Communication
- **Communication**: 모든 대화 응답, 계획(Implementation Plan), 테스크(Task), 워크스루(Walkthrough) 문서는 반드시 **한국어(한글)**로 작성해야 합니다. 대화 중이나 마크다운 문서 생성 시 절대 영어로 전환하지 마세요.
- **Content Policy**: Keep responses concise and focused on the user's query.
### 4.2. File Reference Convention
- Always prefix project file paths with '@ when referencing them in chat or documents (e.g., *@app/page.tsx* , @docs/PRD. md* ).
### 4.3. Code Style & UI/UX
- **Inline Editing**: Implement an "edit-in-place" UX. Clicking text should swap it with an input field; saving happens automatically on blur or Enter. Refer to '@docs/UserScenario.md* for details.
- **Design System**: Use shaden/ui components and Tailwind CSS v4
utility classes.
- **Responsive Design**: Prioritize mobile-first views for the public profile page. See '@docs/Wireframe.md.
- **Favicon Automation**: Use Google Favicon API (https://www. google.com/s2/favicons?domain={url}') to dynamically fetch icons for links.
#*# 4.4. Verification & Commit Workflow
- **Build Check**: Always run 'npm run build' after code changes to ensure no build errors are introduced.
- **Commit Messages**: Write detailed commit messages in
**Korean**. exnlaining hoth "Whv" and "What" was channed.
- **Clarification**: If requirements are ambiguous, ask the user for clarification before proceeding.
## 5. Data Model (Firestore)
Refer to '@docs/PRD.md for the full schema.
- **Users**: 'uid', 'email', 'displayName' (URL Slug), 'username',
"photoURL',
"bio"
- **Links**: 'id', 'title', 'urt', 'creatgoAt'(Sub-collection under User)
@I for Command, aL for Agent