import React from 'react';

export enum PageType {
  DASHBOARD = 'DASHBOARD',
  CODE = 'CODE',
  NOTES = 'NOTES',
  PLANNER = 'PLANNER'
}

export enum CodeLanguage {
  JAVASCRIPT = 'javascript',
  PYTHON = 'python',
  JAVA = 'java',
  CPP = 'cpp',
  GO = 'go',
  RUST = 'rust'
}

export interface PageMetadata {
  id: string;
  title: string;
  type: PageType;
  lastModified: Date;
  isFavorite: boolean;
  tags: string[];
}

// Data models for specific page contents
export interface CodePageData {
  code: string;
  language: CodeLanguage;
  notes: string;
  output: string;
}

export type BlockType = 'paragraph' | 'h1' | 'h2' | 'bullet' | 'image' | 'code';

export interface NoteBlock {
  id: string;
  type: BlockType;
  content: string; // HTML content or Image Base64/URL or Code string
  caption?: string;
  language?: CodeLanguage;
  output?: string;
}

export interface PlannerData {
  todos: { id: string; text: string; completed: boolean }[];
  reflections: {
    wentWell: string;
    improve: string;
    goals: string;
  };
  selectedDate: string; // ISO date string
}

// Navigation Item
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  type: PageType;
}