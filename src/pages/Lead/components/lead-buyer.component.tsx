import { useEffect, useState } from 'react';
import { useBuyer } from '../../../hooks';
import { Question, Answer } from '../../../models';
import { Accordion, Form, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { AppStore } from '../../../redux/store';
import { SweetAlert } from '../../../utilities';

interface Props {
  changeHistorialView: (view: string) => void;
}

export const LeadBuyerComponent = (props: Props) => {
  const {
    questionCategories,
    questions,
    fetchQuestionCategories,
    fetchQuestions,
    submitAnswers,
    fetchAnswers,
    answers: initialAnswers,
    loading,
  } = useBuyer();
  const { lead } = useSelector((store: AppStore) => store.lead);
  const [answers, setAnswers] = useState<Record<number, Partial<Answer>>>({});

  useEffect(() => {
    fetchQuestionCategories();
    fetchQuestions();
    if (lead?.id) {
      fetchAnswers(lead.id);
    }
  }, [lead?.id]);

  useEffect(() => {
    if (initialAnswers.length > 0) {
      const newAnswers: Record<number, Partial<Answer>> = {};
      initialAnswers.forEach(ans => {
        if (ans.question_id) {
          newAnswers[ans.question_id] = ans;
        }
      });
      setAnswers(newAnswers);
    }
  }, [initialAnswers]);

  const handleAnswerChange = (questionId: number, respuesta: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        lead_id: lead.id,
        respuesta: respuesta,
      },
    }));
  };

  const renderQuestionInput = (question: Question) => {
    const answer = answers[question.id]?.respuesta || '';
    switch (question.type_question?.codigo) {
      case 'TEXT':
        return (
          <Form.Control
            type="text"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );
      case 'TEXTAREA':
        return (
          <Form.Control
            as="textarea"
            rows={3}
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );
      case 'BOOLEAN':
        return (
          <Form.Check
            type="checkbox"
            label={question.texto}
            checked={!!answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.checked)}
          />
        );
      case 'SELECT':
        return (
          <Form.Select
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            <option value="">Seleccione una opción</option>
            {question.opciones?.split(',').map((opt, index) => (
              <option key={index} value={opt.trim()}>{opt.trim()}</option>
            ))}
          </Form.Select>
        );
      default:
        return <p>Tipo de pregunta no soportado: {question.type_question?.name}</p>;
    }
  };

  const handleSaveAnswers = async () => {
    const answersToSave = Object.values(answers).filter(a => a.respuesta !== undefined && a.respuesta !== '');
    if (answersToSave.length === 0) {
      SweetAlert.info('Información', 'No hay respuestas para guardar.');
      return;
    }
    try {
      await submitAnswers(answersToSave);
      SweetAlert.success('Éxito', 'Respuestas guardadas correctamente.');
      props.changeHistorialView('');
    } catch (error) {
      SweetAlert.error('Error', 'No se pudieron guardar las respuestas.');
    }
  };

  return (
    <div className="p-3">
      {loading && <p>Cargando formulario...</p>}
      <Accordion defaultActiveKey="0">
        {questionCategories
          .sort((a, b) => a.orden - b.orden)
          .map((category, index) => (
            <Accordion.Item eventKey={String(index)} key={category.id}>
              <Accordion.Header>{category.name}</Accordion.Header>
              <Accordion.Body>
                {questions
                  .filter((q) => q.question_category_id === category.id)
                  .sort((a, b) => a.orden - b.orden)
                  .map((question) => (
                    <Form.Group key={question.id} className="mb-3">
                      <Form.Label>{question.texto}</Form.Label>
                      {renderQuestionInput(question)}
                    </Form.Group>
                  ))}
              </Accordion.Body>
            </Accordion.Item>
          ))}
      </Accordion>
      <div className="mt-3 text-end">
        <Button variant="primary" onClick={handleSaveAnswers} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Respuestas'}
        </Button>
      </div>
    </div>
  );
};

export default LeadBuyerComponent;
