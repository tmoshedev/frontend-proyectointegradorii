import { useBuyerForm } from '../../../hooks/useBuyerForm';
import { Question } from '../../../models';
import { Accordion, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { AppStore } from '../../../redux/store';
import { Edit, Save } from 'lucide-react';
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';

export const LeadBuyerComponent = () => {
  const { lead } = useSelector((store: AppStore) => store.lead);
  
  const {
    loading,
    error,
    categories,
    questions,
    answers,
    canEdit,
    isSupervisor,
    isEditing,
    handleAnswerChange,
    submitAnswers,
    toggleEditMode,
  } = useBuyerForm(lead.id);

  const renderQuestionInput = (question: Question) => {
    const answerValue = answers[question.id]?.respuesta ?? '';
    // El formulario está deshabilitado si no se puede editar, o si no se está en modo edición.
    // La primera vez (canEdit=true, isEditing=false) debe estar habilitado.
    const isDisabled = !canEdit || (!!answers[question.id] && !isEditing);

    switch (question.type_question?.codigo) {
      case 'TEXT':
        return (
          <Form.Control
            type="text"
            value={answerValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={isDisabled}
            placeholder={isDisabled ? 'Respuesta guardada' : 'Escribe tu respuesta...'}
          />
        );
      case 'TEXTAREA':
        return (
          <Form.Control
            as="textarea"
            rows={3}
            value={answerValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={isDisabled}
            placeholder={isDisabled ? 'Respuesta guardada' : 'Escribe tu respuesta...'}
          />
        );
      case 'BOOLEAN':
        return (
          <Form.Check
            type="switch"
            id={`question-${question.id}`}
            label={question.texto}
            checked={!!answerValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.checked)}
            disabled={isDisabled}
          />
        );
      case 'SELECT':
        return (
          <Form.Select
            value={answerValue}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={isDisabled}
          >
            <option value="">Seleccione una opción</option>
            {question.opciones?.split(',').map((opt, index) => (
              <option key={index} value={opt.trim()}>{opt.trim()}</option>
            ))}
          </Form.Select>
        );
      default:
        return <p className="text-danger">Tipo de pregunta no soportado: {question.type_question?.name}</p>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" />
        <span className="ms-3">Cargando formulario...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="m-3">Error al cargar: {error}</Alert>;
  }

  if (categories.length === 0) {
      return <Alert variant="info" className="m-3">No hay preguntas configuradas para el formulario Buyer.</Alert>
  }

  return (
    <Card className="border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Formulario Buyer</h4>
          {isSupervisor && Object.keys(answers).length > 0 && (
            <Button variant={isEditing ? "secondary" : "primary"} onClick={toggleEditMode}>
              <Edit size={16} className="me-2" />
              {isEditing ? 'Cancelar Edición' : 'Habilitar Edición'}
            </Button>
          )}
        </div>

        <Accordion defaultActiveKey="0">
          {categories
            .sort((a: { orden: number }, b: { orden: number }) => a.orden - b.orden)
            .map((category: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: any) => {
              const categoryQuestions = questions.filter((q: { question_category_id: Key | null | undefined; }) => q.question_category_id === category.id);
              if (categoryQuestions.length === 0) return null;

              return (
                <Accordion.Item eventKey={String(index)} key={category.id}>
                  <Accordion.Header>{category.name}</Accordion.Header>
                  <Accordion.Body>
                    {categoryQuestions
                      .sort((a: { orden: number; }, b: { orden: number; }) => a.orden - b.orden)
                      .map((question: Question) => (
                        <Form.Group key={question.id} className="mb-4">
                          {question.type_question?.codigo !== 'BOOLEAN' && <Form.Label className="fw-bold">{question.texto}</Form.Label>}
                          {renderQuestionInput(question)}
                        </Form.Group>
                      ))}
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
        </Accordion>

        {(canEdit || isEditing) && (
          <div className="mt-4 text-end">
            <Button variant="success" onClick={submitAnswers} disabled={loading}>
              <Save size={16} className="me-2" />
              {loading ? 'Guardando...' : 'Guardar Respuestas'}
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LeadBuyerComponent;
