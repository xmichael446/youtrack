import React from 'react';
import { LessonsProvider } from '../context/LessonsContext';
import LessonsContent from '../features/lessons/LessonsContent';

const Lessons: React.FC = () => (
  <LessonsProvider>
    <LessonsContent />
  </LessonsProvider>
);

export default Lessons;
