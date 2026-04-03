# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

실시간 금시세(순금 24K, 18K, 14K, 백금, 은) 표시 웹앱. koreagoldx.co.kr API에서 시세를 가져와 슬라이드 형태로 보여주며, 하단에 YouTube 플레이리스트를 재생한다.

## Commands

- **Dev server**: `npm run dev` (localhost:3000)
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## Architecture

Next.js 14 App Router 기반, 단일 페이지 앱 (src/app/).

- **`page.jsx`**: 메인 클라이언트 컴포넌트. 60초 간격 시세 폴링, react-slick 슬라이더로 금속별 시세 카드 순환, react-youtube로 영상 재생. YouTube AFK 자동일시정지를 3초 폴링으로 회피하는 autoResume 로직 포함.
- **`Modal.jsx`**: 금속 시세 카드 컴포넌트. data 배열을 `[이름, 살때가격, 팔때가격, 살때등락, 팔때등락, 살때등락률, 팔때등락률]` 순서로 받음. 등락에 따라 빨강(▲)/파랑(▼) 색상 적용.
- **`api/gold-price/route.js`**: koreagoldx.co.kr API를 프록시하는 Next.js API Route. CORS 헤더 추가.

## Tech Stack

- Next.js 14, React 18, Tailwind CSS 3
- axios (클라이언트 API 호출), react-slick + slick-carousel (슬라이더), react-youtube (영상)
- ESLint: next/core-web-vitals 설정
