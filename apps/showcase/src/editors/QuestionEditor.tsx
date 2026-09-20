import { useState } from 'react'
import { QuestionEditor as Question, type QuestionValue } from '@richkitjs/editors-pro'
import '@richkitjs/extension-math/style.css'
import { QUESTION_OPTIONS, QUESTION_STEM } from '../content'
import { exposeEditor } from './useDevEditor'

export function QuestionEditor() {
  const [question, setQuestion] = useState<QuestionValue>({
    stem: QUESTION_STEM,
    options: QUESTION_OPTIONS,
    correct: 0,
    points: 2,
  })
  return <Question value={question} onChange={setQuestion} onEditorReady={exposeEditor} />
}
